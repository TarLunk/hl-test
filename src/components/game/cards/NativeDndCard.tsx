import { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'

import { SortableCard } from '@/components/game/cards/SortableCard'
import {
  useNativeDndActions,
  useNativeDndVisual,
} from '@/context/NativeDndContext'
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
  const { dragSession, overIndex, getShift } = useNativeDndVisual()
  const cardRef = useRef<HTMLDivElement>(null)

  const isDragging =
    dragSession !== null && dragSession.fromIndex === index
  const isSortableActive = dragSession !== null

  const shiftY = useMemo(() => {
    if (!dragSession || overIndex === null || isDragging) return 0
    return getShift(index, false)
  }, [dragSession, overIndex, isDragging, getShift, index])

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

  const style = useMemo(
    () =>
      shiftY !== 0
        ? { transform: `translateY(${shiftY}px)` }
        : undefined,
    [shiftY]
  )

  return (
    <SortableCard
      ref={cardRef}
      card={card}
      className={clsx(
        className,
        isDragging && 'dnd-card--dragging',
        isSortableActive && !isDragging && 'dnd-card--shifted'
      )}
      isSelected={isSelected}
      onSelect={handleSelect}
      style={style}
      aria-grabbed={isDragging}
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
