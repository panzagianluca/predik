'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/layout/GlobalSearch'

export function Navbar() {
  const { theme, resolvedTheme } = useTheme()
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

          {/* Right Side: Theme Toggle + Wallet */}
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
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
                    {...(!ready && {
                      'aria-hidden': true,
                      className: 'opacity-0 pointer-events-none select-none',
                    })}
                  >
                    {!connected ? (
                      <Button
                        size="default"
                        className="relative h-9 px-4 overflow-hidden shadow-sm transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.6),transparent)] before:opacity-35 before:animate-[shimmer_6s_linear_infinite] before:content-[''] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:before:animate-none dark:hover:bg-primary/85 dark:hover:shadow-[0_0_22px_rgba(168,85,247,0.5)]"
                        onClick={openConnectModal}
                        type="button"
                      >
                        Acceder
                      </Button>
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
