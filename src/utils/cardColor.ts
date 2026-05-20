import { cardColors } from '@/config/cardColors'

export function getCardColor(value: number): string {
  return cardColors[value - 1] ?? cardColors[0]
}
