'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { config } from '@/lib/wagmi'
import { ReactNode, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Custom RainbowKit theme matching your electric-purple brand
  const customDarkTheme = darkTheme({
    accentColor: '#A855F7', // electric-purple
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  })

  const customLightTheme = lightTheme({
    accentColor: '#A855F7', // electric-purple
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={mounted && resolvedTheme === 'dark' ? customDarkTheme : customLightTheme}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: 'Predik',
            disclaimer: undefined,
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
