import type { Rule } from './types.js';
import { deterministicRules } from './deterministic/index.js';
import { llmRules } from './llm/index.js';

export class RuleRegistry {
  private readonly rules = new Map<string, Rule>();

  constructor(initialRules: Rule[] = []) {
    for (const rule of initialRules) {
      this.register(rule);
    }
  }

  register(rule: Rule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id "${rule.id}" is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  get(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  has(id: string): boolean {
    return this.rules.has(id);
  }

  all(): Rule[] {
    return Array.from(this.rules.values());
  }

  byType(type: 'deterministic' | 'llm'): Rule[] {
    return this.all().filter((rule) => rule.type === type);
  }

  byIds(ids: string[]): Rule[] {
    const out: Rule[] = [];
    for (const id of ids) {
      const rule = this.rules.get(id);
      if (rule) out.push(rule);
    }
    return out;
  }
}

export function createDefaultRegistry(): RuleRegistry {
  return new RuleRegistry([...deterministicRules, ...llmRules]);
}
