import { memo, useMemo } from 'react'

import { NativeDndBoard } from '@/components/game/boards/NativeDndBoard'
import { NativeDndCard } from '@/components/game/cards/NativeDndCard'
import type { CardType } from '@/types/game.type'

type Props = {
  shuffledCards: CardType[]
  selectedIds: string[]
  isLocked: boolean
  moveCard: (fromIndex: number, toIndex: number) => void
  addSelected: (index: number) => void
}

function NativePlayfieldInner({
  shuffledCards,
  selectedIds,
  isLocked,
  moveCard,
  addSelected,
}: Props) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  return (
    <NativeDndBoard
      moveCard={moveCard}
      disabled={isLocked}
      isLocked={isLocked}
    >
      {shuffledCards.map((card, index) => (
        <NativeDndCard
          key={card.id}
          card={card}
          index={index}
          isSelected={selectedSet.has(card.id)}
          addSelected={addSelected}
        />
      ))}
    </NativeDndBoard>
  )
}

export const NativePlayfield = memo(NativePlayfieldInner)
