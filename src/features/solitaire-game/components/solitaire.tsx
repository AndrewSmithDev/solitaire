'use client';

import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/modules/ui-kit/button';
import CardPile from './card-pile';
import { useAppDispatch, useAppSelector } from '@/modules/redux/hooks';
import {
  initializeGame,
  incrementTime,
  checkWinCondition,
  moveFromWasteToTableau,
  moveFromWasteToFoundation,
  moveFromTableauToTableau,
  moveFromTableauToFoundation,
  moveFromFoundationToTableau,
  drawCard,
} from '@/features/solitaire-game/slice/game-slice';
import styles from './solitaire.module.css';
import { Card } from '../deck/deck';

export default function Solitaire() {
  const dispatch = useAppDispatch();
  const {
    stock,
    waste,
    foundations,
    tableaus,
    isGameWon,
    moves,
    time,
    isTimerRunning,
  } = useAppSelector((state) => state.game);

  // Initialize game
  useEffect(() => {
    dispatch(initializeGame());
  }, [dispatch]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        dispatch(incrementTime());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, dispatch]);

  // Check win condition
  useEffect(() => {
    dispatch(checkWinCondition());
  }, [foundations, dispatch]);

  const handleCardMove = (
    card: Card,
    fromPile: string,
    toPile: string,
    fromIndex: number,
  ) => {
    if (fromPile === 'waste' && toPile.startsWith('tableau')) {
      dispatch(moveFromWasteToTableau(Number.parseInt(toPile.split('-')[1])));
    } else if (fromPile === 'waste' && toPile.startsWith('foundation')) {
      dispatch(
        moveFromWasteToFoundation(Number.parseInt(toPile.split('-')[1])),
      );
    } else if (fromPile.startsWith('tableau') && toPile.startsWith('tableau')) {
      dispatch(
        moveFromTableauToTableau({
          fromIndex: Number.parseInt(fromPile.split('-')[1]),
          toIndex: Number.parseInt(toPile.split('-')[1]),
          cardIndex: fromIndex,
        }),
      );
    } else if (
      fromPile.startsWith('tableau') &&
      toPile.startsWith('foundation')
    ) {
      dispatch(
        moveFromTableauToFoundation({
          tableauIndex: Number.parseInt(fromPile.split('-')[1]),
          foundationIndex: Number.parseInt(toPile.split('-')[1]),
        }),
      );
    } else if (
      fromPile.startsWith('foundation') &&
      toPile.startsWith('tableau')
    ) {
      dispatch(
        moveFromFoundationToTableau({
          foundationIndex: Number.parseInt(fromPile.split('-')[1]),
          tableauIndex: Number.parseInt(toPile.split('-')[1]),
        }),
      );
    }
  };

  const handleDrawCard = () => {
    dispatch(drawCard());
  };

  const newGame = () => {
    dispatch(initializeGame());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className={styles.main}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.buttonContainer}>
              <Button onClick={newGame} variant="secondary">
                New Game
              </Button>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>Moves: {moves}</div>
              <div className={styles.stat}>Time: {formatTime(time)}</div>
            </div>
          </div>

          {isGameWon && (
            <div className={styles.winOverlay}>
              <div className={styles.winModal}>
                <h2 className={styles.winTitle}>Congratulations!</h2>
                <p className={styles.winText}>
                  You won in {moves} moves and {formatTime(time)}!
                </p>
                <Button onClick={newGame}>Play Again</Button>
              </div>
            </div>
          )}

          <div className={styles.topSection}>
            {/* Stock and Waste */}
            <div className={styles.stockWasteContainer}>
              <div className={styles.stockWaste}>
                <CardPile
                  id="stock"
                  cards={stock}
                  onClick={handleDrawCard}
                  className={styles.pile}
                />
                <CardPile
                  id="waste"
                  cards={waste}
                  className={styles.pile}
                  onCardMove={handleCardMove}
                />
              </div>
            </div>

            {/* Spacer */}
            <div className={styles.spacer}></div>

            {/* Foundations */}
            <div className={styles.foundationsContainer}>
              <div className={styles.foundations}>
                {foundations.map((foundation, i) => (
                  <CardPile
                    key={`foundation-${i}`}
                    id={`foundation-${i}`}
                    cards={foundation}
                    className={styles.pile}
                    isFoundation
                    onCardMove={handleCardMove}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tableaus */}
          <div className={styles.tableaus}>
            {tableaus.map((tableau, i) => (
              <CardPile
                key={`tableau-${i}`}
                id={`tableau-${i}`}
                cards={tableau}
                className={styles.tableauPile}
                isTableau
                onCardMove={handleCardMove}
              />
            ))}
          </div>
        </div>
      </DndProvider>
    </main>
  );
}
