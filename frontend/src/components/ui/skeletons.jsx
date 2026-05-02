import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function SkeletonRows({ rows = 5, height = 'h-16' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${height}`} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

export function MetricsGridSkeleton({ cols = 4 }) {
  return (
    <div className={`grid gap-4 grid-cols-2 md:grid-cols-${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 'h-72' }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full rounded-lg ${height}`} />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ rows = 6, cols = 7 }) {
  return (
    <div className="space-y-2">
      {/* header */}
      <div className="flex gap-4 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border/50">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ResultsPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      {/* metrics */}
      <MetricsGridSkeleton cols={4} />
      {/* chart tabs */}
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-80" />
        </CardHeader>
        <CardContent>
          <ChartSkeleton height="h-80" />
        </CardContent>
      </Card>
    </div>
  )
}

export function HistoryPageSkeleton() {
  return (
    <div className="space-y-4">
      <MetricsGridSkeleton cols={4} />
      <Card>
        <CardContent className="pt-6">
          <TableSkeleton rows={7} cols={7} />
        </CardContent>
      </Card>
    </div>
  )
}

export function ConfigPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
