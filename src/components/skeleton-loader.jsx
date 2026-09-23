// Shimmer skeleton loading components for dashboard, table rows, and analytics states

export function MetricRibbonSkeleton() {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border-subtle grid grid-cols-2 lg:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-surface-elevated rounded w-20"></div>
            <div className="h-3.5 w-3.5 bg-surface-elevated rounded"></div>
          </div>
          <div className="h-6 bg-surface-elevated rounded w-16"></div>
          <div className="h-2.5 bg-surface-elevated/70 rounded w-28"></div>
        </div>
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-5 bg-surface border border-border-subtle rounded-xl animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 bg-surface-elevated rounded w-20"></div>
        <div className="h-4 w-4 bg-surface-elevated rounded"></div>
      </div>
      <div className="h-7 bg-surface-elevated rounded w-16 mb-2"></div>
      <div className="h-3 bg-surface-elevated rounded w-28"></div>
    </div>
  );
}

export function LinkRowSkeleton() {
  return (
    <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_76px] lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_70px_76px] items-center gap-4 px-4 py-3 bg-surface border border-border-subtle rounded-xl animate-pulse">
      {/* Col 1: Favicon + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-surface-elevated flex-shrink-0"></div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-3.5 bg-surface-elevated rounded w-36"></div>
          <div className="h-2.5 bg-surface-elevated/70 rounded w-20"></div>
        </div>
      </div>

      {/* Col 2: Short slug + original */}
      <div className="space-y-1.5 min-w-0">
        <div className="h-3.5 bg-surface-elevated rounded w-28"></div>
        <div className="h-2.5 bg-surface-elevated/70 rounded w-40"></div>
      </div>

      {/* Col 3: Status */}
      <div>
        <div className="h-5 bg-surface-elevated rounded-full w-16"></div>
      </div>

      {/* Col 4: Clicks */}
      <div className="text-right space-y-1">
        <div className="h-4 bg-surface-elevated rounded w-10 ml-auto"></div>
        <div className="h-2.5 bg-surface-elevated/70 rounded w-8 ml-auto"></div>
      </div>

      {/* Col 5: Date */}
      <div className="text-right hidden lg:block">
        <div className="h-3 bg-surface-elevated rounded w-12 ml-auto"></div>
      </div>

      {/* Col 6: Actions */}
      <div className="flex items-center justify-end gap-1">
        <div className="w-7 h-7 bg-surface-elevated rounded-md"></div>
        <div className="w-7 h-7 bg-surface-elevated rounded-md"></div>
      </div>
    </div>
  );
}

export function LinkCardSkeleton() {
  return (
    <div className="p-4 bg-surface border border-border-subtle rounded-xl animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-surface-elevated flex-shrink-0"></div>
          <div className="h-4 bg-surface-elevated rounded w-32"></div>
        </div>
        <div className="h-4 bg-surface-elevated rounded-full w-14"></div>
      </div>
      <div className="h-3.5 bg-surface-elevated rounded w-44"></div>
      <div className="h-3 bg-surface-elevated rounded w-3/4"></div>
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <div className="h-3 bg-surface-elevated rounded w-20"></div>
        <div className="h-6 bg-surface-elevated rounded w-16"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-5 bg-surface border border-border-subtle rounded-xl animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-surface-elevated rounded w-36"></div>
        <div className="h-4 bg-surface-elevated rounded w-20"></div>
      </div>
      <div className="h-64 bg-surface-elevated/60 rounded-lg w-full"></div>
    </div>
  );
}
