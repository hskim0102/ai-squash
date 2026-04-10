import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClientProvider } from '@/components/ClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SquashVibe AI',
  description: '당신의 랠리를 데이터로 증명하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-background`}>
        <ClientProvider>
          <Sidebar />
          <main className="md:ml-56 min-h-screen pt-14 md:pt-0 p-4 md:p-8">
            {children}
          </main>
        </ClientProvider>
      </body>
    </html>
  )
}
