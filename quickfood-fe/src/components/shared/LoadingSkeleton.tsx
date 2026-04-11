'use client'

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export default function LoadingSkeleton({
  rows = 3,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Đang tải...">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-qf-border"
          style={{
            height: '3.5rem',
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

/** Card-shaped skeleton với thumbnail */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse qf-card p-3 space-y-3">
          <div className="rounded-lg bg-qf-border" style={{ height: '8rem' }} />
          <div className="h-4 bg-qf-border rounded" style={{ width: '75%' }} />
          <div className="h-3 bg-qf-border rounded" style={{ width: '50%' }} />
        </div>
      ))}
    </div>
  )
}
