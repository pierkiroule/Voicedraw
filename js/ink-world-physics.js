export function createPhysics({
  modeState,
  world,
  ball,
}) {
  function applyForces(dt) {
    const friction = modeState.mode.physics.friction;
    ball.vx *= friction;
    ball.vy *= friction;

    const t = performance.now() * 0.0006;
    const driftX = Math.cos(t) * 0.6 + Math.sin(t * 0.73) * 0.4;
    const driftY = Math.sin(t) * 0.6 + Math.cos(t * 0.91) * 0.4;
    const drift = modeState.mode.physics.drift;
    ball.vx += driftX * drift * dt;
    ball.vy += driftY * drift * dt;

    ball.inkR = modeState.mode.inkRadius.base;
    ball.r = modeState.mode.ballRadius.base;

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
