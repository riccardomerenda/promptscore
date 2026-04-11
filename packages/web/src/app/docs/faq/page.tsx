import { DocsArticle } from '../../../components/docs/DocsArticle';

const FAQS = [
  {
    question: 'Is PromptScore an evaluation framework?',
    answer:
      'No. PromptScore analyzes the input prompt itself. It does not grade the quality of a model response or replace output evaluation.',
  },
  {
    question: 'Does PromptScore send prompts to external APIs?',
    answer:
      'Not in the current deterministic workflow. The CLI, core library, and browser analyzer all run the shipped rule set locally unless you explicitly opt into future LLM-backed rules.',
  },
  {
    question: 'Why have model profiles if the rules are deterministic?',
    answer:
      'Profiles let the same core engine adjust severity, weighting, suggestions, and references for different model families without forking the entire rule set.',
  },
  {
    question: 'Can I use PromptScore in CI?',
    answer:
      'Yes. The CLI exits with code 1 when findings meet the active failure threshold, which defaults to errors and can be tightened to warnings or info through config or --fail-on.',
  },
  {
    question: 'Can I add my own rules?',
    answer:
      'Yes. The core library supports additional rules through the programmatic API, and the repository documents how to register and test them.',
  },
  {
    question: 'Is there a paid product today?',
    answer:
      'No hosted paid product ships today. The current public product is the open-source local analysis experience.',
  },
  {
    question: 'Will browser and CLI results match?',
    answer:
      'That is the goal. The browser analyzer uses the same deterministic rule and scoring pipeline, with built-in profiles replacing filesystem-loaded YAML.',
  },
];

export default function FaqPage() {
  return (
    <DocsArticle
      currentHref="/docs/faq"
      eyebrow="FAQ"
      title="Common questions about PromptScore"
      lead="This FAQ is meant to reduce ambiguity around scope, privacy, current capabilities, and the shape of the product."
    >
      <section className="docs-section">
        <div className="docs-faq-list">
          {FAQS.map((item) => (
            <div key={item.question} className="docs-faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </DocsArticle>
  );
}
