'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getProfilePicture, getAllProfilePictures } from '@/lib/profileUtils'
import { useUSDTBalance } from '@/hooks/use-usdt-balance'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Check, SquarePen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { formatted: usdtBalance, isLoading: isLoadingBalance } = useUSDTBalance()
  const [copied, setCopied] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [currentAvatar, setCurrentAvatar] = useState<string>('')

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    if (address) {
      const avatar = getProfilePicture(address)
      setCurrentAvatar(avatar)
      setSelectedAvatar(avatar)
    }
  }, [address])

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveAvatar = () => {
    if (address && selectedAvatar) {
      const profiles = JSON.parse(localStorage.getItem('predik_user_profiles') || '{}')
      profiles[address.toLowerCase()] = selectedAvatar
      localStorage.setItem('predik_user_profiles', JSON.stringify(profiles))
      setCurrentAvatar(selectedAvatar)
      setIsEditingAvatar(false)
      // Force page reload to update navbar avatar
      window.location.reload()
    }
  }

  if (!isConnected || !address) {
    return null
  }

  const allAvatars = getAllProfilePictures()
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const joinedDate = 'Octubre 2025' // Placeholder - will be dynamic later
  const activeDays = 15 // Placeholder - will be calculated from join date

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4">
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
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  className="absolute top-0 right-0 bg-muted text-foreground p-2 rounded-lg hover:bg-electric-purple hover:text-white transition-all z-10"
                  title="Change avatar"
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
                    <h2 className="font-bold text-lg">{shortAddress}</h2>
                    <div className="flex items-center gap-2 mt-1">
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

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground">Twitter</label>
                  <p className="text-sm text-muted-foreground">No conectado</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm text-muted-foreground">No provisto</p>
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
                  <p className="text-xl font-bold mt-1">$0.00</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Última Operación</label>
                  <p className="text-sm mt-1">Sin operaciones</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Mercados Operados</label>
                  <p className="text-xl font-bold mt-1">0</p>
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
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay actividad todavía</p>
                <p className="text-sm mt-2">Tus predicciones aparecerán acá</p>
              </div>
            </Card>
          </div>

          {/* Avatar Selector - Full Width Below Grid */}
          <AnimatePresence>
            {isEditingAvatar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Elegí tu avatar</h2>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-4 mb-6">
                    {allAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`relative rounded-xl overflow-hidden transition-all hover:scale-110 ${
                          selectedAvatar === avatar
                            ? 'ring-4 ring-electric-purple scale-110'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={avatar}
                          alt="Avatar option"
                          width={80}
                          height={80}
                          className="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveAvatar}
                      className="bg-electric-purple hover:bg-electric-purple/90"
                    >
                      Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingAvatar(false)
                        setSelectedAvatar(currentAvatar)
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
