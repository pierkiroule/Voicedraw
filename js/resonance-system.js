const TAP_WINDOW = 320;
const TAP_DISTANCE = 36;
const LONG_PRESS_TIME = 0.5;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function createResonanceSystem({ ball, screenToWorld }) {
  const pointer = {
    down: false,
    id: null,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    pressure: 0,
    downAt: 0,
    target: "world",
    moved: false,
    longPressArmed: false,
    lastTapAt: 0,
    lastTapX: 0,
    lastTapY: 0,
  };

  const state = {
    echoBoostUntil: 0,
    lastAudio: null,
  };

  const events = [];

  function emit(event) {
    events.push({ age: 0, ...event });
  }

  function updateEvents(dt) {
    for (let i = events.length - 1; i >= 0; i -= 1) {
      const event = events[i];
      event.age += dt;
      if (event.age >= event.ttl) {
        events.splice(i, 1);
      }
    }
  }

  function handlePointerDown(event) {
    const now = performance.now();
    pointer.down = true;
    pointer.id = event.pointerId;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.pressure = event.pressure ?? 0.5;
    pointer.downAt = now;
    pointer.moved = false;
    pointer.longPressArmed = true;

    const tapDx = event.clientX - pointer.lastTapX;
    const tapDy = event.clientY - pointer.lastTapY;
    const tapDist = Math.hypot(tapDx, tapDy);
    const isDoubleTap = now - pointer.lastTapAt < TAP_WINDOW && tapDist < TAP_DISTANCE;

    const w = screenToWorld(event.clientX, event.clientY);
    const onBall = dist2(w.x, w.y, ball.x, ball.y) <= ball.r * ball.r * 3.2;
    pointer.target = onBall ? "ball" : "world";

    if (isDoubleTap) {
      pointer.lastTapAt = 0;
      state.echoBoostUntil = now + 1100;
      emit({
        type: "doubleTapPulse",
        origin: { x: ball.x, y: ball.y },
        intensity: 0.9,
        tone: 0.5,
        ttl: 0.7,
      });
      return;
    }

    pointer.lastTapAt = now;
    pointer.lastTapX = event.clientX;
    pointer.lastTapY = event.clientY;

    emit({
      type: "pressPulse",
      origin: { x: w.x, y: w.y },
      target: { x: ball.x, y: ball.y },
      intensity: 0.4,
      tone: 0.4,
      ttl: 0.35,
    });
  }

  function handlePointerMove(event) {
    if (!pointer.down || event.pointerId !== pointer.id) return;

    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;
    const speed = Math.hypot(dx, dy);
    pointer.moved = pointer.moved || speed > 2;

    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.pressure = event.pressure ?? pointer.pressure;

    if (speed > 0.5) {
      const audioState = state.lastAudio;
      const vibrato = audioState?.on && audioState.centroid > 0.55;
      const start = screenToWorld(pointer.lastX - dx, pointer.lastY - dy);
      const end = screenToWorld(pointer.lastX, pointer.lastY);
      emit({
        type: vibrato ? "dragVibrato" : "dragTrace",
        origin: start,
        target: end,
        intensity: clamp(speed / 30, 0.2, 1),
        tone: audioState?.centroid ?? 0.5,
        ttl: 0.25,
      });
    }
  }

  function handlePointerUp(event) {
    if (event.pointerId !== pointer.id) return;

    const now = performance.now();
    const duration = (now - pointer.downAt) / 1000;
    const w = screenToWorld(pointer.x, pointer.y);
    const audioState = state.lastAudio;
    const voiceActive = audioState?.on && audioState.energy > 0.02;

    if (!pointer.longPressArmed && duration > LONG_PRESS_TIME) {
      pointer.down = false;
      return;
    }

    if (!pointer.moved && duration < LONG_PRESS_TIME) {
      if (pointer.target === "ball") {
        const splashCount = 6 + Math.floor(Math.random() * 7);
        emit({
          type: "ballSplash",
          origin: { x: ball.x, y: ball.y },
          intensity: 0.9,
          tone: 0.25,
          ttl: 0.45 + Math.random() * 0.15,
          splashes: Array.from({ length: splashCount }, () => ({
            angle: Math.random() * Math.PI * 2,
            radius: 22 + Math.random() * 26,
            rx: 10 + Math.random() * 18,
            ry: 6 + Math.random() * 14,
            rotation: Math.random() * Math.PI,
          })),
        });
      } else {
        emit({
          type: "tapWave",
          origin: { x: w.x, y: w.y },
          target: { x: ball.x, y: ball.y },
          intensity: 0.7,
          tone: 0.35,
          ttl: 0.6,
        });
        if (voiceActive) {
          emit({
            type: "tapWave",
            origin: { x: w.x, y: w.y },
            target: { x: ball.x, y: ball.y },
            intensity: clamp(0.5 + audioState.energy, 0.5, 1),
            tone: audioState.centroid,
            ttl: 0.55,
            phase: 0.35,
          });
        }
      }
    }

    pointer.down = false;
    pointer.id = null;
    pointer.longPressArmed = false;
  }

  function update(dt, audioState) {
    updateEvents(dt);
    state.lastAudio = audioState;

    const now = performance.now();
    const voiceActive = audioState.on && audioState.energy > 0.02;
    const boost = now < state.echoBoostUntil ? 1.35 : 1;

    if (voiceActive) {
      emit({
        type: "voiceHalo",
        origin: { x: ball.x, y: ball.y },
        intensity: clamp(audioState.energy * boost, 0, 1),
        tone: audioState.centroid,
        ttl: 0.25,
      });

      if (audioState.attack > 0.08) {
        const burstCount = 6 + Math.floor(audioState.attack * 10);
        emit({
          type: "voiceAttack",
          origin: { x: ball.x, y: ball.y },
          intensity: clamp(audioState.attack * boost * 2, 0.3, 1),
          tone: audioState.centroid,
          ttl: 0.3,
          splashes: Array.from({ length: burstCount }, () => ({
            angle: Math.random() * Math.PI * 2,
            radius: 18 + Math.random() * 30,
            rx: 6 + Math.random() * 12,
            ry: 4 + Math.random() * 8,
            rotation: Math.random() * Math.PI,
          })),
        });
      }
    }

    if (pointer.down) {
      const held = (now - pointer.downAt) / 1000;
      const w = screenToWorld(pointer.x, pointer.y);
      if (held >= LONG_PRESS_TIME) {
        pointer.longPressArmed = false;
        emit({
          type: "longPressInk",
          origin: { x: w.x, y: w.y },
          intensity: clamp(0.6 + held * 0.15, 0.6, 1),
          tone: audioState.low,
          ttl: 0.22,
        });
      } else {
        emit({
          type: "pressPulse",
          origin: { x: w.x, y: w.y },
          target: { x: ball.x, y: ball.y },
          intensity: 0.3,
          tone: 0.4,
          ttl: 0.2,
        });
      }
    }

  }

  function reset() {
    events.length = 0;
    pointer.down = false;
    pointer.id = null;
    pointer.moved = false;
    pointer.longPressArmed = false;
    state.echoBoostUntil = 0;
  }

  return {
    update,
    reset,
    getEvents: () => events,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
