import { describe, expect, it } from 'vitest';
import { parsePrompt } from './index.js';

describe('parsePrompt', () => {
  it('counts words and chars', () => {
    const ast = parsePrompt('You are a helpful assistant. Answer user questions.');
    expect(ast.metadata.wordCount).toBe(8);
    expect(ast.metadata.charCount).toBeGreaterThan(0);
  });

  it('detects a role prefix', () => {
    const ast = parsePrompt('You are a senior TypeScript engineer.\nPlease write a function.');
    expect(ast.components.role).toBeDefined();
    expect(ast.components.role!.toLowerCase()).toContain('you are');
  });

  it('detects a task from imperative phrasing', () => {
    const ast = parsePrompt(
      'You are a helpful assistant. Please write a short poem about the sea.',
    );
    expect(ast.components.task).toBeDefined();
  });

  it('detects xml-tagged structure', () => {
    const ast = parsePrompt('<instructions>Do X</instructions><context>Y</context>');
    expect(ast.metadata.hasXmlTags).toBe(true);
    expect(ast.metadata.hasStructuredFormat).toBe(true);
  });

  it('detects markdown headers', () => {
    const ast = parsePrompt('# Instructions\n\nDo the thing.');
    expect(ast.metadata.hasMarkdownHeaders).toBe(true);
  });

  it('extracts constraints from imperative lines', () => {
    const ast = parsePrompt(
      'You are an assistant.\nYou must respond in under 100 words.\nAlways cite sources.',
    );
    expect(ast.components.constraints).toBeDefined();
    expect(ast.components.constraints!.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts output format via keyword', () => {
    const ast = parsePrompt('Return the answer in JSON format.');
    expect(ast.components.outputFormat).toBeDefined();
  });

  it('extracts examples from <example> tags', () => {
    const ast = parsePrompt(
      'Your task is to classify sentiment.\n<example>Input: I love it\nOutput: positive</example>',
    );
    expect(ast.components.examples).toBeDefined();
    expect(ast.components.examples!.length).toBeGreaterThan(0);
  });
});
