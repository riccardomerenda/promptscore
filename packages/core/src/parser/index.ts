import type { Example, PromptAST, PromptComponents, PromptMetadata } from './types.js';

export type { Example, PromptAST, PromptComponents, PromptMetadata } from './types.js';

const ROLE_PATTERNS: RegExp[] = [
  /^you are\b[^.\n]*[.\n]/i,
  /^you're\b[^.\n]*[.\n]/i,
  /^act as\b[^.\n]*[.\n]/i,
  /^your role is\b[^.\n]*[.\n]/i,
  /^assume the role of\b[^.\n]*[.\n]/i,
  /^imagine you are\b[^.\n]*[.\n]/i,
  /^pretend to be\b[^.\n]*[.\n]/i,
];

const TASK_KEYWORDS: RegExp[] = [
  /\byour task is\b/i,
  /\byour job is\b/i,
  /\byour goal is\b/i,
  /\bplease\s+(?:write|explain|generate|analyze|summarize|translate|classify|extract|create|produce|list|describe)\b/i,
  /\b(?:write|explain|generate|analyze|summarize|translate|classify|extract|create|produce|list|describe) (?:a|an|the)\b/i,
];

const CONSTRAINT_KEYWORDS: RegExp[] = [
  /\b(?:must|should|should not|shouldn't|must not|mustn't|never|always|do not|don't|avoid|ensure|make sure|only)\b/i,
  /\b(?:maximum|minimum|at most|at least|no more than|no less than|exactly)\b/i,
];

const OUTPUT_FORMAT_KEYWORDS: RegExp[] = [
  /\b(?:output|respond|return|reply|answer)\s+(?:in|as|with|using)\s+(?:json|xml|yaml|markdown|html|csv|a list|a table|bullet points?|plain text|paragraphs?)\b/i,
  /\bformat\s*:\s*(?:json|xml|yaml|markdown|html|csv|list|table)\b/i,
  /\bin (?:json|xml|yaml|markdown|html|csv) format\b/i,
  /\b(?:output|response|answer) format\b/i,
];

const EXAMPLE_KEYWORDS: RegExp[] = [
  /\bfor example\b/i,
  /\bexamples?:/i,
  /\be\.g\./i,
  /\bhere (?:is|are) (?:an? )?examples?\b/i,
  /<example>/i,
  /\binput\s*:[\s\S]*?output\s*:/i,
];

const TONE_KEYWORDS: RegExp[] = [
  /\btone\s*:/i,
  /\b(?:in a|use a) (?:formal|casual|friendly|professional|concise|humorous|playful|serious|polite) (?:tone|voice|style|manner)\b/i,
  /\bbe (?:formal|casual|friendly|professional|concise|humorous|playful|serious|polite)\b/i,
  /\bwrite in a .{1,20} (?:tone|voice|style)\b/i,
];

const FALLBACK_KEYWORDS: RegExp[] = [
  /\bif (?:you (?:are )?(?:unsure|don't know|cannot|can't)|unsure|unclear|not sure|unable)\b/i,
  /\bif you cannot\b/i,
  /\bwhen in doubt\b/i,
  /\bas a fallback\b/i,
  /\bedge cases?\b/i,
];

const CONTEXT_KEYWORDS: RegExp[] = [
  /^context\s*:/im,
  /^background\s*:/im,
  /^scenario\s*:/im,
  /^given\s*:/im,
  /<context>/i,
];

const XML_TAG_REGEX = /<([a-z][a-z0-9_-]*)\b[^>]*>[\s\S]*?<\/\1>/i;
const MARKDOWN_HEADER_REGEX = /^#{1,6}\s+\S/m;
const NUMBERED_SECTION_REGEX = /^\s*(?:\d+[.)]\s+|\-\s+|\*\s+)/m;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function detectLanguage(text: string): string {
  // Very naive: just check for common English stopwords; default to 'en'.
  // A proper implementation would use a library, but v0.1 ships without it.
  const sample = text.toLowerCase().slice(0, 2000);
  const englishMarkers = /\b(?:the|and|you|your|that|this|with|for|are|not)\b/g;
  const matches = sample.match(englishMarkers);
  if (matches && matches.length >= 3) return 'en';
  return 'unknown';
}

function extractFirstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return undefined;
}

function extractRole(text: string): string | undefined {
  // Role is usually at the very start of the prompt.
  const firstLines = text.split(/\n/).slice(0, 3).join('\n');
  for (const pattern of ROLE_PATTERNS) {
    const match = firstLines.match(pattern);
    if (match) return match[0].trim();
  }
  // Also check via XML tag
  const xmlMatch = text.match(/<(?:role|persona)>([\s\S]*?)<\/(?:role|persona)>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
  return undefined;
}

function extractTask(text: string, role?: string): string | undefined {
  // Try XML tag first
  const xmlMatch = text.match(/<(?:task|instructions?|goal)>([\s\S]*?)<\/(?:task|instructions?|goal)>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();

  const withoutRole = role ? text.replace(role, '') : text;
  const found = extractFirstMatch(withoutRole, TASK_KEYWORDS);
  if (found) {
    // Expand to full sentence
    const idx = withoutRole.toLowerCase().indexOf(found.toLowerCase());
    if (idx >= 0) {
      const rest = withoutRole.slice(idx);
      const end = rest.search(/[.!?\n]/);
      return end > 0 ? rest.slice(0, end + 1).trim() : rest.slice(0, 200).trim();
    }
  }
  return undefined;
}

function extractContext(text: string): string | undefined {
  const xmlMatch = text.match(/<context>([\s\S]*?)<\/context>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();

  for (const pattern of CONTEXT_KEYWORDS) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      const rest = text.slice(match.index);
      const end = rest.search(/\n\n/);
      return end > 0 ? rest.slice(0, end).trim() : rest.slice(0, 300).trim();
    }
  }
  return undefined;
}

function extractConstraints(text: string): string[] {
  const constraints: string[] = [];
  const xmlMatch = text.match(/<constraints?>([\s\S]*?)<\/constraints?>/i);
  if (xmlMatch && xmlMatch[1]) {
    xmlMatch[1]
      .split(/\n/)
      .map((line) => line.replace(/^[\s\-*\d.)]+/, '').trim())
      .filter(Boolean)
      .forEach((line) => constraints.push(line));
  }

  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    for (const pattern of CONSTRAINT_KEYWORDS) {
      if (pattern.test(trimmed) && trimmed.length < 300) {
        constraints.push(trimmed);
        break;
      }
    }
  }

  // Deduplicate preserving order
  return Array.from(new Set(constraints));
}

function extractExamples(text: string): Example[] {
  const examples: Example[] = [];
  const xmlRegex = /<example>([\s\S]*?)<\/example>/gi;
  let xmlMatch: RegExpExecArray | null;
  while ((xmlMatch = xmlRegex.exec(text)) !== null) {
    const body = xmlMatch[1]?.trim() ?? '';
    const inputMatch = body.match(/input\s*:\s*([\s\S]*?)(?=output\s*:|$)/i);
    const outputMatch = body.match(/output\s*:\s*([\s\S]*)/i);
    examples.push({
      raw: body,
      input: inputMatch?.[1]?.trim(),
      output: outputMatch?.[1]?.trim(),
    });
  }

  if (examples.length === 0) {
    const ioRegex = /input\s*:\s*([\s\S]*?)\n\s*output\s*:\s*([\s\S]*?)(?=\n\s*input\s*:|\n\n|$)/gi;
    let ioMatch: RegExpExecArray | null;
    while ((ioMatch = ioRegex.exec(text)) !== null) {
      examples.push({
        raw: ioMatch[0].trim(),
        input: ioMatch[1]?.trim(),
        output: ioMatch[2]?.trim(),
      });
    }
  }

  if (examples.length === 0) {
    for (const pattern of EXAMPLE_KEYWORDS) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        const snippet = text.slice(match.index, match.index + 300);
        examples.push({ raw: snippet.trim() });
        break;
      }
    }
  }

  return examples;
}

function extractOutputFormat(text: string): string | undefined {
  const xmlMatch = text.match(/<(?:output|format|output_format)>([\s\S]*?)<\/(?:output|format|output_format)>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
  return extractFirstMatch(text, OUTPUT_FORMAT_KEYWORDS);
}

function extractTone(text: string): string | undefined {
  return extractFirstMatch(text, TONE_KEYWORDS);
}

function extractFallback(text: string): string | undefined {
  return extractFirstMatch(text, FALLBACK_KEYWORDS);
}

export function parsePrompt(raw: string): PromptAST {
  const text = raw;
  const role = extractRole(text);
  const task = extractTask(text, role);
  const context = extractContext(text);
  const constraints = extractConstraints(text);
  const examples = extractExamples(text);
  const outputFormat = extractOutputFormat(text);
  const tone = extractTone(text);
  const fallback = extractFallback(text);

  const components: PromptComponents = {
    role,
    task,
    context,
    constraints: constraints.length > 0 ? constraints : undefined,
    examples: examples.length > 0 ? examples : undefined,
    outputFormat,
    tone,
    fallback,
  };

  const hasXmlTags = XML_TAG_REGEX.test(text);
  const hasMarkdownHeaders = MARKDOWN_HEADER_REGEX.test(text);
  const hasNumberedSections = NUMBERED_SECTION_REGEX.test(text);

  const metadata: PromptMetadata = {
    wordCount: countWords(text),
    charCount: text.length,
    lineCount: text.split(/\n/).length,
    language: detectLanguage(text),
    hasStructuredFormat: hasXmlTags || hasMarkdownHeaders || hasNumberedSections,
    hasXmlTags,
    hasMarkdownHeaders,
    hasNumberedSections,
  };

  return {
    raw: text,
    components,
    metadata,
  };
}
