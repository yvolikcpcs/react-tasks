const LANGUAGE_ALIASES: Record<string, { editor: string; ext: string }> = {
  javascript: { editor: 'javascript', ext: 'js' },
  js: { editor: 'javascript', ext: 'js' },
  typescript: { editor: 'typescript', ext: 'ts' },
  ts: { editor: 'typescript', ext: 'ts' },
  python: { editor: 'python', ext: 'py' },
  py: { editor: 'python', ext: 'py' },
  java: { editor: 'java', ext: 'java' },
  csharp: { editor: 'csharp', ext: 'cs' },
  'c#': { editor: 'csharp', ext: 'cs' },
  cpp: { editor: 'cpp', ext: 'cpp' },
  'c++': { editor: 'cpp', ext: 'cpp' },
  c: { editor: 'c', ext: 'c' },
  go: { editor: 'go', ext: 'go' },
  golang: { editor: 'go', ext: 'go' },
  rust: { editor: 'rust', ext: 'rs' },
  ruby: { editor: 'ruby', ext: 'rb' },
  php: { editor: 'php', ext: 'php' },
  swift: { editor: 'swift', ext: 'swift' },
  kotlin: { editor: 'kotlin', ext: 'kt' },
  scala: { editor: 'scala', ext: 'scala' },
  sql: { editor: 'sql', ext: 'sql' },
  bash: { editor: 'shell', ext: 'sh' },
  shell: { editor: 'shell', ext: 'sh' },
  react: { editor: 'javascript', ext: 'jsx' },
  reactjs: { editor: 'javascript', ext: 'jsx' },
  'react.js': { editor: 'javascript', ext: 'jsx' },
  'next.js': { editor: 'typescript', ext: 'tsx' },
  nextjs: { editor: 'typescript', ext: 'tsx' },
  vue: { editor: 'javascript', ext: 'vue' },
  angular: { editor: 'typescript', ext: 'ts' },
  svelte: { editor: 'javascript', ext: 'svelte' },
};

const normalize = (languageName: string) => languageName.trim().toLowerCase();

export const inferLanguageRuntime = (languageName: string) => {
  const normalized = normalize(languageName);
  const direct = LANGUAGE_ALIASES[normalized];
  if (direct) return direct;

  // Handle composite labels like "React + TypeScript" or "Next.js (TS)".
  if (normalized.includes('react') || normalized.includes('next')) {
    if (normalized.includes('type') || normalized.includes('ts')) {
      return { editor: 'typescript', ext: 'tsx' };
    }
    return { editor: 'javascript', ext: 'jsx' };
  }

  if (normalized.includes('vue')) return { editor: 'javascript', ext: 'vue' };
  if (normalized.includes('angular')) return { editor: 'typescript', ext: 'ts' };
  if (normalized.includes('svelte')) return { editor: 'javascript', ext: 'svelte' };

  return { editor: 'plaintext', ext: 'txt' };
};

export const inferLanguageTag = (languageName: string) => {
  const normalized = normalize(languageName);
  return normalized.length > 0 ? normalized.replace(/\s+/g, '-') : 'programming';
};
