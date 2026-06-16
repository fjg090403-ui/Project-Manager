export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-text text-surface shadow-soft hover:-translate-y-0.5 opacity-95 hover:opacity-100',
    secondary: 'bg-surface text-text ring-1 ring-line hover:bg-elevated',
    ghost: 'bg-transparent text-muted hover:bg-elevated hover:text-text',
    danger: 'bg-danger text-white hover:bg-red-700'
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`h-11 rounded-xl border border-line bg-surface px-3.5 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return <select className={`h-11 rounded-xl border border-line bg-surface px-3.5 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 ${className}`} {...props}>{children}</select>;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`min-h-28 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 ${className}`} {...props} />;
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-xl2 border border-line bg-surface shadow-soft ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-elevated text-muted',
    blue: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700'
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Alert({ type = 'success', children }) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800'
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[type]}`}>{children}</div>;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-elevated ${className}`} />;
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-brand-50 ring-8 ring-brand-50/50" />
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
