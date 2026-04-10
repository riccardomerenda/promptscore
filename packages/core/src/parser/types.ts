export interface Example {
  input?: string;
  output?: string;
  raw: string;
}

export interface PromptComponents {
  role?: string;
  task?: string;
  context?: string;
  constraints?: string[];
  examples?: Example[];
  outputFormat?: string;
  tone?: string;
  fallback?: string;
  other?: string[];
}

export interface PromptMetadata {
  wordCount: number;
  charCount: number;
  lineCount: number;
  language: string;
  hasStructuredFormat: boolean;
  hasXmlTags: boolean;
  hasMarkdownHeaders: boolean;
  hasNumberedSections: boolean;
}

export interface PromptAST {
  raw: string;
  components: PromptComponents;
  metadata: PromptMetadata;
}
