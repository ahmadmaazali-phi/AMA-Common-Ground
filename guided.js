/* Local exercises selected from the chosen path and a few explicit cues. */
window.CG_GUIDED = (() => {
  'use strict';

  const paths = {
    self: {
      focus: 'This exercise separates the decision in front of you from predictions about how it will turn out.',
      possible_dynamics: [
        {title: 'Competing priorities', explanation: 'Two options can each protect something that matters. Check whether the pull in each direction points to a different need or value.'},
        {title: 'A prediction filling in the gaps', explanation: 'A possible outcome can feel inevitable while you are deciding. Look for one unknown you could test or clarify.'}
      ],
      uncertainties: ['Which concern matters most to you right now?', 'Which part is known, and which part is an expectation about the future?'],
      recommended_next_step: {
        action: 'Try one small step that gives you information.',
        why: 'A reversible step can make a decision clearer while leaving your options open.',
        steps: ['Write the two options in one line each.', 'Name what each option might protect, such as stability or opportunity.', 'Choose one fact to check or one small experiment to try.'],
        timeframe: 'Set aside five minutes today. Review after you have the missing information.',
        example_words: 'Part of me wants ____. Another part is concerned about ____. Before deciding, I can find out ____.',
        fallback: 'Write one question you need answered and leave the decision open for now.'
      },
      other_options: [
        {title: 'Make space for both concerns', action: 'Write one sentence in favour of each option and one cost of each.', why: 'Giving both concerns a fair hearing can make the trade-off more concrete.'},
        {title: 'Get an outside perspective', action: 'Ask a trusted person how they would gather information about the choice.', why: 'A fresh question may expose an assumption you could check.'}
      ],
      follow_up_questions: ['What could you learn before making a commitment?', 'What would make either option easier to live with?'],
      section_result: {title: 'A decision sketch', items: ['Option A protects ____ and may cost ____.', 'Option B protects ____ and may cost ____.', 'I will check ____ before choosing.']},
      practice: [
        {prompt: 'You notice the thought “If I choose wrong, everything will fall apart.” How could you make room for uncertainty?', example_reply: 'I am worried about the outcome. I know ____, and I can check ____ before I decide.', tip: 'Use the facts available to you and leave unknowns open.'},
        {prompt: 'Both options appeal to you for different reasons. What could you say to yourself before choosing?', example_reply: 'One option gives me ____. The other protects ____. I can test a small part of one option before committing.', tip: 'Name what matters on each side and choose an experiment you can reverse.'}
      ],
      smallStep: 'Write down the one unknown that matters most and one way to check it.'
    },
    two: {
      focus: 'This exercise helps you prepare a conversation about one specific moment, with room for the other person to correct your understanding.',
      possible_dynamics: [
        {title: 'Impact and intent may differ', explanation: 'An action can have an impact the other person did not anticipate. You can describe the impact and ask what they understood.'},
        {title: 'A request may have gone unstated', explanation: 'Two people may have different expectations about the same situation. Check whether either person made their expectation explicit.'}
      ],
      uncertainties: ['How would the other person describe the event?', 'Is a voluntary conversation possible and wanted?'],
      recommended_next_step: {
        action: 'Prepare one observation and one request.',
        why: 'A specific observation gives both people something they can check. A clear request gives them a choice about what happens next.',
        steps: ['Choose one incident and describe what someone could have seen or heard.', 'Name how it affected you and what matters now.', 'If both people want to talk, invite the other person to finish their account, summarise it, and ask if you understood.', 'Ask for one change they can freely decline.'],
        timeframe: 'Prepare today. Choose a time for a conversation only if it suits both people.',
        example_words: 'When ____ happened, I felt ____. Could we talk about how we each saw it, then consider ____?',
        fallback: 'Keep the observation and request as a private draft. You can wait, set a boundary or leave the difference open.'
      },
      other_options: [
        {title: 'Clarify one detail', action: 'Ask one open question about the part you understand least, if contact is welcome.', why: 'A question can clear up a factual difference before you propose a solution.'},
        {title: 'Set a limit', action: 'Decide what you will do if the conversation becomes disrespectful, such as ending it.', why: 'A boundary describes an action you control.'}
      ],
      follow_up_questions: ['What is one behaviour you can describe without guessing intent?', 'What request would feel realistic even if the answer is no?'],
      section_result: {title: 'A conversation opener', items: ['What I observed: ____.', 'How it affected me: ____.', 'What I want to understand or ask for: ____.']},
      practice: [
        {prompt: 'Someone replies, “That is how it looked to you. I saw it differently.”', example_reply: 'I can hear that we saw it differently. What did you notice that I might have missed?', tip: 'Pause long enough to hear the answer before replying.'},
        {prompt: 'The other person understands your request and declines it.', example_reply: 'Thanks for being clear. I’ll take some time to think about what I can do from here.', tip: 'Accept the answer and decide what boundary or alternative is within your control.'}
      ],
      smallStep: 'Write one observable detail and the one question you would like answered. Keep it as a private draft.'
    },
    group: {
      focus: 'This exercise helps a group define a decision, include affected voices and keep track of unresolved differences.',
      possible_dynamics: [
        {title: 'Different constraints', explanation: 'People may appear to disagree about a solution while working with different time, resource or access constraints. Ask for those constraints explicitly.'},
        {title: 'Unequal room to speak', explanation: 'Status, role or group norms may affect who speaks up. A quiet person can be reflecting or objecting. Give people a chance to pass or contribute privately if appropriate.'}
      ],
      uncertainties: ['Who has authority to make the decision?', 'Who is affected but absent?', 'Which objections could be hard to raise openly?'],
      recommended_next_step: {
        action: 'Agree on a fair process for one decision.',
        why: 'Making the decision rule explicit can prevent a conversation from being mistaken for agreement.',
        steps: ['Write one question the group actually needs to decide.', 'Invite each person to share a constraint or pass. Record the wording they approve.', 'Confirm who decides, when, and how dissent will be recorded.', 'Choose a reversible trial if appropriate, with an owner and review date.'],
        timeframe: 'Draft the agenda before the next meeting. Ask people to confirm it at the start.',
        example_words: 'Can we agree who will decide this and how we will record concerns before we discuss options?',
        fallback: 'If the group is unavailable, write the decision question and list the people whose input is needed.'
      },
      other_options: [
        {title: 'Make participation easier', action: 'Offer a short written contribution or an opportunity to pass.', why: 'People have different ways to participate and different reasons to need privacy.'},
        {title: 'Keep a disagreement visible', action: 'Record a concern in words its holder approves and schedule a review.', why: 'A workable decision can still have unresolved objections.'}
      ],
      follow_up_questions: ['Who can decide, and who must be consulted?', 'What evidence would show whether a trial helped?'],
      section_result: {title: 'A meeting decision record', items: ['Decision question and owner: ____.', 'People to hear from and decision rule: ____.', 'Trial, unresolved objections and review date: ____.']},
      practice: [
        {prompt: 'A few people agree quickly. Someone says, “Everyone is happy with that.”', example_reply: 'Let’s check who agrees, who has concerns, and who wants to pass before we record the outcome.', tip: 'Say how the decision was made and give dissenters control over what is attributed to them.'},
        {prompt: 'The group is about to change the rota, and the people who work evenings are absent.', example_reply: 'This affects the evening team. Can we share the proposed change and ask for their constraints before we set the rota?', tip: 'Give affected people a practical way to respond before a decision is final.'}
      ],
      smallStep: 'Write the decision as one question and list who needs a chance to respond.'
    },
    world: {
      focus: 'This exercise turns a national or international disagreement into one checkable question and a constructive action within your reach.',
      possible_dynamics: [
        {title: 'Facts and values can become tangled', explanation: 'People may be discussing what happened and what should happen at the same time. Separate the factual claim from the value or policy judgement.'},
        {title: 'Different access to voice and power', explanation: 'Some affected people may have fewer opportunities to shape the discussion. Ask whose direct account is missing and whether harms are unevenly distributed.'}
      ],
      uncertainties: ['Which claim matters most to the conclusion, and what supports it?', 'What has changed since the sources were published?', 'Which affected people are missing from the account?'],
      recommended_next_step: {
        action: 'Verify one consequential claim before sharing it.',
        why: 'Checking the source, date and context gives you firmer ground for a discussion or a peaceful action.',
        steps: ['Write the specific claim you want to check and what would change if it were wrong.', 'Find the original document, data or direct statement if available. Note its date and limits.', 'Compare it with an independent source and record what is still uncertain.', 'Decide on a respectful question or practical local action you can take.'],
        timeframe: 'Before repeating the claim or relying on it in a discussion.',
        example_words: 'Here is the claim I am checking. What is the original source, and which part of this conclusion is still open?',
        fallback: 'Mark the claim as unverified and wait before forwarding it.'
      },
      other_options: [
        {title: 'Hear directly affected people', action: 'Read or listen to a person’s account and keep its individual context in view.', why: 'First-hand experience can add context while leaving room for other experiences.'},
        {title: 'Separate evidence and priorities', action: 'List the factual disagreement and the competing priorities in separate columns.', why: 'The two questions may need different kinds of evidence and discussion.'}
      ],
      follow_up_questions: ['What evidence would change your view of the factual claim?', 'Which safe, peaceful step is actually within your influence?'],
      section_result: {title: 'A claim-checking note', items: ['Claim and why it matters: ____.', 'Original source, date and limitations: ____.', 'What I can verify, what is uncertain, and one action within my reach: ____.']},
      practice: [
        {prompt: 'Someone shares a striking claim without saying where it came from.', example_reply: 'I’d like to understand the basis for that. Do you have the original source and the date?', tip: 'Give claims weight according to the available evidence and keep the human impact visible.'},
        {prompt: 'Someone cites a favourable average to argue that a policy helped everyone.', example_reply: 'The average tells us something about the overall result. Can we see which groups benefited and whether any faced extra costs?', tip: 'Check what the data covers and whose experience an aggregate might hide.'}
      ],
      smallStep: 'Choose one specific claim and write down what an original source would need to show.'
    },
    faith: {
      focus: 'This exercise helps you understand a specific religious or belief difference by making the terms, sources and interpretations explicit.',
      possible_dynamics: [
        {title: 'Different meanings for the same word', explanation: 'A word or quotation may carry a different meaning in different traditions, translations or contexts. Ask what the speaker means in their own terms.'},
        {title: 'A belief can carry personal meaning', explanation: 'Faith and belief can connect with family, identity and belonging. Asking about that significance can help you respond with care.'}
      ],
      uncertainties: ['Which text, translation, tradition or personal belief is under discussion?', 'Has each person had a chance to correct how their view is described?'],
      recommended_next_step: {
        action: 'Clarify one term or source before debating its meaning.',
        why: 'Naming the specific point of difference gives people room to disagree accurately.',
        steps: ['Choose one claim and label it as text, interpretation, tradition, history or personal belief.', 'Check the wording and context if it is a quotation.', 'Ask the person what it means to them if they are willing to discuss it.', 'Record a respectful summary of what remains unresolved.'],
        timeframe: 'Before the next exchange on this specific question.',
        example_words: 'When you use ____, what does it mean in your view? How would you describe the difference between our interpretations?',
        fallback: 'Compare the two terms or source descriptions privately and leave the disagreement open.'
      },
      other_options: [
        {title: 'Check your summary', action: 'Offer one sentence describing the other view and invite the person to correct it.', why: 'A person can clarify their own position without speaking for a whole community.'},
        {title: 'Agree on a discussion boundary', action: 'Set a limit on personal labels or decide to end the discussion if the boundary is crossed.', why: 'Participants can take their convictions seriously and still protect each other’s dignity.'}
      ],
      follow_up_questions: ['Are you comparing a source, a reading of that source, or a personal conviction?', 'What could you understand better even if your views remain different?'],
      section_result: {title: 'A beliefs dialogue map', items: ['Exact question, term or text: ____.', 'How each participant describes their own interpretation: ____.', 'The point of difference that remains, and a respectful question: ____.']},
      practice: [
        {prompt: 'A person says your summary of their tradition misses an important distinction.', example_reply: 'Thank you for catching that. How would you state the distinction in your own words?', tip: 'Let people name their own views and recognise diversity within a tradition.'},
        {prompt: 'You both recognise the difference in how you interpret a passage and still disagree.', example_reply: 'I understand your reading more clearly now. I still read it differently. Are you comfortable leaving the question open?', tip: 'Understanding can be a complete outcome of the conversation.'}
      ],
      smallStep: 'Choose one term or quotation and write one question about its context.'
    },
    couples: {
      focus: 'This exercise helps you prepare for an everyday relationship conversation by looking at one moment and one small repair or boundary.',
      possible_dynamics: [
        {title: 'An interaction can gather momentum', explanation: 'One response can shape what happens next. If both people recognise a sequence, choose one part you could handle differently.'},
        {title: 'The practical issue may also have an emotional impact', explanation: 'An everyday disagreement can affect how considered or connected someone feels. Ask what mattered to each person, and let them answer for themselves.'}
      ],
      uncertainties: ['How does each partner describe the moment and its impact?', 'Does each person feel free to decline or pause the conversation?', 'Which change is genuinely within your control?'],
      recommended_next_step: {
        action: 'Prepare one specific repair or request for a voluntary check-in.',
        why: 'A concrete change gives you both something to try and review. Each person can decide whether they want to take part.',
        steps: ['Choose a recent event rather than describing the whole relationship.', 'Name how it affected you and any action of your own you want to change.', 'Invite a check-in only if you both want one. Listen for your partner’s own account.', 'Suggest one change and agree a review time only if both accept it freely.'],
        timeframe: 'Prepare in private. If you both want to talk, choose a calm time with room to pause.',
        example_words: 'I would like to revisit ____. I can change ____. Would you be willing to tell me what mattered to you and consider ____?',
        fallback: 'Keep the request private for now. You can choose a pause, a boundary or qualified support.'
      },
      other_options: [
        {title: 'Make one accountable repair', action: 'Name an action of your own and the change you intend to make, if it is appropriate to do so.', why: 'You can take responsibility for your own conduct without expecting forgiveness.'},
        {title: 'Review one routine', action: 'Pick a shared routine you would both be willing to check and choose a small adjustment.', why: 'A practical adjustment can ease repeated friction and give you something to revisit.'}
      ],
      follow_up_questions: ['What action of your own could you change?', 'What would tell you that a short check-in helped?'],
      section_result: {title: 'A small repair plan', items: ['The moment and the impact I can speak for: ____.', 'My own change or request: ____.', 'What we each freely choose, and when to check in if appropriate: ____.']},
      practice: [
        {prompt: 'Your partner says, “I’m too overwhelmed to talk about this now.”', example_reply: 'Okay, let’s pause. If you want to return to it, we can choose a time that suits both of us.', tip: 'Respect the pause and keep participation voluntary.'},
        {prompt: 'You realise you interrupted your partner while they were explaining what mattered to them.', example_reply: 'I interrupted you. I’m sorry. I’d like to listen to the rest if you want to tell me.', tip: 'Name your own action and give them room to choose whether to continue.'}
      ],
      smallStep: 'Write one sentence about your own experience and one change you could make independently.'
    }
  };

  const urgentCues = [
    /\bi(?:\s+(?:really\s+)?(?:want|plan|intend)|(?: am|'m)\s+(?:about|going))\s+to\s+(?:kill|hurt|harm)\s+(?:myself|someone|him|her|them)\b/,
    /\bi(?:'m| am)\s+(?:in immediate danger|suicidal right now)\b/,
    /\bi\s+(?:cannot|can't)\s+keep\s+(?:myself|someone else|them)\s+safe\b/,
    /\bi\s+(?:just took an overdose|have taken an overdose|have seriously hurt myself)\b/,
    /\b(?:he|she|they|my partner|someone)\s+(?:said|says)\s+(?:he|she|they)\s+(?:will|would)\s+kill\s+me\b/
  ];
  const pauseCues = [
    /\bi(?:'m| am| feel)\s+(?:unsafe|(?:too )?(?:scared|afraid) to (?:speak|disagree|say no)|afraid of (?:my partner|him|her|them))\b/,
    /\bi\s+(?:do not|don't)\s+feel\s+safe\b/,
    /\b(?:he|she|they|my partner|my spouse|someone)\s+(?:hit|hits|slapped|punched|choked|strangled|shoved|kicked|attacked|threatened to hurt|threatens to hurt)\s+me\b/,
    /\b(?:he|she|they|my partner|my spouse)\s+(?:controls?|monitors?)\s+my\s+(?:money|phone|messages|movements)\b/,
    /\b(?:he|she|they|my partner|my spouse)\s+(?:won't|will not|doesn't|does not)\s+let me\s+(?:leave|see my family|see my friends)\b/,
    /\bi(?:'m| am)\s+(?:being coerced|being pressured to participate|being forced to participate|being threatened)\b/
  ];

  const asText = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const normalise = value => value.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  function quotedExcerpt(value) {
    const excerpt = value.replace(/\s+/g, ' ').replace(/^(.{180}).+$/u, '$1…');
    return `“${excerpt}”${/[.!?…]$/u.test(excerpt) ? '' : '.'}`;
  }

  function safetyMode(entries) {
    const matches = patterns => entries.some(value => patterns.some(pattern => pattern.test(value)));
    if (matches(urgentCues)) return 'urgent_support';
    if (matches(pauseCues)) return 'pause_shared';
    return 'everyday';
  }

  function safetyResult(mode) {
    const urgent = mode === 'urgent_support';
    const message = urgent
      ? 'Your words may describe immediate danger. If anyone is in immediate danger or you cannot keep yourself or someone else safe, contact local emergency services now if you can do so safely.'
      : 'Your words may describe fear, pressure or harm. Pause the shared exercise and consider speaking privately with someone you trust or a qualified local support service.';
    return {
      summary: 'Set this exercise aside and prioritise safety and support.',
      possible_dynamics: [],
      uncertainties: ['A few text cues cannot determine your safety or the level of danger.'],
      recommended_next_step: {
        action: urgent ? 'Get immediate help where you can do so safely.' : 'Pause and seek private support when safe.',
        why: urgent ? 'Immediate risk needs help from people who can respond directly.' : 'Private support gives you room to consider your options without pressure to continue the conversation.',
        steps: urgent
          ? ['Stop the exercise and attend to the immediate situation.', 'Contact local emergency services if anyone is in immediate danger.', 'If safe, ask a trusted person nearby to help you reach immediate support.']
          : ['Stop the shared exercise. You can leave without explaining your entries.', 'When safe, consider using a private device or place to contact support.', 'If the situation becomes immediately dangerous, contact local emergency services when safe.'],
        timeframe: urgent ? 'Now, if it is safe to seek help.' : 'Pause now. Reach out when you can do so privately and safely.',
        example_words: '',
        fallback: urgent ? 'If you cannot make the call and someone safe is nearby, ask them to call for help.' : 'Wait for a safer moment or place to seek support if you cannot do so privately now.'
      },
      other_options: [],
      follow_up_questions: [],
      safety: {mode, message},
      section_result: {title: 'Focus on support', items: ['Pause the exercise and use the support options when safe.']},
      practice: []
    };
  }

  function adjustForFeedback(result, smallStep, outcome, privateOnly, hasCorrection) {
    if (outcome === 'worse') {
      result.recommended_next_step = {
        action: 'Pause before trying another approach.',
        why: 'You reported that the last step made things worse. Pausing gives you room to consider what changed and protect your boundaries.',
        steps: ['Put the earlier step aside for now.', 'When you feel ready, write what happened and which part made it harder.', 'Choose one small action you control, or seek support if you feel unsafe or pressured.'],
        timeframe: 'Pause now. Return to the question when you feel ready and able to choose freely.',
        example_words: '',
        fallback: 'Leave the issue open and take a break. Use the support options if safety is a concern.'
      };
      result.other_options = [];
      result.follow_up_questions = ['What changed after your attempt?', 'What boundary or support would make the next step feel safer?'];
      result.section_result = {title: 'A pause and review', items: ['What I tried: ____.', 'What got harder: ____.', 'What I need before I take another step: ____.']};
      result.practice = [];
    } else if (privateOnly || outcome === 'stuck') {
      result.recommended_next_step = {
        action: privateOnly ? 'Prepare privately before deciding whether to act.' : 'Try the smallest useful part of the plan.',
        why: privateOnly ? 'You described a limit on speaking or making contact. You can make progress within that limit.' : 'A smaller action lets you test what is feasible without committing to the whole plan.',
        steps: [smallStep, 'Check whether the step fits the time, information and support you have.'],
        timeframe: 'Try it when you can set aside a few minutes privately.',
        example_words: '',
        fallback: 'Note the one obstacle that matters most and choose when to look at it again.'
      };
      if (privateOnly) {
        result.other_options = [];
        result.practice = [];
      }
      result.follow_up_questions = ['What part is within your control now?', 'What would make this step easier or more realistic?'];
    } else if (outcome === 'helped') {
      result.recommended_next_step = {
        action: 'Keep the part that helped and review it after one more use.',
        why: 'You reported some progress. Naming what helped makes it easier to choose whether to repeat it.',
        steps: ['Write the part of your earlier action that seemed useful.', 'If a suitable opportunity comes up, try that part again with the same respect for boundaries and consent.', 'Note whether it helped again and what you would change.'],
        timeframe: 'Review it at your next suitable opportunity.',
        example_words: '',
        fallback: smallStep
      };
      result.follow_up_questions = ['Which part helped most?', 'What would tell you it is worth repeating?'];
    } else if (hasCorrection) {
      result.recommended_next_step = {
        action: 'Try a smaller step in private.',
        why: 'The detail you added may change what is feasible. A small private step gives you a chance to check what still fits.',
        steps: ['Name the one detail in your correction that most changes your options.', smallStep, 'Check whether this step works with the constraint you described.'],
        timeframe: 'Try this when you have a few minutes to think privately.',
        example_words: '',
        fallback: 'Keep a private note of the detail that changes what you can do and decide when to review it.'
      };
      result.follow_up_questions = ['What can you do within the limit you described?', 'What would need to change before you could try a larger step?'];
    }
  }

  function assess(input = {}) {
    const {section, description, goal, correction, feedback} = input || {};
    const entries = [asText(description, 5000), asText(goal, 2000), asText(correction, 2000), asText(feedback?.details, 2000)];
    const [reported, desired, revision, feedbackNote] = entries;
    const normalised = entries.map(normalise);
    const mode = safetyMode(normalised);
    if (mode !== 'everyday') return safetyResult(mode);

    const path = Object.hasOwn(paths, section) ? paths[section] : paths.self;
    const {focus, smallStep, ...template} = path;
    const result = JSON.parse(JSON.stringify(template));
    const summary = [focus];
    if (reported) summary.push(`Your starting point was ${quotedExcerpt(reported)}`);
    if (desired) summary.push(`Your goal was ${quotedExcerpt(desired)}`);
    if (revision) summary.push(`Check this exercise against your correction, ${quotedExcerpt(revision)}`);
    if (feedbackNote) summary.push(`Keep your feedback in view as you choose a step. ${quotedExcerpt(feedbackNote)}`);
    result.summary = summary.join(' ');
    result.safety = {mode, message: ''};
    if (revision) result.uncertainties.unshift('Which assumption should change in light of your correction?');
    const privateOnly = /\b(?:(?:cannot|can't|not ready to|do not want to|don't want to)\s+(?:talk|speak|meet|contact|reach (?:them|him|her|out))|no contact|won't talk)\b/;
    adjustForFeedback(result, smallStep, feedback?.outcome, normalised.some(value => privateOnly.test(value)), Boolean(revision));
    return result;
  }

  return {assess};
})();
