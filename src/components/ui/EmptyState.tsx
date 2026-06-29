import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`glass-card p-12 flex flex-col items-center text-center anim-fade-in ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-5 text-white/30">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2 text-white">{title}</h3>
      <p className="text-white/45 text-sm max-w-xs text-balance leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
