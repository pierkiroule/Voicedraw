import { createAudioEngine } from "./audio.js";
import { createInkWorld } from "./ink-world.js";

const canvas = document.getElementById("c");
const micDot = document.getElementById("micDot");
const micTxt = document.getElementById("micTxt");
const btnMic = document.getElementById("btnMic");
const btnClear = document.getElementById("btnClear");
const btnExport = document.getElementById("btnExport");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const expressivityPanel = document.getElementById("expressivityPanel");
const expressivityHandle = document.getElementById("expressivityHandle");
const expressivitySlider = document.getElementById("expressivitySlider");
const expressivityLabel = document.getElementById("expressivityLabel");

const audio = createAudioEngine();
const world = createInkWorld(canvas);

const expressivityLevels = [
  { label: "Faible", value: 0.7 },
  { label: "Moyen", value: 1 },
  { label: "Fort", value: 1.25 },
  { label: "Très fort", value: 1.55 },
];

let expressivity = expressivityLevels[1];
let panelPosition = { x: 20, y: 120 };
let dragOffset = { x: 0, y: 0 };
let draggingPanel = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setPanelPosition(nextX, nextY) {
  const maxX = Math.max(12, window.innerWidth - expressivityPanel.offsetWidth - 12);
  const maxY = Math.max(12, window.innerHeight - expressivityPanel.offsetHeight - 12);
  panelPosition = {
    x: clamp(nextX, 12, maxX),
    y: clamp(nextY, 12, maxY),
  };
  expressivityPanel.style.setProperty("--panel-x", `${panelPosition.x}px`);
  expressivityPanel.style.setProperty("--panel-y", `${panelPosition.y}px`);
}

function setExpressivityLevel(index) {
  const next = expressivityLevels[index] ?? expressivityLevels[1];
  expressivity = next;
  expressivityLabel.textContent = next.label;
}

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
  setPanelPosition(panelPosition.x, panelPosition.y);
}

btnMic.addEventListener("click", handleMicClick);
btnClear.addEventListener("click", world.resetWorld);
btnExport.addEventListener("click", handleExport);
modeButtons.forEach((button) => button.addEventListener("click", handleModeClick));

expressivitySlider.addEventListener("input", (event) => {
  setExpressivityLevel(Number(event.target.value));
});

expressivityHandle.addEventListener("pointerdown", (event) => {
  draggingPanel = true;
  dragOffset = {
    x: event.clientX - panelPosition.x,
    y: event.clientY - panelPosition.y,
  };
  expressivityPanel.classList.add("dragging");
  expressivityHandle.setPointerCapture(event.pointerId);
});

expressivityHandle.addEventListener("pointermove", (event) => {
  if (!draggingPanel) return;
  setPanelPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y);
});

function stopPanelDrag(event) {
  if (!draggingPanel) return;
  draggingPanel = false;
  expressivityPanel.classList.remove("dragging");
  if (event && expressivityHandle.hasPointerCapture(event.pointerId)) {
    expressivityHandle.releasePointerCapture(event.pointerId);
  }
}

expressivityHandle.addEventListener("pointerup", stopPanelDrag);
expressivityHandle.addEventListener("pointercancel", stopPanelDrag);

canvas.addEventListener("pointerdown", world.handlePointerDown);
canvas.addEventListener("pointermove", world.handlePointerMove);
canvas.addEventListener("pointerup", world.handlePointerUp);
canvas.addEventListener("pointercancel", world.handlePointerUp);

window.addEventListener("resize", handleResize);
world.resize();
setModeUI(world.getMode());
setExpressivityLevel(Number(expressivitySlider.value));
setPanelPosition(panelPosition.x, panelPosition.y);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  audio.update();
  const audioState = audio.getState();
  world.step(dt, { ...audioState, expressivity: expressivity.value });
  world.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
