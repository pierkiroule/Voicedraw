export function createRenderer({
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
}) {
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
    inkCtx.fillStyle = modeState.background;
    inkCtx.fillRect(0, 0, inkBuffer.width, inkBuffer.height);
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
    const baseRadius = modeState.mode.watercolor.baseRadius + Math.random() * modeState.mode.watercolor.jitter;
    const ringCount =
      modeState.mode.watercolor.ringMin +
      Math.floor(Math.random() * (modeState.mode.watercolor.ringMax - modeState.mode.watercolor.ringMin + 1));

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
    ctx.fillStyle = modeState.mode.ball.fill;
    ctx.fill();
    ctx.strokeStyle = modeState.mode.ball.stroke;
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

  function render() {
    ctx.fillStyle = modeState.background;
    ctx.fillRect(0, 0, view.w(), view.h());
    drawInkBufferToScreen();
    drawWorldBorder();
    drawDroplets();
    drawBall();
  }

  return {
    resizeCanvas,
    resizeInkBuffer,
    stampWatercolorAt,
    stampInkToBuffer,
    render,
  };
}
