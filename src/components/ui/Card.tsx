import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border p-4', className)}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('mb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: CardProps) {
  return (
    <h3
      className={cn('font-semibold text-sm', className)}
      style={{ color: 'var(--text-secondary)' }}
      {...props}
    >
      {children}
    </h3>
  );
}
