/**
 * Skeleton loader for Market Detail Page
 * Matches the exact layout of the actual market page
 */

export function MarketDetailSkeleton() {
  return (
    <div className="pb-12 animate-pulse">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Skeleton */}
        <div className="w-full h-48 rounded-xl bg-muted my-6 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_318px] gap-6 pt-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Title and Badges Section */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {/* Market Image Skeleton */}
                <div className="relative w-16 h-16 rounded-xl bg-muted flex-shrink-0" />
                
                <div className="flex-1 space-y-3">
                  {/* Title Skeleton */}
                  <div className="h-7 bg-muted rounded w-3/4" />
                  
                  {/* Badges Skeleton */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-7 w-20 bg-muted rounded-full" />
                    <div className="h-7 w-24 bg-muted rounded-full" />
                    <div className="h-7 w-16 bg-muted rounded-full" />
                  </div>
                </div>
              </div>

              {/* Metadata Bar Skeleton */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-5 w-28 bg-muted rounded" />
                  <div className="h-5 w-36 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-12 bg-muted rounded" />
                  <div className="h-7 w-12 bg-muted rounded" />
                  <div className="h-7 w-12 bg-muted rounded" />
                  <div className="h-7 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
            
            {/* Chart Skeleton */}
            <div className="h-[400px] bg-muted rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Description Section Skeleton */}
            <div className="border-t border-b border-border py-6 space-y-4">
              <div className="h-5 w-24 bg-muted rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2 border-b">
                <div className="h-10 w-32 bg-muted rounded-t" />
                <div className="h-10 w-24 bg-muted/50 rounded-t" />
                <div className="h-10 w-28 bg-muted/50 rounded-t" />
              </div>
              <div className="space-y-3">
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Trading Panel Skeleton */}
            <div className="bg-card border rounded-xl p-4 space-y-4">
              <div className="h-6 w-32 bg-muted rounded" />
              
              {/* Outcomes */}
              <div className="space-y-3">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
              
              {/* Input */}
              <div className="h-12 bg-muted rounded" />
              
              {/* Button */}
              <div className="h-12 bg-muted rounded" />
            </div>

            {/* Stats Skeleton */}
            <div className="bg-card border rounded-xl p-4 space-y-4">
              <div className="h-5 w-28 bg-muted rounded" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
