import { Tag } from 'lucide-react';
import Link from 'next/link';
import BadgePill from '@/components/ui/badge-pill';

type TagBadgeProps = {
  tag: string;
  link?: boolean;
};

export default function TagBadge({ tag, link = true }: TagBadgeProps) {
  return (
    <BadgePill icon={<Tag className="mr-2 h-4 w-4 text-slate-400" />}>
      {link ? (
        <Link href={`/?tag=${tag}`} className="text-blue-600 hover:underline">
          {tag}
        </Link>
      ) : (
        <span>{tag}</span>
      )}
    </BadgePill>
  );
}
