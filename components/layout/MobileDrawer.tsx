'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAccount, useDisconnect } from 'wagmi'
import Link from 'next/link'
import Image from 'next/image'
import { X, User, FileText, Shield, Sun, Moon, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfilePicture } from '@/lib/profileUtils'
import { useState } from 'react'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Mobile Drawer Menu
 * Slides in from the right side
 * Only visible on mobile
 * 
 * Features:
 * - Smooth slide-in animation
 * - Backdrop overlay
 * - Profile section (when logged in)
 * - Navigation links
 * - Theme toggle
 * - Logout button
 */
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string>('')

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user avatar
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!address) {
        setUserAvatar('')
        return
      }

      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/profile/update?walletAddress=${address}&_t=${timestamp}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const userData = await response.json()
          setUserAvatar(userData.customAvatar || getProfilePicture(address))
        } else {
          setUserAvatar(getProfilePicture(address))
        }
      } catch (error) {
        setUserAvatar(getProfilePicture(address))
      }
    }

    loadUserAvatar()
  }, [address])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLinkClick = () => {
    onClose()
  }

  const handleLogout = () => {
    disconnect()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-background border-l border-border z-50 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menú</h2>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Section - Only shown when logged in */}
            {address && mounted && (
              <div className="p-4 border-b border-border">
                <Link href="/perfil" onClick={handleLinkClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={userAvatar || getProfilePicture(address)}
                      alt="Profile"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Mi Perfil</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              {address && (
                <>
                  <Link
                    href="/perfil"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors min-h-[44px]"
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Perfil</span>
                  </Link>

                  <div className="h-px bg-border my-2" />
                </>
              )}

              <Link
                href="/terminos"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors min-h-[44px]"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Términos</span>
              </Link>

              <Link
                href="/privacidad"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors min-h-[44px]"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Privacidad</span>
              </Link>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span className="font-medium flex-1">Tema</span>
                  <div className="flex items-center gap-1 bg-muted rounded-md p-1 relative">
                    {/* Sliding background indicator */}
                    <motion.div
                      layoutId="mobile-drawer-theme-selector"
                      className="absolute bg-background rounded shadow-sm"
                      style={{
                        width: 'calc(50% - 4px)',
                        height: 'calc(100% - 8px)',
                        top: '4px',
                      }}
                      initial={false}
                      animate={{
                        left: resolvedTheme === 'light' ? '4px' : 'calc(50%)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />

                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'p-2 rounded transition-colors duration-200 flex items-center justify-center relative z-10 min-w-[36px]',
                        resolvedTheme === 'light' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'p-2 rounded transition-colors duration-200 flex items-center justify-center relative z-10 min-w-[36px]',
                        resolvedTheme === 'dark' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button - Only shown when logged in */}
            {address && (
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left min-h-[44px] text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
