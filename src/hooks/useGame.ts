import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useGameStatus } from '@/context/GameStatusContext'
import { CARD_COUNT } from '@/config/gameConfig'
import type { CardType } from '@/types/game.type'
import {
  generateCards,
  isOrderCorrect,
  moveCardInList,
  swapCardsById,
} from '@/utils/gameLogic'
import { fisherYates } from '@/utils/shuffle'

function createInitialState(): {
  orderedCards: CardType[]
  shuffledCards: CardType[]
} {
  const orderedCards = generateCards(CARD_COUNT)
  return {
    orderedCards,
    shuffledCards: fisherYates(orderedCards),
  }
}

type GameState = {
  orderedCards: CardType[]
  shuffledCards: CardType[]
  selectedIds: string[]
}

type GameAction =
  | { type: 'reset' }
  | { type: 'moveCard'; fromIndex: number; toIndex: number }
  | { type: 'toggleSelect'; index: number }
  | { type: 'swapSelect'; firstId: string; secondId: string }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset': {
      const { orderedCards, shuffledCards } = createInitialState()
      return { orderedCards, shuffledCards, selectedIds: [] }
    }
    case 'moveCard':
      return {
        ...state,
        shuffledCards: moveCardInList(
          state.shuffledCards,
          action.fromIndex,
          action.toIndex
        ),
        selectedIds: [],
      }
    case 'toggleSelect': {
      const id = state.shuffledCards[action.index]?.id
      if (!id) return state
      return {
        ...state,
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((i) => i !== id)
          : state.selectedIds.length >= 2
            ? state.selectedIds
            : [...state.selectedIds, id],
      }
    }
    case 'swapSelect':
      return {
        ...state,
        shuffledCards: swapCardsById(
          state.shuffledCards,
          action.firstId,
          action.secondId
        ),
        selectedIds: [],
      }
    default:
      return state
  }
}

function initGameState(): GameState {
  const { orderedCards, shuffledCards } = createInitialState()
  return { orderedCards, shuffledCards, selectedIds: [] }
}

export function useGame() {
  const { status, setStatus } = useGameStatus()
  const isLocked = status === 'success'
  const isLockedRef = useRef(isLocked)
  const [state, dispatch] = useReducer(gameReducer, undefined, initGameState)
  const { orderedCards, shuffledCards, selectedIds } = state
  const shuffledCardsRef = useRef(shuffledCards)
  const selectedIdsRef = useRef(selectedIds)

  useEffect(() => {
    isLockedRef.current = isLocked
    shuffledCardsRef.current = shuffledCards
    selectedIdsRef.current = selectedIds
  })

  const resetGame = useCallback(() => {
    dispatch({ type: 'reset' })
    setStatus('init')
  }, [setStatus])

  const moveCard = useCallback((fromIndex: number, toIndex: number) => {
    if (isLockedRef.current) return
    dispatch({ type: 'moveCard', fromIndex, toIndex })
  }, [])

  const addSelected = useCallback((index: number) => {
    if (isLockedRef.current) return

    const cards = shuffledCardsRef.current
    const id = cards[index]?.id
    if (!id) return

    const selected = selectedIdsRef.current
    if (selected.includes(id)) {
      dispatch({ type: 'toggleSelect', index })
      return
    }

    if (selected.length >= 2) return

    if (selected.length === 1) {
      dispatch({ type: 'swapSelect', firstId: selected[0], secondId: id })
      return
    }

    dispatch({ type: 'toggleSelect', index })
  }, [])

  const checkResult = useCallback(() => {
    if (isLockedRef.current) return
    setStatus(
      isOrderCorrect(shuffledCardsRef.current, orderedCards) ? 'success' : 'fail'
    )
  }, [orderedCards, setStatus])

  return {
    orderedCards,
    shuffledCards,
    selectedIds,
    isLocked,
    addSelected,
    moveCard,
    checkResult,
    resetGame,
  }
}
