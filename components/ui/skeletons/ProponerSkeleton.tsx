/**
 * Skeleton loader for Proponer Page
 * Matches the exact layout of the proposals page
 */

export function ProponerSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-2">
      {/* Left Column: Submit Button + Top Contributors */}
  <div className="space-y-4">
        {/* Submit Button Skeleton */}
        <div className="w-full h-9 my-3 bg-electric-purple/20 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Top Contributors Skeleton - Desktop Only */}
        <div className="hidden lg:block bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-5 w-40 bg-muted rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-6 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Filter Buttons + Proposals Grid */}
      <div>
        {/* Filter Buttons Skeleton */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg py-3 mb-4">
          <div className="h-[36px] min-w-[140px] bg-electric-purple/10 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="h-[36px] min-w-[120px] bg-muted rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="lg:hidden ml-auto h-[36px] min-w-[140px] bg-muted rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* Proposals Grid Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="bg-card border border-border rounded-xl p-4 relative overflow-hidden"
              style={{
                animationDelay: `${i * 100}ms`
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                    <div className="h-5 w-24 bg-muted rounded" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2 mb-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-9 w-24 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
