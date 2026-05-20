import { KitPlayfield } from '@/components/game/KitPlayfield'
import { ReferenceBoard } from '@/components/game/ReferenceBoard'
import { GameControls } from '@/components/game/layout/GameControls'
import { GameMessage } from '@/components/game/layout/GameMessage'
import { useGame } from '@/hooks/useGame'

export function KitDndGamePage() {
  const {
    orderedCards,
    shuffledCards,
    selectedIds,
    isLocked,
    resetGame,
    checkResult,
    moveCard,
    addSelected,
  } = useGame()

  return (
    <section className="game-page">
      <h2 className="game-page__subtitle">С использованием dnd-kit</h2>

      <ReferenceBoard orderedCards={orderedCards} />

      <KitPlayfield
        shuffledCards={shuffledCards}
        selectedIds={selectedIds}
        isLocked={isLocked}
        moveCard={moveCard}
        addSelected={addSelected}
      />

      <GameControls checkResult={checkResult} resetGame={resetGame} />
      <GameMessage />
    </section>
  )
}
