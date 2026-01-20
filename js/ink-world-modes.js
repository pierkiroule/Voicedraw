export const modeSettings = {
  sumi: {
    label: "Sumi.e",
    background: "#f4f1ea",
    inkStops: [
      { core: "rgba(20, 18, 16, 0.26)", edge: "rgba(20, 18, 16, 0.0)" },
      { core: "rgba(32, 28, 24, 0.2)", edge: "rgba(32, 28, 24, 0.0)" },
    ],
    inkBands: [
      {
        core: { rgb: [18, 16, 14], alpha: 0.42 },
        edge: { rgb: [18, 16, 14], alpha: 0 },
      },
      {
        core: { rgb: [34, 30, 26], alpha: 0.32 },
        edge: { rgb: [34, 30, 26], alpha: 0 },
      },
      {
        core: { rgb: [52, 46, 40], alpha: 0.26 },
        edge: { rgb: [52, 46, 40], alpha: 0 },
      },
    ],
    ball: {
      fill: "#3b2320",
      stroke: "rgba(0,0,0,0.25)",
    },
    physics: {
      friction: 0.987,
      drift: 14,
      push: 95,
      rippleImpulse: 140,
      rippleFalloff: 0.017,
      wobbleForce: 26,
      wobbleDecay: 2.4,
      restitution: 0.8,
      spin: 12,
      maxSpeed: 700,
    },
    inkRadius: {
      base: 6,
      energyScale: 20,
      power: 1.5,
    },
    ballRadius: {
      base: 8,
      energyScale: 6,
      power: 1.1,
    },
    watercolor: {
      baseRadius: 26,
      jitter: 14,
      ringMin: 2,
      ringMax: 4,
    },
    watercolorPalette: [
      { core: "rgba(120, 94, 72, 0.35)", edge: "rgba(120, 94, 72, 0.0)" },
      { core: "rgba(168, 132, 88, 0.3)", edge: "rgba(168, 132, 88, 0.0)" },
      { core: "rgba(200, 162, 116, 0.28)", edge: "rgba(200, 162, 116, 0.0)" },
    ],
    dropletPalette: [
      { core: "rgba(140, 110, 82, 0.55)", edge: "rgba(140, 110, 82, 0.0)" },
      { core: "rgba(176, 132, 96, 0.5)", edge: "rgba(176, 132, 96, 0.0)" },
    ],
    dropletBaseRadius: 20,
  },
  firework: {
    label: "Firework",
    background: "#11121a",
    inkStops: [
      { core: "rgba(255, 106, 61, 0.28)", edge: "rgba(255, 106, 61, 0.0)" },
      { core: "rgba(255, 214, 90, 0.26)", edge: "rgba(255, 214, 90, 0.0)" },
      { core: "rgba(255, 72, 170, 0.24)", edge: "rgba(255, 72, 170, 0.0)" },
    ],
    ball: {
      fill: "#ff4d3a",
      stroke: "rgba(255,255,255,0.25)",
    },
    physics: {
      friction: 0.97,
      drift: 40,
      push: 220,
      rippleImpulse: 260,
      rippleFalloff: 0.012,
      wobbleForce: 60,
      wobbleDecay: 1.8,
      restitution: 0.86,
      spin: 24,
      maxSpeed: 1200,
    },
    inkRadius: {
      base: 8,
      energyScale: 34,
      power: 1.7,
    },
    ballRadius: {
      base: 10,
      energyScale: 10,
      power: 1.25,
    },
    watercolor: {
      baseRadius: 34,
      jitter: 18,
      ringMin: 3,
      ringMax: 6,
    },
    watercolorPalette: [
      { core: "rgba(255, 94, 98, 0.65)", edge: "rgba(255, 94, 98, 0.0)" },
      { core: "rgba(255, 180, 72, 0.6)", edge: "rgba(255, 180, 72, 0.0)" },
      { core: "rgba(255, 80, 190, 0.55)", edge: "rgba(255, 80, 190, 0.0)" },
      { core: "rgba(120, 190, 255, 0.55)", edge: "rgba(120, 190, 255, 0.0)" },
    ],
    dropletPalette: [
      { core: "rgba(255, 124, 60, 0.75)", edge: "rgba(255, 124, 60, 0.0)" },
      { core: "rgba(255, 212, 98, 0.7)", edge: "rgba(255, 212, 98, 0.0)" },
      { core: "rgba(255, 98, 200, 0.7)", edge: "rgba(255, 98, 200, 0.0)" },
    ],
    dropletBaseRadius: 26,
  },
  generatif: {
    label: "Art génératif",
    background: "#f3f6ff",
    inkStops: [
      { core: "rgba(64, 110, 255, 0.24)", edge: "rgba(64, 110, 255, 0.0)" },
      { core: "rgba(56, 210, 160, 0.2)", edge: "rgba(56, 210, 160, 0.0)" },
      { core: "rgba(255, 120, 210, 0.22)", edge: "rgba(255, 120, 210, 0.0)" },
    ],
    ball: {
      fill: "#4e3cff",
      stroke: "rgba(0,0,0,0.2)",
    },
    physics: {
      friction: 0.982,
      drift: 28,
      push: 150,
      rippleImpulse: 190,
      rippleFalloff: 0.015,
      wobbleForce: 38,
      wobbleDecay: 2.1,
      restitution: 0.82,
      spin: 18,
      maxSpeed: 900,
    },
    inkRadius: {
      base: 7,
      energyScale: 26,
      power: 1.6,
    },
    ballRadius: {
      base: 9,
      energyScale: 8,
      power: 1.2,
    },
    watercolor: {
      baseRadius: 30,
      jitter: 16,
      ringMin: 3,
      ringMax: 5,
    },
    watercolorPalette: [
      { core: "rgba(94, 176, 255, 0.55)", edge: "rgba(94, 176, 255, 0.0)" },
      { core: "rgba(120, 255, 204, 0.5)", edge: "rgba(120, 255, 204, 0.0)" },
      { core: "rgba(255, 140, 232, 0.48)", edge: "rgba(255, 140, 232, 0.0)" },
      { core: "rgba(255, 206, 120, 0.45)", edge: "rgba(255, 206, 120, 0.0)" },
    ],
    dropletPalette: [
      { core: "rgba(84, 156, 255, 0.65)", edge: "rgba(84, 156, 255, 0.0)" },
      { core: "rgba(255, 144, 222, 0.6)", edge: "rgba(255, 144, 222, 0.0)" },
    ],
    dropletBaseRadius: 24,
  },
};

export function createModeState(initialMode = "sumi") {
  const modeState = {
    currentMode: initialMode,
    mode: modeSettings[initialMode],
    background: modeSettings[initialMode].background,
  };

  document.documentElement.style.setProperty("--bg", modeState.background);

  return modeState;
}

export function applyMode(modeState, nextMode, resetWorld) {
  if (!modeSettings[nextMode]) return;
  modeState.currentMode = nextMode;
  modeState.mode = modeSettings[nextMode];
  modeState.background = modeState.mode.background;
  document.documentElement.style.setProperty("--bg", modeState.background);
  if (resetWorld) {
    resetWorld();
  }
}

function pickFromPalette(palette, seed) {
  if (!palette.length) return null;
  const t = (Math.sin(seed) + 1) / 2;
  const index = Math.min(palette.length - 1, Math.floor(t * palette.length));
  return palette[index];
}

export function createPalettePickers(modeState) {
  const getInkStops = (wx, wy) => {
    const seed = wx * 0.01 + wy * 0.012 + performance.now() * 0.0004;
    return pickFromPalette(modeState.mode.inkStops, seed) ?? modeState.mode.inkStops[0];
  };

  const getWatercolorPick = (wx, wy) => {
    const seed = wx * 0.02 + wy * 0.017 + performance.now() * 0.0007;
    return pickFromPalette(modeState.mode.watercolorPalette, seed) ?? modeState.mode.watercolorPalette[0];
  };

  const getDropletPick = (wx, wy) => {
    const seed = wx * 0.015 + wy * 0.018 + performance.now() * 0.0006;
    return pickFromPalette(modeState.mode.dropletPalette, seed) ?? modeState.mode.dropletPalette[0];
  };

  return {
    getInkStops,
    getWatercolorPick,
    getDropletPick,
  };
}
