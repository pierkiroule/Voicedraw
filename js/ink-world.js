import { applyMode, createModeState, createPalettePickers } from "./ink-world-modes.js";
import { createPhysics } from "./ink-world-physics.js";
import { createRenderer } from "./ink-world-renderer.js";
import { createResonanceSystem } from "./resonance-system.js";

export function createInkWorld(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const modeState = createModeState("sumi");

  const view = {
    w: () => window.innerWidth,
    h: () => window.innerHeight,
  };

  const world = {
    R: Math.min(view.w(), view.h()) * 1.35,
    cx: 0,
    cy: 0,
  };

  const cam = { x: 0, y: 0 };

  const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 10,
    inkR: 10,
  };

  const lastStamp = {
    x: 0,
    y: 0,
  };

  const inkBuffer = document.createElement("canvas");
  const inkCtx = inkBuffer.getContext("2d");

  const { getInkStops } = createPalettePickers(modeState);

  function screenToWorld(sx, sy) {
    return { x: sx + cam.x, y: sy + cam.y };
  }

  function worldToScreen(wx, wy) {
    return { x: wx - cam.x, y: wy - cam.y };
  }

  function worldToBuffer(wx, wy) {
    return {
      x: wx - world.cx + inkBuffer.width * 0.5,
      y: wy - world.cy + inkBuffer.height * 0.5,
    };
  }

  function updateCamera() {
    cam.x = ball.x - view.w() * 0.5;
    cam.y = ball.y - view.h() * 0.5;
  }

  const renderer = createRenderer({
    canvas,
    ctx,
    inkBuffer,
    inkCtx,
    modeState,
    world,
    view,
    ball,
    cam,
    lastStamp,
    worldToBuffer,
    worldToScreen,
    getInkStops,
  });

  const resonance = createResonanceSystem({
    ball,
    screenToWorld,
  });

  function resetWorld() {
    world.R = Math.min(view.w(), view.h()) * 1.35;
    world.cx = 0;
    world.cy = 0;
    ball.x = world.cx;
    ball.y = world.cy;
    ball.vx = 0;
    ball.vy = 0;
    ball.r = 10;
    ball.inkR = 10;
    lastStamp.x = ball.x;
    lastStamp.y = ball.y;
    ctx.fillStyle = modeState.background;
    ctx.fillRect(0, 0, view.w(), view.h());
    renderer.resizeInkBuffer();
    updateCamera();
    resonance.reset();
  }

  function setMode(nextMode) {
    applyMode(modeState, nextMode, resetWorld);
  }

  const physics = createPhysics({
    modeState,
    world,
    ball,
  });

  function handlePointerDown(event) {
    canvas.setPointerCapture(event.pointerId);
    resonance.handlePointerDown(event);
  }

  function handlePointerMove(event) {
    resonance.handlePointerMove(event);
  }

  function handlePointerUp(event) {
    resonance.handlePointerUp(event);
  }

  function step(dt, audio) {
    resonance.update(dt, audio);
    physics.applyForces(dt, audio, resonance.getPointerState());
    physics.integrate(dt);
    physics.bounceInCircle();
    updateCamera();
    renderer.stampInkToBuffer();
  }

  function render() {
    renderer.renderPersistent();
    renderer.renderResonanceEvents(resonance.getEvents());
    renderer.renderBall();
  }

  function exportInk() {
    return inkBuffer.toDataURL("image/png");
  }

  function resize() {
    renderer.resizeCanvas();
    resetWorld();
  }

  return {
    resize,
    resetWorld,
    step,
    render,
    exportInk,
    setMode,
    getMode: () => modeState.currentMode,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
