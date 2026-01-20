export function createPhysics({
  modeState,
  world,
  ball,
  pointer,
  ripples,
  wobble,
  audioSmooth,
  screenToWorld,
  triggerLongPress,
}) {
  function applyForces(dt, audio) {
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
      const falloff = 1 / (1 + dist * modeState.mode.physics.rippleFalloff);
      const impulse = modeState.mode.physics.rippleImpulse * ripple.strength * wave * falloff;
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
      const wobbleDecay = Math.exp(-dt * modeState.mode.physics.wobbleDecay);
      wobble.strength *= wobbleDecay;
      const wobbleForce = modeState.mode.physics.wobbleForce * wobble.strength;
      ball.vx += Math.cos(wobble.time) * wobbleForce * dt;
      ball.vy += Math.sin(wobble.time * 1.2) * wobbleForce * dt;
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
