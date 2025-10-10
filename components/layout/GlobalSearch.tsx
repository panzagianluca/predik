'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/animate-ui/components/radix/dialog'
import { Input } from '@/components/ui/input'
import { Market } from '@/types/market'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [markets, setMarkets] = useState<Market[]>([])
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch markets on dialog open
  useEffect(() => {
    if (open) {
      fetchMarkets()
    }
  }, [open])

  // Filter markets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMarkets([])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = markets.filter((market) => {
      return (
        market.title.toLowerCase().includes(query) ||
        market.category?.toLowerCase().includes(query) ||
        market.outcomes.some((outcome) =>
          outcome.title.toLowerCase().includes(query)
        )
      )
    })

    setFilteredMarkets(filtered.slice(0, 10)) // Show max 10 results
  }, [searchQuery, markets])

  const fetchMarkets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/markets')
      
      if (!response.ok) {
        throw new Error('Failed to fetch markets')
      }
      
      const data = await response.json()
      setMarkets(data)
    } catch (error) {
      console.error('Error fetching markets:', error)
      setMarkets([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMarket = (market: Market) => {
    setOpen(false)
    setSearchQuery('')
    router.push(`/markets/${market.slug}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-electric-purple transition-colors duration-200">
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Buscar Mercados</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 gap-0 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2" showCloseButton={false}>
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Buscar Mercados</DialogTitle>
        
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mercados, categorías, resultados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando mercados...
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-8 text-muted-foreground">
              Escribe para buscar mercados
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron mercados
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMarkets.map((market) => (
                <button
                  key={market.id}
                  onClick={() => handleSelectMarket(market)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors duration-200 text-left group"
                >
                  {/* Market Image */}
                  {market.image_url && (
                    <img
                      src={market.image_url}
                      alt={market.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Market Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2 text-sm group-hover:text-electric-purple transition-colors duration-200">
                      {market.title}
                    </h4>
                    
                    {/* Outcomes */}
                    <div className="flex items-center gap-3 mt-1">
                      {market.outcomes.slice(0, 2).map((outcome) => (
                        <div
                          key={outcome.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          <span className="text-muted-foreground">
                            {outcome.title}:
                          </span>
                          <span
                            className="font-semibold"
                            style={{
                              color:
                                outcome.title.toLowerCase() === 'yes' ||
                                outcome.title.toLowerCase() === 'si'
                                  ? '#22c55e'
                                  : '#ef4444',
                            }}
                          >
                            {(outcome.price * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Category */}
                    {market.category && (
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          {market.category}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
