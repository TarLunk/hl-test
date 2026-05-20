import { memo, useMemo } from 'react'

import { KitDndBoard } from '@/components/game/boards/KitDndBoard'
import { KitDndCard } from '@/components/game/cards/KitDndCard'
import type { CardType } from '@/types/game.type'

type Props = {
  shuffledCards: CardType[]
  selectedIds: string[]
  isLocked: boolean
  moveCard: (fromIndex: number, toIndex: number) => void
  addSelected: (index: number) => void
}

function KitPlayfieldInner({
  shuffledCards,
  selectedIds,
  isLocked,
  moveCard,
  addSelected,
}: Props) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  return (
    <KitDndBoard moveCard={moveCard} isLocked={isLocked}>
      {shuffledCards.map((card, index) => (
        <KitDndCard
          key={card.id}
          card={card}
          index={index}
          isSelected={selectedSet.has(card.id)}
          addSelected={addSelected}
        />
      ))}
    </KitDndBoard>
  )
}

export const KitPlayfield = memo(KitPlayfieldInner)
