import type { PromptReviewIssueType } from './prompt-review.js';

export interface PromptReviewBenchmarkCase {
  id: string;
  prompt: string;
  expectedPassed: boolean;
  expectedIssueType: PromptReviewIssueType;
  expectedScoreRange: readonly [number, number];
  expectedMessageKeywords: string[];
  expectedSuggestionKeywords: string[];
  llmResponse: {
    passed: boolean;
    score: number;
    issue_type: PromptReviewIssueType;
    message: string;
    suggestion: string;
  };
}

export const promptReviewBenchmarkCases: PromptReviewBenchmarkCase[] = [
  {
    id: 'clear-json-summarizer',
    prompt: [
      'You are a concise research assistant.',
      'Your task is to summarize the article provided in {{article}}.',
      'Use only facts present in the article.',
      'Return JSON with keys: title, summary, key_points.',
      'Keep key_points to 3 bullet strings.',
    ].join('\n'),
    expectedPassed: true,
    expectedIssueType: 'general',
    expectedScoreRange: [88, 100],
    expectedMessageKeywords: ['specified'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 94,
      issue_type: 'general',
      message: 'The task, grounding, and output format are well specified.',
      suggestion: '',
    },
  },
  {
    id: 'implicit-success-criteria',
    prompt: 'You are a helpful assistant. Summarize this article and make it useful.',
    expectedPassed: false,
    expectedIssueType: 'success-criteria',
    expectedScoreRange: [45, 70],
    expectedMessageKeywords: ['success criteria'],
    expectedSuggestionKeywords: ['acceptance criteria'],
    llmResponse: {
      passed: false,
      score: 58,
      issue_type: 'success-criteria',
      message: 'The prompt leaves success criteria implicit.',
      suggestion: 'Define the acceptance criteria for a useful summary.',
    },
  },
  {
    id: 'conflicting-format-instructions',
    prompt: [
      'Classify the customer request into one category.',
      'Return only valid JSON with keys category and rationale.',
      'Do not return JSON. Answer in a single sentence.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'conflict',
    expectedScoreRange: [30, 55],
    expectedMessageKeywords: ['conflicting'],
    expectedSuggestionKeywords: ['one output format'],
    llmResponse: {
      passed: false,
      score: 42,
      issue_type: 'conflict',
      message: 'The prompt contains conflicting output-format instructions.',
      suggestion: 'Choose one output format and remove the incompatible instruction.',
    },
  },
  {
    id: 'ungrounded-policy-answer',
    prompt: [
      'You are a compliance expert.',
      'Tell the user whether this contract clause is legally enforceable.',
      'Be confident and avoid caveats.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'grounding',
    expectedScoreRange: [35, 65],
    expectedMessageKeywords: ['grounding'],
    expectedSuggestionKeywords: ['jurisdiction'],
    llmResponse: {
      passed: false,
      score: 50,
      issue_type: 'grounding',
      message: 'The prompt asks for a high-stakes conclusion without grounding or jurisdiction.',
      suggestion: 'Provide jurisdiction, source material, and require caveats for uncertainty.',
    },
  },
  {
    id: 'structured-classifier',
    prompt: [
      'You are a support triage classifier.',
      'Task: classify the ticket into billing, technical, account, or other.',
      'Context: use only the customer message in {{ticket}}.',
      'Output: JSON with keys category, confidence, and reason.',
      'Constraint: reason must be one sentence.',
    ].join('\n'),
    expectedPassed: true,
    expectedIssueType: 'general',
    expectedScoreRange: [85, 100],
    expectedMessageKeywords: ['clear'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 91,
      issue_type: 'general',
      message: 'The prompt is clear, grounded, and structured for classification.',
      suggestion: '',
    },
  },
  {
    id: 'ambiguous-review-scope',
    prompt: [
      'You are a senior engineer.',
      'Review the attached changes and fix the obvious problems.',
      'Keep the behavior good and do not overdo it.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'ambiguity',
    expectedScoreRange: [35, 65],
    expectedMessageKeywords: ['ambiguous'],
    expectedSuggestionKeywords: ['scope'],
    llmResponse: {
      passed: false,
      score: 48,
      issue_type: 'ambiguity',
      message: 'The review scope is ambiguous and relies on undefined quality terms.',
      suggestion: 'Define the target files, review criteria, and scope of allowed fixes.',
    },
  },
  {
    id: 'unrealistic-guarantee',
    prompt: [
      'You are an AI safety analyst.',
      'Guarantee that this generated answer has zero hallucinations and is legally risk-free.',
      'Give a final yes or no without uncertainty.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'task-framing',
    expectedScoreRange: [20, 50],
    expectedMessageKeywords: ['unrealistic'],
    expectedSuggestionKeywords: ['verification'],
    llmResponse: {
      passed: false,
      score: 35,
      issue_type: 'task-framing',
      message:
        'The task framing is unrealistic because it asks the model to guarantee unknowable outcomes.',
      suggestion:
        'Ask for risk assessment, cited uncertainty, and verification steps instead of guarantees.',
    },
  },
  {
    id: 'vague-rewrite-request',
    prompt: 'Make this better.',
    expectedPassed: false,
    expectedIssueType: 'ambiguity',
    expectedScoreRange: [0, 45],
    expectedMessageKeywords: ['ambiguous'],
    expectedSuggestionKeywords: ['task'],
    llmResponse: {
      passed: false,
      score: 28,
      issue_type: 'ambiguity',
      message: 'The prompt is too ambiguous to review or execute reliably.',
      suggestion: 'State the task, input, audience, constraints, and desired output.',
    },
  },
  {
    id: 'tone-length-conflict',
    prompt: [
      'Write a one-sentence summary of the article in {{article}}.',
      'Make it detailed, comprehensive, and at least 500 words long.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'conflict',
    expectedScoreRange: [25, 55],
    expectedMessageKeywords: ['conflict'],
    expectedSuggestionKeywords: ['length'],
    llmResponse: {
      passed: false,
      score: 38,
      issue_type: 'conflict',
      message: 'The length instructions conflict — one sentence cannot also be a 500-word essay.',
      suggestion:
        'Pick either a one-sentence summary or a 500-word essay; the two length targets cannot both apply.',
    },
  },
  {
    id: 'medical-no-source',
    prompt: [
      'You are a board-certified physician.',
      'A user reports chest pain, sweating, and shortness of breath.',
      'Tell them whether they are having a heart attack and what medication to take immediately.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'grounding',
    expectedScoreRange: [25, 55],
    expectedMessageKeywords: ['grounding'],
    expectedSuggestionKeywords: ['medical'],
    llmResponse: {
      passed: false,
      score: 38,
      issue_type: 'grounding',
      message:
        'High-stakes medical advice without grounding, escalation guidance, or instructions to seek emergency care.',
      suggestion:
        'Require referral to emergency medical care, prohibit medication recommendations, and ground advice in published clinical guidelines.',
    },
  },
  {
    id: 'quality-without-definition',
    prompt: 'Write a good blog post about TypeScript generics for junior developers.',
    expectedPassed: false,
    expectedIssueType: 'success-criteria',
    expectedScoreRange: [40, 70],
    expectedMessageKeywords: ['success criteria'],
    expectedSuggestionKeywords: ['measurable'],
    llmResponse: {
      passed: false,
      score: 55,
      issue_type: 'success-criteria',
      message: 'The prompt asks for a "good" blog post without defining what good looks like.',
      suggestion:
        'State measurable criteria: target length, tone, required examples, and what counts as too advanced for the audience.',
    },
  },
  {
    id: 'overbroad-codebase-refactor',
    prompt: [
      'Refactor this entire codebase to use the best modern patterns.',
      'Make it production-grade and fix all the bugs.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'task-framing',
    expectedScoreRange: [20, 50],
    expectedMessageKeywords: ['overbroad'],
    expectedSuggestionKeywords: ['scope'],
    llmResponse: {
      passed: false,
      score: 32,
      issue_type: 'task-framing',
      message:
        'The task is overbroad — refactoring an entire codebase in one shot is not something a model can complete reliably.',
      suggestion:
        'Narrow the scope to a single file or pattern and provide explicit acceptance checks for the refactor.',
    },
  },
  {
    id: 'missing-input-reference',
    prompt: 'Summarize the document and tell me the key takeaways.',
    expectedPassed: false,
    expectedIssueType: 'ambiguity',
    expectedScoreRange: [25, 55],
    expectedMessageKeywords: ['ambiguous'],
    expectedSuggestionKeywords: ['input'],
    llmResponse: {
      passed: false,
      score: 36,
      issue_type: 'ambiguity',
      message: 'The prompt is ambiguous because no input document is referenced or attached.',
      suggestion:
        'Reference the input explicitly (e.g. {{document}}) and define what counts as a key takeaway.',
    },
  },
  {
    id: 'borderline-extraction-pass',
    prompt: [
      'Extract every phone number from {{text}}.',
      'Return a JSON array of strings in E.164 international format.',
      'Return [] when none are found.',
    ].join('\n'),
    expectedPassed: true,
    expectedIssueType: 'general',
    expectedScoreRange: [80, 95],
    expectedMessageKeywords: ['adequate'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 86,
      issue_type: 'general',
      message:
        'The task, input reference, and output format are adequate for an extraction prompt.',
      suggestion: '',
    },
  },
  {
    id: 'code-explainer-pass',
    prompt: [
      'You are a senior backend engineer mentoring a junior developer.',
      'Your task is to explain what the Python function in {{code}} does in 3 to 5 sentences.',
      'Focus on the high-level intent and any non-obvious side effects.',
      'Skip line-by-line walkthroughs.',
    ].join('\n'),
    expectedPassed: true,
    expectedIssueType: 'general',
    expectedScoreRange: [85, 100],
    expectedMessageKeywords: ['scoped'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 92,
      issue_type: 'general',
      message:
        'Role, task, scope, and output length are clearly scoped for the code-explanation use case.',
      suggestion: '',
    },
  },
  {
    id: 'multi-issue-prefer-conflict',
    prompt: [
      'You are a creative writer.',
      'Make the article better, but be precise and concise.',
      'Return a JSON object with the rewritten article inside.',
      'Do not return JSON — write a human-readable paragraph instead.',
    ].join('\n'),
    expectedPassed: false,
    expectedIssueType: 'conflict',
    expectedScoreRange: [30, 55],
    expectedMessageKeywords: ['conflict'],
    expectedSuggestionKeywords: ['format'],
    llmResponse: {
      passed: false,
      score: 42,
      issue_type: 'conflict',
      message:
        'The output format instructions directly conflict — JSON object vs human-readable paragraph.',
      suggestion:
        'Pick one output format. The vague "make it better" success criteria can be tightened in a separate pass.',
    },
  },
];
