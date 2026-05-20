import './GameMessage.scss'
import type { GameStatusType } from '@/types/game.type'
import { useGameStatus } from '@/context/GameStatusContext'

const MESSAGES: Record<GameStatusType, string> = {
  success: 'Победа!',
  fail: 'Порядок не соответствует заданному, попробуй еще раз!',
  init: '',
}

export function GameMessage() {
  const { status } = useGameStatus()
  if (status === 'init') return null

  return (
    <p className={`game-message game-message--${status}`} role="status">
      {MESSAGES[status]}
    </p>
  )
}
