# Common Ground — Product Brief

Common Ground helps people understand what they are experiencing and find a practical way forward. **All six areas need real AI understanding and useful recommendations, rather than simply collecting answers and asking users to solve the problem themselves.** A useful outcome may be an action, an agreement, a clearer boundary, a pause or respectful disagreement.

The product should feel calm, curious and concrete. It should explain possible emotional dynamics, show why a suggested exercise may help, and offer something the person can try next. The person can correct an interpretation, reject a suggestion or choose a different goal.

## Six areas, with tailored AI support

| Area | Purpose and distinctive experience |
|---|---|
| **With myself** | Understand competing wishes, self-criticism, uncertainty and difficult decisions. Offer a tentative interpretation, a specific next action, a manageable exercise, alternatives and a fallback rather than another blank planning form. |
| **Between two people** | Examine one disagreement, distinguish accounts from assumed motives, and suggest requests, boundaries and wording that participants can review. A proposal is not a shared agreement until freely accepted. |
| **Within a group** | Identify stated priorities, missing voices, disagreements and decision-process problems. Suggest a fair next process and practical options while preserving dissent and noticing unequal power. |
| **Society and world issues** | Clarify disputed claims, evidence gaps, affected communities, values and possible constructive actions. An AI response cannot settle a public issue or establish responsibility merely from the supplied account. |
| **Faith and sects** | Distinguish texts, interpretations, historical claims, practices and personal convictions. Suggest respectful questions and a productive discussion process without declaring a theological winner or inventing authority. |
| **Marriage and couples** | Explore recurring interaction patterns and offer specific communication, repair or boundary options. This is relationship communication support; professional counselling would require a separate service with suitably qualified practitioners. |

## From reflection to a way forward

The shared journey is:

1. **Choose a purpose and check willingness.** Everyone can pause, decline to share or leave.
2. **Describe the situation and response.** Separate events, interpretations, feelings, bodily sensations and stated needs.
3. **Request AI analysis with consent.** Send the selected information through the server to OpenAI. Return a tentative assessment, relevant dynamics, a specific proposed action, practical steps, useful wording, a fallback and alternatives.
4. **Correct and adapt.** Ask what fits, what is wrong and what has been missed. Let the person request a revised response, then choose or edit a practical plan.
5. **Review the plan first.** Present the action, how to begin, any fallback and review intention before the supporting notes. Record only what the person has reviewed and approved.

The [NHS describes connections between thoughts, feelings and behaviour](https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/). [WHO's stress-management guide](https://www.who.int/publications/i/item/9789240003927) provides grounding, noticing and values-based self-help foundations. Guidance on [relationships and communication](https://www.betterhealth.vic.gov.au/health/healthyliving/relationships-and-communication) supports clear requests, listening, checking understanding and pauses. These ingredients do not establish that the app, or its AI recommendations, is an effective treatment or a validated mediator.

## Explain feelings without pretending to know

AI should connect its interpretation to what the person actually reported, distinguish evidence from inference, and offer **possible reasons to explore**. It can examine meanings, expectations, uncertainty, competing needs and current pressures, then ask what fits. It must not claim to know hidden motives, infer trauma as fact, diagnose participants or treat an emotion as proof that a belief is accurate.

Recommendations must be useful without demanding agreement with the model. “That does not fit” should open a correction and revision, not an argument. If the service is unavailable, the app must report the failure clearly; a static exercise or canned response must not masquerade as AI assessment.

## Difference, dignity and choice

Consent includes control over what is sent for analysis and what is shared with others. Private reflections must not become shared material automatically. Threats, coercion, discrimination and unequal harm require different handling from ordinary disagreement. Two perspectives do not imply equal responsibility.

Disclosure of fear or control should lead to private support options rather than pressure to reconcile. [NICE guidance](https://www.nice.org.uk/guidance/qs116/resources/domestic-violence-and-abuse-pdf-75545301469381) emphasises sensitive responses and private discussion with trained staff; an automated prompt cannot replace that assessment.

World and faith discussions should retain verifiable claims, attributable sources, uncertainties and real differences. The app must not fabricate sources or flatten a community into one position. [UNESCO's intercultural dialogue work](https://www.unesco.org/interculturaldialogue/en) offers a foundation for understanding across identities without requiring consensus.

## Current architecture and readiness

The connected prototype uses `server.mjs` on `127.0.0.1:4191` to serve the app and make real AI requests. The credential is connected securely on the server side in a workspace `.env.local` file outside `outputs/`; it is not included in downloadable code. Standalone HTML and static hosting alone cannot provide the AI service.

Drafts and kept notes remain in page memory. The app's server does not log session entries or persist them locally. With consent, selected information is sent to OpenAI. Requests use `store:false`, which does not promise zero provider retention. Provider data handling still applies. Exported copies are under the person's control and are not removed by clearing the app.

Live AI response quality and all six connected journeys still require verification. The current version uses one shared device; remote private rooms, user authentication, payments and professional therapy are not implemented. Native project generation and asset sync succeeded, but actual phone compilation and execution remain unverified. A production HTTPS backend with authentication has not been deployed.

Next work is evaluation with fictional and low-stakes examples, qualified psychological and safeguarding review, participant-controlled remote sharing, authenticated service deployment, and real-device testing. Clinical couples therapy involves professional assessment and structured care; [NICE's couples-therapy guidance](https://www.nice.org.uk/guidance/ng222/chapter/recommendations#behavioural-couples-therapy-for-depression) must not be used to market this app as equivalent treatment.

## Earning hypothesis

Test free introductory sessions with optional paid learning programmes, session packs or a membership for continued practice and follow-ups. Group facilitation tools could become a separate offer when demand is demonstrated. Validate willingness to pay and the costs of providing AI support before setting prices or promising a profitable subscription.

Keep essential safety information accessible. Avoid advertising beside private conflicts, selling personal disclosures or using distress to pressure purchases. Assess whether people understand their situation better, receive a useful next step, can express a clear request or boundary, and voluntarily return.
