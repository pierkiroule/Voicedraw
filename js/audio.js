export function createAudioEngine() {
  const audio = {
    on: false,
    ctx: null,
    analyser: null,
    data: null,
    energy: 0,
    low: 0,
    mid: 0,
    high: 0,
    attack: 0,
    centroid: 0.5,
    prevEnergy: 0,
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
      audio.energy += (0 - audio.energy) * 0.1;
      audio.low += (0 - audio.low) * 0.1;
      audio.mid += (0 - audio.mid) * 0.1;
      audio.high += (0 - audio.high) * 0.1;
      audio.attack += (0 - audio.attack) * 0.2;
      audio.centroid += (0.5 - audio.centroid) * 0.08;
      audio.prevEnergy = audio.energy;
      return;
    }

    audio.analyser.getByteFrequencyData(audio.data);

    let lowSum = 0;
    let lowN = 0;
    for (let i = 2; i < 40; i += 1) {
      lowSum += audio.data[i];
      lowN += 1;
    }

    let midSum = 0;
    let midN = 0;
    for (let i = 40; i < 120 && i < audio.data.length; i += 1) {
      midSum += audio.data[i];
      midN += 1;
    }

    let highSum = 0;
    let highN = 0;
    for (let i = 150; i < 260 && i < audio.data.length; i += 1) {
      highSum += audio.data[i];
      highN += 1;
    }

    const low = (lowSum / Math.max(1, lowN)) / 255;
    const mid = (midSum / Math.max(1, midN)) / 255;
    const high = (highSum / Math.max(1, highN)) / 255;
    const energy = Math.min(1, low * 0.75 + high * 0.35);

    let centroidSum = 0;
    let centroidWeight = 0;
    for (let i = 0; i < audio.data.length; i += 1) {
      const v = audio.data[i];
      centroidSum += v * i;
      centroidWeight += v;
    }
    const centroidRaw = centroidWeight > 0 ? centroidSum / centroidWeight / (audio.data.length - 1) : 0.5;

    audio.low += (low - audio.low) * 0.12;
    audio.mid += (mid - audio.mid) * 0.12;
    audio.high += (high - audio.high) * 0.12;
    audio.energy += (energy - audio.energy) * 0.1;
    audio.centroid += (centroidRaw - audio.centroid) * 0.12;

    const attackRaw = Math.max(0, energy - audio.prevEnergy);
    audio.attack += (attackRaw - audio.attack) * 0.4;
    audio.prevEnergy = energy;
  }

  function getState() {
    return {
      on: audio.on,
      energy: audio.energy,
      low: audio.low,
      mid: audio.mid,
      high: audio.high,
      attack: audio.attack,
      centroid: audio.centroid,
    };
  }

  return {
    start,
    update,
    getState,
  };
}
