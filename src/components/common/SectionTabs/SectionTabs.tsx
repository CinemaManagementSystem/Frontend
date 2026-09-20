import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTabItem {
  id: string;
  label: string;
  count?: number;
}

interface SectionTabsProps {
  tabs: SectionTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'home';
  showCounts?: boolean;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'default',
  showCounts = true,
}) => {
  return (
    <div className={cn('flex items-center gap-5 md:gap-6', className)} role="tablist" aria-label="Movie listing tabs">
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              variant === 'home'
                ? 'flex items-center gap-2 whitespace-nowrap px-0 py-3 text-3xl font-semibold leading-none tracking-[-0.02em] transition-colors md:text-4xl lg:text-[40px]'
                : 'section-tab',
              variant === 'home'
                ? activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
                : activeTab === tab.id ? 'section-tab-active' : 'section-tab-inactive'
            )}
          >
            {tab.label}
            {tab.count !== undefined && variant !== 'home' && showCounts && (
              <span className={cn(
                'inline-flex items-center justify-center min-w-[28px] h-7 rounded-full text-[11px] font-black uppercase tracking-wider',
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-white/10 text-white/50'
              )}>
                {tab.count}
              </span>
            )}
          </button>
          {index < tabs.length - 1 && (
            <div className={variant === 'home' ? 'h-11 w-px bg-white/20' : 'section-tab-divider'} aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
