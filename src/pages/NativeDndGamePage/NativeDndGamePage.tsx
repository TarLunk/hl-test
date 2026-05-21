import { GameControls } from '@/components/game/layout/GameControls'
import { GameMessage } from '@/components/game/layout/GameMessage'
import { useGame } from '@/hooks/useGame'
import { NativeDndBoard } from "@/components/game/boards/NativeDndBoard.tsx";
import { NativeDndCard } from "@/components/game/cards/NativeDndCard.tsx";
import { Board } from "@/components/game/boards/Board.tsx";
import { Card } from "@/components/game/cards/Card.tsx";

export function NativeDndGamePage() {
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
      <h2 className="game-page__subtitle">Нативный drag and drop</h2>

      <Board variant="reference">
        {orderedCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </Board>

      <NativeDndBoard
        moveCard={moveCard}
        disabled={isLocked}
        isLocked={isLocked}
      >
        {shuffledCards.map((card, index) => (
          <NativeDndCard
            key={card.id}
            card={card}
            index={index}
            isSelected={selectedIds.includes(card.id)}
            addSelected={addSelected}
          />
        ))}
      </NativeDndBoard>

      <GameControls checkResult={checkResult} resetGame={resetGame} />
      <GameMessage />
    </section>
  )
}
