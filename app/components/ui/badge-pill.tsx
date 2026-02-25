import type { ReactNode } from 'react';

type BadgePillProps = {
  icon: ReactNode;
  children: ReactNode;
};

export default function BadgePill({ icon, children }: BadgePillProps) {
  return (
    <div className="flex items-center rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
      {icon}
      {children}
    </div>
  );
}
