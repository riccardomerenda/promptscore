import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PromptScore — Static analysis for LLM prompts',
  description:
    'PromptScore is ESLint for prompts: analyze your LLM prompts before you send them and get actionable feedback.',
  metadataBase: new URL('https://promptscore.dev'),
  openGraph: {
    title: 'PromptScore — Static analysis for LLM prompts',
    description:
      'Analyze your LLM prompts before you send them. Get a score, find issues, and learn why.',
    url: 'https://promptscore.dev',
    siteName: 'PromptScore',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptScore',
    description: 'Static analysis for LLM prompts. ESLint, but for prompts.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
