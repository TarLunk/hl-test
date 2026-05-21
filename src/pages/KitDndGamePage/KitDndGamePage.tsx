import { GameControls } from '@/components/game/layout/GameControls'
import { GameMessage } from '@/components/game/layout/GameMessage'
import { useGame } from '@/hooks/useGame'
import { KitDndBoard } from "@/components/game/boards/KitDndBoard.tsx";
import { KitDndCard } from "@/components/game/cards/KitDndCard.tsx";
import { Board } from "@/components/game/boards/Board.tsx";
import { Card } from "@/components/game/cards/Card.tsx";

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

      <Board variant="reference">
        {orderedCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </Board>

      <KitDndBoard moveCard={moveCard} isLocked={isLocked}>
        {shuffledCards.map((card, index) => (
          <KitDndCard
            key={card.id}
            card={card}
            index={index}
            isSelected={selectedIds.includes(card.id)}
            addSelected={addSelected}
          />
        ))}
      </KitDndBoard>

      <GameControls checkResult={checkResult} resetGame={resetGame} />
      <GameMessage />
    </section>
  )
}
