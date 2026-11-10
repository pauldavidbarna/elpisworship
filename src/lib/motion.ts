// Smooth deceleration with no overshoot, used by all reveal animations.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Outline buttons fill with turquoise from the centre instead of the instant hover colour.
export const OUTLINE_FILL =
  'btn-fill [--btn-fill:hsl(var(--primary))] hover:bg-background hover:text-primary-foreground hover:border-primary transition-colors duration-300';
