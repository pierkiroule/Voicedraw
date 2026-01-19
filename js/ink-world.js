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
  };

  const inkBuffer = document.createElement("canvas");
  const inkCtx = inkBuffer.getContext("2d");

  function resizeCanvas() {
    canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
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

    const w = screenToWorld(event.clientX, event.clientY);
    const d = dist2(w.x, w.y, ball.x, ball.y);
    pointer.draggingBall = d <= ball.r * ball.r * 5;
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
    if (pointer.draggingBall) {
      ball.vx += pointer.vx * 0.12;
      ball.vy += pointer.vy * 0.12;
    }
    pointer.draggingBall = false;
  }

  function applyForces(dt, audio) {
    const friction = 0.985;
    ball.vx *= friction;
    ball.vy *= friction;

    const push = 220 * audio.energy;
    ball.vx += (audio.high - audio.low) * push * dt;
    ball.vy += Math.sin(performance.now() * 0.002) * 0.15 * push * dt;

    ball.inkR = 6 + Math.pow(audio.energy, 1.8) * 34;
    ball.r = 8 + Math.pow(audio.energy, 1.2) * 10;

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

      const restitution = 0.92;
      ball.vx *= restitution;
      ball.vy *= restitution;

      const spin = 40;
      ball.vx += -ny * spin * (0.5 - Math.random());
      ball.vy += nx * spin * (0.5 - Math.random());
    }
  }

  function updateCamera() {
    cam.x = ball.x - view.w() * 0.5;
    cam.y = ball.y - view.h() * 0.5;
  }

  function stampInkToBuffer() {
    const b = worldToBuffer(ball.x, ball.y);
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

  function step(dt, audio) {
    applyForces(dt, audio);
    integrate(dt);
    bounceInCircle();
    updateCamera();
    stampInkToBuffer();
  }

  function render() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, view.w(), view.h());
    drawInkBufferToScreen();
    drawWorldBorder();
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
