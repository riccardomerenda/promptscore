import type { Rule } from '../types.js';

const VAGUE_WORDS = [
  'good',
  'nice',
  'proper',
  'appropriate',
  'correct',
  'better',
  'high quality',
  'high-quality',
  'reasonable',
  'decent',
  'suitable',
];

function buildVaguePattern(): RegExp {
  const escaped = VAGUE_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'gi');
}

const VAGUE_PATTERN = buildVaguePattern();

export const vagueInstructionRule: Rule = {
  id: 'vague-instruction',
  name: 'Vague instructions',
  description:
    'Vague words like "good", "proper", or "appropriate" do not give the model a concrete target.',
  category: 'clarity',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const matches = ast.raw.match(VAGUE_PATTERN) ?? [];
    const unique = Array.from(new Set(matches.map((m) => m.toLowerCase())));
    const passed = matches.length === 0;
    const score = passed ? 100 : Math.max(25, 100 - matches.length * 15);
    return {
      ruleId: 'vague-instruction',
      passed,
      score,
      message: passed
        ? 'No vague qualifiers detected.'
        : `Vague qualifiers used: ${unique.join(', ')}.`,
      suggestion: passed
        ? undefined
        : 'Replace vague words with measurable criteria. "Good" → "concise (≤ 3 sentences) and citing sources".',
      severity: 'warning',
      category: 'clarity',
      weight: 1,
    };
  },
};
