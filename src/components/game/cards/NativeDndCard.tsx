import { memo, useCallback, useLayoutEffect, useRef } from 'react'

import { SortableCard } from '@/components/game/cards/SortableCard'
import { useNativeDndActions } from '@/context/NativeDndContext'
import type { CardType } from '@/types/game.type'

type Props = {
  card: CardType
  index: number
  className?: string
  isSelected?: boolean
  addSelected?: (index: number) => void
}

function NativeDndCardInner({
  card,
  index,
  className,
  isSelected,
  addSelected,
}: Props) {
  const { startDrag, registerCard, consumeSuppressClick } = useNativeDndActions()
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    registerCard(index, cardRef.current)
    return () => registerCard(index, null)
  }, [index, registerCard])

  const handleSelect = useCallback(() => {
    if (consumeSuppressClick() || !addSelected) return
    addSelected(index)
  }, [consumeSuppressClick, addSelected, index])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      startDrag(index, e)
    },
    [startDrag, index]
  )

  return (
    <SortableCard
      ref={cardRef}
      card={card}
      className={className}
      isSelected={isSelected}
      onSelect={handleSelect}
      onPointerDown={handlePointerDown}
    />
  )
}

function propsAreEqual(prev: Props, next: Props) {
  return (
    prev.card.id === next.card.id &&
    prev.index === next.index &&
    prev.isSelected === next.isSelected &&
    prev.addSelected === next.addSelected &&
    prev.className === next.className
  )
}

export const NativeDndCard = memo(NativeDndCardInner, propsAreEqual)
