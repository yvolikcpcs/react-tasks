import { Tag } from 'lucide-react';
import Link from 'next/link';

type TagBadgeProps = {
  tag: string;
  link?: boolean;
};

export default function TagBadge({ tag, link = true }: TagBadgeProps) {
  return (
    <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      <Tag className="w-4 h-4 mr-2 text-slate-400" />
      {link ? (
        <Link href={`/?tag=${tag}`} className="text-blue-600 hover:underline">
          {tag}
        </Link>
      ) : (
        <span>{tag}</span>
      )}
    </div>
  );
}
