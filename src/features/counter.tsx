import { useState } from 'react';
import styles from './counter.module.css';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button className={styles.button} onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
