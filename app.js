const STORAGE_KEY = "tablequest-progress-v3";
const INTERVALS_MS = [0, 4 * 3600_000, 24 * 3600_000, 3 * 24 * 3600_000, 7 * 24 * 3600_000, 14 * 24 * 3600_000];
const MAX_ANSWER_DIGITS = 3;
const CHALLENGE_RESULT_DELAY_MS = 1650;
const GAME_MAX_STEPS = 10;
const CHALLENGE_DURATION_SECONDS = 60;
const LEADERBOARD_LIMIT = 10;
const CHALLENGE_IDLE_TEXT = 'Défi chrono: appuie sur "Démarrer le défi".';
const RESET_CONFIRM_WORD = "EFFACER";
const DEFAULT_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TIMED_MAX_SCORE = 10_000;
const TIMED_BASE_POINTS = 180;
const TIMED_COMPLEX_BONUS = 0.35;
const TIMED_HIGH_BONUS = 0.15;
const TIMED_WRONG_PENALTY = 40;
const CELEBRATION_DURATION_MS = 5000;
const FACTS = [];
const IMAGE_THEME_EMOJIS = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦉",
  "🦄",
  "🐴",
  "🦋",
  "🐢",
  "🐠",
  "🐙",
  "🦖",
  "🦕",
  "🐬",
  "🦒",
  "🐘",
  "🦓",
  "🦘",
  "🦦",
  "🐝",
  "🍎",
  "🍓",
  "🍉",
  "🍍",
  "🥝",
  "🍇",
  "🍒",
  "🍌",
  "🥕",
  "🌽",
  "🍄",
  "🌸",
  "🌼",
  "🌻",
  "🌈",
  "⭐",
  "🌙",
  "☀️",
  "⚡",
  "🔥",
  "❄️",
  "🚗",
  "🚕",
  "🚌",
  "🚓",
  "🚑",
  "🚒",
  "🚜",
  "🏎️",
  "🚲",
  "🛴",
  "🚂",
  "🚁",
  "✈️",
  "🚀",
  "🛸",
  "⛵",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎾",
  "🥎",
  "🏐",
  "🎯",
  "🎈",
];
const IMAGE_THEMES = IMAGE_THEME_EMOJIS.map((emoji, index) => ({
  name: `Image ${index + 1}`,
  emoji,
}));
const IMAGE_TILE_ORDER = [7, 2, 9, 0, 4, 6, 1, 8, 3, 5];
const CELEBRATION_EFFECTS = [
  { name: "fireworks", message: "BRAVO !", emojis: ["🎆", "✨", "🎇"], particles: 26, shake: false },
  { name: "champion", message: "CHAMPION !", emojis: ["🏆", "⭐", "🥳"], particles: 24, shake: true },
  { name: "stars", message: "SUPER !", emojis: ["⭐", "🌟", "✨"], particles: 28, shake: false },
  { name: "party", message: "TROP FORT !", emojis: ["🎉", "🎊", "🥳"], particles: 26, shake: false },
  { name: "space", message: "MISSION RÉUSSIE !", emojis: ["🚀", "🛸", "🌠"], particles: 24, shake: true },
  { name: "animals", message: "GÉNIAL !", emojis: ["🐶", "🐱", "🦄"], particles: 24, shake: false },
  { name: "ocean", message: "BIEN JOUÉ !", emojis: ["🐠", "🐢", "🌈"], particles: 24, shake: false },
  { name: "dino", message: "ROOOAR !", emojis: ["🦖", "🦕", "💥"], particles: 24, shake: true },
  { name: "magic", message: "MAGIQUE !", emojis: ["🪄", "✨", "🌟"], particles: 26, shake: false },
  { name: "hearts", message: "FORMIDABLE !", emojis: ["💖", "💙", "💛"], particles: 28, shake: false },
];
const CELEBRATION_PREMIUM_EFFECTS = [
  { name: "volcano", message: "WOW LÉGENDAIRE !", emojis: ["🌋", "🔥", "💥"], particles: 34, shake: true },
  { name: "rainbow", message: "ARC-EN-CIEL !", emojis: ["🌈", "⭐", "🎉"], particles: 34, shake: false },
  { name: "thunder", message: "PUISSANCE MAX !", emojis: ["⚡", "🌟", "💫"], particles: 36, shake: true },
  { name: "galaxy", message: "COSMIQUE !", emojis: ["🌌", "🪐", "✨"], particles: 34, shake: false },
  { name: "dragon", message: "DRAGON MODE !", emojis: ["🐉", "🔥", "🏅"], particles: 36, shake: true },
];

function pickImageTargets() {
  const shuffled = [...IMAGE_THEMES];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4).map((theme) => theme.emoji);
}

for (let a = 1; a <= 10; a += 1) {
  for (let b = 1; b <= 10; b += 1) {
    FACTS.push({ id: `${a}x${b}`, a, b, result: a * b });
  }
}

const state = {
  progress: {},
  learnTable: 2,
  learnMultiplier: 4,
  settings: {
    enabledTables: [...DEFAULT_TABLES],
    leaderboard: [],
    visualSide: "left",
  },
  train: {
    filter: "all",
    asked: 0,
    correct: 0,
    current: null,
    answered: false,
  },
  challenge: {
    active: false,
    mode: "timed",
    score: 0,
    hits: 0,
    total: 0,
    current: null,
    progress: 0,
    bricks: [],
    imageTargets: pickImageTargets(),
    timeLeft: CHALLENGE_DURATION_SECONDS,
    timerId: null,
  },
};

const els = {
  tabs: [...document.querySelectorAll(".tab")],
  panels: [...document.querySelectorAll(".panel")],
  learnTableButtons: [...document.querySelectorAll("[data-learn-table]")],
  learnMultiplierButtons: [...document.querySelectorAll("[data-learn-multiplier]")],
  learnEquation: document.getElementById("learn-equation"),
  learnGrid: document.getElementById("learn-grid"),
  learnList: document.getElementById("learn-list"),
  trainFilter: document.getElementById("train-filter"),
  trainAsked: document.getElementById("train-asked"),
  trainCorrect: document.getElementById("train-correct"),
  trainQuestion: document.getElementById("train-question"),
  trainInlineResult: document.getElementById("train-inline-result"),
  trainForm: document.getElementById("train-form"),
  trainAnswer: document.getElementById("train-answer"),
  trainNext: document.getElementById("train-next"),
  keypads: [...document.querySelectorAll(".keypad")],
  challengeStart: document.getElementById("challenge-start"),
  gameModeTimed: document.getElementById("game-mode-timed"),
  gameModeImage: document.getElementById("game-mode-image"),
  gameModeTower: document.getElementById("game-mode-tower"),
  challengePanel: document.getElementById("challenge"),
  timedGame: document.getElementById("timed-game"),
  imageGame: document.getElementById("image-game"),
  imageEmojiCells: [...document.querySelectorAll(".image-emoji-cell")],
  imageMaskTiles: [...document.querySelectorAll(".image-mask-tile")],
  towerGame: document.getElementById("tower-game"),
  towerStack: document.getElementById("tower-stack"),
  challengeTimer: document.getElementById("challenge-timer"),
  challengeTimerGauge: document.getElementById("challenge-timer-gauge"),
  challengeTimerFill: document.getElementById("challenge-timer-fill"),
  challengeScore: document.getElementById("challenge-score"),
  challengeQuestion: document.getElementById("challenge-question"),
  challengeInlineResult: document.getElementById("challenge-inline-result"),
  challengeForm: document.getElementById("challenge-form"),
  challengeAnswer: document.getElementById("challenge-answer"),
  challengeSubmit: document.getElementById("challenge-submit"),
  leaderboardWrap: document.getElementById("leaderboard-wrap"),
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardClear: document.getElementById("leaderboard-clear"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statMastered: document.getElementById("stat-mastered"),
  statDue: document.getElementById("stat-due"),
  heatmap: document.getElementById("heatmap"),
  weakFacts: document.getElementById("weak-facts"),
  settingsTableButtons: [...document.querySelectorAll("[data-config-table]")],
  settingsVisualLeft: document.getElementById("settings-visual-left"),
  settingsVisualRight: document.getElementById("settings-visual-right"),
  settingsActiveSummary: document.getElementById("settings-active-summary"),
  settingsStatus: document.getElementById("settings-status"),
  settingsExportFile: document.getElementById("settings-export-file"),
  settingsExportEmail: document.getElementById("settings-export-email"),
  settingsImportBtn: document.getElementById("settings-import-btn"),
  settingsImportInput: document.getElementById("settings-import-input"),
  settingsResetBtn: document.getElementById("settings-reset-btn"),
  celebrationLayer: document.getElementById("celebration-layer"),
};

let celebrationEndTimerId = null;

function defaultEntry() {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    box: 0,
    nextDue: 0,
    lastSeen: 0,
    lastResult: null,
  };
}

function clampToRange(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeEnabledTables(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_TABLES];
  }
  const cleaned = [...new Set(value.map((item) => Number(item)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 10))].sort(
    (a, b) => a - b,
  );
  return cleaned.length ? cleaned : [...DEFAULT_TABLES];
}

function sanitizeLeaderboard(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const cleaned = value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }
      const rawPoints = row.points ?? row.score;
      const points = clampToRange(Math.trunc(Number(rawPoints) || 0), 0, TIMED_MAX_SCORE);
      const total = clampToRange(Math.trunc(Number(row.total) || 0), 0, 100000);
      const fallbackHits =
        Number.isFinite(Number(row.hits)) ? Number(row.hits) : Number.isFinite(Number(row.score)) && Number(row.score) <= total ? Number(row.score) : 0;
      const hits = clampToRange(Math.trunc(Number(fallbackHits) || 0), 0, total);
      const accuracy = total > 0 ? hits / total : 0;
      const playedAt =
        typeof row.playedAt === "string" && row.playedAt
          ? row.playedAt
          : new Date().toISOString();
      return { points, hits, total, accuracy, playedAt };
    })
    .filter(Boolean)
    .sort((a, b) => b.points - a.points || b.hits - a.hits || b.accuracy - a.accuracy)
    .slice(0, LEADERBOARD_LIMIT);

  return cleaned;
}

function sanitizeVisualSide(value) {
  return value === "right" ? "right" : "left";
}

function sanitizeProgress(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const out = {};
  FACTS.forEach((fact) => {
    const entry = raw[fact.id];
    if (!entry || typeof entry !== "object") {
      return;
    }
    const attempts = clampToRange(Math.trunc(Number(entry.attempts) || 0), 0, 100000);
    const correct = clampToRange(Math.trunc(Number(entry.correct) || 0), 0, attempts);
    out[fact.id] = {
      attempts,
      correct,
      streak: clampToRange(Math.trunc(Number(entry.streak) || 0), 0, 100000),
      box: clampToRange(Math.trunc(Number(entry.box) || 0), 0, 5),
      nextDue: Number.isFinite(Number(entry.nextDue)) ? Number(entry.nextDue) : 0,
      lastSeen: Number.isFinite(Number(entry.lastSeen)) ? Number(entry.lastSeen) : 0,
      lastResult: entry.lastResult === true ? true : entry.lastResult === false ? false : null,
    };
  });
  return out;
}

function getEntry(id) {
  if (!state.progress[id]) {
    state.progress[id] = defaultEntry();
  }
  return state.progress[id];
}

function accuracy(entry) {
  return entry.attempts > 0 ? entry.correct / entry.attempts : 0;
}

function mastery(entry) {
  const a = accuracy(entry);
  const attemptsBoost = Math.min(entry.attempts, 6) / 6;
  const score = 0.55 * (entry.box / 5) + 0.35 * a + 0.1 * attemptsBoost;
  return Math.max(0, Math.min(1, score));
}

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("tablequest-progress-v2") ||
      localStorage.getItem("tablequest-progress-v1");
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }

    state.progress = sanitizeProgress(parsed.progress);
    state.learnTable = Number.isInteger(parsed.learnTable) ? clampToRange(parsed.learnTable, 1, 10) : state.learnTable;
    state.learnMultiplier = Number.isInteger(parsed.learnMultiplier)
      ? clampToRange(parsed.learnMultiplier, 1, 10)
      : state.learnMultiplier;

    const loadedTables = parsed.settings?.enabledTables || parsed.enabledTables;
    state.settings.enabledTables = sanitizeEnabledTables(loadedTables);
    if (
      parsed.settings?.gameMode === "timed" ||
      parsed.settings?.gameMode === "image" ||
      parsed.settings?.gameMode === "tower"
    ) {
      state.challenge.mode = parsed.settings.gameMode;
    }
    state.settings.leaderboard = sanitizeLeaderboard(parsed.settings?.leaderboard);
    state.settings.visualSide = sanitizeVisualSide(parsed.settings?.visualSide);
  } catch (err) {
    console.warn("Impossible de charger la sauvegarde locale:", err);
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        progress: state.progress,
        learnTable: state.learnTable,
        learnMultiplier: state.learnMultiplier,
        settings: {
          enabledTables: state.settings.enabledTables,
          gameMode: state.challenge.mode,
          leaderboard: state.settings.leaderboard,
          visualSide: state.settings.visualSide,
        },
      }),
    );
  } catch (err) {
    console.warn("Impossible de sauvegarder les progrès:", err);
  }
}

function formatPct(value) {
  return `${Math.round(value * 100)}%`;
}

function setFeedback(el, type, text) {
  if (!el) {
    return;
  }
  el.textContent = text;
  el.classList.remove("good", "bad");
  if (type) {
    el.classList.add(type);
  }
}

function setSettingsStatus(text, type = "") {
  if (!els.settingsStatus) {
    return;
  }
  setFeedback(els.settingsStatus, type, text);
}

function hasPremiumCelebrationsUnlocked() {
  const enabled = state.settings.enabledTables;
  return enabled.includes(7) && enabled.includes(8) && enabled.includes(9);
}

function pickRandomEffect(effects) {
  return effects[Math.floor(Math.random() * effects.length)];
}

function renderCelebrationWave(effect) {
  els.celebrationLayer.className = "celebration-layer";
  els.celebrationLayer.classList.add("is-active", `effect-${effect.name}`);
  els.celebrationLayer.innerHTML = "";

  const badge = document.createElement("div");
  badge.className = "celebration-badge";
  badge.textContent = effect.message;
  els.celebrationLayer.appendChild(badge);

  for (let i = 0; i < effect.particles; i += 1) {
    const particle = document.createElement("span");
    particle.className = "celebration-particle";
    particle.textContent = effect.emojis[i % effect.emojis.length];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${60 + Math.random() * 34}%`;
    particle.style.setProperty("--dx", `${-85 + Math.random() * 170}px`);
    particle.style.setProperty("--dy", `${-200 - Math.random() * 250}px`);
    particle.style.setProperty("--rot", `${-90 + Math.random() * 180}deg`);
    particle.style.animationDelay = `${Math.random() * 350}ms`;
    particle.style.animationDuration = `${2800 + Math.random() * 2200}ms`;
    els.celebrationLayer.appendChild(particle);
  }

  if (effect.shake) {
    document.body.classList.remove("screen-shake");
    void document.body.offsetWidth;
    document.body.classList.add("screen-shake");
  }
}

function clearCelebration() {
  if (!els.celebrationLayer) {
    return;
  }
  if (celebrationEndTimerId) {
    clearTimeout(celebrationEndTimerId);
    celebrationEndTimerId = null;
  }
  els.celebrationLayer.className = "celebration-layer";
  els.celebrationLayer.innerHTML = "";
  document.body.classList.remove("screen-shake");
}

function triggerCelebration() {
  if (!els.celebrationLayer) {
    return;
  }
  clearCelebration();

  const premiumUnlocked = hasPremiumCelebrationsUnlocked();
  const effectsPool = premiumUnlocked
    ? [...CELEBRATION_EFFECTS, ...CELEBRATION_PREMIUM_EFFECTS]
    : CELEBRATION_EFFECTS;

  const effect = pickRandomEffect(effectsPool);
  renderCelebrationWave(effect);
  celebrationEndTimerId = setTimeout(() => {
    clearCelebration();
  }, CELEBRATION_DURATION_MS);
}

function timedSuccessCoefficient(fact) {
  let coefficient = 1;
  if (fact.a >= 6) {
    coefficient += TIMED_COMPLEX_BONUS;
  }
  if (fact.b >= 6) {
    coefficient += TIMED_COMPLEX_BONUS;
  }
  if (fact.a >= 8 || fact.b >= 8) {
    coefficient += TIMED_HIGH_BONUS;
  }
  return coefficient;
}

function pointsForTimedSuccess(fact) {
  return Math.round(TIMED_BASE_POINTS * timedSuccessCoefficient(fact));
}

function updateProgress(factId, isCorrect) {
  const entry = getEntry(factId);
  entry.attempts += 1;
  entry.lastSeen = Date.now();
  entry.lastResult = isCorrect;

  if (isCorrect) {
    entry.correct += 1;
    entry.streak += 1;
    if (entry.streak >= 2) {
      entry.box = Math.min(5, entry.box + 1);
    }
  } else {
    entry.streak = 0;
    entry.box = Math.max(0, entry.box - 1);
  }

  entry.nextDue = Date.now() + INTERVALS_MS[entry.box];
  saveState();
}

function factPool(filter) {
  const enabled = state.settings.enabledTables;
  if (filter === "all") {
    return FACTS.filter((f) => enabled.includes(f.a));
  }
  const table = Number(filter);
  if (!enabled.includes(table)) {
    return [];
  }
  return FACTS.filter((f) => f.a === table);
}

function aggregateWeakness(stats) {
  if (!stats || stats.attempts <= 0) {
    return 0.72;
  }
  const acc = stats.correct / stats.attempts;
  const lowExposure = 1 - Math.min(stats.attempts, 30) / 30;
  return 0.8 * (1 - acc) + 0.2 * lowExposure;
}

function pickFact({ filter = "all", avoidId = null } = {}) {
  const allFacts = factPool(filter);
  if (!allFacts.length) {
    return null;
  }

  const candidates = allFacts.filter((fact) => fact.id !== avoidId);
  const pool = candidates.length ? candidates : allFacts;

  const tableStats = new Map();
  const multiplierStats = new Map();
  allFacts.forEach((fact) => {
    const entry = getEntry(fact.id);

    const tableCurrent = tableStats.get(fact.a) || { attempts: 0, correct: 0 };
    tableCurrent.attempts += entry.attempts;
    tableCurrent.correct += entry.correct;
    tableStats.set(fact.a, tableCurrent);

    const multCurrent = multiplierStats.get(fact.b) || { attempts: 0, correct: 0 };
    multCurrent.attempts += entry.attempts;
    multCurrent.correct += entry.correct;
    multiplierStats.set(fact.b, multCurrent);
  });

  const now = Date.now();
  let totalWeight = 0;
  const weightedFacts = pool.map((fact) => {
    const entry = getEntry(fact.id);
    const tableWeakness = aggregateWeakness(tableStats.get(fact.a));
    const multiplierWeakness = aggregateWeakness(multiplierStats.get(fact.b));
    const factWeakness = entry.attempts === 0 ? 0.75 : 1 - accuracy(entry);
    const lowStreak = 1 - Math.min(entry.streak, 5) / 5;
    const lowExposure = 1 - Math.min(entry.attempts, 12) / 12;
    const dueBoost = entry.nextDue <= now ? 1 : 0;

    const priority =
      0.34 * factWeakness +
      0.24 * tableWeakness +
      0.24 * multiplierWeakness +
      0.1 * lowStreak +
      0.05 * lowExposure +
      0.03 * dueBoost;

    const weight = Math.max(0.05, priority);
    totalWeight += weight;
    return { fact, weight };
  });

  let roll = Math.random() * totalWeight;
  for (const item of weightedFacts) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.fact;
    }
  }

  return weightedFacts[weightedFacts.length - 1].fact;
}

function renderLearn() {
  const table = state.learnTable;
  const mult = state.learnMultiplier;
  const result = table * mult;

  els.learnTableButtons.forEach((btn) => {
    const val = Number(btn.dataset.learnTable);
    btn.classList.toggle("is-active", val === table);
  });

  els.learnMultiplierButtons.forEach((btn) => {
    const val = Number(btn.dataset.learnMultiplier);
    btn.classList.toggle("is-active", val === mult);
  });

  els.learnEquation.textContent = `${table} x ${mult} = ${result} (${table} groupes de ${mult})`;

  els.learnGrid.innerHTML = "";
  els.learnGrid.style.gridTemplateRows = `repeat(${table}, 1fr)`;
  for (let r = 0; r < table; r += 1) {
    const row = document.createElement("div");
    row.className = "array-grid-row";
    row.style.gridTemplateColumns = `repeat(${mult}, 1fr)`;
    for (let c = 0; c < mult; c += 1) {
      const dot = document.createElement("span");
      dot.className = "array-dot";
      row.appendChild(dot);
    }
    els.learnGrid.appendChild(row);
  }

  els.learnList.innerHTML = "";
  for (let b = 1; b <= 10; b += 1) {
    const item = document.createElement("li");
    item.textContent = `${table} x ${b} = ${table * b}`;
    els.learnList.appendChild(item);
  }
}

function updateTrainCounters() {
  els.trainAsked.textContent = `Questions: ${state.train.asked}`;
  els.trainCorrect.textContent = `Réussies: ${state.train.correct}`;
}

function showNextTrainQuestion() {
  state.train.answered = false;
  state.train.current = pickFact({
    filter: state.train.filter,
    avoidId: state.train.current ? state.train.current.id : null,
  });

  if (!state.train.current) {
    els.trainQuestion.textContent = "Active au moins une table dans Configuration.";
    els.trainAnswer.value = "";
    els.trainAnswer.disabled = true;
    els.trainNext.hidden = true;
    setFeedback(els.trainInlineResult, "bad", "Aucune table active.");
    return;
  }

  const { a, b } = state.train.current;
  els.trainQuestion.textContent = `${a} x ${b} = ?`;
  els.trainAnswer.value = "";
  els.trainAnswer.disabled = false;
  els.trainNext.hidden = true;
  setFeedback(els.trainInlineResult, "", "");
}

function onTrainSubmit(event) {
  event.preventDefault();
  if (!state.train.current || state.train.answered) {
    return;
  }

  const val = Number(els.trainAnswer.value);
  if (!Number.isFinite(val)) {
    return;
  }

  const expected = state.train.current.result;
  const ok = val === expected;
  state.train.answered = true;
  state.train.asked += 1;
  if (ok) {
    state.train.correct += 1;
  }

  updateProgress(state.train.current.id, ok);
  updateTrainCounters();
  renderProgress();

  if (ok) {
    setFeedback(els.trainInlineResult, "good", `Bravo ! ${state.train.current.a} x ${state.train.current.b} = ${expected}.`);
    state.train.answered = true;
    els.trainAnswer.disabled = true;
    els.trainNext.hidden = false;
  } else {
    setFeedback(
      els.trainInlineResult,
      "bad",
      `Pas grave, essaye encore : ${state.train.current.a} x ${state.train.current.b} = ${expected}.`,
    );
    state.train.answered = false;
    els.trainAnswer.disabled = false;
    els.trainAnswer.value = "";
    els.trainNext.hidden = false;
  }
}

function updateChallengeUI() {
  if (state.challenge.mode === "timed") {
    const ratio = Math.max(0, Math.min(1, state.challenge.timeLeft / CHALLENGE_DURATION_SECONDS));
    els.challengeTimerFill.style.width = `${ratio * 100}%`;
    els.challengeTimerGauge.setAttribute("aria-label", `Temps restant: ${state.challenge.timeLeft} secondes`);
    els.challengeTimerGauge.setAttribute("aria-valuenow", `${state.challenge.timeLeft}`);
    els.challengeScore.textContent = `Score: ${state.challenge.score} pts`;
    return;
  }
  const progress = state.challenge.mode === "image" ? state.challenge.progress : state.challenge.bricks.length;
  els.challengeTimer.textContent = `Progression: ${progress} / ${GAME_MAX_STEPS}`;
  els.challengeScore.textContent = `Réussites: ${state.challenge.score}`;
}

function clearChallengeTimer() {
  if (state.challenge.timerId) {
    clearInterval(state.challenge.timerId);
    state.challenge.timerId = null;
  }
}

function addLeaderboardEntry(points, hits, total) {
  const accuracy = total > 0 ? hits / total : 0;
  const playedAt = new Date().toISOString();
  state.settings.leaderboard = sanitizeLeaderboard([
    {
      points,
      hits,
      total,
      accuracy,
      playedAt,
    },
    ...state.settings.leaderboard,
  ]);
  const rank = state.settings.leaderboard.findIndex(
    (entry) => entry.points === points && entry.hits === hits && entry.total === total && entry.playedAt === playedAt,
  );
  return rank >= 0 ? rank + 1 : -1;
}

function renderLeaderboard() {
  const timedMode = state.challenge.mode === "timed";
  els.leaderboardWrap.hidden = !timedMode;
  if (!timedMode) {
    return;
  }

  els.leaderboardList.innerHTML = "";
  if (!state.settings.leaderboard.length) {
    const li = document.createElement("li");
    li.className = "leaderboard-empty";
    li.textContent = "Aucun score pour l'instant.";
    els.leaderboardList.appendChild(li);
    return;
  }

  state.settings.leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    const pct = entry.total > 0 ? Math.round((entry.hits / entry.total) * 100) : 0;
    const date = new Date(entry.playedAt).toLocaleDateString("fr-FR");
    li.textContent = `${index + 1}. ${entry.points} pts - ${entry.hits}/${entry.total} (${pct}%) - ${date}`;
    els.leaderboardList.appendChild(li);
  });
}

function cancelChallengeSilently() {
  clearCelebration();
  clearChallengeTimer();
  state.challenge.active = false;
  state.challenge.score = 0;
  state.challenge.hits = 0;
  state.challenge.total = 0;
  state.challenge.current = null;
  state.challenge.progress = 0;
  state.challenge.bricks = [];
  state.challenge.imageTargets = pickImageTargets();
  state.challenge.timeLeft = CHALLENGE_DURATION_SECONDS;

  els.challengeStart.disabled = false;
  els.challengeAnswer.disabled = true;
  els.challengeSubmit.disabled = true;
  els.challengeAnswer.value = "";
  els.challengeQuestion.textContent = state.challenge.mode === "timed" ? CHALLENGE_IDLE_TEXT : "";
  setFeedback(els.challengeInlineResult, "", "");
  renderChallengeVisuals();
  updateChallengeUI();
}

function stopChallenge(reason = "") {
  clearChallengeTimer();
  state.challenge.active = false;
  els.challengeStart.disabled = false;
  els.challengeAnswer.disabled = true;
  els.challengeSubmit.disabled = true;

  if (state.challenge.mode === "timed") {
    let rank = -1;
    if (reason === "timeup") {
      rank = addLeaderboardEntry(state.challenge.score, state.challenge.hits, state.challenge.total);
      saveState();
      renderLeaderboard();
    }
    const pct = state.challenge.total > 0 ? Math.round((state.challenge.hits / state.challenge.total) * 100) : 0;
    const text =
      reason === "timeup"
        ? `Temps écoulé: ${state.challenge.score} pts (${state.challenge.hits}/${state.challenge.total}, ${pct}%).`
        : `Partie terminée: ${state.challenge.score} pts (${state.challenge.hits}/${state.challenge.total}, ${pct}%).`;
    setFeedback(els.challengeInlineResult, "good", text);
    if (reason === "timeup" && rank > 0 && rank <= 3) {
      triggerCelebration();
    }
    return;
  }

  const progress = state.challenge.mode === "image" ? state.challenge.progress : state.challenge.bricks.length;
  setFeedback(els.challengeInlineResult, "good", `Partie finie: ${progress} / ${GAME_MAX_STEPS}.`);
  if (reason === "completed") {
    triggerCelebration();
  }
}

function nextChallengeQuestion() {
  state.challenge.current = pickFact({
    filter: "all",
    avoidId: state.challenge.current ? state.challenge.current.id : null,
  });

  if (!state.challenge.current) {
    stopChallenge("no-facts");
    setFeedback(els.challengeInlineResult, "bad", "Aucune table active. Va dans Configuration.");
    return;
  }

  const { a, b } = state.challenge.current;
  els.challengeQuestion.textContent = `${a} x ${b} = ?`;
  els.challengeAnswer.value = "";
  setFeedback(els.challengeInlineResult, "", "");
}

function onKeypadPress(event) {
  const btn = event.target.closest("button[data-key], button[data-action]");
  if (!btn) {
    return;
  }
  const keypad = event.currentTarget;
  const inputId = keypad.dataset.inputId;
  const formId = keypad.dataset.formId;
  const input = document.getElementById(inputId);
  const form = document.getElementById(formId);
  if (!input || !form || input.disabled) {
    return;
  }

  const key = btn.dataset.key;
  const action = btn.dataset.action;

  if (key !== undefined) {
    if (input.value.length >= MAX_ANSWER_DIGITS) {
      return;
    }
    input.value = `${input.value}${key}`;
    return;
  }

  if (action === "back" || action === "delete") {
    input.value = input.value.slice(0, -1);
    return;
  }
  if (action === "clear" || action === "erase") {
    input.value = "";
    return;
  }
  if (action === "submit" && input.value !== "") {
    form.requestSubmit();
  }
}

function startChallenge() {
  if (state.challenge.active) {
    return;
  }
  clearCelebration();
  if (!state.settings.enabledTables.length) {
    setFeedback(els.challengeInlineResult, "bad", "Aucune table active. Va dans Configuration.");
    return;
  }

  state.challenge.active = true;
  state.challenge.score = 0;
  state.challenge.hits = 0;
  state.challenge.total = 0;
  state.challenge.current = null;
  state.challenge.progress = 0;
  state.challenge.bricks = [];
  state.challenge.imageTargets = pickImageTargets();
  state.challenge.timeLeft = CHALLENGE_DURATION_SECONDS;

  els.challengeStart.disabled = true;
  els.challengeAnswer.disabled = false;
  els.challengeSubmit.disabled = false;
  setFeedback(els.challengeInlineResult, "", "");
  renderChallengeVisuals();
  updateChallengeUI();
  nextChallengeQuestion();

  if (state.challenge.mode === "timed") {
    state.challenge.timerId = setInterval(() => {
      state.challenge.timeLeft -= 1;
      updateChallengeUI();
      if (state.challenge.timeLeft <= 0) {
        stopChallenge("timeup");
        renderProgress();
      }
    }, 1000);
  }
}

function onChallengeSubmit(event) {
  event.preventDefault();
  if (!state.challenge.active || !state.challenge.current) {
    return;
  }
  const val = Number(els.challengeAnswer.value);
  if (!Number.isFinite(val)) {
    return;
  }

  const ok = val === state.challenge.current.result;
  state.challenge.total += 1;
  updateProgress(state.challenge.current.id, ok);
  const factText = `${state.challenge.current.a} x ${state.challenge.current.b} = ${state.challenge.current.result}`;

  if (state.challenge.mode === "timed") {
    if (ok) {
      state.challenge.hits += 1;
      state.challenge.score = clampToRange(
        state.challenge.score + pointsForTimedSuccess(state.challenge.current),
        0,
        TIMED_MAX_SCORE,
      );
    } else {
      state.challenge.score = clampToRange(state.challenge.score - TIMED_WRONG_PENALTY, 0, TIMED_MAX_SCORE);
    }

    if (ok) {
      setFeedback(els.challengeInlineResult, "good", `Bravo ! ${factText}.`);
    } else {
      setFeedback(els.challengeInlineResult, "bad", `Essaye encore : ${factText}.`);
    }

    updateChallengeUI();
    els.challengeAnswer.disabled = true;
    els.challengeSubmit.disabled = true;
    setTimeout(() => {
      if (!state.challenge.active) {
        return;
      }
      els.challengeAnswer.disabled = false;
      els.challengeSubmit.disabled = false;
      nextChallengeQuestion();
    }, CHALLENGE_RESULT_DELAY_MS);
    return;
  }

  if (ok) {
    state.challenge.score += 1;
  }

  if (state.challenge.mode === "image") {
    if (ok) {
      state.challenge.progress = Math.min(GAME_MAX_STEPS, state.challenge.progress + 1);
      setFeedback(els.challengeInlineResult, "good", `Bravo ! ${factText}.`);
    } else {
      state.challenge.progress = Math.max(0, state.challenge.progress - 1);
      setFeedback(els.challengeInlineResult, "bad", `Essaye encore : ${factText}.`);
    }
  } else {
    if (ok) {
      if (state.challenge.bricks.length < GAME_MAX_STEPS) {
        state.challenge.bricks.push({
          table: state.challenge.current.a,
          cracks: 0,
        });
      }
      setFeedback(els.challengeInlineResult, "good", `Bravo ! ${factText}.`);
    } else if (state.challenge.bricks.length) {
      const topBrick = state.challenge.bricks[state.challenge.bricks.length - 1];
      topBrick.cracks += 1;
      if (topBrick.cracks >= 3) {
        state.challenge.bricks.pop();
        setFeedback(els.challengeInlineResult, "bad", `La brique casse ! ${factText}.`);
      } else {
        setFeedback(els.challengeInlineResult, "bad", `Brique fissurée (${topBrick.cracks}/3). ${factText}.`);
      }
    } else {
      setFeedback(els.challengeInlineResult, "bad", `Essaye encore : ${factText}.`);
    }
  }

  renderChallengeVisuals();
  updateChallengeUI();

  const progress = state.challenge.mode === "image" ? state.challenge.progress : state.challenge.bricks.length;
  if (progress >= GAME_MAX_STEPS) {
    stopChallenge("completed");
    return;
  }

  els.challengeAnswer.disabled = true;
  els.challengeSubmit.disabled = true;
  setTimeout(() => {
    if (!state.challenge.active) {
      return;
    }
    els.challengeAnswer.disabled = false;
    els.challengeSubmit.disabled = false;
    nextChallengeQuestion();
  }, CHALLENGE_RESULT_DELAY_MS);
}

function renderTimedGame() {
  els.timedGame.hidden = state.challenge.mode !== "timed";
}

function renderImageGame() {
  els.imageEmojiCells.forEach((cell, idx) => {
    cell.textContent = state.challenge.imageTargets[idx] || "⭐";
  });
  els.imageMaskTiles.forEach((tile, tileIndex) => {
    const revealIndex = IMAGE_TILE_ORDER[tileIndex] ?? tileIndex;
    tile.hidden = revealIndex < state.challenge.progress;
  });
}

function renderTowerGame() {
  els.towerStack.innerHTML = "";
  for (let visualIndex = 0; visualIndex < GAME_MAX_STEPS; visualIndex += 1) {
    const brickIndex = GAME_MAX_STEPS - 1 - visualIndex;
    const brick = state.challenge.bricks[brickIndex];
    const slot = document.createElement("div");
    slot.className = "tower-slot";

    if (brick) {
      const block = document.createElement("div");
      block.className = `tower-brick table-${brick.table} ${brick.cracks ? `crack-${brick.cracks}` : ""}`;
      block.title = `Brique ${brickIndex + 1}`;
      slot.appendChild(block);
    }

    els.towerStack.appendChild(slot);
  }
}

function renderChallengeVisuals() {
  const timedMode = state.challenge.mode === "timed";
  const imageMode = state.challenge.mode === "image";

  els.timedGame.hidden = !timedMode;
  els.imageGame.hidden = !imageMode;
  els.towerGame.hidden = timedMode || imageMode;
  els.gameModeTimed.classList.toggle("is-active", timedMode);
  els.gameModeImage.classList.toggle("is-active", imageMode);
  els.gameModeTower.classList.toggle("is-active", state.challenge.mode === "tower");
  els.challengeTimer.hidden = timedMode;
  els.challengeTimerGauge.hidden = !timedMode;
  els.challengeStart.textContent = timedMode ? "Démarrer le défi" : "Rejouer";

  renderTimedGame();
  renderImageGame();
  renderTowerGame();
  renderLeaderboard();
}

function renderChallengeLayout() {
  const rightSide = state.settings.visualSide === "right";
  els.challengePanel.classList.toggle("visual-right", rightSide);
}

function setChallengeMode(mode) {
  if (mode !== "timed" && mode !== "image" && mode !== "tower") {
    return;
  }
  state.challenge.mode = mode;
  cancelChallengeSilently();
  saveState();
  if (mode !== "timed") {
    startChallenge();
  }
}

function renderProgress() {
  let attempts = 0;
  let correct = 0;
  let mastered = 0;
  let due = 0;
  const now = Date.now();

  const difficult = FACTS.map((fact) => {
    const entry = getEntry(fact.id);
    attempts += entry.attempts;
    correct += entry.correct;
    if (entry.attempts > 0 && entry.nextDue <= now) {
      due += 1;
    }
    if (entry.attempts >= 6 && accuracy(entry) >= 0.85 && entry.box >= 3) {
      mastered += 1;
    }
    return {
      fact,
      entry,
      score: (1 - accuracy(entry)) + (1 - Math.min(entry.streak, 5) / 5),
    };
  });

  els.statAccuracy.textContent = attempts ? formatPct(correct / attempts) : "0%";
  els.statMastered.textContent = `${mastered} / 100`;
  els.statDue.textContent = `${due}`;

  els.heatmap.innerHTML = "";
  for (let a = 1; a <= 10; a += 1) {
    for (let b = 1; b <= 10; b += 1) {
      const fact = FACTS.find((f) => f.a === a && f.b === b);
      const m = mastery(getEntry(fact.id));
      const level = Math.min(4, Math.floor(m * 5));
      const cell = document.createElement("div");
      cell.className = `heat-cell m${level}`;
      cell.textContent = `${a}x${b}`;
      cell.title = `${a}x${b} - réussite estimée ${Math.round(m * 100)}%`;
      els.heatmap.appendChild(cell);
    }
  }

  const weak = difficult
    .filter((x) => x.entry.attempts > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 7);

  els.weakFacts.innerHTML = "";
  if (!weak.length) {
    const li = document.createElement("li");
    li.textContent = "Fais quelques questions pour voir tes premiers résultats.";
    els.weakFacts.appendChild(li);
    return;
  }

  weak.forEach(({ fact, entry }) => {
    const li = document.createElement("li");
    const dueTag = entry.nextDue <= now ? "à revoir" : "bien";
    li.textContent = `${fact.a} x ${fact.b} - réussite ${formatPct(accuracy(entry))}, ${dueTag}`;
    els.weakFacts.appendChild(li);
  });
}

function setTab(tabId) {
  els.tabs.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tabTarget === tabId);
  });
  els.panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === tabId);
  });
  if (tabId === "challenge" && state.challenge.mode !== "timed" && !state.challenge.active) {
    startChallenge();
  }
}

function renderTrainFilterOptions() {
  const current = state.train.filter;
  const enabled = [...state.settings.enabledTables].sort((a, b) => a - b);

  els.trainFilter.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "Toutes les tables actives";
  els.trainFilter.appendChild(allOpt);

  enabled.forEach((table) => {
    const opt = document.createElement("option");
    opt.value = `${table}`;
    opt.textContent = `Table de ${table}`;
    els.trainFilter.appendChild(opt);
  });

  if (current !== "all" && !enabled.includes(Number(current))) {
    state.train.filter = "all";
  }
  els.trainFilter.value = state.train.filter;
}

function renderSettingsTables() {
  const enabled = state.settings.enabledTables;
  els.settingsTableButtons.forEach((btn) => {
    const table = Number(btn.dataset.configTable);
    const active = enabled.includes(table);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const summary = enabled.join(", ");
  els.settingsActiveSummary.textContent = `${enabled.length} table(s) active(s): ${summary}.`;

  const leftActive = state.settings.visualSide !== "right";
  els.settingsVisualLeft.classList.toggle("is-active", leftActive);
  els.settingsVisualLeft.setAttribute("aria-pressed", leftActive ? "true" : "false");
  els.settingsVisualRight.classList.toggle("is-active", !leftActive);
  els.settingsVisualRight.setAttribute("aria-pressed", !leftActive ? "true" : "false");
}

function applyVisualSide(value) {
  state.settings.visualSide = sanitizeVisualSide(value);
  saveState();
  renderSettingsTables();
  renderChallengeLayout();
}

function applySettingsTables(newTables) {
  state.settings.enabledTables = sanitizeEnabledTables(newTables);
  if (state.train.filter !== "all" && !state.settings.enabledTables.includes(Number(state.train.filter))) {
    state.train.filter = "all";
  }
  saveState();
  renderSettingsTables();
  renderTrainFilterOptions();
  showNextTrainQuestion();
  renderProgress();

  if (state.challenge.active && state.challenge.current && !state.settings.enabledTables.includes(state.challenge.current.a)) {
    nextChallengeQuestion();
  }
}

function onSettingsTableToggle(event) {
  const btn = event.currentTarget;
  const table = Number(btn.dataset.configTable);
  const enabled = [...state.settings.enabledTables];
  const isActive = enabled.includes(table);

  if (isActive && enabled.length === 1) {
    setSettingsStatus("Au moins une table doit rester active.", "bad");
    return;
  }

  const next = isActive ? enabled.filter((t) => t !== table) : [...enabled, table];
  applySettingsTables(next);
  setSettingsStatus("Configuration enregistrée.", "good");
}

function buildBackupPayload() {
  return {
    app: "TableQuest",
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      progress: state.progress,
      learnTable: state.learnTable,
      learnMultiplier: state.learnMultiplier,
      settings: {
        enabledTables: state.settings.enabledTables,
        gameMode: state.challenge.mode,
        leaderboard: state.settings.leaderboard,
        visualSide: state.settings.visualSide,
      },
    },
  };
}

function exportBackupFile() {
  const payload = buildBackupPayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);

  const link = document.createElement("a");
  link.href = url;
  link.download = `tablequest-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  setSettingsStatus("Export terminé: fichier téléchargé.", "good");
}

async function exportBackupEmail() {
  const payload = buildBackupPayload();
  const compactJson = JSON.stringify(payload);
  let copied = false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(compactJson);
      copied = true;
    } catch (err) {
      copied = false;
    }
  }

  const subject = encodeURIComponent("Sauvegarde TableQuest");
  const lines = [
    "Bonjour,",
    "",
    "Voici ma sauvegarde TableQuest.",
  ];

  if (compactJson.length <= 1400) {
    lines.push("", compactJson);
  } else if (copied) {
    lines.push("", "Les données JSON ont été copiées dans le presse-papiers. Colle-les ici avant d'envoyer.");
  } else {
    lines.push("", "Le JSON est trop long pour le mail direct. Utilise plutôt Exporter en fichier.");
  }

  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;

  if (copied) {
    setSettingsStatus("Email préparé. Les données sont copiées dans le presse-papiers.", "good");
  } else {
    setSettingsStatus("Email préparé. Si besoin, utilise Exporter en fichier.", "");
  }
}

function applyImportedPayload(payload) {
  const source = payload && typeof payload === "object" && payload.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object") {
    throw new Error("Format invalide");
  }

  state.progress = sanitizeProgress(source.progress);
  state.learnTable = Number.isInteger(source.learnTable) ? clampToRange(source.learnTable, 1, 10) : 2;
  state.learnMultiplier = Number.isInteger(source.learnMultiplier) ? clampToRange(source.learnMultiplier, 1, 10) : 4;

  const importedTables = source.settings?.enabledTables || source.enabledTables;
  state.settings.enabledTables = sanitizeEnabledTables(importedTables);
  state.settings.leaderboard = sanitizeLeaderboard(source.settings?.leaderboard);
  state.settings.visualSide = sanitizeVisualSide(source.settings?.visualSide);
  if (
    source.settings?.gameMode === "timed" ||
    source.settings?.gameMode === "image" ||
    source.settings?.gameMode === "tower"
  ) {
    state.challenge.mode = source.settings.gameMode;
  }

  state.train.filter = "all";
  state.train.asked = 0;
  state.train.correct = 0;
  state.train.current = null;
  state.train.answered = false;

  cancelChallengeSilently();

  saveState();
  renderLearn();
  renderTrainFilterOptions();
  renderSettingsTables();
  renderChallengeLayout();
  updateTrainCounters();
  showNextTrainQuestion();
  renderProgress();
}

async function onImportFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    applyImportedPayload(parsed);
    setSettingsStatus("Import terminé: les résultats ont été chargés.", "good");
  } catch (err) {
    setSettingsStatus("Import impossible: fichier JSON invalide.", "bad");
  } finally {
    event.target.value = "";
  }
}

function resetAllData() {
  const first = window.confirm("Cette action va tout effacer (résultats + configuration). Continuer ?");
  if (!first) {
    setSettingsStatus("Remise à zéro annulée.", "");
    return;
  }

  const typed = window.prompt(`Confirmation finale: tape ${RESET_CONFIRM_WORD}`);
  if (typed !== RESET_CONFIRM_WORD) {
    setSettingsStatus("Mot de confirmation incorrect. Aucune donnée effacée.", "bad");
    return;
  }

  state.progress = {};
  state.learnTable = 2;
  state.learnMultiplier = 4;
  state.settings.enabledTables = [...DEFAULT_TABLES];
  state.settings.leaderboard = [];
  state.settings.visualSide = "left";
  state.challenge.mode = "timed";

  state.train.filter = "all";
  state.train.asked = 0;
  state.train.correct = 0;
  state.train.current = null;
  state.train.answered = false;

  cancelChallengeSilently();

  saveState();
  renderLearn();
  renderTrainFilterOptions();
  renderSettingsTables();
  renderChallengeLayout();
  updateTrainCounters();
  showNextTrainQuestion();
  renderProgress();
  setSettingsStatus("Remise à zéro terminée.", "good");
}

function bindEvents() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setTab(tab.dataset.tabTarget);
      if (tab.dataset.tabTarget === "progress") {
        renderProgress();
      }
      if (tab.dataset.tabTarget === "settings") {
        renderSettingsTables();
      }
    });
  });

  els.learnTableButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.learnTable = Number(btn.dataset.learnTable);
      saveState();
      renderLearn();
    });
  });

  els.learnMultiplierButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.learnMultiplier = Number(btn.dataset.learnMultiplier);
      saveState();
      renderLearn();
    });
  });

  els.trainFilter.addEventListener("change", () => {
    state.train.filter = els.trainFilter.value;
    showNextTrainQuestion();
  });
  els.trainForm.addEventListener("submit", onTrainSubmit);
  els.trainNext.addEventListener("click", showNextTrainQuestion);

  els.keypads.forEach((keypad) => {
    keypad.addEventListener("click", onKeypadPress);
  });

  els.challengeStart.addEventListener("click", startChallenge);
  els.challengeForm.addEventListener("submit", onChallengeSubmit);
  els.gameModeTimed.addEventListener("click", () => {
    setChallengeMode("timed");
  });
  els.gameModeImage.addEventListener("click", () => {
    setChallengeMode("image");
  });
  els.gameModeTower.addEventListener("click", () => {
    setChallengeMode("tower");
  });
  els.leaderboardClear.addEventListener("click", () => {
    state.settings.leaderboard = [];
    saveState();
    renderLeaderboard();
    setSettingsStatus("Leaderboard vidé.", "good");
  });

  els.settingsTableButtons.forEach((btn) => {
    btn.addEventListener("click", onSettingsTableToggle);
  });
  els.settingsVisualLeft.addEventListener("click", () => {
    applyVisualSide("left");
    setSettingsStatus("Affichage du jeu: visuel à gauche.", "good");
  });
  els.settingsVisualRight.addEventListener("click", () => {
    applyVisualSide("right");
    setSettingsStatus("Affichage du jeu: visuel à droite.", "good");
  });

  els.settingsExportFile.addEventListener("click", exportBackupFile);
  els.settingsExportEmail.addEventListener("click", exportBackupEmail);
  els.settingsImportBtn.addEventListener("click", () => {
    els.settingsImportInput.click();
  });
  els.settingsImportInput.addEventListener("change", onImportFileChange);
  els.settingsResetBtn.addEventListener("click", resetAllData);
}

function init() {
  loadState();
  renderTrainFilterOptions();
  bindEvents();

  renderLearn();
  renderSettingsTables();
  renderChallengeLayout();
  updateTrainCounters();
  showNextTrainQuestion();
  cancelChallengeSilently();
  renderProgress();
}

init();
