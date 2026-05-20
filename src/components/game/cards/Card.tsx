import { memo } from 'react'
import clsx from 'clsx'

import './Card.scss'
import type { CardType } from '@/types/game.type'

type Props = {
  card: CardType
  className?: string
}

export const Card = memo(
  ({ card, className }: Props) => {
    return (
      <div className={clsx('card', className)}>
        <p>{card.value}</p>
      </div>
    )
  }
)

Card.displayName = 'Card'