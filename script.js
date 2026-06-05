const player = document.getElementById("cube-player");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const sidebar = document.getElementById("sidebar");
const answerGrid = document.getElementById("oll-grid");
const showTimerCheckbox = document.getElementById("show-timer");
const trainTabs = document.getElementById("train-mode-tabs");
const selectArea = document.getElementById("select-area");
const selectGridEl = document.getElementById("select-grid");
const selectAllBtn = document.getElementById("select-all-btn");
const selectNoneBtn = document.getElementById("select-none-btn");
const selectCount = document.getElementById("select-count");
const statsTable = document.getElementById("stats-table");
const statsTbody = document.querySelector("#stats-table tbody");

let isRunning = false;
let startTime = 0;
let timerInterval = null;
let currentCase = null;
let displayedGroup = null;
let lastSolveTime = null;
let currentMode = "oll";
let currentTrainMode = "all";

const stats = {};
const selectedCases = new Set();
const CROSS_KEY = "oll-trainer-cross";

function loadCrossSetups() {
  try {
    const saved = JSON.parse(localStorage.getItem(CROSS_KEY));
    if (Array.isArray(saved) && saved.length > 0) return new Set(saved);
  } catch {
    /* ignore */
  }
  return new Set(["x2", ""]);
}

function saveCrossSetups() {
  localStorage.setItem(CROSS_KEY, JSON.stringify([...selectedCrossSetups]));
}

const selectedCrossSetups = loadCrossSetups();

// ----------------------------------------------------------------
function invertMove(move) {
  if (move.endsWith("2")) return move;
  if (move.endsWith("'")) return move.slice(0, -1);
  return move + "'";
}
function invertAlg(alg) {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reverse()
    .map(invertMove)
    .join(" ");
}
ollDatabase.forEach((it) => {
  it.reverseAlg = invertAlg(it.alg);
});
pllDatabase.forEach((it) => {
  it.reverseAlg = invertAlg(it.alg);
});

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomPLLs = [
  "",
  "x R' U R' D2 R U' R' D2 R2 x'",
  "x R2 D2 R U R' D2 R U' R x'",
  "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
  "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
  "R2 U R' U R' U' R U' R2 U' D R' U R D'",
  "R' U' R U D' R2 U R' U R U' R U' R2 D",
  "R2 U' R U' R U R' U R2 U D' R U' R' D",
  "R U R' U' D R2 U' R U' R' U R' U R2 D'",
  "M2 U M2 U2 M2 U M2",
  "x R2 F R F' R U2 r' U r U2 x'",
  "R U R' F' R U R' U' R' F R2 U' R' U'",
  "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
  "r' D' F r U' r' F' D r2 U r' U' r' F r F'",
  "R U R' F' R U2 R' U2 R' F R U R U2 R'",
  "R' U2 R U2 R' F R U R' U' R' F' R2",
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "M2 U M U2 M' U M2",
  "M2 U' M U2 M' U' M2",
  "R' U R' d' R' F' R2 U' R' U R' F R F",
  "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  "M2 U M2 U M' U2 M2 U2 M'",
];

function db() {
  return currentMode === "oll" ? ollDatabase : pllDatabase;
}
function groupLabels() {
  const base = currentMode === "oll" ? OLL_GROUP_LABELS : PLL_GROUP_LABELS;
  return { ...base, custom: "Custom selection" };
}

function getActivePool() {
  const d = db();
  if (currentTrainMode !== "custom") {
    if (currentTrainMode === "all") return d;
    return d.filter((item) => item.group === currentTrainMode);
  }
  if (selectedCases.size === 0) return d;
  return d.filter((item) => selectedCases.has(item.id));
}

function pickRandomCase() {
  return getRandom(getActivePool());
}
function getRandomCrossSetup() {
  const setups = [...selectedCrossSetups];
  if (setups.length === 0) return "x2";
  return getRandom(setups);
}

const AUFs = ["", "U", "U2", "U'"];
const Y_ROTS = ["", "y", "y2", "y'"];

function buildScrambleString(scr) {
  return Object.values(scr).filter(Boolean).join(" ");
}

function generateOLLScramble(ollItem) {
  return {
    crossSetup: getRandomCrossSetup(),
    yRot: getRandom(Y_ROTS),
    auf1: getRandom(AUFs),
    pll: getRandom(randomPLLs),
    auf2: getRandom(AUFs),
    oll: ollItem.reverseAlg,
    auf3: getRandom(AUFs),
  };
}
function generatePLLScramble(pllItem) {
  return {
    crossSetup: getRandomCrossSetup(),
    yRot: getRandom(Y_ROTS),
    auf1: getRandom(AUFs),
    pll: pllItem.reverseAlg,
    auf2: getRandom(AUFs),
  };
}

function applyScramble(caseItem) {
  let scr, info;
  if (currentMode === "oll") {
    scr = generateOLLScramble(caseItem);
    info = [
      `%c[OLL ${caseItem.id} | ${caseItem.name}]`,
      "background:#222;color:#bada55;padding:2px 5px;border-radius:3px;",
      `\n  ├─ Cross:  ${scr.crossSetup}` +
        `\n  ├─ Y Rot:  ${scr.yRot || "[none]"}` +
        `\n  ├─ AUF 1:  ${scr.auf1 || "[none]"}` +
        `\n  ├─ PLL:    ${scr.pll ? scr.pll : "[Skip]"}` +
        `\n  ├─ AUF 2:  ${scr.auf2 || "[none]"}` +
        `\n  ├─ OLL:    ${scr.oll}` +
        `\n  └─ AUF 3:  ${scr.auf3 || "[none]"}`,
    ];
  } else {
    scr = generatePLLScramble(caseItem);
    info = [
      `%c[PLL ${caseItem.id} | ${caseItem.name}]`,
      "background:#222;color:#facc15;padding:2px 5px;border-radius:3px;",
      `\n  ├─ Cross:  ${scr.crossSetup}` +
        `\n  ├─ Y Rot:  ${scr.yRot || "[none]"}` +
        `\n  ├─ AUF 1:  ${scr.auf1 || "[none]"}` +
        `\n  ├─ PLL:    ${scr.pll}` +
        `\n  └─ AUF 2:  ${scr.auf2 || "[none]"}`,
    ];
  }
  console.log(...info);
  player.setAttribute("alg", buildScrambleString(scr));
}

function caseImageSrc(id) {
  return `images/${currentMode === "oll" ? "oll" : "pll"}/${id}.svg`;
}
function visualCubeFallback(alg, stage) {
  return `https://visualcube.api.cubing.net/visualcube.php?fmt=svg&size=96&pzl=3&view=plan&stage=${stage}&case=${encodeURIComponent(alg)}`;
}

function renderAnswerButtons(targetGroup) {
  const d = db();
  const filtered =
    targetGroup === "all" ? d : d.filter((item) => item.group === targetGroup);
  answerGrid.innerHTML = "";
  const stage = currentMode === "oll" ? "oll" : "pll";
  filtered.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "oll-btn";
    btn.dataset.caseId = String(item.id);
    const img = document.createElement("img");
    img.className = "oll-img";
    img.src = caseImageSrc(item.id);
    img.alt = `${currentMode === "oll" ? "OLL" : "PLL"} ${item.id}`;
    img.width = 56;
    img.height = 56;
    img.loading = "lazy";
    if (item.rotation) img.style.transform = `rotate(${item.rotation}deg)`;
    img.onerror = () => {
      img.src = visualCubeFallback(item.alg, stage);
    };
    const label = document.createElement("span");
    label.className = "oll-label";
    label.textContent = currentMode === "oll" ? `OLL ${item.id}` : item.name;
    btn.append(img, label);
    btn.addEventListener("click", () => checkAnswer(item.id, btn));
    answerGrid.appendChild(btn);
  });
  displayedGroup = targetGroup;
}

function updateAnswerPanel(force) {
  if (!currentCase) return;
  if (currentTrainMode === "custom") {
    const pool = getActivePool();
    if (force || pool.length !== answerGrid.children.length)
      renderCustomAnswerButtons(pool);
    return;
  }
  const mode = currentTrainMode;
  if (mode !== "all") {
    if (force || displayedGroup !== mode) renderAnswerButtons(mode);
    return;
  }
  if (currentMode === "pll") {
    if (force || displayedGroup !== "all") renderAnswerButtons("all");
  } else {
    if (force || displayedGroup !== currentCase.group)
      renderAnswerButtons(currentCase.group);
  }
}

function renderCustomAnswerButtons(pool) {
  answerGrid.innerHTML = "";
  const stage = currentMode === "oll" ? "oll" : "pll";
  pool.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "oll-btn";
    btn.dataset.caseId = String(item.id);
    const img = document.createElement("img");
    img.className = "oll-img";
    img.src = caseImageSrc(item.id);
    img.alt = `${currentMode === "oll" ? "OLL" : "PLL"} ${item.id}`;
    img.width = 56;
    img.height = 56;
    img.loading = "lazy";
    if (item.rotation) img.style.transform = `rotate(${item.rotation}deg)`;
    img.onerror = () => {
      img.src = visualCubeFallback(item.alg, stage);
    };
    const label = document.createElement("span");
    label.className = "oll-label";
    label.textContent = currentMode === "oll" ? `OLL ${item.id}` : item.name;
    btn.append(img, label);
    btn.addEventListener("click", () => checkAnswer(item.id, btn));
    answerGrid.appendChild(btn);
  });
  displayedGroup = "custom";
}

function selectAll() {
  db().forEach((it) => selectedCases.add(it.id));
  updateSelectGrid();
}
function selectNone() {
  selectedCases.clear();
  updateSelectGrid();
}
function toggleCase(id) {
  selectedCases.has(id) ? selectedCases.delete(id) : selectedCases.add(id);
  updateSelectGrid();
}

function updateSelectGrid() {
  const d = db();
  if (currentTrainMode !== "custom") {
    selectArea.classList.add("hidden");
    return;
  }
  selectArea.classList.remove("hidden");
  selectCount.textContent = `Selected: ${selectedCases.size} / ${d.length}`;
  selectGridEl.innerHTML = "";
  d.forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "select-chip";
    if (selectedCases.has(item.id)) chip.classList.add("selected");
    chip.dataset.caseId = String(item.id);
    const img = document.createElement("img");
    img.className = "oll-img";
    img.src = caseImageSrc(item.id);
    img.alt = currentMode === "oll" ? `OLL ${item.id}` : item.name;
    img.width = 48;
    img.height = 48;
    img.loading = "lazy";
    if (item.rotation) img.style.transform = `rotate(${item.rotation}deg)`;
    const label = document.createElement("span");
    label.className = "oll-label";
    label.textContent = currentMode === "oll" ? `OLL ${item.id}` : item.name;
    chip.append(img, label);
    chip.addEventListener("click", () => toggleCase(item.id));
    selectGridEl.appendChild(chip);
  });
}

function statsKey(item) {
  return `${currentMode}-${item.id}`;
}
function recordSolve(item, time) {
  const key = statsKey(item);
  if (!stats[key]) stats[key] = { times: [], errors: 0 };
  stats[key].times.push(time);
  if (stats[key].times.length > 100) stats[key].times.shift();
  updateStatsTable(item);
}
function recordError(item) {
  const key = statsKey(item);
  if (!stats[key]) stats[key] = { times: [], errors: 0 };
  stats[key].errors++;
}
function avg(arr) {
  if (arr.length === 0) return "\u2014";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function updateStatsTable(touchedItem) {
  const d = db();
  const entries = d
    .map((item) => {
      const s = stats[statsKey(item)];
      if (!s) return null;
      return {
        item,
        times: s.times,
        errors: s.errors,
        tries: s.times.length + s.errors,
      };
    })
    .filter(Boolean);
  if (entries.length === 0) {
    statsTable.classList.add("hidden");
    return;
  }
  statsTable.classList.remove("hidden");
  entries.sort((a, b) => {
    if (a.item.id === touchedItem.id) return -1;
    if (b.item.id === touchedItem.id) return 1;
    return b.tries - a.tries;
  });
  statsTbody.innerHTML = "";
  entries.forEach((e) => {
    const tr = document.createElement("tr");
    const label = currentMode === "oll" ? `OLL ${e.item.id}` : e.item.name;
    tr.innerHTML = `<td>${label}</td><td>${avg(e.times)}</td><td>${e.times.length}</td><td class="${e.errors > 0 ? "stats-errors" : ""}">${e.errors}</td>`;
    statsTbody.appendChild(tr);
  });
}

function nextScramble({ keepTimer = false } = {}) {
  currentCase = pickRandomCase();
  applyScramble(currentCase);
  updateAnswerPanel(true);
  if (!keepTimer) {
    startTimer();
  } else {
    resetTimerDisplay();
    startTime = Date.now();
  }
}

function checkAnswer(clickedId, btnElement) {
  if (!isRunning || !currentCase) return;
  if (Number(clickedId) === currentCase.id) {
    lastSolveTime = (Date.now() - startTime) / 1000;
    recordSolve(currentCase, lastSolveTime);
    answerGrid
      .querySelectorAll(".oll-btn")
      .forEach((b) => b.classList.remove("btn-error"));
    currentCase = pickRandomCase();
    applyScramble(currentCase);
    updateAnswerPanel(false);
    resetTimerDisplay();
    startTime = Date.now();
  } else {
    recordError(currentCase);
    btnElement.classList.add("btn-error");
  }
}

function resetTimerDisplay() {
  timerDisplay.textContent = "0.00";
}
function syncTimerVisibility() {
  timerDisplay.classList.toggle("hidden", !showTimerCheckbox.checked);
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  isRunning = true;
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
  sidebar.classList.add("sidebar-hidden");
  selectArea.classList.add("hidden");
  answerGrid.classList.add("visible");
  answerGrid.setAttribute("aria-hidden", "false");
  for (const key in stats) delete stats[key];
  statsTable.classList.add("hidden");
  statsTbody.innerHTML = "";
  syncTimerVisibility();
  resetTimerDisplay();
  timerInterval = setInterval(() => {
    timerDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(2);
  }, 10);
}

function stopTimer(showStart = true) {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  if (showStart) {
    startBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
    sidebar.classList.remove("sidebar-hidden");
    answerGrid.classList.remove("visible");
    answerGrid.setAttribute("aria-hidden", "true");
    if (currentTrainMode === "custom") selectArea.classList.remove("hidden");
  }
}

function endSession() {
  stopTimer(true);
  currentCase = null;
  displayedGroup = null;
  answerGrid.innerHTML = "";
  player.setAttribute("alg", "");
  resetTimerDisplay();
  statsTable.classList.add("hidden");
}

function buildTrainTabs() {
  trainTabs.innerHTML = "";
  for (const [value, label] of Object.entries(groupLabels())) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "train-tab";
    tab.dataset.mode = value;
    tab.textContent = label;
    if (value === currentTrainMode) tab.classList.add("active");
    tab.addEventListener("click", () => setTrainMode(value));
    trainTabs.appendChild(tab);
  }
}

function setTrainMode(mode) {
  if (mode === currentTrainMode) return;
  currentTrainMode = mode;
  trainTabs.querySelectorAll(".train-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.mode === mode);
  });
  updateSelectGrid();
  if (isRunning) updateAnswerPanel(true);
}

function switchMode(mode) {
  if (mode === currentMode) return;
  if (isRunning) endSession();
  currentMode = mode;
  for (const key in stats) delete stats[key];
  statsTable.classList.add("hidden");
  selectedCases.clear();
  document.querySelectorAll("#mode-switch .mode-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
  currentTrainMode = "all";
  buildTrainTabs();
  updateSelectGrid();
  displayedGroup = null;
  answerGrid.innerHTML = "";
  document.title =
    mode === "oll" ? "2 Sided OLL Recognition" : "2 Sided PLL Recognition";
}

startBtn.addEventListener("click", () => {
  if (isRunning) return;
  const pool = getActivePool();
  if (pool.length === 0) {
    alert("No algorithms selected for training!");
    return;
  }
  nextScramble();
});
stopBtn.addEventListener("click", endSession);
selectAllBtn.addEventListener("click", selectAll);
selectNoneBtn.addEventListener("click", selectNone);
showTimerCheckbox.addEventListener("change", syncTimerVisibility);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    if (!isRunning) {
      const pool = getActivePool();
      if (pool.length === 0) {
        alert("No algorithms selected for training!");
        return;
      }
      nextScramble();
    }
  }
  if (e.code === "Escape" && isRunning) {
    e.preventDefault();
    endSession();
  }
});

document.querySelectorAll("#cross-colors .color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const setup = btn.getAttribute("data-setup");
    if (selectedCrossSetups.has(setup)) {
      if (selectedCrossSetups.size > 1) {
        selectedCrossSetups.delete(setup);
        btn.classList.remove("active");
      }
    } else {
      selectedCrossSetups.add(setup);
      btn.classList.add("active");
    }
    saveCrossSetups();
  });
});

document.querySelectorAll("#mode-switch .mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});

// ----------------------------------------------------------------
// Управление темой
// ----------------------------------------------------------------
const THEME_KEY = "oll-trainer-theme";
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const themeIcons = {
  light:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  dark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  system:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
};

themeToggle.querySelectorAll(".theme-btn").forEach((btn) => {
  const t = btn.dataset.theme;
  if (themeIcons[t]) btn.innerHTML = themeIcons[t];
});

function getSystemTheme() {
  return themeMedia.matches ? "dark" : "light";
}

function applyTheme(pref) {
  themeToggle.querySelectorAll(".theme-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.theme === pref);
  });
  htmlEl.setAttribute(
    "data-theme",
    pref === "system" ? getSystemTheme() : pref,
  );
}

function setTheme(pref) {
  localStorage.setItem(THEME_KEY, pref);
  applyTheme(pref);
}

themeToggle.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

themeMedia.addEventListener("change", () => {
  if ((localStorage.getItem(THEME_KEY) || "system") === "system")
    applyTheme("system");
});

// ----------------------------------------------------------------
// Инициализация
// ----------------------------------------------------------------
applyTheme(localStorage.getItem(THEME_KEY) || "system");
syncTimerVisibility();
buildTrainTabs();
updateSelectGrid();

// Восстановить active-классы кнопок цветов из сохранённого состояния
document.querySelectorAll("#cross-colors .color-btn").forEach((btn) => {
  const setup = btn.getAttribute("data-setup");
  if (selectedCrossSetups.has(setup)) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
});

function lockCubeView() {
  player.setAttribute("experimental-drag-input", "none");
  const wrap = document.querySelector(".cube-wrap");
  if (wrap) wrap.style.pointerEvents = "none";
}
customElements.whenDefined("twisty-player").then(lockCubeView);
lockCubeView();
