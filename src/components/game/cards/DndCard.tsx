import { forwardRef, type HTMLAttributes } from 'react'
import clsx from 'clsx'

import './DndCard.scss'
import type { CardType } from '@/types/game.type'

type Props = {
  card: CardType
  className?: string
} & HTMLAttributes<HTMLDivElement>

export const DndCard = forwardRef<HTMLDivElement, Props>(
  ({ card, className, ...props }, ref) => (
    <div ref={ref} className={clsx('dnd-card', className)} {...props}>
      <p>{card.value}</p>
    </div>
  )
)

DndCard.displayName = 'DndCard'
