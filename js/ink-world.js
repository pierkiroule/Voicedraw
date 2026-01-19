export function createInkWorld(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const BG = "#f4f1ea";

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
  };

  const ripples = [];
  const droplets = [];
  const wobble = {
    time: 0,
    strength: 0,
  };

  const inkBuffer = document.createElement("canvas");
  const inkCtx = inkBuffer.getContext("2d");

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
    inkCtx.fillStyle = BG;
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
    ctx.fillStyle = BG;
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
      ball.x += (w.x - ball.x) * 0.35;
      ball.y += (w.y - ball.y) * 0.35;
      ball.vx += dx * 0.06;
      ball.vy += dy * 0.06;
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
    const palette = [
      { core: "rgba(248, 183, 62, 0.5)", edge: "rgba(255, 129, 48, 0.0)" },
      { core: "rgba(142, 126, 245, 0.5)", edge: "rgba(76, 66, 190, 0.0)" },
    ];
    const choice = palette[Math.floor(Math.random() * palette.length)];
    droplets.push({
      x: wx,
      y: wy,
      age: 0,
      life: 1.6,
      core: choice.core,
      edge: choice.edge,
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

  function applyForces(dt, audio) {
    const friction = 0.99;
    ball.vx *= friction;
    ball.vy *= friction;

    const smooth = 1 - Math.pow(0.001, dt);
    audioSmooth.energy += (audio.energy - audioSmooth.energy) * smooth;
    audioSmooth.low += (audio.low - audioSmooth.low) * smooth;
    audioSmooth.high += (audio.high - audioSmooth.high) * smooth;

    const t = performance.now() * 0.0006;
    const driftX = Math.cos(t) * 0.6 + Math.sin(t * 0.73) * 0.4;
    const driftY = Math.sin(t) * 0.6 + Math.cos(t * 0.91) * 0.4;
    const drift = 28;
    ball.vx += driftX * drift * dt;
    ball.vy += driftY * drift * dt;

    const push = 160 * audioSmooth.energy;
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
      const falloff = 1 / (1 + dist * 0.015);
      const impulse = 180 * ripple.strength * wave * falloff;
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
      const wobbleDecay = Math.exp(-dt * 2.6);
      wobble.strength *= wobbleDecay;
      const wobbleForce = 45 * wobble.strength;
      ball.vx += Math.cos(wobble.time) * wobbleForce * dt;
      ball.vy += Math.sin(wobble.time * 1.2) * wobbleForce * dt;
    }

    ball.inkR = 7 + Math.pow(audioSmooth.energy, 1.6) * 28;
    ball.r = 9 + Math.pow(audioSmooth.energy, 1.2) * 8;

    const vmax = 900;
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

      const restitution = 0.78;
      ball.vx *= restitution;
      ball.vy *= restitution;

      const spin = 18;
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

    inkCtx.save();
    inkCtx.beginPath();
    inkCtx.arc(inkBuffer.width * 0.5, inkBuffer.height * 0.5, world.R, 0, Math.PI * 2);
    inkCtx.clip();

    const grad = inkCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    grad.addColorStop(0, "rgba(10,10,12,0.22)");
    grad.addColorStop(1, "rgba(10,10,12,0.00)");
    inkCtx.fillStyle = grad;
    inkCtx.beginPath();
    inkCtx.arc(b.x, b.y, r, 0, Math.PI * 2);
    inkCtx.fill();

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
    ctx.fillStyle = "#cc2222";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawDroplets() {
    for (let i = droplets.length - 1; i >= 0; i -= 1) {
      const drop = droplets[i];
      const t = drop.age / drop.life;
      if (t >= 1) {
        droplets.splice(i, 1);
        continue;
      }
      const p = worldToScreen(drop.x, drop.y);
      const swell = 1 + t * 0.6;
      const stretch = 1 + Math.sin(t * Math.PI) * 0.9;
      const radius = 22 + t * 30;
      const angle = t * Math.PI * 0.8;
      const alpha = (1 - t) * 0.85;

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
    for (let i = droplets.length - 1; i >= 0; i -= 1) {
      const drop = droplets[i];
      drop.age += dt;
      if (drop.age >= drop.life) {
        droplets.splice(i, 1);
      }
    }
  }

  function render() {
    ctx.fillStyle = BG;
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
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
