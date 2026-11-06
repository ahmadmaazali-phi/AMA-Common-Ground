/* Real assessments come only from the server. There is no sample-result fallback. */
window.CG_AI = (() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let connection = {checked:false,configured:false};
  let connectionPromise;
  const controllers = new Map();
  let serial = 0;
  const apiBase = () => (window.CG_CONFIG?.apiBaseUrl || '').replace(/\/$/,'');
  const endpoint = path => apiBase()+path;
  async function checkConnection() {
    if(connectionPromise)return connectionPromise;
    connectionPromise=(async()=>{
      if(location.protocol==='file:'&&!apiBase()){connection={checked:true,configured:false,message:'Open the connected app to use AI. This downloaded file has no AI server.'};return connection;}
      try {
        const response=await fetch(endpoint('/api/status'),{cache:'no-store',signal:AbortSignal.timeout(6000)});
        if(!response.ok)throw new Error();
        const data=await response.json();
        connection={checked:true,configured:data.configured===true,provider:data.provider||'OpenAI',model:data.model||'',message:data.configured?'The AI key is configured. Model availability is checked when you request guidance.':'The app server is running, but its AI key is not configured.'};
      } catch {connection={checked:true,configured:false,message:'The AI server could not be reached. Your entries have not been sent.'};}
      return connection;
    })();
    return connectionPromise;
  }
  function connectionMarkup() {
    if(!connection.checked)return '<span class="ai-connection">Checking AI connection…</span>';
    return `<span class="ai-connection ${connection.configured?'ready':'unavailable'}">${connection.configured?'● AI configured':'○ AI not connected'}</span>`;
  }
  function errorMarkup(draft) {
    if(!draft.aiError)return '';
    const billing=['credits_required','quota_required'].includes(draft.aiErrorCode),limits=draft.aiErrorCode==='usage_limit_reached';
    return `<div class="callout error-callout" role="alert"><p>${esc(draft.aiError)}</p>${billing?'<a class="source-link" href="https://platform.openai.com/settings/organization/billing" target="_blank" rel="noopener noreferrer">Open OpenAI API billing ↗</a>':''}${limits?'<a class="source-link" href="https://platform.openai.com/settings/organization/limits" target="_blank" rel="noopener noreferrer">Review OpenAI API limits ↗</a>':''}<p class="help-text">Your entries are still here. No substitute AI response has been generated.</p></div>`;
  }
  function intake(item,draft) {
    const shared=draft.mode==='together';
    return `<p class="eyebrow">UNDERSTAND · EXPLORE · ACT</p><h2>Let’s find a way forward.</h2><p>The AI will consider your situation and feelings, explain possible patterns, and suggest concrete steps. You can correct its understanding and ask for a different approach.</p><div id="ai-connection-status">${connectionMarkup()}</div>${errorMarkup(draft)}<details class="explainer"><summary>Add context before getting guidance <span class="help-text">(optional)</span></summary><label class="prompt-label" for="answer">${esc(item.prompts[2].label)}</label><p class="help-text">${esc(item.prompts[2].help)}</p><textarea id="answer" data-field="answer" maxlength="5000" rows="3" placeholder="${esc(item.prompts[2].placeholder)}">${esc(draft.answers[2])}</textarea><div class="char-count"><span id="count">${draft.answers[2].length}</span> / 5000</div></details><details class="explainer"><summary>Review what will be sent</summary><p class="help-text">Your entries, selected feelings and needs, body sensations, any intensity rating, and this section’s context will go to the app’s server and OpenAI. No contacts or other device information are included.</p>${draft.answers.map((x,i)=>`<p class="data-preview"><strong>${esc(item.prompts[i].label)}</strong><br>${esc(x||'Not entered.')}</p>`).join('')}<p class="help-text">${esc([draft.feelings.length?'Feelings: '+draft.feelings.join(', '):'',draft.needs.length?'Needs: '+draft.needs.join(', '):'',draft.body?'Body: '+draft.body:'',draft.intensity!==null?'Intensity: '+draft.intensity+'/10':''].filter(Boolean).join(' · ')||'No optional check-in selections.')}</p></details><label class="checkline"><input id="ai-consent" data-field="aiConsent" type="checkbox" ${draft.aiConsent?'checked':''}><span>${shared?'Everyone whose information is included agrees to send these entries to the app server and OpenAI for AI guidance.':'I agree to send these entries to the app server and OpenAI for AI guidance.'} The AI can be wrong. <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noopener noreferrer">Provider data controls ↗</a></span></label><div class="actions-wrap"><button class="button" data-action="ai-assess" ${!draft.aiConsent?'disabled':''}>Get AI guidance →</button><button class="button secondary" data-action="ai-setup">Connection details</button></div><p class="help-text">AI guidance is a suggestion to consider, not a diagnosis or a verified account of other people’s motives.</p>`;
  }
  function loading() {return '<p class="eyebrow">WORKING WITH YOUR ENTRIES</p><h2>Considering a way forward…</h2><div class="ai-loading" role="status"><span class="ai-loading-dot"></span><p>The AI is examining the situation and preparing practical options. This can take a little time.</p></div><button class="button secondary" data-action="ai-cancel">Cancel request</button><p class="help-text">Cancelling stops the app waiting for a response. A request already received by the provider may still be processed.</p>';}
  function result(item,draft) {
    const a=draft.aiAssessment, next=a.recommended_next_step, caution=a.safety.mode!=='everyday';
    return `<p class="eyebrow">AI GUIDANCE · REVIEW WHAT FITS</p><h2>A possible way forward.</h2><p>${esc(a.summary)}</p>${caution?`<div class="callout error-callout"><strong>${a.safety.mode==='urgent_support'?'Prioritise immediate support':'Pause the shared exercise'}</strong><p>${esc(a.safety.message)}</p><button class="text-button" data-action="unsafe">Private support options</button></div>`:''}<section class="ai-recommendation"><p class="eyebrow">SUGGESTED NEXT STEP</p><h3>${esc(next.action)}</h3><p>${esc(next.why)}</p><ol>${next.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${next.example_words?`<div class="example-words"><p class="mini-label">WORDS YOU COULD ADAPT</p><p>${esc(next.example_words)}</p></div>`:''}<p class="help-text"><strong>Suggested timing:</strong> ${esc(next.timeframe)}</p><p class="help-text"><strong>If that feels difficult:</strong> ${esc(next.fallback)}</p><button class="button" data-action="ai-adopt">Use this as my starting plan →</button></section>${a.possible_dynamics.length?`<section class="ai-section"><h3>What may be happening</h3><p class="help-text">Possible explanations based on what was shared. Reject or correct anything that does not fit.</p>${a.possible_dynamics.map(x=>`<div class="dynamic"><strong>${esc(x.title)}</strong><p>${esc(x.explanation)}</p></div>`).join('')}</section>`:''}${a.other_options.length?`<section class="ai-section"><h3>Other ways forward</h3><div class="ai-options">${a.other_options.map((x,i)=>`<article><h4>${esc(x.title)}</h4><p>${esc(x.action)}</p><p class="help-text">${esc(x.why)}</p><button class="text-button" data-action="ai-alternative" data-index="${i}">Build a plan from this →</button></article>`).join('')}</div></section>`:''}${a.uncertainties.length?`<details class="explainer"><summary>What the AI cannot establish yet</summary><ul>${a.uncertainties.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}<section class="ai-section"><h3>Does this fit your situation?</h3>${a.follow_up_questions.length?`<p class="help-text">${esc(a.follow_up_questions.join(' '))}</p>`:''}<label class="prompt-label" for="ai-followup">Correct something or ask for a different approach</label><textarea id="ai-followup" data-field="aiFollowup" maxlength="2000" rows="3" placeholder="For example: That assumes I can change my hours, but I can’t. What else could I try?">${esc(draft.aiFollowup||'')}</textarea><label class="checkline"><input id="ai-followup-consent" data-field="aiConsent" type="checkbox" ${draft.aiConsent?'checked':''}><span>${draft.mode==='together'?'Everyone whose information appears here agrees':'I agree'} to send the current entries, this AI response and the correction to OpenAI for revised guidance.</span></label><div class="actions-wrap"><button class="button secondary" data-action="ai-refine" ${!draft.aiConsent?'disabled':''}>Revise the guidance →</button><button class="button quiet" data-action="ai-reset">Edit the information first</button></div>${errorMarkup(draft)}</section>`;
  }
  function render(item,draft) {return draft.aiPending?loading():draft.aiAssessment?result(item,draft):intake(item,draft);}
  async function mount() {
    await checkConnection();
    const node=document.getElementById('ai-connection-status');if(node)node.innerHTML=connectionMarkup();
  }
  function invalidate(draft) {
    cancel(draft);
    draft.aiAssessment=null;draft.aiError='';draft.aiErrorCode='';draft.aiConsent=false;draft.accepted=false;
  }
  function cancel(draft) {const controller=controllers.get(draft.id);if(controller)controller.abort();controllers.delete(draft.id);draft.aiRequestId=null;draft.aiPending=false;}
  async function generate(item,draft,rerender,refine=false) {
    if(draft.aiPending)return;
    if(!draft.aiConsent){draft.aiError='Please review the sharing choice before sending your entries.';rerender();return;}
    if(draft.answers.slice(0,3).join(' ').trim().length<20){draft.aiError='Please add a little more about the situation first, so the AI has something concrete to work with.';rerender();return;}
    if(refine&&!(draft.aiFollowup||'').trim()){draft.aiError='Add what does not fit or what you would like to change before asking for a revision.';rerender();return;}
    draft.aiError='';draft.aiErrorCode='';draft.aiPending=true;const controller=new AbortController();controllers.set(draft.id,controller);const requestId=++serial;draft.aiRequestId=requestId;const previous=refine?draft.aiAssessment:null;rerender();
    await checkConnection();
    if(draft.aiRequestId!==requestId||!draft.aiConsent||controller.signal.aborted)return;
    if(!connection.configured){draft.aiError=connection.message+' No assessment has been generated.';draft.aiPending=false;draft.aiRequestId=null;controllers.delete(draft.id);rerender();return;}
    let timer=setTimeout(()=>controller.abort(),75000);
    try {
      const response=await fetch(endpoint('/api/assess'),{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({section:item.id,answers:draft.answers,feelings:draft.feelings,needs:draft.needs,intensity:draft.intensity,body:draft.body,mode:draft.mode||'alone',consent:true,followup:refine?draft.aiFollowup:'',previousAssessment:previous})});
      const data=await response.json();
      if(!response.ok||!data.assessment){const error=new Error(data?.error?.message||'The AI could not return guidance. Your entries are still here.');error.code=data?.error?.code||'';throw error;}
      if(draft.aiRequestId!==requestId)return;
      draft.aiAssessment=data.assessment;draft.aiFollowup='';draft.aiConsent=false;draft.accepted=false;draft.aiGeneratedAt=new Date().toISOString();
    } catch(error) {if(draft.aiRequestId!==requestId)return;draft.aiErrorCode=error.code||'';draft.aiError=error.name==='AbortError'?'The request stopped or took too long. Your entries are still here; you can try again.':error.message;}
    finally {clearTimeout(timer);if(draft.aiRequestId===requestId){draft.aiPending=false;draft.aiRequestId=null;controllers.delete(draft.id);rerender();}}
  }
  function adopt(draft,index) {
    const a=draft.aiAssessment;if(!a)return;
    const next=a.recommended_next_step,option=Number.isInteger(index)?a.other_options[index]:null;
    if(index!==undefined&&!option)return;
    draft.answers[3]=option?option.action:next.action;
    draft.planWhy=option?option.why:next.why;draft.planSteps=option?[]:[...next.steps];draft.planWhen=option?'':next.timeframe;draft.planFallback=option?'':next.fallback;draft.planWhenEdited=false;draft.planFallbackEdited=false;draft.planWords=option?'':next.example_words;draft.planSource='AI suggestion selected by the user';draft.accepted=false;draft.stage=4;
  }
  function planFields(draft) {return `<div id="ai-plan-details">${draft.planWhy?`<div class="callout"><strong>Why try this?</strong><p>${esc(draft.planWhy)}</p></div>`:''}${draft.planSteps?.length?`<h3>How to try it</h3><ol class="plan-steps">${draft.planSteps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:''}${draft.planWords?`<div class="example-words"><p class="mini-label">WORDS TO ADAPT</p><p>${esc(draft.planWords)}</p></div>`:''}</div><p id="plan-edit-notice" class="help-text" role="status"></p><label class="prompt-label" for="plan-when">When will you try this?</label><input id="plan-when" type="text" data-field="planWhen" maxlength="300" value="${esc(draft.planWhen||'')}" placeholder="For example: tomorrow after breakfast"><label class="prompt-label" for="plan-fallback">If this is difficult, what is the smaller alternative?</label><textarea id="plan-fallback" data-field="planFallback" maxlength="1500" rows="2">${esc(draft.planFallback||'')}</textarea>`;}
  function summary(draft) {return `<section class="plan-summary"><p class="eyebrow">YOUR WAY FORWARD</p><h3>${esc(draft.answers[3]||'Choose a starting action from your AI guidance.')}</h3>${draft.planWhen?`<p><strong>When:</strong> ${esc(draft.planWhen)}</p>`:''}${draft.planSteps?.length?`<ol>${draft.planSteps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:''}${draft.planFallback?`<p><strong>If blocked:</strong> ${esc(draft.planFallback)}</p>`:''}<p class="help-text">${draft.planSource==='User-edited plan'?'Your edited plan.':'An AI suggestion you can change.'} This is not a clinical assessment or a confirmed agreement.</p></section>`;}
  function exportText(draft) {const a=draft.aiAssessment;if(!a)return '';return ['AI GUIDANCE — SUGGESTIONS, NOT A CLINICAL ASSESSMENT',a.summary,'','Possible dynamics:',...a.possible_dynamics.map(x=>x.title+': '+x.explanation),'','Suggested action: '+a.recommended_next_step.action,...a.recommended_next_step.steps.map((x,i)=>(i+1)+'. '+x),'Suggested words: '+a.recommended_next_step.example_words,'Fallback: '+a.recommended_next_step.fallback,'','Uncertainties:',...a.uncertainties,'','USER-CHOSEN PLAN',draft.answers[3],'When: '+(draft.planWhen||'Not set.'),'If blocked: '+(draft.planFallback||'Not set.')].join('\n');}
  function setup(openModal) {openModal('Connect the app to AI.',`<div>${connectionMarkup()}</div><p>${esc(connection.message||'The app is checking its server connection.')}</p><p>The API key belongs in the app’s server settings. Never put it into this page, a downloadable HTML file, or a mobile app bundle.</p><p>On this computer, use the connected local app at <a href="http://127.0.0.1:4191/">127.0.0.1:4191 ↗</a>. The downloaded file can display the interface but needs that server to generate guidance.</p><p>For phones and a public release, connect a hosted HTTPS backend with user authentication and spending controls. No public AI backend is deployed by this local setup.</p>`);}
  return {render,mount,generate,adopt,invalidate,cancel,planFields,summary,exportText,setup,checkConnection};
})();
