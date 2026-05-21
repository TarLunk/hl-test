import { memo, type ReactNode } from 'react'

import { Board } from '@/components/game/boards/Board'
import {
  NativeDndProvider,
  useNativeDndActions,
} from '@/context/NativeDndContext'

import './NativeDndBoard.scss'

type Props = {
  children: ReactNode
  moveCard: (fromIndex: number, toIndex: number) => void
  disabled?: boolean
  isLocked?: boolean
}

function NativeDndBoardInner({
  children,
  isLocked,
}: {
  children: ReactNode
  isLocked: boolean
}) {
  const { containerRef } = useNativeDndActions()

  return (
    <div ref={containerRef}>
      <Board variant="playfield" isLocked={isLocked}>
        {children}
      </Board>
    </div>
  )
}

export const MemoNativeDndBoardInner = memo(NativeDndBoardInner)

export function NativeDndBoard({
  children,
  moveCard,
  disabled = false,
  isLocked = false,
}: Props) {
  return (
    <NativeDndProvider moveCard={moveCard} disabled={disabled}>
      <MemoNativeDndBoardInner isLocked={isLocked}>
        {children}
      </MemoNativeDndBoardInner>
    </NativeDndProvider>
  )
}
