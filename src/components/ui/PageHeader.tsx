import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, backLabel, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 anim-fade-up">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {backLabel || 'Back'}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          {icon && (
            <div className="w-11 h-11 rounded-2xl bg-ink-800 border border-white/10 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && <p className="text-white/45 text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
