// Shimmer skeleton loading components for dashboard and link states

export function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-800 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-800 rounded w-32"></div>
    </div>
  );
}

export function LinkCardSkeleton() {
  return (
    <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl animate-pulse flex flex-col md:flex-row gap-5 items-start">
      <div className="w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-800 rounded w-48"></div>
          <div className="h-4 bg-gray-800 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2 self-start md:self-center">
        <div className="w-9 h-9 bg-gray-800 rounded"></div>
        <div className="w-9 h-9 bg-gray-800 rounded"></div>
        <div className="w-9 h-9 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl animate-pulse space-y-4">
      <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
      <div className="h-64 bg-gray-800/60 rounded-lg w-full"></div>
    </div>
  );
}
