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
  html5: { editor: 'html', ext: 'html' },
  html: { editor: 'html', ext: 'html' },
  css: { editor: 'css', ext: 'css' },
};

const normalize = (languageName: string) => languageName.trim().toLowerCase();

const DISPLAY_LABELS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  'c#': 'C#',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  vue: 'Vue',
  angular: 'Angular',
  svelte: 'Svelte',
  html5: 'HTML',
  html: 'HTML',
  css: 'CSS',
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatLanguageLabel(alias: string) {
  return DISPLAY_LABELS[alias] ?? alias;
}

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

export const inferLanguageSuggestion = (topic: string) => {
  const normalizedTopic = normalize(topic);
  if (!normalizedTopic) {
    return null;
  }

  const aliases = Object.keys(LANGUAGE_ALIASES).sort((a, b) => b.length - a.length);
  let bestMatch: { alias: string; index: number } | null = null;

  for (const alias of aliases) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}(?=$|[^a-z0-9])`);
    const match = pattern.exec(normalizedTopic);
    if (!match) {
      continue;
    }

    const index = match.index + match[1].length;
    if (!bestMatch || index < bestMatch.index || (index === bestMatch.index && alias.length > bestMatch.alias.length)) {
      bestMatch = { alias, index };
    }
  }

  return bestMatch ? formatLanguageLabel(bestMatch.alias) : null;
};
