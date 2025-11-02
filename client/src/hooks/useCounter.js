// src/hooks/useCounter.js
import { useState } from 'react';

const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return { count, increment, decrement };
};

export default useCounter;
