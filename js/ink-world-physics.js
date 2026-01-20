export function createPhysics({
  modeState,
  world,
  ball,
}) {
  const audioSmooth = {
    energy: 0,
    low: 0,
    high: 0,
  };

  function applyForces(dt, audio, pointerState) {
    const friction = modeState.mode.physics.friction;
    ball.vx *= friction;
    ball.vy *= friction;

    const smooth = 1 - Math.pow(0.001, dt);
    audioSmooth.energy += (audio.energy - audioSmooth.energy) * smooth;
    audioSmooth.low += (audio.low - audioSmooth.low) * smooth;
    audioSmooth.high += (audio.high - audioSmooth.high) * smooth;

    const t = performance.now() * 0.0006;
    const driftX = Math.cos(t) * 0.6 + Math.sin(t * 0.73) * 0.4;
    const driftY = Math.sin(t) * 0.6 + Math.cos(t * 0.91) * 0.4;
    const drift = modeState.mode.physics.drift;
    ball.vx += driftX * drift * dt;
    ball.vy += driftY * drift * dt;

    const push = modeState.mode.physics.push * audioSmooth.energy;
    const audioTilt = audioSmooth.high - audioSmooth.low;
    ball.vx += audioTilt * push * dt;
    ball.vy += Math.sin(performance.now() * 0.0014) * 0.2 * push * dt;

    if (pointerState?.down && pointerState.draggingBall) {
      const wx = pointerState.world.x;
      const wy = pointerState.world.y;
      ball.x = wx;
      ball.y = wy;
      ball.vx = 0;
      ball.vy = 0;
      return;
    }

    if (pointerState?.tapImpulse) {
      ball.vx += pointerState.tapImpulse.vx;
      ball.vy += pointerState.tapImpulse.vy;
    }

    if (pointerState?.flingImpulse) {
      ball.vx += pointerState.flingImpulse.vx;
      ball.vy += pointerState.flingImpulse.vy;
    }

    ball.inkR =
      modeState.mode.inkRadius.base +
      Math.pow(audioSmooth.energy, modeState.mode.inkRadius.power) * modeState.mode.inkRadius.energyScale;
    ball.r =
      modeState.mode.ballRadius.base +
      Math.pow(audioSmooth.energy, modeState.mode.ballRadius.power) * modeState.mode.ballRadius.energyScale;

    const vmax = modeState.mode.physics.maxSpeed;
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

      const restitution = modeState.mode.physics.restitution;
      ball.vx *= restitution;
      ball.vy *= restitution;

      const spin = modeState.mode.physics.spin;
      ball.vx += -ny * spin;
      ball.vy += nx * spin;
    }
  }

  return {
    applyForces,
    integrate,
    bounceInCircle,
  };
}
