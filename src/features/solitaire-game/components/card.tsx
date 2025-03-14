import { useDrag } from 'react-dnd';
import styles from './card.module.css';
import type { Card as CardType } from '../deck/deck';
import { useRef } from 'react';
import clsx from 'clsx';

type CardProps = {
  card: CardType;
  index?: number;
  pileId: string;
  isTableau?: boolean;
};

export default function Card({
  card,
  index = 0,
  pileId,
  isTableau,
}: CardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { card, pileId, index },
    canDrag: () => card.faceUp,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const cardRef = useRef<HTMLDivElement>(null);
  drag(cardRef);

  const isRed = card.suit === '♥' || card.suit === '♦';

  if (!card.faceUp) {
    const cardBackClasses = clsx({
      [styles.cardBack]: true,
      [styles.tableauCard]: isTableau,
    });

    const cardBackStyle = isTableau ? { top: `${index * 2.5}rem` } : {};

    return (
      <div className={cardBackClasses} style={cardBackStyle}>
        <div className={styles.cardBackInner}>
          <div className={styles.cardBackPattern}>
            <div className={styles.cardBackSymbols}>♠♥♦♣</div>
          </div>
        </div>
      </div>
    );
  }

  const cardClasses = [
    styles.card,
    isDragging && styles.dragging,
    isTableau && styles.tableauCard,
  ]
    .filter(Boolean)
    .join(' ');

  const cardStyle = isTableau ? { top: `${index * 2.5}rem` } : {};

  const cardValue =
    card.value === 1
      ? 'A'
      : card.value === 11
        ? 'J'
        : card.value === 12
          ? 'Q'
          : card.value === 13
            ? 'K'
            : card.value;

  const colorStyle = isRed ? styles.red : styles.black;

  return (
    <div ref={cardRef} className={cardClasses} style={cardStyle}>
      <div className={styles.cardInner}>
        <div className={clsx(styles.cardCorner, colorStyle)}>
          <div className={styles.cardValue}>{cardValue}</div>
          <div className={styles.cardSuit}>{card.suit}</div>
        </div>

        <div className={clsx(styles.cardCenter, colorStyle)}>{card.suit}</div>

        <div className={clsx(styles.cardCorner, styles.rotated, colorStyle)}>
          <div className={styles.cardValue}>{cardValue}</div>
          <div className={styles.cardSuit}>{card.suit}</div>
        </div>
      </div>
    </div>
  );
}
