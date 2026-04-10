import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClientProvider } from '@/components/ClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '창연쌤의 스쿼시 교실',
  description: '창연쌤의 스쿼시 교실 — AI가 분석하는 나만의 코치',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
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
