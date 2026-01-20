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
  const wander = {
    angle: Math.random() * Math.PI * 2,
    targetAngle: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.6,
    targetSpeed: 0.4 + Math.random() * 0.6,
    nextChange: 0,
  };
  const rescue = {
    nextKickAt: 0,
  };

  function updateWander(now) {
    if (now >= wander.nextChange) {
      wander.targetAngle = Math.random() * Math.PI * 2;
      wander.targetSpeed = 0.35 + Math.random() * 0.9;
      wander.nextChange = now + 1400 + Math.random() * 2200;
    }
    wander.angle += (wander.targetAngle - wander.angle) * 0.015;
    wander.speed += (wander.targetSpeed - wander.speed) * 0.02;
    return {
      x: Math.cos(wander.angle) * wander.speed,
      y: Math.sin(wander.angle) * wander.speed,
    };
  }

  function applyForces(dt, audio, pointerState) {
    const friction = modeState.mode.physics.friction;
    ball.vx *= friction;
    ball.vy *= friction;

    const smooth = 1 - Math.pow(0.001, dt);
    const expressivity = audio.expressivity ?? 1;
    const scaledEnergy = Math.min(1, audio.energy * expressivity);
    audioSmooth.energy += (scaledEnergy - audioSmooth.energy) * smooth;
    audioSmooth.low += (audio.low - audioSmooth.low) * smooth;
    audioSmooth.high += (audio.high - audioSmooth.high) * smooth;

    const now = performance.now();
    const t = now * 0.0006;
    const driftX = Math.cos(t) * 0.6 + Math.sin(t * 0.73) * 0.4;
    const driftY = Math.sin(t) * 0.6 + Math.cos(t * 0.91) * 0.4;
    const drift = modeState.mode.physics.drift;
    const freeMove = !pointerState?.down;
    const freeBoost = freeMove ? 1.25 : 1;
    ball.vx += driftX * drift * dt * freeBoost;
    ball.vy += driftY * drift * dt * freeBoost;

    const audioBoost = 1 + audioSmooth.energy * 1.6 * expressivity;
    const push = modeState.mode.physics.push * audioSmooth.energy * expressivity * audioBoost;
    const audioTilt = audioSmooth.high - audioSmooth.low;
    ball.vx += audioTilt * push * dt;
    ball.vy += Math.sin(performance.now() * 0.0014) * 0.25 * push * dt;

    if (freeMove) {
      const flow = updateWander(now);
      const wanderForce = modeState.mode.physics.wander ?? 120;
      const audioWander = 1 + audioSmooth.energy * 2.2;
      ball.vx += flow.x * wanderForce * dt * audioWander;
      ball.vy += flow.y * wanderForce * dt * audioWander;
    }

    const gyro = audio?.gyro;
    if (gyro?.enabled) {
      const gyroStrength = modeState.mode.physics.gyroStrength ?? 85;
      ball.vx += gyro.x * gyroStrength * dt;
      ball.vy += gyro.y * gyroStrength * dt;
    }

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

    const vibe = (audio.attack * 26 + audio.energy * 18) * expressivity;
    ball.traceOffset.x = Math.sin(now * 0.025 + audio.centroid * 7) * vibe;
    ball.traceOffset.y = Math.cos(now * 0.022 + audio.centroid * 5) * vibe;

    const vmax =
      modeState.mode.physics.maxSpeed *
      (freeMove ? 1.35 : 1) *
      (1 + audioSmooth.energy * 0.6 * expressivity);
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

  function rescueSlowBall(audio = { energy: 0 }) {
    const now = performance.now();
    if (now < rescue.nextKickAt) return;
    const dx = world.cx - ball.x;
    const dy = world.cy - ball.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = Math.hypot(ball.vx, ball.vy);
    const edgeGap = world.R - ball.r - dist;
    const nearEdge = edgeGap < 26;
    const nearCenter = dist < Math.max(40, world.R * 0.06);
    const farFromCenter = dist > world.R * 0.35;

    if (speed > 18 || (!nearEdge && !nearCenter && !farFromCenter)) return;

    rescue.nextKickAt = now + 450 + Math.random() * 450;
    let nx = dx / dist;
    let ny = dy / dist;
    if (nearCenter) {
      const angle = Math.random() * Math.PI * 2;
      nx = Math.cos(angle);
      ny = Math.sin(angle);
    }
    const strength = (nearEdge ? 240 : 160) + audio.energy * 140;
    ball.vx += nx * strength;
    ball.vy += ny * strength;
  }

  function bounceInCircle(audio = { energy: 0 }) {
    const dx = ball.x - world.cx;
    const dy = ball.y - world.cy;
    const d = Math.hypot(dx, dy);
    const limit = world.R - ball.r;

    if (d > limit) {
      const nx = dx / (d || 1);
      const ny = dy / (d || 1);
      const tx = -ny;
      const ty = nx;

      ball.x = world.cx + nx * limit;
      ball.y = world.cy + ny * limit;

      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;

      const tangent = ball.vx * tx + ball.vy * ty;
      ball.vx -= tangent * tx * 0.4;
      ball.vy -= tangent * ty * 0.4;

      const restitution = modeState.mode.physics.restitution + audio.energy * 0.12;
      ball.vx *= restitution;
      ball.vy *= restitution;

      const spin = modeState.mode.physics.spin;
      ball.vx += -ny * spin;
      ball.vy += nx * spin;

      const edgePush = 140 + audio.energy * 180;
      ball.vx -= nx * edgePush;
      ball.vy -= ny * edgePush;
    }
  }

  return {
    applyForces,
    integrate,
    rescueSlowBall,
    bounceInCircle,
  };
}
