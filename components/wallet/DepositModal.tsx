'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/animate-ui/components/radix/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/animate-ui/components/radix/tabs'
import { Button } from '@/components/ui/button'
import { Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { LiFiWidget } from '@lifi/widget'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
}

export function DepositModal({ isOpen, onClose, walletAddress }: DepositModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Li.Fi Widget Configuration
  const lifiConfig = {
    integrator: 'Predik',
    theme: {
      container: {
        boxShadow: 'none',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden"
        from="top"
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <DialogTitle className="sr-only">Depositar USDT</DialogTitle>
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Depositar USDT</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Agregá fondos para comenzar a predecir
          </p>
        </div>

        {/* Tabs Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Tabs defaultValue="cex" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cex">Desde CEX</TabsTrigger>
              <TabsTrigger value="bridge">Bridge</TabsTrigger>
            </TabsList>

            {/* Tab 1: CEX (LemonCash + Exchanges) */}
            <TabsContent value="cex" className="space-y-4 mt-4">
              {/* LemonCash Section */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">🇦🇷</div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      🍋 LemonCash
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Recomendado ARG
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      La forma más fácil desde Argentina
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 py-4 bg-white dark:bg-muted rounded-lg mb-4">
                  <QRCodeSVG
                    value={walletAddress}
                    size={160}
                    level="M"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  <p className="text-xs text-center text-muted-foreground px-4">
                    Escaneá con LemonCash para enviar USDT a Celo
                  </p>
                </div>

                {/* Full Wallet Address */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted border rounded-md text-xs font-mono break-all">
                      {walletAddress}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-auto shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">Pasos:</p>
                  <ol className="text-sm text-muted-foreground space-y-1.5 ml-4">
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">1.</span>
                      <span>Abrí LemonCash y comprá USDT</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">2.</span>
                      <span>Tocá &quot;Enviar&quot; y escaneá el QR de arriba</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">3.</span>
                      <span>Seleccioná red <strong>Celo</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">4.</span>
                      <span>Confirmá el envío</span>
                    </li>
                  </ol>
                </div>

                <a
                  href="https://www.lemon.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full" variant="default">
                    Abrir LemonCash
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* Other Exchanges */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  🌎 Otros Exchanges
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Si ya tenés USDT en un exchange, podés retirarlo a Celo:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                    <span>Binance (retiro a Celo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                    <span>OKX (retiro a Celo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                    <span>Bitget (retiro a Celo)</span>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      <strong>Importante:</strong> Asegurate de seleccionar la red <strong>Celo</strong> al retirar.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Bridge (Li.Fi Widget) */}
            <TabsContent value="bridge" className="space-y-4 mt-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  🔄 Transferir desde otra red
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si ya tenés USDT en otra blockchain (Ethereum, Polygon, etc.), podés hacer bridge a Celo:
                </p>

                {/* Li.Fi Widget */}
                <div className="rounded-lg overflow-hidden">
                  <LiFiWidget
                    integrator="Predik"
                    config={lifiConfig}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
