import { memo, type ReactNode } from 'react'
import clsx from 'clsx'

import './Board.scss'
import { Card } from "@/components/game/cards/Card.tsx";

type BoardVariant = 'reference' | 'playfield'

type Props = {
  children: ReactNode
  variant?: BoardVariant
  isLocked?: boolean
}

const ARIA_LABELS: Record<BoardVariant, string> = {
  reference: 'Целевая последовательность',
  playfield: 'Перемещаемый список',
}

export const Board = memo(
  ({
  children,
  variant = 'reference',
  isLocked = false,
}: Props) => {
  const isPlayfield = variant === 'playfield'

  return (
    <div
      className={clsx('board', isPlayfield && 'board--playfield')}
      aria-label={ARIA_LABELS[variant]}
    >
      <div
        className={clsx(
          'board__list',
          isPlayfield && 'board__list--playfield',
          isLocked && 'board__list--locked'
        )}
        aria-disabled={isLocked || undefined}
      >
        {children}
      </div>
    </div>
  )
})
Card.displayName = 'Board'