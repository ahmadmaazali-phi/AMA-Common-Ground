import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../www/ai-ui.js',import.meta.url),'utf8');
const result=()=>({summary:'You are choosing between growth and time at home.',possible_dynamics:[{title:'Competing values',explanation:'Both priorities may matter.'}],uncertainties:['Working hours are unknown.'],recommended_next_step:{action:'Ask the recruiter about typical weekly hours.',why:'This fills a specific information gap before the deadline.',steps:['Draft one question about weekly hours.','Send it to the recruiter.','Compare the answer with the time you want at home.'],timeframe:'Tomorrow morning.',example_words:'Could you describe a typical working week?',fallback:'Draft the message without sending it yet.'},other_options:[{title:'Explore a trial',action:'Ask whether a short trial of the role is possible.',why:'A reversible experiment can add useful information.'}],follow_up_questions:['When must you reply?'],safety:{mode:'everyday',message:''}});
const draft=()=>({id:'self',answers:['I need to choose between a new role and family time.','I feel uncertain.','',''],feelings:[],needs:[],intensity:null,body:'',mode:'alone',aiConsent:true,aiPending:false,aiAssessment:null,aiFollowup:'',accepted:false});
function client(fetchImpl) {
  const window={CG_CONFIG:{apiBaseUrl:''}};
  const context={window,fetch:fetchImpl,location:{protocol:'http:'},document:{getElementById:()=>null},AbortController,AbortSignal,setTimeout,clearTimeout,Date,console};
  vm.runInNewContext(source,context);
  return window.CG_AI;
}
const ok=(value)=>({ok:true,json:async()=>value});

test('every section displays concrete guidance and choices, rather than only intake answers',()=>{
  const api=client(()=>{throw new Error('render must not call a provider');});
  for(const id of ['self','two','group','world','faith','couples']) {
    const d={...draft(),id,aiAssessment:result()};
    const html=api.render({id},d);
    assert.ok(html.includes(d.aiAssessment.recommended_next_step.action));
    assert.ok(html.includes('Draft one question about weekly hours.'));
    assert.ok(html.includes('Does this fit your situation?'));
    assert.ok(html.includes('Other ways forward'));
    assert.ok(html.includes('If that feels difficult:'));
  }
});
test('clearing during the connection check prevents any personal-data request',async()=>{
  let finishStatus,calls=0;
  const api=client(url=>url==='/api/status'?new Promise(resolve=>{finishStatus=()=>resolve(ok({configured:true}));}):(calls++,Promise.resolve(ok({assessment:result()}))));
  const d=draft(),pending=api.generate({id:'self'},d,()=>{});
  assert.equal(d.aiPending,true);
  api.cancel(d);finishStatus();await pending;
  assert.equal(calls,0);assert.equal(d.aiAssessment,null);assert.equal(d.aiPending,false);
});
test('rapid repeated clicks dispatch one assessment, and no consent dispatches none',async()=>{
  let finishStatus,calls=0;
  const api=client(url=>url==='/api/status'?new Promise(resolve=>{finishStatus=()=>resolve(ok({configured:true}));}):(calls++,Promise.resolve(ok({assessment:result()}))));
  const d=draft();const first=api.generate({id:'self'},d,()=>{}),second=api.generate({id:'self'},d,()=>{});
  finishStatus();await Promise.all([first,second]);assert.equal(calls,1);
  await api.generate({id:'self'},{...draft(),aiConsent:false},()=>{});assert.equal(calls,1);
});
test('a correction sends prior guidance and the user correction, then clears sharing approval',async()=>{
  let payload;
  const api=client(async(url,options)=>url==='/api/status'?ok({configured:true}):(payload=JSON.parse(options.body),ok({assessment:result()})));
  const d={...draft(),aiAssessment:result(),aiFollowup:'The recruiter cannot reply before my deadline.'};
  await api.generate({id:'self'},d,()=>{},true);
  assert.equal(payload.followup,'The recruiter cannot reply before my deadline.');assert.equal(payload.previousAssessment.summary,result().summary);assert.equal(d.aiConsent,false);
});
test('unavailable credits remain an actionable error and never become an invented assessment',async()=>{
  const api=client(async url=>url==='/api/status'?ok({configured:true}):({ok:false,json:async()=>({error:{code:'credits_required',message:'Add API credits before trying again.'}})}));
  const d=draft();await api.generate({id:'self'},d,()=>{});
  assert.equal(d.aiAssessment,null);assert.equal(d.aiErrorCode,'credits_required');
  const item={id:'self',prompts:Array.from({length:4},()=>({label:'Your entry',help:'',placeholder:''}))};
  const html=api.render(item,d);assert.ok(html.includes('https://platform.openai.com/settings/organization/billing'));assert.ok(html.includes('No substitute AI response'));
});
test('selected alternatives do not inherit unrelated primary timing or fallback',()=>{
  const api=client(()=>{}),d={...draft(),aiAssessment:result()};api.adopt(d,0);
  assert.equal(d.answers[3],result().other_options[0].action);assert.equal(d.planWhen,'');assert.equal(d.planFallback,'');assert.equal(d.planSteps.length,0);
});
test('sharing preview includes an edited plan and generated HTML escapes model text',()=>{
  const api=client(()=>{}),d=draft();d.answers[3]='An existing private plan';
  const item={id:'self',prompts:Array.from({length:4},()=>({label:'Your entry',help:'',placeholder:''}))};
  assert.ok(api.render(item,d).includes('An existing private plan'));
  d.aiAssessment=result();d.aiAssessment.summary='<img src=x onerror=alert(1)>';
  const html=api.render(item,d);assert.equal(html.includes('<img src=x'),false);assert.ok(html.includes('&lt;img src=x'));
});
