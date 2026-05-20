import { memo } from 'react'

import { Board } from '@/components/game/boards/Board'
import { Card } from '@/components/game/cards/Card'
import type { CardType } from '@/types/game.type'

type Props = {
  orderedCards: CardType[]
}

function ReferenceBoardInner({ orderedCards }: Props) {
  return (
    <Board variant="reference">
      {orderedCards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </Board>
  )
}

export const ReferenceBoard = memo(ReferenceBoardInner)
