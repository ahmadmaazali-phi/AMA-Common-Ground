/* The public page can run exercises entirely in the browser. Live AI is optional. */
window.CG_QUICK = (() => {
  'use strict';

  const goals = {
    self: 'What would you like to decide or change?',
    two: 'What would you like to be different after the conversation?',
    group: 'What does the group need to decide or change?',
    world: 'What question would you like to understand better?',
    faith: 'What would you like to understand about the difference?',
    couples: 'What would you like to change the next time this comes up?'
  };
  const feedbackLabels = {helped: 'Helped', stuck: 'Still stuck', worse: 'Made things worse'};
  const fitLabels = {fits: 'That fits', partly: 'Partly', missed: 'You missed something'};

  function connection() {
    const configured = window.CG_CONFIG?.apiBaseUrl?.trim();
    if (configured) {
      try {
        const url = new URL(configured);
        if (url.protocol === 'https:' && url.origin === configured.replace(/\/$/, '')) {
          return {url: url.origin, remote: true};
        }
      } catch {
        // An invalid address leaves the standalone exercise available.
      }
      return null;
    }
    if (window.CG_CONFIG?.useLocalApi && location.protocol === 'http:' && location.hostname === '127.0.0.1') {
      return {url: '', remote: false};
    }
    return null;
  }

  function createDraft() {
    return {
      view: 'intake', description: '', goal: '', mode: 'alone', result: null, source: null,
      fit: null, correction: '', feedback: null, revision: null, practiceIndex: 0,
      replies: [], revealed: [], practiceReturn: 'result', plan: null, accepted: false,
      pending: null, error: ''
    };
  }

  function create({esc, button, openModal, closeModal}) {
    const api = connection();
    let accessCode = '';
    const list = (items, tag = 'ul') => `<${tag}>${items.map(item => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
    const escape = value => esc(value ?? '');

    function intake(item, draft) {
      const shared = item.id !== 'self' && item.id !== 'world';
      return `
        <p class="eyebrow">${esc(item.eyebrow)} · QUICK START</p>
        <h2>Start with what happened.</h2>
        <p>Describe one situation and what you’d like to change. Add how it felt if that helps explain what matters.</p>
        <form id="quick-intake" autocomplete="off">
          <label class="prompt-label" for="quick-description">${esc(item.prompts[0].label)}</label>
          <textarea id="quick-description" data-quick-field="description" rows="3" maxlength="5000" required placeholder="${esc(item.prompts[0].placeholder)}">${esc(draft.description)}</textarea>
          <label class="prompt-label" for="quick-goal">${esc(goals[item.id])}</label>
          <textarea id="quick-goal" data-quick-field="goal" rows="2" maxlength="2000" required placeholder="A small, specific change is enough.">${esc(draft.goal)}</textarea>
          ${shared ? `<label class="checkline"><input type="checkbox" data-quick-field="mode" ${draft.mode === 'together' ? 'checked' : ''}>
            <span>We’re sharing this screen and everyone is choosing to take part. Anyone can pause or pass.</span></label>` : ''}
          <div class="actions-wrap">
            <button class="button" type="submit">Find a next step →</button>
            ${api ? button('Get AI guidance', 'quick-ai', 'secondary', 'type="button"') : ''}
          </div>
        </form>
        <p class="help-text quick-privacy">${api
          ? 'The guided exercise runs on this device. AI asks before sending your entries.'
          : 'This version uses guided exercises on your device. Live AI needs a separate server connection.'}</p>
        <div class="quick-links">
          <button class="text-button" data-action="pause">Take a pause</button>
          <button class="text-button" data-action="unsafe">I feel unsafe</button>
          ${draft.result ? '<button class="text-button" data-action="quick-result">Return to my result</button>' : ''}
        </div>`;
    }

    function errorMarkup(draft) {
      return draft.error ? `<div class="callout error-callout" role="alert">${esc(draft.error)}</div>` : '';
    }

    function sourceName(draft) {
      return draft.source === 'ai' ? 'AI guidance' : 'Guided exercise';
    }

    function revisionPanel(draft, kind) {
      const editing = draft.revision?.kind === kind;
      if (!editing) return '';
      const correction = kind === 'correction';
      const selection = draft.revision.selection;
      const label = correction ? 'What should change in our understanding?' : 'What happened when you tried it?';
      const action = draft.source === 'ai' ? 'Revise with AI' : 'Adjust my next step';
      return `<div class="quick-revision">
        <p class="mini-label">${esc(correction ? fitLabels[selection] : feedbackLabels[selection])}</p>
        <label class="prompt-label" for="quick-revision">${label}</label>
        <textarea id="quick-revision" data-quick-field="revision" maxlength="1600" rows="2" placeholder="${correction ? 'For example, I can’t change the schedule.' : 'Add a detail if you’d like.'}">${esc(draft.revision.text)}</textarea>
        <div class="actions-wrap">
          ${button(action, 'quick-revise')}
          ${draft.source === 'ai' ? button('Adjust on this device', 'quick-revise-guided', 'secondary') : ''}
          ${button('Cancel', 'quick-close-revision', 'quiet')}
        </div>
      </div>`;
    }

    function feedbackPanel(draft) {
      return `<section class="ai-section">
        <h3>How did it go?</h3>
        <p class="help-text">Come back here after trying your step. Your answer helps choose what to do next.</p>
        ${draft.feedback ? `<p class="quick-confirmation">Last check-in · ${esc(feedbackLabels[draft.feedback.outcome])}</p>` : ''}
        <div class="chips" role="group" aria-label="How the step went">
          ${Object.entries(feedbackLabels).map(([value, label]) => `<button class="chip" data-action="quick-feedback" data-value="${value}" aria-pressed="${draft.revision?.kind === 'feedback' && draft.revision.selection === value}">${label}</button>`).join('')}
        </div>
        ${revisionPanel(draft, 'feedback')}
      </section>`;
    }

    function resultView(draft) {
      const result = draft.result;
      const next = result.recommended_next_step;
      const caution = result.safety.mode !== 'everyday';
      return `
        <p class="eyebrow">${sourceName(draft).toUpperCase()} · YOUR NEXT STEP</p>
        <h2>A way forward.</h2>
        <p>${esc(result.summary)}</p>
        ${draft.source === 'guided' ? '<p class="help-text">This exercise offers prompts and examples for the path you chose. Check which ideas fit your situation.</p>' : ''}
        ${errorMarkup(draft)}
        ${caution ? `<div class="callout error-callout"><strong>Make space for support</strong>
          <p>${esc(result.safety.message)}</p><button class="text-button" data-action="unsafe">Private support options</button></div>` : ''}
        <section class="ai-recommendation">
          <p class="eyebrow">TRY THIS FIRST</p>
          <h3>${esc(next.action)}</h3>
          <p>${esc(next.why)}</p>
          ${list(next.steps, 'ol')}
          ${next.example_words ? `<div class="example-words"><p class="mini-label">WORDS TO ADAPT</p><p>${esc(next.example_words)}</p></div>` : ''}
          <p><strong>When to try it</strong> · ${esc(next.timeframe)}</p>
          <p><strong>If you get stuck</strong> · ${esc(next.fallback)}</p>
          <div class="actions-wrap">
            ${button('Use this step', 'quick-adopt')}
            ${canPractise(draft) ? button('Practise first', 'quick-practice', 'secondary') : ''}
            ${draft.plan ? button('Return to my plan', 'quick-plan', 'secondary') : ''}
          </div>
        </section>
        <section class="ai-section">
          <h3>${esc(result.section_result.title)}</h3>
          ${list(result.section_result.items)}
        </section>
        <section class="ai-section">
          <h3>${caution ? 'What to keep in mind' : 'What may be happening'}</h3>
          ${result.possible_dynamics.map(detail => `<div class="dynamic"><strong>${esc(detail.title)}</strong><p>${esc(detail.explanation)}</p></div>`).join('')}
          ${result.uncertainties.length ? `<details class="explainer"><summary>What to check for yourself</summary>${list(result.uncertainties)}</details>` : ''}
          ${result.follow_up_questions.length ? `<details class="explainer"><summary>A question to think about</summary>${list(result.follow_up_questions)}</details>` : ''}
          <p class="help-text">Does this understanding fit?</p>
          <div class="chips" role="group" aria-label="How the guidance fits">
            ${Object.entries(fitLabels).map(([value, label]) => `<button class="chip" data-action="quick-fit" data-value="${value}" aria-pressed="${draft.fit === value}">${label}</button>`).join('')}
          </div>
          ${draft.fit === 'fits' ? '<p class="quick-confirmation" role="status">You’ve marked this guidance as fitting your situation.</p>' : ''}
          ${revisionPanel(draft, 'correction')}
        </section>
        ${result.other_options.length ? `<section class="ai-section">
          <h3>Other options</h3>
          <div class="ai-options">${result.other_options.map((option, index) => `<article>
            <h4>${esc(option.title)}</h4><p>${esc(option.action)}</p><p class="help-text">${esc(option.why)}</p>
            ${button('Use this option', 'quick-adopt', 'secondary small', `data-index="${index}"`)}
          </article>`).join('')}</div>
        </section>` : ''}
        ${feedbackPanel(draft)}
        <div class="actions-wrap">
          ${button('Edit what I shared', 'quick-edit', 'secondary')}
          ${api && draft.source === 'guided' && !caution ? button('Personalise with AI', 'quick-ai', 'secondary') : ''}
        </div>`;
    }

    function practiceView(draft) {
      const turns = draft.result.practice;
      const index = draft.practiceIndex;
      const turn = turns[index];
      const revealed = draft.revealed[index];
      return `
        <p class="eyebrow">PRIVATE PRACTICE · ${index + 1} OF ${turns.length}</p>
        <h2>Try the words out.</h2>
        <p>This is a rehearsal. You can type a reply, say it aloud, or just think it through.</p>
        <div class="callout"><strong>Practice prompt</strong><p>${esc(turn.prompt)}</p></div>
        <label class="prompt-label" for="practice-reply">How would you respond?</label>
        <textarea id="practice-reply" data-quick-field="reply" maxlength="1200" rows="3" placeholder="Try putting it in your own words.">${escape(draft.replies[index])}</textarea>
        <p class="help-text">Your practice reply stays on this device during this visit.</p>
        ${revealed ? `<div class="example-words"><p class="mini-label">ONE POSSIBLE RESPONSE</p><p>${esc(turn.example_reply)}</p></div><p>${esc(turn.tip)}</p>` : ''}
        <div class="actions-wrap">
          ${revealed ? button(index + 1 < turns.length ? 'Next practice prompt →' : 'Finish practice →', 'quick-practice-next') : button('See an example reply', 'quick-reveal')}
          ${index > 0 ? button('Previous prompt', 'quick-practice-back', 'secondary') : ''}
          ${button('Leave practice', 'quick-practice-exit', 'quiet')}
        </div>`;
    }

    function planView(draft) {
      return `
        <p class="eyebrow">A STEP YOU CHOOSE</p>
        <h2>Make the plan yours.</h2>
        <p>Adjust the step so it fits what you can do. You can keep a note for this visit or download a copy.</p>
        <label class="prompt-label" for="quick-action">What will you do?</label>
        <textarea id="quick-action" data-quick-field="action" rows="2" maxlength="1500">${esc(draft.plan.action)}</textarea>
        <label class="prompt-label" for="quick-when">When will you try it?</label>
        <input id="quick-when" type="text" data-quick-field="when" maxlength="300" value="${esc(draft.plan.when)}">
        <label class="prompt-label" for="quick-fallback">What could you do if it’s difficult?</label>
        <textarea id="quick-fallback" data-quick-field="fallback" maxlength="1000" rows="2">${esc(draft.plan.fallback)}</textarea>
        <label class="checkline"><input type="checkbox" data-quick-field="accepted" ${draft.accepted ? 'checked' : ''}><span>I’ve reviewed this plan and choose to keep or export it.</span></label>
        <div class="actions-wrap">
          ${button('Keep for this visit', 'save', '', draft.accepted && draft.plan.action.trim() ? '' : 'disabled')}
          ${button('Export my plan', 'export', 'secondary', draft.accepted && draft.plan.action.trim() ? '' : 'disabled')}
          ${canPractise(draft) ? button('Practise this step', 'quick-practice', 'secondary') : ''}
          ${button('Back to guidance', 'quick-result', 'quiet')}
        </div>
        ${errorMarkup(draft)}
        ${feedbackPanel(draft)}`;
    }

    function render(item, draft) {
      let body;
      if (draft.pending) {
        body = `<p class="eyebrow">AI GUIDANCE</p><h2>Finding a useful next step…</h2>
          <p role="status">The AI is working with the details you chose to share.</p>
          ${button('Cancel request', 'quick-cancel', 'secondary')}
          <p class="help-text">The provider may still process a request it already received.</p>`;
      } else if (draft.view === 'result') {
        body = resultView(draft);
      } else if (draft.view === 'practice') {
        body = practiceView(draft);
      } else if (draft.view === 'plan') {
        body = planView(draft);
      } else {
        body = intake(item, draft) + errorMarkup(draft);
      }
      return `<div class="session-wrap">
        <button class="back-link" data-action="home">← All six paths</button>
        <div class="session-meta"><span>${esc(item.icon)} ${esc(item.title)}</span>
          <span>${draft.mode === 'together' ? 'Shared screen' : 'Personal preparation'}</span></div>
        <section class="session-card quick-card">${body}</section>
        <div class="session-actions"><button class="text-button" data-action="clear-session">Clear this reflection</button></div>
      </div>`;
    }

    function validateIntake() {
      const form = document.getElementById('quick-intake');
      if (!form) return true;
      for (const input of form.querySelectorAll('textarea[required]')) {
        input.setCustomValidity(input.value.trim() ? '' : 'Add a few words to continue.');
      }
      return form.reportValidity();
    }

    function canPractise(draft) {
      return draft.result.safety.mode === 'everyday' && draft.result.practice.length > 0
        && draft.feedback?.outcome !== 'worse';
    }

    function revisionInput(draft, applyRevision) {
      const updated = {correction: draft.correction, feedback: draft.feedback};
      if (applyRevision && draft.revision?.kind === 'correction') {
        const {selection, text} = draft.revision;
        updated.correction = fitLabels[selection] + '. ' + text.trim();
      }
      if (applyRevision && draft.revision?.kind === 'feedback') {
        const {selection, text} = draft.revision;
        updated.feedback = {outcome: selection, details: text.trim()};
      }
      return updated;
    }

    function useResult(draft, result, source, input) {
      Object.assign(draft, {
        result, source, ...input, view: 'result', error: '', fit: null,
        revision: null, plan: null, accepted: false, practiceIndex: 0, replies: [], revealed: []
      });
    }

    function runGuided(item, draft, applyRevision = false) {
      const input = revisionInput(draft, applyRevision);
      const result = window.CG_GUIDED.assess({
        section: item.id, description: draft.description.trim(), goal: draft.goal.trim(), ...input
      });
      useResult(draft, result, 'guided', input);
    }

    function openAiConsent(item, draft, applyRevision) {
      if (!api || draft.pending || !validateIntake()) return;
      const input = revisionInput(draft, applyRevision);
      const tried = input.feedback && draft.plan ? draft.plan.action.trim() : '';
      openModal('Share entries for AI guidance?', `
        <p>Your situation, goal and any correction or check-in go to the app server and OpenAI. Revisions can include the previous AI result. Use details everyone involved has agreed to share.</p>
        <details class="explainer"><summary>Review the details to send</summary>
          <p class="data-preview"><strong>Situation</strong><br>${esc(draft.description.trim())}</p>
          <p class="data-preview"><strong>Goal</strong><br>${esc(draft.goal.trim())}</p>
          ${input.correction ? `<p class="data-preview"><strong>Correction</strong><br>${esc(input.correction)}</p>` : ''}
          ${input.feedback ? `<p class="data-preview"><strong>Check-in</strong><br>${esc(feedbackLabels[input.feedback.outcome])} ${esc(input.feedback.details)}</p>` : ''}
          ${tried ? `<p class="data-preview"><strong>Chosen plan</strong><br>${esc(tried)}</p>` : ''}
          ${applyRevision && draft.source === 'ai' ? '<p>The full current AI guidance will also be included.</p>' : ''}
        </details>
        ${api.remote ? `<label class="prompt-label" for="quick-code">AI access code</label>
          <input id="quick-code" type="password" maxlength="256" autocomplete="off" placeholder="${accessCode ? 'Code entered for this visit' : 'Enter the site owner’s code'}">
          <p class="help-text">The access code stays in memory for this visit.</p>` : ''}
        <label class="checkline"><input id="quick-consent" type="checkbox"><span>I agree to send the listed information for AI guidance.</span></label>
        <p id="quick-consent-error" class="help-text" role="alert"></p>
        <div class="actions-wrap">${button('Send and get AI guidance', 'quick-send', '', applyRevision ? 'data-revise="true"' : '')}</div>
        <p class="help-text"><a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noopener noreferrer">OpenAI data controls ↗</a></p>`);
    }

    async function requestAi(item, draft, input, previous, redraw) {
      const controller = new AbortController();
      draft.pending = controller;
      draft.error = '';
      redraw();
      const timer = setTimeout(() => controller.abort(), 75000);
      try {
        const headers = {'Content-Type': 'application/json'};
        if (api.remote) headers.Authorization = 'Bearer ' + accessCode;
        const response = await fetch(api.url + '/api/assess', {
          method: 'POST', headers, signal: controller.signal, cache: 'no-store', credentials: 'omit',
          body: JSON.stringify({
            section: item.id, experience: 'quick',
            answers: [draft.description.trim(), draft.goal.trim(), '', input.feedback && draft.plan ? draft.plan.action.trim() : ''],
            feelings: [], needs: [], intensity: null, body: '', mode: draft.mode,
            consent: true, followup: input.correction, feedback: input.feedback, previousAssessment: previous
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'AI guidance is unavailable right now.');
        if (!data.assessment?.section_result || !Array.isArray(data.assessment.practice)) {
          throw new Error('This AI server needs the current Common Ground update.');
        }
        if (draft.pending === controller) useResult(draft, data.assessment, 'ai', input);
      } catch (error) {
        if (draft.pending === controller) {
          draft.error = controller.signal.aborted
            ? 'The AI request took too long. Your entries are still here.'
            : (error instanceof TypeError || error instanceof SyntaxError
              ? 'The AI server could not be reached. You can use the guided exercise on this device.'
              : error.message);
        }
      } finally {
        clearTimeout(timer);
        if (draft.pending === controller) {
          draft.pending = null;
          redraw();
        }
      }
    }

    function start(item, draft, redraw) {
      if (draft.pending || !validateIntake()) return;
      runGuided(item, draft);
      redraw();
    }

    function act(item, draft, target, redraw) {
      const action = target.dataset.action;
      if (draft.pending && action !== 'quick-cancel') return;
      if (action === 'quick-ai') {
        openAiConsent(item, draft, false);
        return;
      }
      if (action === 'quick-send') {
        const applyRevision = target.dataset.revise === 'true';
        const error = document.getElementById('quick-consent-error');
        if (!document.getElementById('quick-consent')?.checked) {
          error.textContent = 'Choose whether to share before sending your entries.';
          document.getElementById('quick-consent').focus();
          return;
        }
        const code = document.getElementById('quick-code');
        if (api.remote) {
          const entered = code.value.trim() || accessCode;
          if (!/^[A-Za-z0-9_-]{32,256}$/.test(entered)) {
            error.textContent = 'Enter the access code provided by the site owner.';
            code.focus();
            return;
          }
          accessCode = entered;
        }
        const previous = applyRevision && draft.source === 'ai' ? draft.result : null;
        closeModal();
        void requestAi(item, draft, revisionInput(draft, applyRevision), previous, redraw);
        return;
      }
      if (action === 'quick-cancel') {
        cancel(draft);
        draft.error = 'AI request cancelled. Your entries are still here.';
      }
      if (action === 'quick-edit') draft.view = 'intake';
      if (action === 'quick-result' && draft.result) draft.view = 'result';
      if (action === 'quick-plan' && draft.plan) draft.view = 'plan';
      if (action === 'quick-fit') {
        draft.fit = target.dataset.value;
        draft.revision = draft.fit === 'fits' ? null : {kind: 'correction', selection: draft.fit, text: ''};
        redraw(draft.revision ? 'quick-revision' : {action: 'quick-fit', value: 'fits'});
        return;
      }
      if (action === 'quick-feedback') {
        draft.revision = {kind: 'feedback', selection: target.dataset.value, text: ''};
        redraw('quick-revision');
        return;
      }
      if (action === 'quick-close-revision') {
        draft.revision = null;
        if (draft.fit !== 'fits') draft.fit = null;
      }
      if (action === 'quick-revise' || action === 'quick-revise-guided') {
        if (!draft.revision) return;
        const field = document.getElementById('quick-revision');
        if (draft.revision.kind === 'correction' && !draft.revision.text.trim()) {
          field.setCustomValidity('Add a few words about what should change.');
          field.reportValidity();
          return;
        }
        if (draft.source === 'ai' && action === 'quick-revise') {
          openAiConsent(item, draft, true);
          return;
        }
        runGuided(item, draft, true);
      }
      if (action === 'quick-practice' && canPractise(draft)) {
        draft.practiceReturn = draft.view;
        draft.view = 'practice';
      }
      if (action === 'quick-reveal') draft.revealed[draft.practiceIndex] = true;
      if (action === 'quick-practice-back') draft.practiceIndex = Math.max(0, draft.practiceIndex - 1);
      if (action === 'quick-practice-next') {
        if (draft.practiceIndex + 1 < draft.result.practice.length) draft.practiceIndex += 1;
        else draft.view = draft.practiceReturn;
      }
      if (action === 'quick-practice-exit') draft.view = draft.practiceReturn;
      if (action === 'quick-adopt') {
        const option = draft.result.other_options[Number(target.dataset.index)];
        const next = draft.result.recommended_next_step;
        draft.plan = option
          ? {action: option.action, when: '', fallback: '', edited: false, whenEdited: false, fallbackEdited: false}
          : {action: next.action, when: next.timeframe, fallback: next.fallback, edited: false, whenEdited: false, fallbackEdited: false};
        draft.accepted = false;
        draft.revision = null;
        draft.view = 'plan';
      }
      redraw();
    }

    function update(draft, target) {
      const field = target.dataset.quickField;
      if (!field) return;
      if (field === 'mode') draft.mode = target.checked ? 'together' : 'alone';
      if (field === 'description' || field === 'goal') {
        target.setCustomValidity('');
        if (draft[field] !== target.value) {
          const mode = draft.mode;
          const description = draft.description;
          const goal = draft.goal;
          Object.assign(draft, createDraft(), {mode, description, goal, [field]: target.value});
          document.querySelector('[data-action="quick-result"]')?.remove();
        }
      }
      if (field === 'revision' && draft.revision) {
        target.setCustomValidity('');
        draft.revision.text = target.value;
      }
      if (field === 'reply') draft.replies[draft.practiceIndex] = target.value;
      if (['action', 'when', 'fallback'].includes(field)) {
        draft.plan[field] = target.value;
        draft.plan.edited = true;
        if (field === 'when') draft.plan.whenEdited = true;
        if (field === 'fallback') draft.plan.fallbackEdited = true;
        if (field === 'action') {
          if (!draft.plan.whenEdited) draft.plan.when = document.getElementById('quick-when').value = '';
          if (!draft.plan.fallbackEdited) draft.plan.fallback = document.getElementById('quick-fallback').value = '';
        }
        draft.accepted = false;
        document.querySelector('[data-quick-field="accepted"]').checked = false;
      }
      if (field === 'accepted') draft.accepted = target.checked;
      if (draft.view === 'plan') {
        const ready = draft.accepted && draft.plan.action.trim();
        document.querySelectorAll('[data-action="save"],[data-action="export"]').forEach(control => {
          control.disabled = !ready;
        });
      }
    }

    function cancel(draft) {
      const request = draft.pending;
      draft.pending = null;
      request?.abort();
    }

    function noteMarkup(draft) {
      return `<section class="plan-summary">
        <p class="eyebrow">${draft.plan.edited ? 'YOUR EDITED PLAN' : esc(sourceName(draft).toUpperCase())}</p>
        <h3>${esc(draft.plan.action)}</h3>
        ${draft.plan.when ? `<p><strong>When</strong> · ${esc(draft.plan.when)}</p>` : ''}
        ${draft.plan.fallback ? `<p><strong>If it’s difficult</strong> · ${esc(draft.plan.fallback)}</p>` : ''}
      </section>
      <details class="explainer"><summary>Review what you shared</summary>
        <p class="data-preview">${esc(draft.description)}</p><p class="data-preview">${esc(draft.goal)}</p>
      </details>`;
    }

    function noteText(item, draft) {
      return ['COMMON GROUND · REVIEWED PLAN', item.title, '', draft.plan.action,
        draft.plan.when && 'When: ' + draft.plan.when,
        draft.plan.fallback && 'If it’s difficult: ' + draft.plan.fallback,
        '', 'Guidance source: ' + sourceName(draft), 'What I shared', draft.description,
        'What I wanted to change', draft.goal].filter(value => value !== false).join('\n');
    }

    return {act, cancel, noteMarkup, noteText, render, start, update, clearAccess: () => { accessCode = ''; }};
  }

  return {create, createDraft};
})();
