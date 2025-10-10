'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/animate-ui/components/radix/dropdown-menu'
import { Menu, Activity, Trophy, Mail, FileText, Shield, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export function Navbar() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to show
  const logoSrc = mounted && (resolvedTheme === 'dark' || theme === 'dark')
    ? '/prediksvgwhite.svg'
    : '/svglogoblack.svg'

  return (
    <nav className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {mounted && (
              <Image 
                src={logoSrc} 
                alt="Predik" 
                width={80} 
                height={20}
                className="h-5 w-auto transition-opacity duration-300"
                priority
              />
            )}
          </Link>

          {/* Global Search */}
          <div className="ml-6 lg:ml-8 flex-1 max-w-xl">
            <GlobalSearch />
          </div>

          {/* Right Side: Wallet + Menu */}
          <div className="flex items-center gap-3 ml-auto">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                mounted,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus || authenticationStatus === 'authenticated')

                return (
                  <div
                    className="flex items-center gap-3"
                    {...(!ready && {
                      'aria-hidden': true,
                      className: 'opacity-0 pointer-events-none select-none',
                    })}
                  >
                    {!connected ? (
                      <>
                        <Button
                          size="default"
                          className="relative h-9 px-4 overflow-hidden shadow-sm transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.6),transparent)] before:opacity-35 before:animate-[shimmer_6s_linear_infinite] before:content-[''] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:before:animate-none dark:hover:bg-primary/85 dark:hover:shadow-[0_0_22px_rgba(168,85,247,0.5)]"
                          onClick={openConnectModal}
                          type="button"
                        >
                          Acceder
                        </Button>
                        
                        {/* Hamburger Menu - Only visible when NOT connected */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="default"
                              variant="outline"
                              className="h-9 w-9 p-0"
                            >
                              <Menu className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="w-auto min-w-[160px]"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <DropdownMenuItem className="justify-start group">
                              <Activity className="mr-2 h-4 w-4 group-hover:text-white" />
                              <span className="group-hover:text-white">Actividad</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-start group">
                              <Trophy className="mr-2 h-4 w-4 group-hover:text-white" />
                              <span className="group-hover:text-white">Ranking</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="justify-start group">
                              <Mail className="mr-2 h-4 w-4 group-hover:text-white" />
                              <span className="group-hover:text-white">Contacto</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-start group">
                              <FileText className="mr-2 h-4 w-4 group-hover:text-white" />
                              <span className="group-hover:text-white">Términos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-start group">
                              <Shield className="mr-2 h-4 w-4 group-hover:text-white" />
                              <span className="group-hover:text-white">Privacidad</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Theme Selector */}
                            <div className="px-2 py-2">
                              <div className="flex items-center gap-1 bg-muted rounded-md p-1 w-full relative">
                                <button
                                  onClick={() => setTheme('light')}
                                  className={`p-1.5 rounded transition-all duration-200 flex-1 flex items-center justify-center ${
                                    resolvedTheme === 'light' 
                                      ? 'bg-background text-foreground shadow-sm' 
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <Sun className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setTheme('dark')}
                                  className={`p-1.5 rounded transition-all duration-200 flex-1 flex items-center justify-center ${
                                    resolvedTheme === 'dark' 
                                      ? 'bg-background text-foreground shadow-sm' 
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <Moon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : chain.unsupported ? (
                      <Button
                        size="default"
                        variant="destructive"
                        className="h-9 px-4"
                        onClick={openChainModal}
                        type="button"
                      >
                        Wrong network
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        variant="outline"
                        className="h-9 px-4"
                        onClick={openAccountModal}
                        type="button"
                      >
                        {account.displayName}
                      </Button>
                    )}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </nav>
  )
}
