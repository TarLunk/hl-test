import './GameControls.scss'
import { useGameStatus } from '@/context/GameStatusContext'

interface GameControlsProps {
  checkResult: () => void
  resetGame: () => void
}

export function GameControls({ checkResult, resetGame }: GameControlsProps) {
  const { status } = useGameStatus()

  return (
    <div className="game-controls">
      {(status === 'init' || status === 'fail') && (
        <button
          type="button"
          className="game-controls__button"
          onClick={checkResult}
        >
          Проверить
        </button>
      )}
      {status === 'success' && (
        <button
          type="button"
          className="game-controls__button"
          onClick={resetGame}
        >
          Новая игра
        </button>
      )}
    </div>
  )
}
