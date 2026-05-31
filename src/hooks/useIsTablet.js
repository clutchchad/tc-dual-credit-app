import { useState, useEffect } from 'react';

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isTablet;
}
