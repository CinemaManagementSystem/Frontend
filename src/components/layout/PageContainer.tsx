import React from 'react';
import { cn } from '@/lib/utils';

type PageContainerProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export function PageContainer<T extends React.ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: PageContainerProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component className={cn('app-container', className)} {...props}>
      {children}
    </Component>
  );
}
