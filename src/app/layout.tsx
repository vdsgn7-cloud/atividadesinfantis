import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gerador de Atividades — Colégio Cristo Rei',
  description: 'Gere atividades infantis ilustradas para imprimir',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
