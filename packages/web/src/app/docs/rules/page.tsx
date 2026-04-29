import { DocsArticle } from '../../../components/docs/DocsArticle';

interface RuleEntry {
  id: string;
  category: string;
  summary: string;
  details: string;
  fix: string;
}

const DETERMINISTIC_RULES: RuleEntry[] = [
  {
    id: 'min-length',
    category: 'specificity',
    summary: 'Prompt is not too short.',
    details:
      'Prompts shorter than 20 words rarely give a model enough to work with. The score scales linearly with the word count below the threshold.',
    fix: 'Add detail about what you want, why, and how the output should look.',
  },
  {
    id: 'max-length',
    category: 'structure',
    summary: 'Prompt is not excessively long.',
    details:
      'Very long prompts (>1500 words) tend to contain redundancy and dilute the model’s focus. The score decreases gradually past the soft limit.',
    fix: 'Look for repeated instructions, bundled unrelated tasks, or sections that can be summarized.',
  },
  {
    id: 'no-output-format',
    category: 'specificity',
    summary: 'The expected answer format is specified.',
    details:
      'The prompt should tell the model exactly how to format its answer, otherwise the model will guess and consumers cannot rely on the shape.',
    fix: 'State the exact format: JSON schema, bullet list, markdown table, single sentence, etc.',
  },
  {
    id: 'no-examples',
    category: 'best-practice',
    summary: 'Few-shot examples are present.',
    details:
      'Examples dramatically improve consistency on classification, extraction, and formatting tasks. Profiles like claude weight this rule higher.',
    fix: 'Add 1–3 concrete examples showing the input and the expected output.',
  },
  {
    id: 'no-role',
    category: 'best-practice',
    summary: 'A role or persona is assigned.',
    details:
      'Assigning a role focuses the model and sets expectations for expertise and tone. Useful for both system and user messages.',
    fix: 'Start with something like "You are a senior <X> who specializes in <Y>."',
  },
  {
    id: 'no-context',
    category: 'specificity',
    summary: 'Background context is provided.',
    details:
      'Context helps the model understand the situation, audience, and constraints. Long prompts (>=80 words) are assumed to provide implicit context.',
    fix: 'Explain the situation: who the user is, why they’re asking, and what the stakes are.',
  },
  {
    id: 'ambiguous-negation',
    category: 'clarity',
    summary: 'Negative instructions are not overly vague or stacked.',
    details:
      'Models follow positive instructions ("do Y") more reliably than negations ("don\'t do X"). Heavy stacking of negations correlates with regressions.',
    fix: 'Rewrite "don\'t do X" as "do Y instead". Tell the model what the desired behavior is.',
  },
  {
    id: 'no-constraints',
    category: 'specificity',
    summary: 'Explicit constraints are defined.',
    details:
      'Constraints keep the model on track and prevent scope drift. They are also the easiest hook for downstream evaluation.',
    fix: 'Add constraints like length limits, scope boundaries, or things the answer must include.',
  },
  {
    id: 'all-caps-abuse',
    category: 'clarity',
    summary: 'ALL CAPS is not overused for emphasis.',
    details:
      'Excessive ALL CAPS is noisy and rarely the clearest way to emphasize something. Bold, quotes, and XML tags work better.',
    fix: 'Use bold (**word**), quotes, or XML tags for emphasis instead of ALL CAPS.',
  },
  {
    id: 'vague-instruction',
    category: 'clarity',
    summary: 'Qualifiers like good or appropriate are not left undefined.',
    details:
      'Vague qualifiers ("good", "proper", "appropriate") don\'t give the model a measurable target. Replace them with concrete acceptance criteria.',
    fix: 'Replace vague words with measurable criteria. "Good" → "concise (≤ 3 sentences) and citing sources".',
  },
  {
    id: 'missing-task',
    category: 'clarity',
    summary: 'An explicit task or request is detectable.',
    details:
      "This is the highest-weight rule and the only one that fires as an error by default. If the model can't identify a task, the rest of the prompt is wasted.",
    fix: 'State the task explicitly: "Your task is to..." or "Please <verb> <object>".',
  },
  {
    id: 'no-structured-format',
    category: 'structure',
    summary: 'Long prompts use visible structure such as sections or tags.',
    details:
      'Long prompts (>100 words) are easier for a model to follow when broken into sections. XML tags work especially well for Claude; markdown headers work well for GPT.',
    fix: 'Split the prompt into labeled sections: <instructions>, <context>, <examples>, <output_format>.',
  },
];

interface IssueEntry {
  id: string;
  label: string;
  summary: string;
  fix: string;
}

const LLM_ISSUE_TYPES: IssueEntry[] = [
  {
    id: 'llm-prompt-review-ambiguity',
    label: 'Ambiguity',
    summary:
      'The prompt has multiple plausible readings, missing scope, or under-specified inputs.',
    fix: 'Specify the task, input, audience, constraints, and expected output.',
  },
  {
    id: 'llm-prompt-review-conflict',
    label: 'Conflicting instructions',
    summary:
      'The prompt asks for incompatible behaviors (e.g. JSON and plain text) or contradicts itself across sections.',
    fix: 'Choose one instruction path and remove the incompatible wording.',
  },
  {
    id: 'llm-prompt-review-grounding',
    label: 'Grounding',
    summary:
      'The prompt expects facts, citations, or jurisdiction-specific knowledge without supplying source material or scope.',
    fix: 'Provide source material, scope, assumptions, and how the model should handle uncertainty.',
  },
  {
    id: 'llm-prompt-review-success-criteria',
    label: 'Success criteria',
    summary: 'The prompt does not state what a good answer must include, avoid, or optimize for.',
    fix: 'State what a good answer must include, avoid, and optimize for.',
  },
  {
    id: 'llm-prompt-review-task-framing',
    label: 'Task framing',
    summary:
      'The task is unrealistic, overbroad, or asks for guarantees the model cannot reasonably provide.',
    fix: 'Narrow the task to something the model can reasonably complete and verify.',
  },
];

export default function RulesPage() {
  return (
    <DocsArticle
      currentHref="/docs/rules"
      eyebrow="Rules reference"
      title="Understand what the engine checks"
      lead="The deterministic rules score the structure and clarity of the prompt itself. The LLM rule is opt-in and looks for issues deterministic checks miss."
    >
      <section className="docs-section">
        <h2>Rules in the current public release</h2>
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Category</th>
                <th>What it checks</th>
              </tr>
            </thead>
            <tbody>
              {DETERMINISTIC_RULES.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <a href={`#${rule.id}`}>
                      <code>{rule.id}</code>
                    </a>
                  </td>
                  <td>{rule.category}</td>
                  <td>{rule.summary}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <a href="#llm-prompt-review">
                    <code>llm-prompt-review</code>
                  </a>
                </td>
                <td>model-specific</td>
                <td>Opt-in LLM review for issues deterministic rules miss.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h2>Deterministic rules</h2>
        {DETERMINISTIC_RULES.map((rule) => (
          <div id={rule.id} key={rule.id}>
            <h3>
              <code>{rule.id}</code> — {rule.category}
            </h3>
            <p>{rule.details}</p>
            <p>
              <strong>Fix:</strong> {rule.fix}
            </p>
          </div>
        ))}
      </section>

      <section className="docs-section" id="llm-prompt-review">
        <h2>LLM-backed rule (experimental, opt-in)</h2>
        <p>
          The <code>llm-prompt-review</code> rule is skipped unless you enable <code>--llm</code> in
          the CLI or <code>include_llm: true</code> in the project config and provide a configured
          LLM client. It calls the configured provider to catch hidden ambiguity, missing grounding,
          conflicting instructions, unrealistic task framing, and unclear success criteria.
        </p>
        <p>
          When the model reports a failure, PromptScore normalizes the review into one of the issue
          types below. The reported <code>reference</code> on the rule result links to the matching
          anchor here.
        </p>
        {LLM_ISSUE_TYPES.map((issue) => (
          <div id={issue.id} key={issue.id}>
            <h3>{issue.label}</h3>
            <p>{issue.summary}</p>
            <p>
              <strong>Fix:</strong> {issue.fix}
            </p>
          </div>
        ))}
      </section>

      <section className="docs-section">
        <h2>How scoring should be interpreted</h2>
        <ul className="docs-list">
          <li>The score is a structural signal, not a guarantee of output quality.</li>
          <li>Rule weight and severity come from the active profile.</li>
          <li>
            <code>missing-task</code> is intentionally the most important rule in the default
            experience.
          </li>
          <li>Suggestions are sorted by likely impact, not just in file order.</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>What rules are not doing yet</h2>
        <p>
          PromptScore does not currently validate runtime grounding, output correctness, safety
          outcomes, or tool behavior. Those are different problems and should remain clearly
          separated from prompt linting.
        </p>
      </section>
    </DocsArticle>
  );
}
