import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { RestrictToElement } from '@dnd-kit/dom/modifiers'
import { isSortable } from '@dnd-kit/react/sortable'
import {
  PointerSensor,
  PointerActivationConstraints,
} from '@dnd-kit/dom'

import { Board } from '@/components/game/boards/Board'

type Props = {
  children: ReactNode
  moveCard: (fromIndex: number, toIndex: number) => void
  isLocked?: boolean
}

export function KitDndBoard({
  children,
  moveCard,
  isLocked = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const moveCardRef = useRef(moveCard)

  useEffect(() => {
    moveCardRef.current = moveCard
  })

  useEffect(() => {
    setContainer(containerRef.current)
  }, [])

  const modifiers = useMemo(
    () => [
      RestrictToVerticalAxis,
      RestrictToElement.configure({
        element: container,
      }),
    ],
    [container]
  )

  const sensors = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (defaults: any[]) => [
      ...defaults.filter((sensor) => sensor !== PointerSensor),
      PointerSensor.configure({
        activationConstraints: [
          new PointerActivationConstraints.Distance({ value: 8 }),
          new PointerActivationConstraints.Delay({
            value: 200,
            tolerance: 10,
          }),
        ],
      }),
    ],
    []
  )

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return

        const { source } = event.operation

        if (isSortable(source)) {
          const { initialIndex, index } = source

          if (initialIndex !== index) {
            moveCardRef.current(initialIndex, index)
          }
        }
      }}
      modifiers={modifiers}
      sensors={sensors}
    >
      <div ref={containerRef}>
        <Board variant="playfield" isLocked={isLocked}>
          {children}
        </Board>
      </div>
    </DragDropProvider>
  )
}
