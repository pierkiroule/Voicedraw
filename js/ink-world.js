import { applyMode, createModeState, createPalettePickers } from "./ink-world-modes.js";
import { createPhysics } from "./ink-world-physics.js";
import { createRenderer } from "./ink-world-renderer.js";

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

  const audioSmooth = {
    energy: 0,
    low: 0,
    high: 0,
  };

  const lastStamp = {
    x: 0,
    y: 0,
  };

  const pointer = {
    down: false,
    id: null,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
    draggingBall: false,
    downAt: 0,
    longPressTriggered: false,
    lastTapAt: 0,
    lastTapX: 0,
    lastTapY: 0,
  };

  const ripples = [];
  const droplets = [];
  const wobble = {
    time: 0,
    strength: 0,
  };

  const inkBuffer = document.createElement("canvas");
  const inkCtx = inkBuffer.getContext("2d");

  const { getInkStops, getWatercolorPick, getDropletPick } = createPalettePickers(modeState);

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

  function dist2(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
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
    droplets,
    worldToBuffer,
    worldToScreen,
    getInkStops,
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
    droplets.length = 0;
    ctx.fillStyle = modeState.background;
    ctx.fillRect(0, 0, view.w(), view.h());
    renderer.resizeInkBuffer();
    updateCamera();
  }

  function setMode(nextMode) {
    applyMode(modeState, nextMode, resetWorld);
  }

  function triggerLongPress(wx, wy) {
    const choice = getDropletPick(wx, wy);
    renderer.stampWatercolorAt(wx, wy, choice);
    droplets.push({
      x: wx,
      y: wy,
      core: choice.core,
      edge: choice.edge,
      baseRadius: modeState.mode.dropletBaseRadius,
      seed: Math.random() * Math.PI * 2,
    });
    wobble.time = 0;
    wobble.strength = 1;
    ripples.push({
      x: wx,
      y: wy,
      age: 0,
      strength: 1.6,
    });
  }

  function triggerWatercolorTap(wx, wy) {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) {
      const pick = getWatercolorPick(wx + i * 12, wy - i * 7);
      const offsetAngle = Math.random() * Math.PI * 2;
      const offsetRadius = 8 + Math.random() * 26;
      const ox = Math.cos(offsetAngle) * offsetRadius;
      const oy = Math.sin(offsetAngle) * offsetRadius;
      renderer.stampWatercolorAt(wx + ox, wy + oy, pick);
    }
    ripples.push({
      x: wx,
      y: wy,
      age: 0,
      strength: 1.1,
    });
  }

  const physics = createPhysics({
    modeState,
    world,
    ball,
    pointer,
    ripples,
    wobble,
    audioSmooth,
    screenToWorld,
    triggerLongPress,
  });

  function handlePointerDown(event) {
    canvas.setPointerCapture(event.pointerId);
    const tapNow = performance.now();
    pointer.down = true;
    pointer.id = event.pointerId;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.vx = 0;
    pointer.vy = 0;
    pointer.downAt = performance.now();
    pointer.longPressTriggered = false;

    const tapDx = event.clientX - pointer.lastTapX;
    const tapDy = event.clientY - pointer.lastTapY;
    const tapDist = Math.hypot(tapDx, tapDy);
    if (tapNow - pointer.lastTapAt < 300 && tapDist < 36) {
      const w = screenToWorld(event.clientX, event.clientY);
      triggerWatercolorTap(w.x, w.y);
      pointer.longPressTriggered = true;
      pointer.lastTapAt = 0;
    } else {
      pointer.lastTapAt = tapNow;
      pointer.lastTapX = event.clientX;
      pointer.lastTapY = event.clientY;
    }

    const w = screenToWorld(event.clientX, event.clientY);
    const d = dist2(w.x, w.y, ball.x, ball.y);
    pointer.draggingBall = d <= ball.r * ball.r * 5;

    ripples.push({
      x: w.x,
      y: w.y,
      age: 0,
      strength: pointer.draggingBall ? 0.5 : 1,
    });
  }

  function handlePointerMove(event) {
    if (!pointer.down || event.pointerId !== pointer.id) return;

    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;

    pointer.vx = dx;
    pointer.vy = dy;

    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (pointer.draggingBall) {
      const w = screenToWorld(event.clientX, event.clientY);
      ball.x += (w.x - ball.x) * 0.175;
      ball.y += (w.y - ball.y) * 0.175;
      ball.vx += dx * 0.03;
      ball.vy += dy * 0.03;
    }
  }

  function handlePointerUp(event) {
    if (event.pointerId !== pointer.id) return;
    pointer.down = false;
    pointer.longPressTriggered = false;
    if (pointer.draggingBall) {
      ball.vx += pointer.vx * 0.12;
      ball.vy += pointer.vy * 0.12;
    }
    pointer.draggingBall = false;
  }

  function step(dt, audio) {
    physics.applyForces(dt, audio);
    physics.integrate(dt);
    physics.bounceInCircle();
    updateCamera();
    renderer.stampInkToBuffer();
  }

  function render() {
    renderer.render();
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
