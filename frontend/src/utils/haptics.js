export const HAPTIC_CONFIGS = {
  ERROR: {
    pattern: [
      { duration: 40 },
      { delay: 40, duration: 40 },
      { delay: 40, duration: 40 },
    ],
    options: { intensity: 1.2 },
  },
  CLICK: {
    pattern: [{ duration: 35 }],
    options: { intensity: 1 },
  },
  SELECTION: {
    pattern: [{ duration: 8 }],
    options: { intensity: 0.3 },
  },
};
