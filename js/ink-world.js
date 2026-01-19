export function createInkWorld(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const modeSettings = {
    sumi: {
      label: "Sumi.e",
      background: "#f4f1ea",
      inkStops: [
        { core: "rgba(20, 18, 16, 0.26)", edge: "rgba(20, 18, 16, 0.0)" },
        { core: "rgba(32, 28, 24, 0.2)", edge: "rgba(32, 28, 24, 0.0)" },
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

  let currentMode = "sumi";
  let mode = modeSettings[currentMode];
  let background = mode.background;
  document.documentElement.style.setProperty("--bg", background);

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

  function pickFromPalette(palette, seed) {
    if (!palette.length) return null;
    const t = (Math.sin(seed) + 1) / 2;
    const index = Math.min(palette.length - 1, Math.floor(t * palette.length));
    return palette[index];
  }

  function getInkStops(wx, wy) {
    const seed = wx * 0.01 + wy * 0.012 + performance.now() * 0.0004;
    return pickFromPalette(mode.inkStops, seed) ?? mode.inkStops[0];
  }

  function getWatercolorPick(wx, wy) {
    const seed = wx * 0.02 + wy * 0.017 + performance.now() * 0.0007;
    return pickFromPalette(mode.watercolorPalette, seed) ?? mode.watercolorPalette[0];
  }

  function getDropletPick(wx, wy) {
    const seed = wx * 0.015 + wy * 0.018 + performance.now() * 0.0006;
    return pickFromPalette(mode.dropletPalette, seed) ?? mode.dropletPalette[0];
  }

  function applyMode(nextMode) {
    if (!modeSettings[nextMode]) return;
    currentMode = nextMode;
    mode = modeSettings[currentMode];
    background = mode.background;
    document.documentElement.style.setProperty("--bg", background);
    resetWorld();
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeInkBuffer() {
    const side = Math.ceil(world.R * 2 + 200);
    inkBuffer.width = side;
    inkBuffer.height = side;
    inkCtx.setTransform(1, 0, 0, 1, 0, 0);
    inkCtx.fillStyle = background;
    inkCtx.fillRect(0, 0, inkBuffer.width, inkBuffer.height);
  }

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
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, view.w(), view.h());
    resizeInkBuffer();
    updateCamera();
  }

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

  function triggerLongPress(wx, wy) {
    const choice = getDropletPick(wx, wy);
    stampWatercolorAt(wx, wy, choice);
    droplets.push({
      x: wx,
      y: wy,
      core: choice.core,
      edge: choice.edge,
      baseRadius: mode.dropletBaseRadius,
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
      stampWatercolorAt(wx + ox, wy + oy, pick);
    }
    ripples.push({
      x: wx,
      y: wy,
      age: 0,
      strength: 1.1,
    });
  }

  function applyForces(dt, audio) {
    const friction = mode.physics.friction;
    ball.vx *= friction;
    ball.vy *= friction;

    const smooth = 1 - Math.pow(0.001, dt);
    audioSmooth.energy += (audio.energy - audioSmooth.energy) * smooth;
    audioSmooth.low += (audio.low - audioSmooth.low) * smooth;
    audioSmooth.high += (audio.high - audioSmooth.high) * smooth;

    const t = performance.now() * 0.0006;
    const driftX = Math.cos(t) * 0.6 + Math.sin(t * 0.73) * 0.4;
    const driftY = Math.sin(t) * 0.6 + Math.cos(t * 0.91) * 0.4;
    const drift = mode.physics.drift;
    ball.vx += driftX * drift * dt;
    ball.vy += driftY * drift * dt;

    const push = mode.physics.push * audioSmooth.energy;
    const audioTilt = audioSmooth.high - audioSmooth.low;
    ball.vx += audioTilt * push * dt;
    ball.vy += Math.sin(performance.now() * 0.0014) * 0.2 * push * dt;

    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.age += dt;
      const life = 1.2;
      if (ripple.age > life) {
        ripples.splice(i, 1);
        continue;
      }
      const dx = ball.x - ripple.x;
      const dy = ball.y - ripple.y;
      const dist = Math.hypot(dx, dy) || 1;
      const wave = 1 - Math.min(1, ripple.age / life);
      const falloff = 1 / (1 + dist * mode.physics.rippleFalloff);
      const impulse = mode.physics.rippleImpulse * ripple.strength * wave * falloff;
      ball.vx += (dx / dist) * impulse * dt;
      ball.vy += (dy / dist) * impulse * dt;
    }

    if (pointer.down && !pointer.draggingBall && !pointer.longPressTriggered) {
      const held = (performance.now() - pointer.downAt) / 1000;
      if (held > 0.45) {
        const w = screenToWorld(pointer.x, pointer.y);
        triggerLongPress(w.x, w.y);
        pointer.longPressTriggered = true;
      }
    }

    if (wobble.strength > 0.001) {
      wobble.time += dt * 6;
      const wobbleDecay = Math.exp(-dt * mode.physics.wobbleDecay);
      wobble.strength *= wobbleDecay;
      const wobbleForce = mode.physics.wobbleForce * wobble.strength;
      ball.vx += Math.cos(wobble.time) * wobbleForce * dt;
      ball.vy += Math.sin(wobble.time * 1.2) * wobbleForce * dt;
    }

    ball.inkR =
      mode.inkRadius.base + Math.pow(audioSmooth.energy, mode.inkRadius.power) * mode.inkRadius.energyScale;
    ball.r =
      mode.ballRadius.base + Math.pow(audioSmooth.energy, mode.ballRadius.power) * mode.ballRadius.energyScale;

    const vmax = mode.physics.maxSpeed;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > vmax) {
      const k = vmax / speed;
      ball.vx *= k;
      ball.vy *= k;
    }
  }

  function integrate(dt) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  }

  function bounceInCircle() {
    const dx = ball.x - world.cx;
    const dy = ball.y - world.cy;
    const d = Math.hypot(dx, dy);
    const limit = world.R - ball.r;

    if (d > limit) {
      const nx = dx / (d || 1);
      const ny = dy / (d || 1);

      ball.x = world.cx + nx * limit;
      ball.y = world.cy + ny * limit;

      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;

      const restitution = mode.physics.restitution;
      ball.vx *= restitution;
      ball.vy *= restitution;

      const spin = mode.physics.spin;
      ball.vx += -ny * spin;
      ball.vy += nx * spin;
    }
  }

  function updateCamera() {
    cam.x = ball.x - view.w() * 0.5;
    cam.y = ball.y - view.h() * 0.5;
  }

  function stampInkAt(wx, wy) {
    const b = worldToBuffer(wx, wy);
    const r = ball.inkR;
    const stops = getInkStops(wx, wy);

    inkCtx.save();
    inkCtx.beginPath();
    inkCtx.arc(inkBuffer.width * 0.5, inkBuffer.height * 0.5, world.R, 0, Math.PI * 2);
    inkCtx.clip();

    const grad = inkCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    grad.addColorStop(0, stops.core);
    grad.addColorStop(1, stops.edge);
    inkCtx.fillStyle = grad;
    inkCtx.beginPath();
    inkCtx.arc(b.x, b.y, r, 0, Math.PI * 2);
    inkCtx.fill();

    inkCtx.restore();
  }

  function stampWatercolorAt(wx, wy, pick) {
    const b = worldToBuffer(wx, wy);
    const baseRadius = mode.watercolor.baseRadius + Math.random() * mode.watercolor.jitter;
    const ringCount =
      mode.watercolor.ringMin + Math.floor(Math.random() * (mode.watercolor.ringMax - mode.watercolor.ringMin + 1));

    inkCtx.save();
    inkCtx.beginPath();
    inkCtx.arc(inkBuffer.width * 0.5, inkBuffer.height * 0.5, world.R, 0, Math.PI * 2);
    inkCtx.clip();

    for (let i = 0; i < ringCount; i += 1) {
      const spread = baseRadius * (0.8 + Math.random() * 0.7);
      const grad = inkCtx.createRadialGradient(b.x, b.y, spread * 0.1, b.x, b.y, spread);
      grad.addColorStop(0, pick.core);
      grad.addColorStop(1, pick.edge);
      inkCtx.fillStyle = grad;
      inkCtx.beginPath();
      inkCtx.ellipse(
        b.x,
        b.y,
        spread * (0.8 + Math.random() * 0.35),
        spread * (0.7 + Math.random() * 0.4),
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      inkCtx.fill();
    }

    inkCtx.restore();
  }

  function stampInkToBuffer() {
    const dx = ball.x - lastStamp.x;
    const dy = ball.y - lastStamp.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(1, ball.inkR * 0.35);
    const count = Math.max(1, Math.ceil(dist / step));

    for (let i = 1; i <= count; i += 1) {
      const t = i / count;
      stampInkAt(lastStamp.x + dx * t, lastStamp.y + dy * t);
    }

    lastStamp.x = ball.x;
    lastStamp.y = ball.y;
  }

  function drawInkBufferToScreen() {
    const topLeftWorld = { x: cam.x, y: cam.y };
    const topLeftBuf = worldToBuffer(topLeftWorld.x, topLeftWorld.y);

    ctx.drawImage(
      inkBuffer,
      topLeftBuf.x,
      topLeftBuf.y,
      view.w(),
      view.h(),
      0,
      0,
      view.w(),
      view.h()
    );
  }

  function drawWorldBorder() {
    const c = worldToScreen(world.cx, world.cy);
    ctx.beginPath();
    ctx.arc(c.x, c.y, world.R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawBall() {
    const p = worldToScreen(ball.x, ball.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = mode.ball.fill;
    ctx.fill();
    ctx.strokeStyle = mode.ball.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawDroplets() {
    for (let i = 0; i < droplets.length; i += 1) {
      const drop = droplets[i];
      const p = worldToScreen(drop.x, drop.y);
      const time = performance.now() * 0.001;
      const wave = Math.sin(time * 1.6 + drop.seed);
      const shimmer = Math.sin(time * 0.9 + drop.seed * 2);
      const swell = 1 + 0.08 * wave;
      const stretch = 1 + 0.35 * shimmer;
      const baseRadius = drop.baseRadius ?? 22;
      const radius = baseRadius * (1.05 + 0.12 * wave);
      const angle = shimmer * 0.35;
      const alpha = 0.72 + 0.18 * wave;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.scale(stretch, 1 / stretch);
      const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * swell);
      grad.addColorStop(0, drop.core);
      grad.addColorStop(1, drop.edge);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * swell, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function step(dt, audio) {
    applyForces(dt, audio);
    integrate(dt);
    bounceInCircle();
    updateCamera();
    stampInkToBuffer();
  }

  function render() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, view.w(), view.h());
    drawInkBufferToScreen();
    drawWorldBorder();
    drawDroplets();
    drawBall();
  }

  function exportInk() {
    return inkBuffer.toDataURL("image/png");
  }

  function resize() {
    resizeCanvas();
    resetWorld();
  }

  return {
    resize,
    resetWorld,
    step,
    render,
    exportInk,
    setMode: applyMode,
    getMode: () => currentMode,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
