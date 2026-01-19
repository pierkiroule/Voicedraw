import { createAudioEngine } from "./audio.js";
import { createInkWorld } from "./ink-world.js";

const canvas = document.getElementById("c");
const micDot = document.getElementById("micDot");
const micTxt = document.getElementById("micTxt");
const btnMic = document.getElementById("btnMic");
const btnClear = document.getElementById("btnClear");
const btnExport = document.getElementById("btnExport");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));

const audio = createAudioEngine();
const world = createInkWorld(canvas);

function setModeUI(mode) {
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function handleModeClick(event) {
  const { mode } = event.currentTarget.dataset;
  if (!mode) return;
  world.setMode(mode);
  setModeUI(mode);
}

function setMicUI(isOn, text) {
  micDot.classList.toggle("on", isOn);
  micTxt.textContent = text;
  btnMic.textContent = isOn ? "Micro actif" : "Activer micro";
}

async function handleMicClick() {
  if (audio.getState().on) return;
  const result = await audio.start();
  if (result.ok) {
    setMicUI(true, "On");
  } else {
    setMicUI(false, "Refusé");
  }
}

function handleExport() {
  const link = document.createElement("a");
  link.download = "sgraffito-cercle.png";
  link.href = world.exportInk();
  link.click();
}

function handleResize() {
  world.resize();
}

btnMic.addEventListener("click", handleMicClick);
btnClear.addEventListener("click", world.resetWorld);
btnExport.addEventListener("click", handleExport);
modeButtons.forEach((button) => button.addEventListener("click", handleModeClick));

canvas.addEventListener("pointerdown", world.handlePointerDown);
canvas.addEventListener("pointermove", world.handlePointerMove);
canvas.addEventListener("pointerup", world.handlePointerUp);
canvas.addEventListener("pointercancel", world.handlePointerUp);

window.addEventListener("resize", handleResize);
world.resize();
setModeUI(world.getMode());

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  audio.update();
  world.step(dt, audio.getState());
  world.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
