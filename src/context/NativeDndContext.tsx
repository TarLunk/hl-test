import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  CARD_LIST_GAP,
  CLICK_DRAG_THRESHOLD,
  clampY,
  getCardShift,
  getDropIndex,
} from '@/utils/nativeSortable'

export type DragSession = {
  fromIndex: number
  pointerId: number
  startY: number
  itemStride: number
  layoutRects: DOMRect[]
} | null

type NativeDndContextValue = {
  containerRef: RefObject<HTMLDivElement | null>
  startDrag: (index: number, e: React.PointerEvent<HTMLDivElement>) => void
  registerCard: (index: number, el: HTMLDivElement | null) => void
  consumeSuppressClick: () => boolean
}

const NativeDndContext = createContext<NativeDndContextValue | null>(null)

export function useNativeDndActions() {
  const ctx = useContext(NativeDndContext)
  if (!ctx) {
    throw new Error('useNativeDndActions must be used within NativeDndProvider')
  }
  return ctx
}

/** @deprecated Use useNativeDndActions */
export function useNativeDndVisual() {
  return useNativeDndActions()
}

/** @deprecated Use useNativeDndActions */
export function useNativeDnd() {
  return useNativeDndActions()
}

type ProviderProps = {
  children: ReactNode
  moveCard: (fromIndex: number, toIndex: number) => void
  disabled?: boolean
}

export function NativeDndProvider({
  children,
  moveCard,
  disabled = false,
}: ProviderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const draggingElRef = useRef<HTMLDivElement | null>(null)
  const dragSessionRef = useRef<DragSession>(null)
  const overIndexRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const pointerListenersRef = useRef<{
    move: (e: PointerEvent) => void
    end: (e: PointerEvent) => void
  } | null>(null)

  const consumeSuppressClick = useCallback(() => {
    const suppress = suppressClickRef.current
    suppressClickRef.current = false
    return suppress
  }, [])

  const registerCard = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardsRef.current.set(index, el)
    } else {
      cardsRef.current.delete(index)
    }
  }, [])

  const snapshotLayoutRects = useCallback(() => {
    const indices = [...cardsRef.current.keys()].sort((a, b) => a - b)
    return indices.map((i) => cardsRef.current.get(i)!.getBoundingClientRect())
  }, [])

  const applyDragTransform = useCallback((delta: number) => {
    const el = draggingElRef.current
    if (!el) return
    el.style.transform = `translateY(${delta}px)`
    el.style.transition = 'none'
  }, [])

  const applyCardShifts = useCallback(
    (session: NonNullable<DragSession>, overIndex: number) => {
      const { fromIndex, itemStride } = session
      cardsRef.current.forEach((el, index) => {
        if (index === fromIndex) return
        const shift = getCardShift(
          index,
          fromIndex,
          overIndex,
          itemStride,
          0,
          false
        )
        el.style.transform = shift !== 0 ? `translateY(${shift}px)` : ''
        el.classList.toggle('dnd-card--shifted', shift !== 0)
      })
    },
    []
  )

  const clearDragVisuals = useCallback(() => {
    const draggingEl = draggingElRef.current
    if (draggingEl) {
      draggingEl.style.transform = ''
      draggingEl.style.transition = ''
      draggingEl.classList.remove('dnd-card--dragging')
      draggingEl.removeAttribute('aria-grabbed')
    }
    draggingElRef.current = null

    cardsRef.current.forEach((el) => {
      el.style.transform = ''
      el.style.transition = ''
      el.classList.remove('dnd-card--shifted')
    })

    containerRef.current?.classList.remove('native-dnd-board--dragging')
    dragSessionRef.current = null
    overIndexRef.current = null
  }, [])

  const removePointerListeners = useCallback(() => {
    const listeners = pointerListenersRef.current
    if (!listeners) return
    window.removeEventListener('pointermove', listeners.move)
    window.removeEventListener('pointerup', listeners.end)
    window.removeEventListener('pointercancel', listeners.end)
    pointerListenersRef.current = null
  }, [])

  const updateOverIndex = useCallback(
    (session: NonNullable<DragSession>, y: number) => {
      const next = getDropIndex(
        y,
        session.layoutRects[0].top,
        session.itemStride,
        session.layoutRects.length
      )
      if (next !== overIndexRef.current) {
        overIndexRef.current = next
        applyCardShifts(session, next)
      }
    },
    [applyCardShifts]
  )

  const finishDrag = useCallback(
    (session: NonNullable<DragSession>, toIndex: number) => {
      if (session.fromIndex !== toIndex) {
        moveCard(session.fromIndex, toIndex)
      }

      const el = cardsRef.current.get(session.fromIndex)
      if (el?.hasPointerCapture(session.pointerId)) {
        el.releasePointerCapture(session.pointerId)
      }
    },
    [moveCard]
  )

  const startDrag = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || e.button !== 0) return

      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      const layoutRects = snapshotLayoutRects()
      const itemStride =
        layoutRects.length > 1
          ? layoutRects[1].top - layoutRects[0].top
          : rect.height + CARD_LIST_GAP

      target.setPointerCapture(e.pointerId)
      suppressClickRef.current = false
      draggingElRef.current = target

      const startY = e.clientY

      const session: NonNullable<DragSession> = {
        fromIndex: index,
        pointerId: e.pointerId,
        startY,
        itemStride,
        layoutRects,
      }

      dragSessionRef.current = session
      containerRef.current?.classList.add('native-dnd-board--dragging')
      target.classList.add('dnd-card--dragging')
      target.setAttribute('aria-grabbed', 'true')

      const initialOver = getDropIndex(
        startY,
        layoutRects[0].top,
        itemStride,
        layoutRects.length
      )
      overIndexRef.current = initialOver
      applyCardShifts(session, initialOver)
      applyDragTransform(0)

      const onPointerMove = (ev: PointerEvent) => {
        const active = dragSessionRef.current
        if (!active || ev.pointerId !== active.pointerId) return

        const currentY = clampY(ev.clientY, active.layoutRects)

        if (Math.abs(currentY - active.startY) > CLICK_DRAG_THRESHOLD) {
          suppressClickRef.current = true
        }

        applyDragTransform(currentY - active.startY)
        updateOverIndex(active, currentY)
      }

      const onPointerEnd = (ev: PointerEvent) => {
        const active = dragSessionRef.current
        if (!active || ev.pointerId !== active.pointerId) return

        const currentY = clampY(ev.clientY, active.layoutRects)
        const toIndex = getDropIndex(
          currentY,
          active.layoutRects[0].top,
          active.itemStride,
          active.layoutRects.length
        )

        removePointerListeners()
        clearDragVisuals()
        finishDrag(active, toIndex)
      }

      removePointerListeners()
      pointerListenersRef.current = { move: onPointerMove, end: onPointerEnd }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerEnd)
      window.addEventListener('pointercancel', onPointerEnd)

      e.preventDefault()
    },
    [
      disabled,
      snapshotLayoutRects,
      applyDragTransform,
      applyCardShifts,
      updateOverIndex,
      removePointerListeners,
      clearDragVisuals,
      finishDrag,
    ]
  )

  useEffect(
    () => () => {
      removePointerListeners()
      clearDragVisuals()
    },
    [removePointerListeners, clearDragVisuals]
  )

  const value = useMemo(
    () => ({
      containerRef,
      startDrag,
      registerCard,
      consumeSuppressClick,
    }),
    [startDrag, registerCard, consumeSuppressClick]
  )

  return (
    <NativeDndContext.Provider value={value}>{children}</NativeDndContext.Provider>
  )
}
