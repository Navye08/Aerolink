// Shimmer skeleton loading components for dashboard, table rows, and analytics states

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
    <div className="px-4 py-3 bg-surface border border-border-subtle rounded-xl animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-elevated flex-shrink-0"></div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-surface-elevated rounded w-36"></div>
            <div className="h-3.5 bg-surface-elevated rounded-full w-14"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 bg-surface-elevated rounded w-28"></div>
            <div className="h-3 bg-surface-elevated rounded w-44"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="h-5 bg-surface-elevated rounded-full w-14"></div>
        <div className="h-3.5 bg-surface-elevated rounded w-16"></div>
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
