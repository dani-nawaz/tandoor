import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale System'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
            <head>
        <Script strategy="beforeInteractive" id="prevent-arp">
          {`document.documentElement.removeAttribute('data-arp')`}
        </Script>
      </head>
      <body suppressHydrationWarning={true} className="min-h-screen bg-gray-100">
        <main className="container mx-auto flex items-center justify-center py-12">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}