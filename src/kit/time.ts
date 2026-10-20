/** Every chapter runs at 30 fps; chapters state their timings in seconds. */
export const FPS = 30;

/** seconds -> frames */
export const f = (seconds: number): number => Math.round(seconds * FPS);

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
