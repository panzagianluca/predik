'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <Button onClick={() => disconnect()} variant="outline">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => {
        const isInjected = connector.id === 'injected'
        const isWalletConnect = connector.id === 'walletConnect'
        
        return (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            className={isInjected ? "bg-electric-purple hover:bg-electric-purple/90" : ""}
            variant={isWalletConnect ? "outline" : "default"}
            title={isInjected ? "Connect with browser extension (MetaMask, Coinbase Wallet, etc.)" : "Connect with mobile wallet via QR code"}
          >
            {isInjected && "🦊 MetaMask"}
            {isWalletConnect && "📱 Mobile Wallet"}
            {!isInjected && !isWalletConnect && `Connect ${connector.name}`}
          </Button>
        )
      })}
    </div>
  )
}
