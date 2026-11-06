(() => {
  'use strict';
  const content = window.CG_CONTENT;
  const main = document.getElementById('main');
  const modal = document.getElementById('modal');
  const drafts = new Map();
  const notes = [];
  const lessons = [
    {title: 'Feelings are a starting point', label: '01 · EMOTIONAL LITERACY', body: 'Name an emotion in words that fit your experience. Then notice the situation, your interpretation, any physical sensations and what you feel drawn to do. These can influence one another. No single feeling tells the whole story.', practice: 'Try: “I notice I feel ____. The thought I am having is ____. What I know so far is ____.”', source: 'NHS · Self-help CBT techniques', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/'},
    {title: 'Make a little room', label: '02 · GROUNDING', body: 'Before a difficult conversation, you can pause and notice the room around you. Feel the contact of your feet with the floor, notice a few sights and sounds, and return attention to what you want to do next. You can stop if the exercise is uncomfortable.', practice: 'A pause is an option, not a test you must pass. You do not need to feel perfectly calm to be heard.', source: 'WHO · Doing What Matters in Times of Stress', url: 'https://www.who.int/publications/i/item/9789240003927'},
    {title: 'Listen, then check', label: '03 · REFLECTIVE LISTENING', body: 'Give someone room to finish. Summarise what you think they mean, then invite a correction. Understanding their account does not require agreeing with every claim, accepting blame or changing a boundary.', practice: 'Try: “What I heard is ____. Have I understood, or is something missing?”', source: 'Better Health Channel · Relationships and communication', url: 'https://www.betterhealth.vic.gov.au/health/healthyliving/relationships-and-communication'},
    {title: 'Ask for something specific', label: '04 · CONSTRUCTIVE REQUESTS', body: 'Describe an observable event, explain its impact on you, and make a request the other person can understand and genuinely decline. Ask about their experience instead of guessing their motives.', practice: 'Try: “When ____ happened, I felt ____. What matters to me is ____. Would you be willing to ____?”', source: 'Better Health Channel · Relationships and communication', url: 'https://www.betterhealth.vic.gov.au/health/healthyliving/relationships-and-communication'},
    {title: 'Understand across difference', label: '05 · DIALOGUE', body: 'People within a religion, nation or community do not all hold one view. Ask how someone understands their own position. Distinguish a quotation from an interpretation, a documented fact from a claim, and understanding from agreement.', practice: 'Try: “What does that term mean to you? Which source are we discussing? Where do we still differ?”', source: 'UNESCO · Intercultural dialogue', url: 'https://www.unesco.org/interculturaldialogue/en'},
    {title: 'A boundary is a valid outcome', label: '06 · WILLING PARTICIPATION', body: 'A constructive conversation may end with a pause, a boundary or an unresolved difference. Nobody must disclose a private experience, forgive, compromise or continue. When someone feels afraid or controlled, a joint exercise may be inappropriate.', practice: 'Try: “I am willing to discuss ____. I am not comfortable with ____. I need to pause now.”', source: 'NICE · Domestic violence and abuse (safety context)', url: 'https://www.nice.org.uk/guidance/qs116'}
  ];
  function esc(value = '') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char])); }
  function button(text, action, cls = '', extra = '') { return `<button class="button ${cls}" data-action="${action}" ${extra}>${text}</button>`; }
  function openModal(title, body) { document.getElementById('modal-body').innerHTML = `<h2 id="modal-title">${title}</h2>${body}`; if (!modal.open) modal.showModal(); }
  function toast(message) { const el=document.getElementById('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timeout); toast.timeout=setTimeout(()=>el.classList.remove('show'),3000); }
  function current() { const id=location.hash.split('/')[1]; return {item:content.find(x=>x.id===id), draft:drafts.get(id)}; }
  const quick = window.CG_QUICK.create({esc, button, openModal, closeModal: () => modal.close()});
  function art() { return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 380 340"><defs><linearGradient id="arch" x2="1" y2="1"><stop stop-color="#aac08d"/><stop offset="1" stop-color="#d4dfbd"/></linearGradient></defs><path d="M75 330V180a105 105 0 0 1 210 0v150" fill="url(#arch)"/><path d="M104 330V182a77 77 0 0 1 154 0v148" fill="#e6ebdd"/><path d="M125 330V181a56 56 0 0 1 112 0v149" fill="#b6c99c"/><path d="M146 330V182a35 35 0 0 1 70 0v148" fill="#e6ebdd"/><g class="orbit" fill="none" stroke="#749363" stroke-width=".8"><ellipse cx="180" cy="160" rx="158" ry="72" transform="rotate(-36 180 160)"/><circle cx="54" cy="199" r="6" fill="#214e43"/></g><g class="orbit-slow" fill="none" stroke="#95a780" stroke-width=".7"><ellipse cx="180" cy="160" rx="158" ry="72" transform="rotate(32 180 160)"/><circle cx="312" cy="189" r="7" fill="#f7f6f0"/></g><circle cx="180" cy="53" r="13" fill="#d1a77d"/><path d="M19 316h324" stroke="#9bad86" stroke-width="1"/></svg></div>`; }
  function renderHome() {
    main.innerHTML=`<section class="hero"><div class="hero-copy"><p class="eyebrow">SIX PATHS. A SHARED INTENTION.</p><h1>Find a way<br>through.</h1><p>Understand what you feel. Make room for another perspective. Take a thoughtful next step.</p></div>${art()}</section><div class="section-heading"><h2>Where would you like to begin?</h2><p>Choose the space that feels right today.</p></div><section class="paths" aria-label="Six paths to understanding">${content.map((item,i)=>`<button class="path" data-action="path" data-id="${item.id}" style="--tint:${['#e9e3ef','#e2ece3','#efe7d7','#e2e9ed','#eee5d8','#f0e2e1'][i]}"><span class="path-number">0${i+1}</span><span class="path-icon" aria-hidden="true">${item.icon}</span><h3>${item.title}</h3><p>${item.description}</p><span class="path-footer"><span>QUICK START</span><b aria-hidden="true">↗</b></span></button>`).join('')}</section><aside class="pause-strip"><span class="pause-symbol" aria-hidden="true">◌</span><div><strong>A moment before the conversation.</strong><p>Take a pause and notice what is around you.</p></div><button class="text-button" data-action="pause">Try a gentle pause ↗</button></aside>`;
  }
  function renderLearn() { main.innerHTML=`<header class="view-header"><p class="eyebrow">SMALL SKILLS. MORE UNDERSTANDING.</p><h1>Learn to connect.</h1><p>Short ideas to practise at your own pace. These are general learning exercises, not an explanation of anyone’s diagnosis or motives.</p></header><div class="library">${lessons.map(x=>`<article class="lesson"><p class="eyebrow">${x.label}</p><h2>${x.title}</h2><p>${x.body}</p><div class="callout">${x.practice}</div><a class="source-link" href="${x.url}" target="_blank" rel="noopener noreferrer">${x.source} ↗</a></article>`).join('')}</div>`; }
  function renderNotes() {
    main.innerHTML=`<header class="view-header"><p class="eyebrow">WORDS YOU HAVE REVIEWED</p><h1>Your session notes.</h1><p>Notes stay in memory for this visit. Use Clear or reload to clear them. Switching away may leave them available. A downloaded copy stays wherever you save it.</p></header>${notes.length?`<div class="notes-list">${notes.map((n,i)=>`<article class="note"><p class="mini-label">${esc(n.item.eyebrow)}</p><h2>${esc(n.item.title)}</h2><p>${esc(n.draft.plan.action)}</p><div class="actions-wrap"><a class="button secondary small" href="#session/${esc(n.id)}">Return to session</a>${button('View note','view-note','secondary small',`data-index="${i}"`)}${button('Export text','export-note','secondary small',`data-index="${i}"`)}${button('Delete','delete-note','quiet small',`data-index="${i}"`)}</div></article>`).join('')}</div><div class="actions-wrap">${button('Clear all notes & drafts','clear','secondary')}</div>`:`<div class="panel empty-state"><span class="path-icon" aria-hidden="true" style="margin:0 auto 25px">▱</span><h2>A little room for your next step.</h2><p>Complete a guided reflection and choose to keep your reviewed note here for this visit.</p><a class="button" href="#home">Choose a path ↗</a></div>`}`;
  }
  function renderAbout() {
    main.innerHTML = `<header class="view-header"><p class="eyebrow">THE INTENTION BEHIND COMMON GROUND</p>
      <h1>Understanding, with care.</h1><p>A guided space to reflect, practise communication and discuss differences. Bringing people together can include clearer boundaries and respectful disagreement.</p></header>
      <div class="principles">
        <section class="panel"><h2>Start with two answers.</h2><p>Describe what happened and what you’d like to change. Each path offers its own starting step, a way to rehearse it and a chance to come back and adjust it.</p></section>
        <section class="panel"><h2>Informed by psychology.</h2><p>Explore how thoughts, feelings and actions can influence each other. Practise listening, asking clear questions and making specific requests. You decide which ideas fit your experience.</p><a href="#learn" class="source-link">Read the learning notes and sources ↗</a></section>
        <section class="panel"><h2>Room for consent and boundaries.</h2><p>Take part freely, pass on any question, or leave at any time. Couples exercises support communication. If you feel afraid or controlled, private support can help you consider your options.</p><button class="text-button" data-action="unsafe">See private support options</button></section>
        <section class="panel"><h2>How guidance works.</h2><p>Guided exercises run on this device. Sites with a live AI connection offer a separate sharing choice. AI suggestions can be wrong and should be checked against your experience.</p><button class="text-button" data-action="privacy">Read privacy details</button></section>
      </div>`;
  }
  function renderPause() { main.innerHTML=`<div class="session-wrap"><button class="back-link" data-action="return">← Back to where you were</button><section class="session-card breathing"><p class="eyebrow">NO NEED TO RUSH</p><h2>Come back to this moment.</h2><p>Keep your eyes open if that feels comfortable. Breathe naturally; there is no pace you need to match.</p><div class="grounding-orb" aria-hidden="true">Here, now.</div><ol class="grounding-steps"><li>Notice the contact of your feet with the floor, or your body with the chair.</li><li>Look around. Notice a few colours, shapes and sounds.</li><li>Ask yourself: “What matters for the next small step?”</li></ol>${button('Gently animate the circle','animate','secondary')}<p class="help-text" style="margin-top:20px">You can skip or stop whenever you want. This exercise may not suit everyone.</p><a href="https://www.who.int/publications/i/item/9789240003927" class="source-link" target="_blank" rel="noopener noreferrer">Inspired by WHO grounding guidance ↗</a></section></div>`; }
  function redrawSession(item, draft, focus) {
    if (current().item !== item || drafts.get(item.id) !== draft || !location.hash.startsWith('#session/')) return;
    main.innerHTML = quick.render(item, draft);
    if (typeof focus === 'string') {
      document.getElementById(focus)?.focus();
    } else if (focus) {
      main.querySelector(`[data-action="${focus.action}"][data-value="${focus.value}"]`)?.focus();
    } else {
      window.scrollTo(0, 0);
      main.focus({preventScroll: true});
    }
  }
  function route() {
    const [page,id]=(location.hash.slice(1)||'home').split('/');
    if(page==='session') {const item=content.find(x=>x.id===id);if(!item){location.hash='home';return;}if(!drafts.has(id))drafts.set(id,window.CG_QUICK.createDraft());redrawSession(item,drafts.get(id));}
    else if(page==='learn')renderLearn();else if(page==='notes')renderNotes();else if(page==='about')renderAbout();else if(page==='pause')renderPause();else renderHome();
    document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(page==='session'||page==='pause'?'home':page);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    window.scrollTo(0,0); main.focus({preventScroll:true});
  }
  let returnHash='#home';
  function downloadNote(item,draft) {
    const text = quick.noteText(item, draft);
    openModal('Take your note with you.',`<p>Copy the text below, or request a text-file download if your browser supports it. Exported copies are outside the app’s clear-data control.</p><label class="prompt-label" for="export-text">Your reviewed note</label><textarea id="export-text" readonly rows="10">${esc(text)}</textarea><div class="actions-wrap">${button('Copy text','copy-text','secondary')}${button('Download .txt','download-text','secondary',`data-filename="common-ground-${item.id}-note.txt"`)}</div><p class="help-text" id="export-status" role="status">You decide where to keep or share a copy.</p>`);
  }
  document.addEventListener('input', event => {
    const {draft} = current();
    if (draft && event.target.dataset.quickField) quick.update(draft, event.target);
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'quick-intake') return;
    event.preventDefault();
    const {item, draft} = current();
    if (item && draft) quick.start(item, draft, focus => redrawSession(item, draft, focus));
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('.skip')){event.preventDefault();main.focus();main.scrollIntoView();return;}
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action;const {item,draft}=current();
    if (action.startsWith('quick-')) {
      if (item && draft) quick.act(item, draft, target, focus => redrawSession(item, draft, focus));
      return;
    }
    if(action==='path')location.hash='session/'+target.dataset.id;
    if(action==='home')location.hash='home';
    if(action==='pause'){returnHash=location.hash||'#home';location.hash='pause';}
    if(action==='return')location.hash=returnHash;
    if(action==='animate'){const orb=main.querySelector('.grounding-orb');orb.classList.toggle('animate');const running=orb.classList.contains('animate');target.textContent=running?'Stop animation':'Gently animate the circle';target.setAttribute('aria-pressed',String(running));}
    if(action==='save'&&draft?.accepted&&draft.plan?.action.trim()){const clone=JSON.parse(JSON.stringify(draft));const existing=notes.findIndex(n=>n.id===item.id);const note={id:item.id,item,draft:clone};if(existing>=0)notes[existing]=note;else notes.push(note);location.hash='notes';toast('Note kept for this visit. Reloading will clear it.');}
    if(action==='export'&&draft?.accepted&&draft.plan?.action.trim())downloadNote(item,draft);
    if(action==='export-note'){const n=notes[Number(target.dataset.index)];downloadNote(n.item,n.draft);}
    if(action==='download-text'){const text=document.getElementById('export-text').value,blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=target.dataset.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('export-status').textContent='Download requested. If no file appears, select and copy the text above.';}
    if(action==='copy-text'){const text=document.getElementById('export-text').value,status=document.getElementById('export-status');if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>{status.textContent='Copied to your clipboard. Clipboard contents are outside this app’s clear-data control.';}).catch(()=>{status.textContent='Select and copy the text above using your device’s copy controls.';});}else{document.getElementById('export-text').select();status.textContent='Text selected. Use your device’s Copy command.';}}
    if(action==='view-note'){const n=notes[Number(target.dataset.index)];openModal(esc(n.item.title),quick.noteMarkup(n.draft));}
    if(action==='delete-note'){notes.splice(Number(target.dataset.index),1);renderNotes();toast('Note deleted from this visit. Downloads are unchanged.');}
    if(action==='clear-session'){quick.cancel(draft);drafts.delete(item.id);location.hash='home';toast('This reflection has been cleared. Kept notes are separate.');}
    if(action==='clear'){notes.length=0;for(const d of drafts.values())quick.cancel(d);drafts.clear();quick.clearAccess();if(modal.open)modal.close();location.hash='home';route();toast('Notes and drafts cleared. Downloads are unchanged.');}
    if(action==='close-modal')modal.close();
    if (action === 'privacy') openModal('Your words, your choice.', `
      <p>Guided exercises run on your device. Drafts, practice replies and notes stay in memory for this visit. Clear them here or reload the page. Anyone viewing a shared screen can see what’s entered.</p>
      <p>When you choose AI guidance and agree to share, the listed details go to the site’s AI server and OpenAI. Practice replies stay on your device. <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noopener noreferrer">OpenAI data controls ↗</a></p>
      <p>Exported copies stay wherever you save them.</p>
      ${button('Clear all notes & drafts', 'clear', 'secondary full')}`);
    if(action==='unsafe')openModal('You can step away.',`<p>You do not have to continue, compromise, reconcile or share details here. This app cannot assess your safety or provide emergency support.</p><p>If you face immediate danger, contact your local emergency service when it is safe to do so. Consider seeking private support from someone you trust or a qualified local service.</p><p><a href="https://www.nhs.uk/live-well/getting-help-for-domestic-violence/" target="_blank" rel="noopener noreferrer">NHS information about domestic abuse and support ↗</a></p><p class="help-text">Opening a support website may appear in your browser history.</p>${button('Clear this visit & return home','clear','secondary full')}`);
  });
  window.addEventListener('hashchange',route);
  route();
  if(window.CG_CONFIG?.useServiceWorker&&'serviceWorker' in navigator&&!window.Capacitor){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
})();
