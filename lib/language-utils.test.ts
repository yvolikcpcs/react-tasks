import { describe, it, expect } from 'vitest';
import {
  canonicalizeLanguageName,
  inferLanguageRuntime,
  inferLanguageSuggestion,
  inferLanguageTag,
  isKnownLanguageTag,
  normalizeLanguageLabel,
} from './language-utils';

describe('language-utils', () => {
  describe('inferLanguageRuntime', () => {
    it('should correctly infer direct aliases', () => {
      expect(inferLanguageRuntime('javascript')).toEqual({ editor: 'javascript', ext: 'js' });
      expect(inferLanguageRuntime('js')).toEqual({ editor: 'javascript', ext: 'js' });
      expect(inferLanguageRuntime('ts')).toEqual({ editor: 'typescript', ext: 'ts' });
      expect(inferLanguageRuntime('python')).toEqual({ editor: 'python', ext: 'py' });
    });

    it('should be case-insensitive and handle whitespace', () => {
      expect(inferLanguageRuntime('  TypeScript  ')).toEqual({ editor: 'typescript', ext: 'ts' });
      expect(inferLanguageRuntime('CPP')).toEqual({ editor: 'cpp', ext: 'cpp' });
    });

    it('should handle React and Next.js variants', () => {
      // Plain React
      expect(inferLanguageRuntime('react')).toEqual({ editor: 'javascript', ext: 'jsx' });
      // React with TypeScript
      expect(inferLanguageRuntime('React + TS')).toEqual({ editor: 'typescript', ext: 'tsx' });
      expect(inferLanguageRuntime('next.js (typescript)')).toEqual({ editor: 'typescript', ext: 'tsx' });
    });

    it('should handle other frameworks', () => {
      expect(inferLanguageRuntime('vue')).toEqual({ editor: 'javascript', ext: 'vue' });
      expect(inferLanguageRuntime('angular')).toEqual({ editor: 'typescript', ext: 'ts' });
      expect(inferLanguageRuntime('svelte')).toEqual({ editor: 'javascript', ext: 'svelte' });
    });

    it('should return plaintext fallback for unknown languages', () => {
      expect(inferLanguageRuntime('unknown-lang')).toEqual({ editor: 'plaintext', ext: 'txt' });
      expect(inferLanguageRuntime('')).toEqual({ editor: 'plaintext', ext: 'txt' });
    });
  });

  describe('inferLanguageTag', () => {
    it('should slugify language names', () => {
      expect(inferLanguageTag('JavaScript')).toBe('javascript');
      expect(inferLanguageTag('Next.js (TS)')).toBe('next.js-(ts)');
      expect(inferLanguageTag('React Native')).toBe('react-native');
    });

    it('should return "programming" for empty input', () => {
      expect(inferLanguageTag('')).toBe('programming');
      expect(inferLanguageTag('   ')).toBe('programming');
    });
  });

  describe('inferLanguageSuggestion', () => {
    it('should suggest direct language aliases from topic text', () => {
      expect(inferLanguageSuggestion('C# arrays and lists')).toBe('C#');
      expect(inferLanguageSuggestion('typescript async functions')).toBe('TypeScript');
      expect(inferLanguageSuggestion('react hooks interview task')).toBe('React');
    });

    it('should prefer the earliest language mention in the topic', () => {
      expect(inferLanguageSuggestion('React forms with TypeScript')).toBe('React');
    });

    it('should return null when no known language is present', () => {
      expect(inferLanguageSuggestion('data structures and problem solving')).toBeNull();
    });
  });

  describe('normalizeLanguageLabel', () => {
    it('should normalize known aliases to a display label', () => {
      expect(normalizeLanguageLabel('react')).toBe('React');
      expect(normalizeLanguageLabel('React')).toBe('React');
      expect(normalizeLanguageLabel('typescript')).toBe('TypeScript');
      expect(normalizeLanguageLabel('c#')).toBe('C#');
    });

    it('should preserve unknown labels except for trimming', () => {
      expect(normalizeLanguageLabel('  Elixir  ')).toBe('Elixir');
    });
  });

  describe('canonicalizeLanguageName', () => {
    it('should compare language names case-insensitively', () => {
      expect(canonicalizeLanguageName('React')).toBe('react');
      expect(canonicalizeLanguageName(' react ')).toBe('react');
    });
  });

  describe('isKnownLanguageTag', () => {
    it('should detect known languages and frameworks', () => {
      expect(isKnownLanguageTag('react')).toBe(true);
      expect(isKnownLanguageTag('React')).toBe(true);
      expect(isKnownLanguageTag('c#')).toBe(true);
      expect(isKnownLanguageTag('next.js')).toBe(true);
    });

    it('should ignore regular topic tags', () => {
      expect(isKnownLanguageTag('hooks')).toBe(false);
      expect(isKnownLanguageTag('algorithms')).toBe(false);
      expect(isKnownLanguageTag('string manipulation')).toBe(false);
    });
  });
});
