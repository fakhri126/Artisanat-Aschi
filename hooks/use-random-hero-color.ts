import { useState, useEffect } from 'react';

// The 4 colors extracted from the wooden rosettes
const HERO_COLORS = [
  '#298A48', // Green (Vert émeraude vif)
  '#CC4B27', // Red (Rouge vif)
  '#9E6733', // Brown (Brun chaud/doré)
  '#D89B27', // Yellow (Jaune moutarde)
];

export function useRandomHeroColor() {
  // We initialize with a default color (e.g. green) to ensure Server-Side Rendering (SSR) 
  // matches the initial client render (avoiding hydration mismatch errors).
  const [color, setColor] = useState(HERO_COLORS[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Once the component is mounted on the client, we pick a random color
    const randomColor = HERO_COLORS[Math.floor(Math.random() * HERO_COLORS.length)];
    setColor(randomColor);
    setIsMounted(true);
  }, []);

  return { color, isMounted };
}
