'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getProfilePicture } from '@/lib/profileUtils'
import { useUSDTBalance } from '@/hooks/use-usdt-balance'
import { useUserTransactions } from '@/hooks/use-user-transactions'
import { Card } from '@/components/ui/card'
import { Copy, Check, SquarePen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EditProfileModal from '@/components/profile/EditProfileModal'
import { WinningsChart } from '@/components/profile/WinningsChart'
import { TransactionsList } from '@/components/profile/TransactionsList'
import { PositionsList } from '@/components/profile/PositionsList'
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/animate-ui/components/radix/tabs'
import { formatUnits } from 'viem'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { formatted: usdtBalance, isLoading: isLoadingBalance } = useUSDTBalance()
  const { transactions, positions, stats, isLoading: isLoadingTransactions } = useUserTransactions(address)
  const [copied, setCopied] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState<string>('')
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    if (address) {
      loadUserProfile()
    }
  }, [address])

  const loadUserProfile = async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/profile/update?walletAddress=${address}`)
      
      if (response.ok) {
        const userData = await response.json()
        setCurrentAvatar(userData.customAvatar || getProfilePicture(address))
        setUsername(userData.username || '')
      } else {
        // User doesn't exist yet, use default avatar
        setCurrentAvatar(getProfilePicture(address))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setCurrentAvatar(getProfilePicture(address))
    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveProfile = async (data: {
    avatar?: string
    username?: string
  }) => {
    if (!address) return

    try {
      // Call API to update profile
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, ...data }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()

      // Update local state
      if (data.avatar) setCurrentAvatar(data.avatar)
      if (data.username) setUsername(data.username)

      // Reload page to update navbar
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  if (!isConnected || !address) {
    return null
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const joinedDate = 'Octubre 2025' // Placeholder - will be dynamic later
  const activeDays = 15 // Placeholder - will be calculated from join date

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Two Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mb-6">
            
            {/* Left Column - Profile Info */}
            <Card className="p-6 h-fit">
              {/* Profile Image & Username */}
              <div className="relative mb-6">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute top-0 right-0 bg-muted text-foreground p-2 rounded-lg hover:bg-electric-purple hover:text-white transition-all z-10"
                  title="Editar perfil"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-4">
                  <Image
                    src={currentAvatar}
                    alt="Profile"
                    width={72}
                    height={72}
                    className="rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{username || shortAddress}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Image
                        src="/celo.png"
                        alt="Celo"
                        width={12}
                        height={12}
                        className="flex-shrink-0"
                      />
                      <code className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{address}</code>
                      <button
                        onClick={handleCopyAddress}
                        className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                        title={copied ? 'Copied!' : 'Copy address'}
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground">Balance Actual</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold">
                      ${isLoadingBalance ? '...' : parseFloat(usdtBalance).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">USDT</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Volumen Total</label>
                  <p className="text-xl font-bold mt-1">
                    {isLoadingTransactions 
                      ? '...' 
                      : `$${(Number(formatUnits(stats.totalInvested + stats.totalWithdrawn, 6))).toFixed(2)}`
                    }
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Última Operación</label>
                  <p className="text-sm mt-1">
                    {isLoadingTransactions 
                      ? '...' 
                      : transactions.length > 0 
                        ? new Date(transactions[0].timestamp * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                        : 'Sin operaciones'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Mercados Operados</label>
                  <p className="text-xl font-bold mt-1">
                    {isLoadingTransactions ? '...' : stats.marketsTraded.size}
                  </p>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              {/* Joined Date */}
              <div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Miembro desde</span> {joinedDate} - {activeDays} días activos
                </p>
              </div>
            </Card>

            {/* Right Column - Activity */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
              
              <Tabs defaultValue="resumen" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
                  <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
                </TabsList>

                <TabsContents transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {/* Resumen Tab */}
                  <TabsContent value="resumen" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Invertido</p>
                          <p className="text-2xl font-bold mt-1">
                            {isLoadingTransactions 
                              ? '...' 
                              : `$${Number(formatUnits(stats.totalInvested, 6)).toFixed(2)}`
                            }
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Ganancia/Pérdida</p>
                          <p className={`text-2xl font-bold mt-1 ${stats.netPosition >= BigInt(0) ? 'text-green-500' : 'text-red-500'}`}>
                            {isLoadingTransactions 
                              ? '...' 
                              : `${stats.netPosition >= BigInt(0) ? '+' : ''}$${Number(formatUnits(stats.netPosition, 6)).toFixed(2)}`
                            }
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Transacciones</p>
                          <p className="text-2xl font-bold mt-1">
                            {isLoadingTransactions ? '...' : stats.transactionCount}
                          </p>
                        </div>
                      </div>
                      
                      {/* Winnings Over Time Chart */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Ganancias en el Tiempo</h3>
                        <WinningsChart 
                          transactions={transactions} 
                          tokenDecimals={6}
                          tokenSymbol="USDT"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Posiciones Tab */}
                  <TabsContent value="posiciones" className="mt-6">
                    <PositionsList
                      positions={positions}
                      tokenDecimals={6}
                      tokenSymbol="USDT"
                    />
                  </TabsContent>

                  {/* Transacciones Tab */}
                  <TabsContent value="transacciones" className="mt-6">
                    <TransactionsList 
                      transactions={transactions}
                      tokenDecimals={6}
                      tokenSymbol="USDT"
                    />
                  </TabsContent>
                </TabsContents>
              </Tabs>
            </Card>
          </div>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditingProfile}
            onClose={() => setIsEditingProfile(false)}
            currentAvatar={currentAvatar}
            currentUsername={username}
            walletAddress={address}
            onSave={handleSaveProfile}
          />
        </motion.div>
      </div>
    </div>
  )
}
