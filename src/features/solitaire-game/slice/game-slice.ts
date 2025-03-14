import type { Card } from '@/features/solitaire-game/deck/deck';
import { createDeck, shuffleDeck } from '@/features/solitaire-game/deck/deck';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type GameState = {
  deck: Card[];
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableaus: Card[][];
  isGameWon: boolean;
  moves: number;
  time: number;
  isTimerRunning: boolean;
};

const initialState: GameState = {
  deck: [],
  stock: [],
  waste: [],
  foundations: Array(4)
    .fill([])
    .map(() => []),
  tableaus: Array(7)
    .fill([])
    .map(() => []),
  isGameWon: false,
  moves: 0,
  time: 0,
  isTimerRunning: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state) => {
      const newDeck = shuffleDeck(createDeck());
      state.deck = newDeck;

      // Reset state
      state.waste = [];
      state.foundations = Array(4)
        .fill([])
        .map(() => []);
      state.isGameWon = false;
      state.moves = 0;
      state.time = 0;
      state.isTimerRunning = true;

      // Deal cards to tableaus
      state.tableaus = Array(7)
        .fill([])
        .map(() => []);
      let cardIndex = 0;

      for (let i = 0; i < 7; i++) {
        for (let j = i; j < 7; j++) {
          state.tableaus[j] = [
            ...state.tableaus[j],
            {
              ...newDeck[cardIndex],
              faceUp: i === j,
            },
          ];
          cardIndex++;
        }
      }

      // Set remaining cards as stock
      state.stock = newDeck
        .slice(28)
        .map((card) => ({ ...card, faceUp: false }));
    },

    drawCard: (state) => {
      if (state.stock.length === 0) {
        // Reset stock from waste
        state.stock = state.waste
          .map((card) => ({ ...card, faceUp: false }))
          .reverse();
        state.waste = [];
      } else {
        const card = state.stock.pop();
        if (card) {
          state.waste.push({ ...card, faceUp: true });
        }
      }
      state.moves += 1;
    },

    moveFromWasteToTableau: (state, action: PayloadAction<number>) => {
      const tableauIndex = action.payload;
      if (state.waste.length === 0) return;

      const card = state.waste[state.waste.length - 1];
      const targetTableau = state.tableaus[tableauIndex];

      if (canPlaceOnTableau(card, targetTableau)) {
        state.tableaus[tableauIndex] = [...targetTableau, card];
        state.waste.pop();
        state.moves += 1;

        if (!state.isTimerRunning && !state.isGameWon) {
          state.isTimerRunning = true;
        }
      }
    },

    moveFromWasteToFoundation: (state, action: PayloadAction<number>) => {
      const foundationIndex = action.payload;
      if (state.waste.length === 0) return;

      const card = state.waste[state.waste.length - 1];
      const targetFoundation = state.foundations[foundationIndex];

      if (canPlaceOnFoundation(card, targetFoundation)) {
        state.foundations[foundationIndex] = [...targetFoundation, card];
        state.waste.pop();
        state.moves += 1;

        if (!state.isTimerRunning && !state.isGameWon) {
          state.isTimerRunning = true;
        }
      }
    },

    moveFromTableauToTableau: (
      state,
      action: PayloadAction<{
        fromIndex: number;
        toIndex: number;
        cardIndex: number;
      }>,
    ) => {
      const { fromIndex, toIndex, cardIndex } = action.payload;
      const fromTableau = state.tableaus[fromIndex];
      const toTableau = state.tableaus[toIndex];

      if (cardIndex < 0 || cardIndex >= fromTableau.length) return;

      const cardsToMove = fromTableau.slice(cardIndex);
      const firstCard = cardsToMove[0];

      if (canPlaceOnTableau(firstCard, toTableau)) {
        // Move cards
        state.tableaus[toIndex] = [...toTableau, ...cardsToMove];
        state.tableaus[fromIndex] = fromTableau.slice(0, cardIndex);

        // Flip the new top card if needed
        if (
          state.tableaus[fromIndex].length > 0 &&
          !state.tableaus[fromIndex][state.tableaus[fromIndex].length - 1]
            .faceUp
        ) {
          state.tableaus[fromIndex][
            state.tableaus[fromIndex].length - 1
          ].faceUp = true;
        }

        state.moves += 1;

        if (!state.isTimerRunning && !state.isGameWon) {
          state.isTimerRunning = true;
        }
      }
    },

    moveFromTableauToFoundation: (
      state,
      action: PayloadAction<{
        tableauIndex: number;
        foundationIndex: number;
      }>,
    ) => {
      const { tableauIndex, foundationIndex } = action.payload;
      const tableau = state.tableaus[tableauIndex];
      if (tableau.length === 0) return;

      const card = tableau[tableau.length - 1];
      const foundation = state.foundations[foundationIndex];

      if (canPlaceOnFoundation(card, foundation)) {
        // Move card
        state.foundations[foundationIndex] = [...foundation, card];
        state.tableaus[tableauIndex] = tableau.slice(0, -1);

        // Flip the new top card if needed
        if (
          state.tableaus[tableauIndex].length > 0 &&
          !state.tableaus[tableauIndex][state.tableaus[tableauIndex].length - 1]
            .faceUp
        ) {
          state.tableaus[tableauIndex][
            state.tableaus[tableauIndex].length - 1
          ].faceUp = true;
        }

        state.moves += 1;

        if (!state.isTimerRunning && !state.isGameWon) {
          state.isTimerRunning = true;
        }
      }
    },

    moveFromFoundationToTableau: (
      state,
      action: PayloadAction<{
        foundationIndex: number;
        tableauIndex: number;
      }>,
    ) => {
      const { foundationIndex, tableauIndex } = action.payload;
      const foundation = state.foundations[foundationIndex];
      if (foundation.length === 0) return;

      const card = foundation[foundation.length - 1];
      const tableau = state.tableaus[tableauIndex];

      if (canPlaceOnTableau(card, tableau)) {
        // Move card
        state.tableaus[tableauIndex] = [...tableau, card];
        state.foundations[foundationIndex] = foundation.slice(0, -1);

        state.moves += 1;

        if (!state.isTimerRunning && !state.isGameWon) {
          state.isTimerRunning = true;
        }
      }
    },

    incrementTime: (state) => {
      if (state.isTimerRunning) {
        state.time += 1;
      }
    },

    checkWinCondition: (state) => {
      if (state.foundations.every((pile) => pile.length === 13)) {
        state.isGameWon = true;
        state.isTimerRunning = false;
      }
    },

    setTimerRunning: (state, action: PayloadAction<boolean>) => {
      state.isTimerRunning = action.payload;
    },
  },
});

// Helper functions
function canPlaceOnTableau(card: Card, tableau: Card[]) {
  // Can place a King on an empty tableau
  if (tableau.length === 0) {
    return card.value === 13; // King
  }

  const topCard = tableau[tableau.length - 1];

  // Can place if the card is one less in value and of opposite color
  return (
    topCard.faceUp &&
    card.value === topCard.value - 1 &&
    (card.suit === '♥' || card.suit === '♦') !==
      (topCard.suit === '♥' || topCard.suit === '♦')
  );
}

function canPlaceOnFoundation(card: Card, foundation: Card[]) {
  // Can place an Ace on an empty foundation
  if (foundation.length === 0) {
    return card.value === 1; // Ace
  }

  const topCard = foundation[foundation.length - 1];

  // Can place if the card is one more in value and of the same suit
  return card.suit === topCard.suit && card.value === topCard.value + 1;
}

export const {
  initializeGame,
  drawCard,
  moveFromWasteToTableau,
  moveFromWasteToFoundation,
  moveFromTableauToTableau,
  moveFromTableauToFoundation,
  moveFromFoundationToTableau,
  incrementTime,
  checkWinCondition,
  setTimerRunning,
} = gameSlice.actions;

export default gameSlice.reducer;
