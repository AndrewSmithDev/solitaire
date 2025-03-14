import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReduxProvider } from './modules/redux/provider';
import Solitaire from './features/solitaire-game/components/solitaire';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <Solitaire />
    </ReduxProvider>
  </StrictMode>,
);
