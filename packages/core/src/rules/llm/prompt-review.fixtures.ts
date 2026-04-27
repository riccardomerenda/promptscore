export interface PromptReviewBenchmarkCase {
  id: string;
  prompt: string;
  expectedPassed: boolean;
  expectedScoreRange: readonly [number, number];
  expectedMessageKeywords: string[];
  expectedSuggestionKeywords: string[];
  llmResponse: {
    passed: boolean;
    score: number;
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
    expectedScoreRange: [88, 100],
    expectedMessageKeywords: ['specified'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 94,
      message: 'The task, grounding, and output format are well specified.',
      suggestion: '',
    },
  },
  {
    id: 'implicit-success-criteria',
    prompt: 'You are a helpful assistant. Summarize this article and make it useful.',
    expectedPassed: false,
    expectedScoreRange: [45, 70],
    expectedMessageKeywords: ['success criteria'],
    expectedSuggestionKeywords: ['acceptance criteria'],
    llmResponse: {
      passed: false,
      score: 58,
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
    expectedScoreRange: [30, 55],
    expectedMessageKeywords: ['conflicting'],
    expectedSuggestionKeywords: ['one output format'],
    llmResponse: {
      passed: false,
      score: 42,
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
    expectedScoreRange: [35, 65],
    expectedMessageKeywords: ['grounding'],
    expectedSuggestionKeywords: ['jurisdiction'],
    llmResponse: {
      passed: false,
      score: 50,
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
    expectedScoreRange: [85, 100],
    expectedMessageKeywords: ['clear'],
    expectedSuggestionKeywords: [],
    llmResponse: {
      passed: true,
      score: 91,
      message: 'The prompt is clear, grounded, and structured for classification.',
      suggestion: '',
    },
  },
  {
    id: 'vague-rewrite-request',
    prompt: 'Make this better.',
    expectedPassed: false,
    expectedScoreRange: [0, 45],
    expectedMessageKeywords: ['ambiguous'],
    expectedSuggestionKeywords: ['task'],
    llmResponse: {
      passed: false,
      score: 28,
      message: 'The prompt is too ambiguous to review or execute reliably.',
      suggestion: 'State the task, input, audience, constraints, and desired output.',
    },
  },
];
