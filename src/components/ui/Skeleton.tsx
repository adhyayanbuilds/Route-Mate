interface SkeletonProps { className?: string; }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function PlaceCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-12 rounded-xl" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3" aria-hidden="true">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-3 w-24 rounded-lg" />
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <div className="glass-card p-7 space-y-4" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-8 items-end">
        <div className="space-y-2">
          <Skeleton className="h-14 w-28 rounded-xl" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
