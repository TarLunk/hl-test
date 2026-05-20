import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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

type NativeDndActionsContextValue = {
  containerRef: RefObject<HTMLDivElement | null>
  startDrag: (index: number, e: React.PointerEvent<HTMLDivElement>) => void
  registerCard: (index: number, el: HTMLDivElement | null) => void
  consumeSuppressClick: () => boolean
}

type NativeDndVisualContextValue = {
  dragSession: DragSession
  overIndex: number | null
  getShift: (index: number, isDragging: boolean) => number
}

const NativeDndActionsContext =
  createContext<NativeDndActionsContextValue | null>(null)
const NativeDndVisualContext =
  createContext<NativeDndVisualContextValue | null>(null)

export function useNativeDndActions() {
  const ctx = useContext(NativeDndActionsContext)
  if (!ctx) {
    throw new Error('useNativeDndActions must be used within NativeDndProvider')
  }
  return ctx
}

export function useNativeDndVisual() {
  const ctx = useContext(NativeDndVisualContext)
  if (!ctx) {
    throw new Error('useNativeDndVisual must be used within NativeDndProvider')
  }
  return ctx
}

/** @deprecated Prefer useNativeDndActions + useNativeDndVisual */
export function useNativeDnd() {
  return { ...useNativeDndActions(), ...useNativeDndVisual() }
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
  const currentYRef = useRef(0)
  const overIndexRef = useRef<number | null>(null)

  const [dragSession, setDragSession] = useState<DragSession>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragSessionRef = useRef(dragSession)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    dragSessionRef.current = dragSession
  }, [dragSession])

  useEffect(() => {
    overIndexRef.current = overIndex
  }, [overIndex])

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

  const clearDragTransform = useCallback(() => {
    const el = draggingElRef.current
    if (el) {
      el.style.transform = ''
      el.style.transition = ''
    }
    draggingElRef.current = null
  }, [])

  const updateOverIndex = useCallback((session: NonNullable<DragSession>, y: number) => {
    const next = getDropIndex(
      y,
      session.layoutRects[0].top,
      session.itemStride,
      session.layoutRects.length
    )
    if (next !== overIndexRef.current) {
      overIndexRef.current = next
      setOverIndex(next)
    }
  }, [])

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
      currentYRef.current = startY

      const session: NonNullable<DragSession> = {
        fromIndex: index,
        pointerId: e.pointerId,
        startY,
        itemStride,
        layoutRects,
      }

      dragSessionRef.current = session
      setDragSession(session)

      const initialOver = getDropIndex(
        startY,
        layoutRects[0].top,
        itemStride,
        layoutRects.length
      )
      overIndexRef.current = initialOver
      setOverIndex(initialOver)

      applyDragTransform(0)
      e.preventDefault()
    },
    [disabled, snapshotLayoutRects, applyDragTransform]
  )

  const getShift = useCallback(
    (index: number, isDragging: boolean) => {
      if (!dragSession || overIndex === null) return 0
      return getCardShift(
        index,
        dragSession.fromIndex,
        overIndex,
        dragSession.itemStride,
        0,
        isDragging
      )
    },
    [dragSession, overIndex]
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

  useEffect(() => {
    if (!dragSession) return

    const onPointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current
      if (!session || e.pointerId !== session.pointerId) return

      const currentY = clampY(e.clientY, session.layoutRects)
      currentYRef.current = currentY

      if (Math.abs(currentY - session.startY) > CLICK_DRAG_THRESHOLD) {
        suppressClickRef.current = true
      }

      applyDragTransform(currentY - session.startY)
      updateOverIndex(session, currentY)
    }

    const onPointerEnd = (e: PointerEvent) => {
      const session = dragSessionRef.current
      if (!session || e.pointerId !== session.pointerId) return

      const currentY = clampY(e.clientY, session.layoutRects)
      const toIndex = getDropIndex(
        currentY,
        session.layoutRects[0].top,
        session.itemStride,
        session.layoutRects.length
      )

      clearDragTransform()
      dragSessionRef.current = null
      overIndexRef.current = null
      setDragSession(null)
      setOverIndex(null)
      finishDrag(session, toIndex)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bind when drag session starts
  }, [dragSession?.pointerId, finishDrag, applyDragTransform, updateOverIndex, clearDragTransform])

  const actionsValue = useMemo(
    () => ({
      containerRef,
      startDrag,
      registerCard,
      consumeSuppressClick,
    }),
    [startDrag, registerCard, consumeSuppressClick]
  )

  const visualValue = useMemo(
    () => ({
      dragSession,
      overIndex,
      getShift,
    }),
    [dragSession, overIndex, getShift]
  )

  return (
    <NativeDndActionsContext.Provider value={actionsValue}>
      <NativeDndVisualContext.Provider value={visualValue}>
        {children}
      </NativeDndVisualContext.Provider>
    </NativeDndActionsContext.Provider>
  )
}
