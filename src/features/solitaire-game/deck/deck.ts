export type Card = {
  suit: string;
  value: number;
  faceUp: boolean;
};

export function createDeck(): Card[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        suit,
        value,
        faceUp: false,
      });
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];

  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }

  return newDeck;
}
