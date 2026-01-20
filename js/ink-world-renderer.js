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
  worldToBuffer,
  worldToScreen,
  getInkStops,
  getWatercolorPick,
}) {
  let lastAudio = {
    energy: 0,
    low: 0,
    mid: 0,
    high: 0,
    centroid: 0.5,
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function makeRgba(color, alphaScale = 1) {
    const alpha = clamp(color.alpha * alphaScale, 0, 1);
    return `rgba(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${alpha})`;
  }

  function fadeByAge(event) {
    return Math.max(0, 1 - event.age / event.ttl);
  }

  function setAudioState(audio) {
    if (!audio) return;
    lastAudio = {
      energy: audio.energy ?? 0,
      low: audio.low ?? 0,
      mid: audio.mid ?? 0,
      high: audio.high ?? 0,
      centroid: audio.centroid ?? 0.5,
    };
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
    inkCtx.fillStyle = modeState.background;
    inkCtx.fillRect(0, 0, inkBuffer.width, inkBuffer.height);
  }

  function stampInkAt(wx, wy) {
    const b = worldToBuffer(wx, wy);
    const r = ball.inkR;
    const stops = getInkStops(wx, wy);
    const bands = modeState.mode.inkBands;

    inkCtx.save();
    inkCtx.beginPath();
    inkCtx.arc(inkBuffer.width * 0.5, inkBuffer.height * 0.5, world.R, 0, Math.PI * 2);
    inkCtx.clip();

    if (bands?.length === 3) {
      const audioBands = [lastAudio.low, lastAudio.mid, lastAudio.high];
      for (let i = 0; i < bands.length; i += 1) {
        const band = bands[i];
        const drift = (Math.sin(performance.now() * 0.003 + i * 1.7) + 1) * 0.08;
        const intensity = clamp(audioBands[i] * 1.35 + drift + lastAudio.energy * 0.15, 0.08, 1);
        const radius = r * (0.7 + i * 0.22 + intensity * 0.35);
        const grad = inkCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
        grad.addColorStop(0, makeRgba(band.core, intensity));
        grad.addColorStop(1, makeRgba(band.edge, intensity * 0.9));
        inkCtx.fillStyle = grad;
        inkCtx.beginPath();
        inkCtx.arc(b.x, b.y, radius, 0, Math.PI * 2);
        inkCtx.fill();
      }
    } else {
      const grad = inkCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      grad.addColorStop(0, stops.core);
      grad.addColorStop(1, stops.edge);
      inkCtx.fillStyle = grad;
      inkCtx.beginPath();
      inkCtx.arc(b.x, b.y, r, 0, Math.PI * 2);
      inkCtx.fill();
    }

    inkCtx.restore();
  }

  function stampInkSmearAt(wx, wy) {
    const b = worldToBuffer(wx, wy);
    const smearRadius = 8 + Math.random() * 18;
    const angle = Math.random() * Math.PI;
    const stretch = 1.2 + Math.random() * 1.6;

    inkCtx.save();
    inkCtx.beginPath();
    inkCtx.arc(inkBuffer.width * 0.5, inkBuffer.height * 0.5, world.R, 0, Math.PI * 2);
    inkCtx.clip();

    inkCtx.translate(b.x, b.y);
    inkCtx.rotate(angle);
    inkCtx.scale(stretch, 1);
    const grad = inkCtx.createRadialGradient(0, 0, smearRadius * 0.1, 0, 0, smearRadius);
    grad.addColorStop(0, "rgba(18, 16, 14, 0.55)");
    grad.addColorStop(1, "rgba(18, 16, 14, 0)");
    inkCtx.fillStyle = grad;
    inkCtx.beginPath();
    inkCtx.ellipse(0, 0, smearRadius, smearRadius * 0.6, 0, 0, Math.PI * 2);
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

  function stampCrystallizedStroke(start, end, intensity) {
    const count = 2 + Math.floor(intensity * 4);
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      const pick = getWatercolorPick?.(x + i * 3, y - i * 2) ?? getInkStops(x, y);
      stampWatercolorAt(x, y, pick);
    }
  }

  function stampInkToBuffer() {
    const traceX = ball.x + (ball.traceOffset?.x ?? 0);
    const traceY = ball.y + (ball.traceOffset?.y ?? 0);
    const dx = traceX - lastStamp.x;
    const dy = traceY - lastStamp.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(1, ball.inkR * 0.35);
    const count = Math.max(1, Math.ceil(dist / step));

    for (let i = 1; i <= count; i += 1) {
      const t = i / count;
      stampInkAt(lastStamp.x + dx * t, lastStamp.y + dy * t);
    }

    lastStamp.x = traceX;
    lastStamp.y = traceY;
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

  function renderPersistent() {
    ctx.fillStyle = modeState.background;
    ctx.fillRect(0, 0, view.w(), view.h());
    drawInkBufferToScreen();
    drawWorldBorder();
  }

  function renderTapWave(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const target = worldToScreen(event.target.x, event.target.y);
    const t = event.age / event.ttl;
    const phase = event.phase ?? 0;
    const driftX = (target.x - p.x) * t * 0.2;
    const driftY = (target.y - p.y) * t * 0.2;
    const radius = 40 + event.intensity * 90 + Math.sin((t + phase) * Math.PI * 2) * 6;
    const scaled = radius * (1 - t * 0.4);
    const distance = Math.hypot(target.x - p.x, target.y - p.y);
    const warm = Math.min(1, distance / 300);
    const coldColor = `rgba(80, 140, 210, ${0.35 + event.intensity * 0.15})`;
    const warmColor = `rgba(240, 140, 80, ${0.3 + warm * 0.2})`;

    ctx.save();
    ctx.translate(p.x + driftX, p.y + driftY);
    ctx.globalAlpha = fadeByAge(event);
    const grad = ctx.createRadialGradient(0, 0, scaled * 0.2, 0, 0, scaled);
    grad.addColorStop(0, coldColor);
    grad.addColorStop(1, warmColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, scaled, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderBallSplash(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const t = event.age / event.ttl;
    const fade = fadeByAge(event);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade;

    event.splashes.forEach((splash) => {
      const dist = splash.radius * (0.6 + t * 0.6);
      const sx = Math.cos(splash.angle) * dist;
      const sy = Math.sin(splash.angle) * dist;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(splash.rotation);
      const grad = ctx.createRadialGradient(0, 0, splash.rx * 0.1, 0, 0, splash.rx * 1.2);
      grad.addColorStop(0, "rgba(30, 30, 30, 0.85)");
      grad.addColorStop(0.6, "rgba(140, 140, 140, 0.55)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, splash.rx, splash.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  function renderDoubleTapPulse(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const t = event.age / event.ttl;
    const fade = fadeByAge(event);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade * 0.6;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r + t * 120, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = fade * 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r + t * 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function renderLongPress(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const t = event.age / event.ttl;
    const fade = fadeByAge(event);
    const radius = 40 + event.intensity * 70;
    const dark = clamp(0.2 + event.tone * 0.6, 0.2, 0.8);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade * 0.7;
    const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
    grad.addColorStop(0, `rgba(20, 20, 20, ${dark})`);
    grad.addColorStop(1, "rgba(20, 20, 20, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1 + t * 0.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderVoiceHalo(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const t = event.age / event.ttl;
    const fade = fadeByAge(event);
    const radius = ball.r + 30 + event.intensity * 120;
    const thickness = 8 + (1 - event.tone) * 18;
    const glow = event.tone > 0.6 ? 0.4 : 0.25;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade * (0.35 + event.intensity * 0.25);
    ctx.strokeStyle = `rgba(60, 60, 60, ${glow})`;
    ctx.lineWidth = thickness * (1 - t * 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.9 + 0.1 * Math.sin(performance.now() * 0.002)), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function renderVoiceAttack(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const fade = fadeByAge(event);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + event.intensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r + event.intensity * 20, 0, Math.PI * 2);
    ctx.fill();

    event.splashes.forEach((splash) => {
      const dist = splash.radius;
      const sx = Math.cos(splash.angle) * dist;
      const sy = Math.sin(splash.angle) * dist;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(splash.rotation);
      ctx.globalAlpha = fade * 0.8;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(0, 0, splash.rx, splash.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  function renderDragTrace(event) {
    const p0 = worldToScreen(event.origin.x, event.origin.y);
    const p1 = worldToScreen(event.target.x, event.target.y);
    const fade = fadeByAge(event);
    const width = 1 + event.intensity * 3;
    const jitter = event.type === "dragVibrato" ? 4 + event.intensity * 10 : 0;
    if (event.type === "dragVibrato" && !event.persisted && event.age > event.ttl * 0.85) {
      stampCrystallizedStroke(event.origin, event.target, event.intensity);
      event.persisted = true;
    }

    ctx.save();
    ctx.globalAlpha = fade * 0.7;
    ctx.strokeStyle = "rgba(40, 40, 40, 0.5)";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x + Math.sin(event.age * 50) * jitter, p0.y + Math.cos(event.age * 40) * jitter);
    ctx.lineTo(p1.x - Math.cos(event.age * 45) * jitter, p1.y + Math.sin(event.age * 35) * jitter);
    ctx.stroke();
    ctx.restore();
  }

  function renderPressPulse(event) {
    const p = worldToScreen(event.origin.x, event.origin.y);
    const fade = fadeByAge(event);
    const radius = 14 + event.intensity * 40;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = fade * 0.5;
    ctx.strokeStyle = "rgba(40, 40, 40, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function renderResonanceEvents(events) {
    events.forEach((event) => {
      switch (event.type) {
        case "tapWave":
          renderTapWave(event);
          break;
        case "ballSplash":
          renderBallSplash(event);
          break;
        case "doubleTapPulse":
          renderDoubleTapPulse(event);
          break;
        case "longPressInk":
          renderLongPress(event);
          break;
        case "voiceHalo":
          renderVoiceHalo(event);
          break;
        case "voiceAttack":
          renderVoiceAttack(event);
          break;
        case "dragTrace":
        case "dragVibrato":
          renderDragTrace(event);
          break;
        case "pressPulse":
          renderPressPulse(event);
          break;
        default:
          break;
      }
    });
  }

  function renderBall() {
    drawBall();
  }

  return {
    setAudioState,
    resizeCanvas,
    resizeInkBuffer,
    stampWatercolorAt,
    stampInkToBuffer,
    stampInkSmearAt,
    renderPersistent,
    renderResonanceEvents,
    renderBall,
  };
}
