export { CARD_LIST_GAP } from '@/config/layout'

/** Pointer movement past this (px) suppresses the subsequent click. */
export const CLICK_DRAG_THRESHOLD = 8

export function getVisualIndex(
  index: number,
  fromIndex: number,
  overIndex: number
): number {
  if (fromIndex === overIndex) return index
  if (index === fromIndex) return overIndex

  if (fromIndex < overIndex) {
    if (index > fromIndex && index <= overIndex) return index - 1
  } else if (index >= overIndex && index < fromIndex) {
    return index + 1
  }

  return index
}

export function getCardShift(
  index: number,
  fromIndex: number,
  overIndex: number,
  itemStride: number,
  pointerDelta: number,
  isDragging: boolean
): number {
  if (isDragging) return pointerDelta

  const visual = getVisualIndex(index, fromIndex, overIndex)
  return (visual - index) * itemStride
}

export function clampY(y: number, layoutRects: DOMRect[]): number {
  if (layoutRects.length === 0) return y

  const minY = layoutRects[0].top
  const maxY = layoutRects[layoutRects.length - 1].bottom

  return Math.min(Math.max(y, minY), maxY)
}

export function getDropIndex(
  clientY: number,
  listTop: number,
  itemStride: number,
  count: number
): number {
  if (count <= 0) return 0
  if (count === 1) return 0

  const index = Math.floor((clientY - listTop) / itemStride)
  return Math.max(0, Math.min(count - 1, index))
}
