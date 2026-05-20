import { memo, useCallback } from 'react'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/react/sortable'

import { SortableCard } from '@/components/game/cards/SortableCard'
import type { CardType } from '@/types/game.type'

export const SORTABLE_GROUP = 'cards'

type Props = {
  card: CardType
  index: number
  className?: string
  isSelected?: boolean
  addSelected?: (index: number) => void
}

function KitDndCardInner({
  card,
  index,
  className,
  isSelected,
  addSelected,
}: Props) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: SORTABLE_GROUP,
  })

  const handleSelect = useCallback(() => {
    if (isDragging || !addSelected) return
    addSelected(index)
  }, [isDragging, addSelected, index])

  return (
    <SortableCard
      ref={ref}
      card={card}
      className={clsx(className, isDragging && 'dnd-card--dragging')}
      isSelected={isSelected}
      onSelect={handleSelect}
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

export const KitDndCard = memo(KitDndCardInner, propsAreEqual)
