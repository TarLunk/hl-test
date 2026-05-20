import type { ReactNode } from 'react'

import { GameBackground } from '@/components/game/layout/GameBackground'
import { AppNav } from '@/components/ui/app-nav/AppNav'
import { Header } from '@/components/ui/header/Header'
import { GameStatusProvider } from '@/context/GameStatusContext'
import './Layout.scss'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <GameStatusProvider>
      <div className="layout">
        <GameBackground />
        <Header />
        <AppNav />
        <main className="layout__main">
          <div className="layout__background">
            <h1 className="game-page__title">Упорядочивание цифр</h1>
            {children}
          </div>
        </main>
      </div>
    </GameStatusProvider>
  )
}
