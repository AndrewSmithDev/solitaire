import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Counter } from '@/features/counter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Counter />
  </StrictMode>,
);
