import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export function AdminSectionCard({
  title,
  description,
  icon: Icon,
  className,
  children,
}: AdminSectionCardProps) {
  return (
    <section className={cn('rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-sm sm:p-6', className)}>
      <div className="mb-6 flex items-start gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E50914]/20 bg-[#E50914]/10 text-[#ff3341]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
