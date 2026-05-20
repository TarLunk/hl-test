import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

import type { GameStatusType } from '@/types/game.type'

type GameStatusContextValue = {
  status: GameStatusType
  setStatus: (status: GameStatusType) => void
}

const GameStatusContext = createContext<GameStatusContextValue | null>(null)

export function GameStatusProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [status, setStatus] = useState<GameStatusType>('init')

  useEffect(() => {
    setStatus('init')
  }, [pathname])

  const value = useMemo(() => ({ status, setStatus }), [status])

  return (
    <GameStatusContext.Provider value={value}>
      {children}
    </GameStatusContext.Provider>
  )
}

export function useGameStatus() {
  const context = useContext(GameStatusContext)

  if (!context) {
    throw new Error('useGameStatus must be used within GameStatusProvider')
  }

  return context
}


