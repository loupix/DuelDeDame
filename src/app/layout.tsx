import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Duel de Dame',
  description: 'Un jeu de dames moderne en Next.js',
  icons: [
    { rel: 'icon', url: '/icon.svg' },
    { rel: 'apple-touch-icon', url: '/icon.svg' }
  ],
  manifest: '/manifest.webmanifest'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <main className="min-h-screen bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  )
} 