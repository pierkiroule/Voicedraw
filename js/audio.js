export function createAudioEngine() {
  const audio = {
    on: false,
    ctx: null,
    analyser: null,
    data: null,
    energy: 0,
    low: 0,
    high: 0,
  };

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;

      const src = ac.createMediaStreamSource(stream);
      src.connect(analyser);

      audio.ctx = ac;
      audio.analyser = analyser;
      audio.data = new Uint8Array(analyser.frequencyBinCount);
      audio.on = true;
      return { ok: true };
    } catch (error) {
      audio.on = false;
      return { ok: false, error };
    }
  }

  function update() {
    if (!audio.on || !audio.analyser) {
      audio.energy += (0.12 - audio.energy) * 0.03;
      audio.low += (0.1 - audio.low) * 0.03;
      audio.high += (0.1 - audio.high) * 0.03;
      return;
    }

    audio.analyser.getByteFrequencyData(audio.data);

    let lowSum = 0;
    let lowN = 0;
    for (let i = 2; i < 40; i += 1) {
      lowSum += audio.data[i];
      lowN += 1;
    }

    let highSum = 0;
    let highN = 0;
    for (let i = 150; i < 260 && i < audio.data.length; i += 1) {
      highSum += audio.data[i];
      highN += 1;
    }

    const low = (lowSum / Math.max(1, lowN)) / 255;
    const high = (highSum / Math.max(1, highN)) / 255;
    const energy = Math.min(1, low * 0.75 + high * 0.35);

    audio.low += (low - audio.low) * 0.12;
    audio.high += (high - audio.high) * 0.12;
    audio.energy += (energy - audio.energy) * 0.1;
  }

  function getState() {
    return {
      on: audio.on,
      energy: audio.energy,
      low: audio.low,
      high: audio.high,
    };
  }

  return {
    start,
    update,
    getState,
  };
}
