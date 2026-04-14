import { DocsArticle } from '../../../components/docs/DocsArticle';

const RULES = [
  ['min-length', 'specificity', 'Prompt is not too short.'],
  ['max-length', 'structure', 'Prompt is not excessively long.'],
  ['no-output-format', 'specificity', 'The expected answer format is specified.'],
  ['no-examples', 'best-practice', 'Few-shot examples are present.'],
  ['no-role', 'best-practice', 'A role or persona is assigned.'],
  ['no-context', 'specificity', 'Background context is provided.'],
  ['ambiguous-negation', 'clarity', 'Negative instructions are not overly vague or stacked.'],
  ['no-constraints', 'specificity', 'Explicit constraints are defined.'],
  ['all-caps-abuse', 'clarity', 'ALL CAPS is not overused for emphasis.'],
  ['vague-instruction', 'clarity', 'Qualifiers like good or appropriate are not left undefined.'],
  ['missing-task', 'clarity', 'An explicit task or request is detectable.'],
  [
    'no-structured-format',
    'structure',
    'Long prompts use visible structure such as sections or tags.',
  ],
];

export default function RulesPage() {
  return (
    <DocsArticle
      currentHref="/docs/rules"
      eyebrow="Rules reference"
      title="Understand what the deterministic engine checks"
      lead="All currently shipped rules are deterministic. They score the structure and clarity of the prompt itself, not the quality of a model response."
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
              {RULES.map(([id, category, description]) => (
                <tr key={id}>
                  <td>
                    <code>{id}</code>
                  </td>
                  <td>{category}</td>
                  <td>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h2>How scoring should be interpreted</h2>
        <ul className="docs-list">
          <li>The score is a structural signal, not a guarantee of output quality.</li>
          <li>Rule weight and severity come from the active profile.</li>
          <li>
            `missing-task` is intentionally the most important rule in the default experience.
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
