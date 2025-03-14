import { useDrop } from 'react-dnd';
import Card from './card';
import styles from './card-pile.module.css';
import type { Card as CardType } from '../deck/deck';
import { useRef } from 'react';
import clsx from 'clsx';

type CardPileProps = {
  id: string;
  cards: CardType[];
  className?: string;
  isFoundation?: boolean;
  isTableau?: boolean;
  onClick?: () => void;
  onCardMove?: (
    card: CardType,
    fromPile: string,
    toPile: string,
    fromIndex: number,
  ) => void;
};

export default function CardPile({
  id,
  cards,
  className,
  isFoundation,
  isTableau,
  onClick,
  onCardMove,
}: CardPileProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CARD',
    drop: (item: { card: CardType; pileId: string; index: number }) => {
      if (onCardMove && item.pileId !== id) {
        onCardMove(item.card, item.pileId, id, item.index);
      }
      return { id };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const pileRef = useRef<HTMLDivElement>(null);
  drop(pileRef);

  const renderEmptyPile = () => {
    if (id === 'stock') {
      return (
        <div className={styles.emptyStockPile} onClick={onClick}>
          <span className={styles.emptyPileText}>Reset</span>
        </div>
      );
    }

    if (isFoundation) {
      return (
        <div className={styles.emptyFoundationPile}>
          <span className={styles.emptyPileSymbol}>A</span>
        </div>
      );
    }

    return (
      <div className={styles.emptyTableauPile}>
        <span className={styles.emptyPileSymbol} />
      </div>
    );
  };

  const pileClasses = clsx({
    [styles.pile]: true,
    [styles.validDrop]: isOver && canDrop,
    [styles.invalidDrop]: isOver && !canDrop,
    className,
  });

  return (
    <div ref={pileRef} className={pileClasses}>
      {cards.length === 0 ? (
        renderEmptyPile()
      ) : (
        <>
          {id === 'stock' ? (
            <div onClick={onClick} className={styles.stockPile}>
              <Card card={cards[cards.length - 1]} pileId={id} />
            </div>
          ) : (
            <>
              {isTableau ? (
                <>
                  {cards.map((card, i) => (
                    <Card
                      key={`${card.suit}-${card.value}-${i}`}
                      card={card}
                      index={i}
                      pileId={id}
                      isTableau
                    />
                  ))}
                </>
              ) : (
                <Card card={cards[cards.length - 1]} pileId={id} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
