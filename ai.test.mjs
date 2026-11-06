import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {assess,validatePayload,validateAssessment,AIError} from '../ai-core.mjs';
import {createAppServer} from '../server.mjs';

const payload=(section='self')=>({section,answers:['I am unsure whether to change roles.','I feel anxious and want clarity.','',''],feelings:['Anxious'],needs:['Clarity'],intensity:null,body:'',mode:'alone',consent:true,followup:'',previousAssessment:null});
const validAssessment=()=>({summary:'You describe a decision with competing needs for growth and stability.',possible_dynamics:[{title:'Competing priorities',explanation:'Both growth and stability may matter to you.'}],uncertainties:['The new role’s working hours are not yet clear.'],recommended_next_step:{action:'Ask about the working hours before deciding.',why:'One concrete fact may reduce uncertainty.',steps:['Write down the one missing fact.','Ask the recruiter about typical working hours.','Compare the answer with your needs.'],timeframe:'Before your next decision deadline.',example_words:'Could you tell me the usual working hours for this role?',fallback:'Draft the question without sending it yet.'},other_options:[{title:'Compare the options',action:'List one benefit and cost of each role.',why:'Make competing priorities visible.'}],follow_up_questions:['What deadline do you have?'],safety:{mode:'everyday',message:''}});
const response=(assessment=validAssessment())=>new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(assessment)}]}]}),{status:200,headers:{'Content-Type':'application/json'}});
const rejectsCode=(promise,code)=>assert.rejects(promise,error=>error instanceof AIError&&error.code===code);

test('all six sections build provider requests and validate mocked results with server-only credentials',async()=>{
  for(const section of ['self','two','group','world','faith','couples']) {
    let request;
    const result=await assess(payload(section),{apiKey:'test-only-placeholder',model:'test-model',fetchImpl:async(url,options)=>{request={url,options,body:JSON.parse(options.body)};return response();}});
    assert.equal(result.recommended_next_step.action,'Ask about the working hours before deciding.');
    assert.equal(request.url,'https://api.openai.com/v1/responses');
    assert.equal(request.body.store,false);assert.equal(request.body.model,'test-model');
    assert.equal(request.body.text.format.type,'json_schema');assert.equal(request.body.text.format.strict,true);
    assert.equal(JSON.parse(request.body.input[0].content[0].text).section,section);
    assert.equal(request.body.input[0].content[0].text.includes('test-only-placeholder'),false);
    assert.match(request.body.instructions,/SECTION GUIDANCE:/);
  }
});

test('consent and bounded inputs are required before any provider call',async()=>{
  let calls=0;const options={apiKey:'test-only-placeholder',fetchImpl:async()=>{calls++;return response();}};
  await rejectsCode(assess({...payload(),consent:false},options),'consent_required');
  await rejectsCode(assess({...payload(),answers:['x'.repeat(5001),'','','']},options),'invalid_input');
  await rejectsCode(assess({...payload(),section:'unknown'},options),'invalid_input');
  await rejectsCode(assess({...payload(),feelings:['x'.repeat(81)]},options),'invalid_input');
  await rejectsCode(assess({...payload(),intensity:11},options),'invalid_input');
  await rejectsCode(assess({...payload(),mode:'private-room'},options),'invalid_input');
  await rejectsCode(assess({...payload(),followup:'x'.repeat(2001)},options),'invalid_input');
  await rejectsCode(assess({...payload(),answers:['','','',''],followup:123},options),'invalid_input');
  assert.equal(calls,0);
});

test('no configured key means an honest error with no assessment',async()=>{
  await rejectsCode(assess(payload(),{apiKey:'',fetchImpl:async()=>{throw new Error('must not call');}}),'not_configured');
});

test('previous guidance and follow-up are validated and included as untrusted input',async()=>{
  const input=payload();input.previousAssessment=validAssessment();input.followup='The recruiter cannot answer until next week.';
  let sent;await assess(input,{apiKey:'test-only-placeholder',fetchImpl:async(_,options)=>{sent=JSON.parse(JSON.parse(options.body).input[0].content[0].text);return response();}});
  assert.equal(sent.followup,input.followup);assert.deepEqual(sent.previousAssessment,input.previousAssessment);
  assert.throws(()=>validatePayload({...payload(),previousAssessment:{unexpected:'data'}}),AIError);
});

test('provider authentication, limits and malformed responses never leak provider error bodies',async()=>{
  const secret='DO_NOT_EXPOSE_PROVIDER_BODY';
  await rejectsCode(assess(payload(),{apiKey:'test-only-placeholder',fetchImpl:async()=>new Response(secret,{status:401})}),'provider_authentication');
  await rejectsCode(assess(payload(),{apiKey:'test-only-placeholder',fetchImpl:async()=>new Response(secret,{status:429})}),'provider_busy');
  for(const body of [{status:'incomplete',output:[]},{status:'completed',output:[{content:[{type:'output_text',text:'not JSON'}]}]},{status:'completed',output:[]}]) {
    await assert.rejects(assess(payload(),{apiKey:'test-only-placeholder',fetchImpl:async()=>new Response(JSON.stringify(body),{status:200})}),error=>error instanceof AIError&&!error.message.includes(secret));
  }
  await rejectsCode(assess(payload(),{apiKey:'test-only-placeholder',fetchImpl:async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'refusal',refusal:'no'}]}]}),{status:200})}),'ai_refusal');
});

test('an assessment without actual steps or with unknown fields is rejected',()=>{
  const missing=validAssessment();missing.recommended_next_step.steps=[];assert.throws(()=>validateAssessment(missing),AIError);
  const extra=validAssessment();extra.secret='unexpected';assert.throws(()=>validateAssessment(extra),AIError);
});

test('billing exhaustion, usage limits and temporary rate limits are distinguished without leaking details',async()=>{
  for(const [providerCode,expected] of [['credit_balance_exhausted','credits_required'],['project_spend_limit_exceeded','usage_limit_reached'],['slow_down','provider_busy']]) {
    await rejectsCode(assess(payload(),{apiKey:'test-only-placeholder',fetchImpl:async()=>new Response(JSON.stringify({error:{code:providerCode,message:'PRIVATE PROVIDER DETAIL'}}),{status:429})}),expected);
  }
});

test('provider timeout aborts the request and does not fabricate guidance',async()=>{
  await rejectsCode(assess(payload(),{apiKey:'test-only-placeholder',timeoutMs:5,fetchImpl:(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true}))}),'timeout');
});

async function withServer(options,fn) {
  const server=createAppServer(options);server.listen(0,'127.0.0.1');await once(server,'listening');
  const url=`http://127.0.0.1:${server.address().port}`;
  try {await fn(url);} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}

test('local HTTP contract returns status, guidance and no credential/source files',async()=>{
  await withServer({apiKey:'test-only-placeholder',model:'test-model',fetchImpl:async()=>response()},async(url)=>{
    const status=await fetch(url+'/api/status');assert.equal(status.headers.get('cache-control'),'no-store');assert.deepEqual(await status.json(),{configured:true,provider:'OpenAI',model:'test-model'});
    const result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'application/json',Origin:url},body:JSON.stringify(payload())});assert.equal(result.status,200);assert.deepEqual((await result.json()).assessment,validAssessment());
    for(const filename of ['/.env.local','/server.mjs','/ai-core.mjs','/package.json','/%2e%2e/.env.local']) {const blocked=await fetch(url+filename);assert.equal(blocked.status,404);assert.equal((await blocked.text()).includes('test-only-placeholder'),false);}
    const page=await fetch(url+'/');assert.equal(page.status,200);assert.match(page.headers.get('content-type'),/text\/html/);
  });
});

test('cross-origin, non-JSON, oversized and rapid requests are rejected',async()=>{
  let calls=0;
  await withServer({apiKey:'test-only-placeholder',rateLimit:2,fetchImpl:async()=>{calls++;return response();}},async(url)=>{
    let result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:JSON.stringify(payload())});assert.equal(result.status,403);
    result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'text/plain'},body:'data'});assert.equal(result.status,415);
    result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(50000)});assert.equal(result.status,413);
    for(let i=0;i<2;i++){result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});assert.equal(result.status,200);}
    result=await fetch(url+'/api/assess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});assert.equal(result.status,429);assert.equal(calls,2);
  });
});
