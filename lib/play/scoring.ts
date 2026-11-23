/**
 * Chips for one election race: 0 at 50%, +24 for a right call at 90%, −56 for a wrong one.
 * Saying what you believe earns the most on average. p is the chance given to A, o is 1 if A won, 0 if B won.
 */
export const chipsFor = (p: number, o: number) => Math.round(100 * (1 - (o - p) ** 2) - 75);
