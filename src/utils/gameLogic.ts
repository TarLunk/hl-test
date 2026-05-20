import type { CardType } from '@/types/game.type'
import { fisherYates } from '@/utils/shuffle'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function generateCards(count: number): CardType[] {
  return fisherYates([...DIGITS])
    .slice(0, count)
    .map((value) => ({
      id: crypto.randomUUID(),
      value,
    }))
}

export function isOrderCorrect(
  shuffled: CardType[],
  ordered: CardType[]
): boolean {
  return shuffled.every((card, index) => card.id === ordered[index]?.id)
}

export function swapCardsById(
  cards: CardType[],
  firstId: string,
  secondId: string
): CardType[] {
  const first = cards.findIndex((c) => c.id === firstId)
  const second = cards.findIndex((c) => c.id === secondId)

  if (first === -1 || second === -1) return cards

  const updated = [...cards]
  ;[updated[first], updated[second]] = [updated[second], updated[first]]
  return updated
}

export function moveCardInList(
  cards: CardType[],
  fromIndex: number,
  toIndex: number
): CardType[] {
  const updated = [...cards]
  const [card] = updated.splice(fromIndex, 1)
  updated.splice(toIndex, 0, card)
  return updated
}
