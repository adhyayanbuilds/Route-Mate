interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; }

export function Spinner({ size = 'md' }: SpinnerProps) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div
      className={`${s} rounded-full border-2 border-emerald-500/25 border-t-emerald-500 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <Spinner size="lg" />
    </div>
  );
}
