import { createAudioEngine } from "./audio.js";
import { createInkWorld } from "./ink-world.js";

const canvas = document.getElementById("c");
const micDot = document.getElementById("micDot");
const micTxt = document.getElementById("micTxt");
const btnMic = document.getElementById("btnMic");
const btnClear = document.getElementById("btnClear");
const btnExport = document.getElementById("btnExport");
const btnGyro = document.getElementById("btnGyro");
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
const gyroState = {
  enabled: false,
  supported: "DeviceOrientationEvent" in window,
  x: 0,
  y: 0,
  smoothX: 0,
  smoothY: 0,
};

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

function setGyroUI() {
  if (!gyroState.supported) {
    btnGyro.textContent = "Gyro indisponible";
    btnGyro.disabled = true;
    return;
  }
  btnGyro.textContent = gyroState.enabled ? "Gyro actif" : "Activer gyroscope";
  btnGyro.classList.toggle("active", gyroState.enabled);
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

function handleOrientation(event) {
  if (!gyroState.enabled) return;
  const beta = event.beta ?? 0;
  const gamma = event.gamma ?? 0;
  gyroState.x = clamp(gamma / 35, -1, 1);
  gyroState.y = clamp(beta / 45, -1, 1);
}

async function handleGyroClick() {
  if (!gyroState.supported) return;
  if (gyroState.enabled) {
    gyroState.enabled = false;
    window.removeEventListener("deviceorientation", handleOrientation, true);
    setGyroUI();
    return;
  }

  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== "granted") {
        setGyroUI();
        return;
      }
    } catch (error) {
      setGyroUI();
      return;
    }
  }

  gyroState.enabled = true;
  window.addEventListener("deviceorientation", handleOrientation, true);
  setGyroUI();
}

function handleResize() {
  world.resize();
  setPanelPosition(panelPosition.x, panelPosition.y);
}

btnMic.addEventListener("click", handleMicClick);
btnClear.addEventListener("click", world.resetWorld);
btnExport.addEventListener("click", handleExport);
btnGyro.addEventListener("click", handleGyroClick);
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
setGyroUI();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  audio.update();
  const audioState = audio.getState();
  gyroState.smoothX += (gyroState.x - gyroState.smoothX) * 0.08;
  gyroState.smoothY += (gyroState.y - gyroState.smoothY) * 0.08;
  world.step(dt, {
    ...audioState,
    expressivity: expressivity.value,
    gyro: {
      enabled: gyroState.enabled,
      x: gyroState.smoothX,
      y: gyroState.smoothY,
    },
  });
  world.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
