import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '@/features/solitaire-game/slice/game-slice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  // Add middleware for development tools
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
