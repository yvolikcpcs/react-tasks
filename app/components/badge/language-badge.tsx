import {
  Braces,
  Code2,
  Coffee,
  Cpu,
  Database,
  FileCode2,
  Gem,
  Globe,
  Layers,
  Smartphone,
  Terminal,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import BadgePill from '@/app/components/ui/badge-pill';

type LanguageBadgeProps = {
  language: string;
  link?: boolean;
};

function normalizeLanguage(language: string) {
  return language.trim().toLowerCase();
}

function getLanguageIcon(language: string): ReactNode {
  const normalized = normalizeLanguage(language);

  if (normalized.includes('typescript') || normalized === 'ts') {
    return <Braces className="mr-2 h-4 w-4 text-slate-400" />;
  }
  if (normalized.includes('javascript') || normalized === 'js' || normalized.includes('node'))
    return <FileCode2 className="mr-2 h-4 w-4 text-slate-400" />;
  if (normalized.includes('python')) return <Terminal className="mr-2 h-4 w-4 text-slate-400" />;
  if (normalized.includes('java')) return <Coffee className="mr-2 h-4 w-4 text-slate-400" />;
  if (
    normalized.includes('c#') ||
    normalized.includes('dotnet') ||
    normalized === 'c' ||
    normalized.includes('c++')
  ) {
    return <Cpu className="mr-2 h-4 w-4 text-slate-400" />;
  }
  if (normalized.includes('go')) return <Globe className="mr-2 h-4 w-4 text-slate-400" />;
  if (normalized.includes('rust')) return <Gem className="mr-2 h-4 w-4 text-slate-400" />;
  if (normalized.includes('sql') || normalized.includes('postgres') || normalized.includes('mysql'))
    return <Database className="mr-2 h-4 w-4 text-slate-400" />;
  if (normalized.includes('swift') || normalized.includes('kotlin'))
    return <Smartphone className="mr-2 h-4 w-4 text-slate-400" />;
  if (
    normalized.includes('react') ||
    normalized.includes('next') ||
    normalized.includes('vue') ||
    normalized.includes('angular') ||
    normalized.includes('svelte')
  ) {
    return <Layers className="mr-2 h-4 w-4 text-slate-400" />;
  }

  return <Code2 className="mr-2 h-4 w-4 text-slate-400" />;
}

export default function LanguageBadge({ language, link = true }: LanguageBadgeProps) {
  return (
    <BadgePill icon={getLanguageIcon(language)}>
      {link ? (
        <Link href={`/?language=${encodeURIComponent(language)}`} className="text-blue-600 hover:underline">
          {language}
        </Link>
      ) : (
        <span>{language}</span>
      )}
    </BadgePill>
  );
}
