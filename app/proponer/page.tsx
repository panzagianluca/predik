'use client'

import { useState, useEffect } from 'react'
import { ProposalCard } from '@/components/proponer/ProposalCard'
import { SubmitProposalModal } from '@/components/proponer/SubmitProposalModal'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LogoSpinner } from '@/components/ui/logo-spinner'
import { Trophy, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'

type SortFilter = 'most-voted' | 'recent'
type CategoryFilter = 'all' | 'Deportes' | 'Economía' | 'Política' | 'Crypto' | 'Cultura'

interface Proposal {
  id: string
  title: string
  category: string
  endDate: string
  source: string | null
  outcomes: string
  createdBy: string
  upvotes: number
  createdAt: string
}

export default function ProponerPage() {
  const { address } = useAccount()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortFilter, setSortFilter] = useState<SortFilter>('most-voted')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [topContributors, setTopContributors] = useState<Array<{ address: string; count: number }>>([])

  useEffect(() => {
    fetchProposals()
    if (address) {
      fetchUserVotes()
    }
  }, [sortFilter, categoryFilter, address])

  const fetchProposals = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        sort: sortFilter,
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      })
      
      const response = await fetch(`/api/proposals?${params}`)
      if (!response.ok) throw new Error('Failed to fetch proposals')
      
      const data = await response.json()
      setProposals(data)
      
      // Calculate top contributors
      const contributorMap = new Map<string, number>()
      data.forEach((p: Proposal) => {
        contributorMap.set(p.createdBy, (contributorMap.get(p.createdBy) || 0) + 1)
      })
      
      const sorted = Array.from(contributorMap.entries())
        .map(([address, count]) => ({ address, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      setTopContributors(sorted)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    if (!address) return
    
    try {
      // Fetch all proposal IDs that the user has voted on
      const response = await fetch(`/api/proposals/user-votes?voterAddress=${address}`)
      if (response.ok) {
        const votedProposalIds = await response.json()
        setUserVotes(new Set(votedProposalIds))
      }
    } catch (error) {
      console.error('Error fetching user votes:', error)
    }
  }

  const handleVote = async (proposalId: string) => {
    // Just refresh proposals to keep counts in sync
    // The ProposalCard component handles the actual voting
    await fetchProposals()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const sortFilters: Array<{
    id: SortFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { id: 'most-voted', label: 'Más Votados', icon: TrendingUp },
    { id: 'recent', label: 'Recientes', icon: Clock },
  ]

  const categoryFilters: Array<{
    id: CategoryFilter
    label: string
  }> = [
    { id: 'all', label: 'Todos' },
    { id: 'Deportes', label: 'Deportes' },
    { id: 'Economía', label: 'Economía' },
    { id: 'Política', label: 'Política' },
    { id: 'Crypto', label: 'Crypto' },
    { id: 'Cultura', label: 'Cultura' },
  ]

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-8">
          <h1 className="text-[24px] font-medium">Proponer Mercados</h1>
        </div>

        {/* Filter Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg py-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Filters - Outlined buttons with icons */}
            {sortFilters.map((filter) => {
              const Icon = filter.icon
              const isActive = sortFilter === filter.id
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => setSortFilter(filter.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 h-[36px] rounded-md border-2 transition-all duration-200 text-[14px] relative overflow-hidden',
                    isActive
                      ? 'bg-electric-purple text-white border-electric-purple font-semibold'
                      : 'bg-background border-border hover:border-electric-purple/50 text-foreground font-medium'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSortFilter"
                      className="absolute inset-0 bg-electric-purple rounded-md -z-10"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              )
            })}

            {/* Divider */}
            <div className="h-8 w-px bg-border mx-2" />

            {/* Category Filters - Ghost buttons */}
            {categoryFilters.map((filter) => {
              const isActive = categoryFilter === filter.id
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => setCategoryFilter(filter.id)}
                  className={cn(
                    'px-4 h-[36px] rounded-md transition-all duration-200 font-medium text-[14px] relative overflow-hidden',
                    isActive
                      ? 'text-electric-purple bg-electric-purple/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryFilter"
                      className="absolute inset-0 bg-electric-purple/5 rounded-md"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Main Layout: Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Proposals Grid */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LogoSpinner size={60} />
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No hay propuestas aún. ¡Sé el primero en proponer un mercado!
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${sortFilter}-${categoryFilter}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid grid-cols-1 gap-4"
                >
                  {proposals.map((proposal, index) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                    >
                      <ProposalCard
                        proposal={proposal}
                        userAddress={address}
                        userVoted={userVotes.has(proposal.id)}
                        onVote={handleVote}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Submit Button Card */}
            <Card>
              <CardContent className="p-4">
                <SubmitProposalModal
                  userAddress={address}
                  onProposalCreated={fetchProposals}
                />
              </CardContent>
            </Card>

            {/* Top Contributors */}
            {topContributors.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-electric-purple" />
                    <h3 className="text-[16px] font-medium">Top Contributors</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topContributors.map((contributor, index) => (
                      <div key={contributor.address} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground min-w-[1.5ch]">
                            {index + 1}.
                          </span>
                          <a
                            href={`https://celo-sepolia.blockscout.com/address/${contributor.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono hover:text-electric-purple transition-colors"
                          >
                            {truncateAddress(contributor.address)}
                          </a>
                        </div>
                        <span className="text-sm font-semibold">{contributor.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
