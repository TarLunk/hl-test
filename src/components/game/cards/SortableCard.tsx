import { forwardRef, memo, type CSSProperties, type HTMLAttributes } from 'react'
import clsx from 'clsx'

import { DndCard } from '@/components/game/cards/DndCard'
import { getCardColor } from '@/utils/cardColor'
import type { CardType } from '@/types/game.type'

type Props = {
  card: CardType
  className?: string
  isSelected?: boolean
  style?: CSSProperties
  onSelect?: () => void
} & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'onClick'>

const SortableCardInner = forwardRef<HTMLDivElement, Props>(
  ({ card, className, isSelected, style, onSelect, ...rest }, ref) => (
    <DndCard
      ref={ref}
      card={card}
      className={clsx(className, isSelected && 'dnd-card--selecting')}
      style={{ backgroundColor: getCardColor(card.value), ...style }}
      onClick={onSelect}
      {...rest}
    />
  )
)

SortableCardInner.displayName = 'SortableCard'

export const SortableCard = memo(SortableCardInner)
