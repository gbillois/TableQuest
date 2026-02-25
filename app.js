const STORAGE_KEY = "tablequest-progress-v2";
const INTERVALS_MS = [0, 4 * 3600_000, 24 * 3600_000, 3 * 24 * 3600_000, 7 * 24 * 3600_000, 14 * 24 * 3600_000];
const MAX_ANSWER_DIGITS = 3;
const CHALLENGE_RESULT_DELAY_MS = 1650;
const CHALLENGE_IDLE_TEXT = 'Appuie sur "Démarrer le défi".';
const RESET_CONFIRM_WORD = "EFFACER";
const DEFAULT_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const FACTS = [];

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
    timeLeft: 60,
    score: 0,
    total: 0,
    current: null,
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
  challengeTimer: document.getElementById("challenge-timer"),
  challengeScore: document.getElementById("challenge-score"),
  challengeQuestion: document.getElementById("challenge-question"),
  challengeInlineResult: document.getElementById("challenge-inline-result"),
  challengeForm: document.getElementById("challenge-form"),
  challengeAnswer: document.getElementById("challenge-answer"),
  challengeSubmit: document.getElementById("challenge-submit"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statMastered: document.getElementById("stat-mastered"),
  statDue: document.getElementById("stat-due"),
  heatmap: document.getElementById("heatmap"),
  weakFacts: document.getElementById("weak-facts"),
  settingsTableButtons: [...document.querySelectorAll("[data-config-table]")],
  settingsActiveSummary: document.getElementById("settings-active-summary"),
  settingsStatus: document.getElementById("settings-status"),
  settingsExportFile: document.getElementById("settings-export-file"),
  settingsExportEmail: document.getElementById("settings-export-email"),
  settingsImportBtn: document.getElementById("settings-import-btn"),
  settingsImportInput: document.getElementById("settings-import-input"),
  settingsResetBtn: document.getElementById("settings-reset-btn"),
};

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
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("tablequest-progress-v1");
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

function pickFact({ filter = "all", avoidId = null, dueBias = true } = {}) {
  const now = Date.now();
  const pool = factPool(filter).filter((fact) => fact.id !== avoidId);
  if (!pool.length) {
    return null;
  }

  const scored = pool.map((fact) => {
    const entry = getEntry(fact.id);
    const due = entry.nextDue <= now ? 1 : 0;
    const diff = 1 - accuracy(entry);
    const lowStreak = 1 - Math.min(entry.streak, 5) / 5;
    const w = diff * 0.58 + lowStreak * 0.27 + due * 0.15;
    return { fact, score: w, due };
  });

  let candidates = scored;
  if (dueBias) {
    const dueOnly = scored.filter((s) => s.due);
    if (dueOnly.length) {
      candidates = dueOnly;
    }
  }

  candidates.sort((x, y) => y.score - x.score);
  const top = candidates.slice(0, Math.min(8, candidates.length));
  return top[Math.floor(Math.random() * top.length)].fact;
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
    dueBias: true,
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
  els.challengeTimer.textContent = `Temps: ${state.challenge.timeLeft}s`;
  els.challengeScore.textContent = `Score: ${state.challenge.score} / ${state.challenge.total}`;
}

function clearChallengeTimer() {
  if (state.challenge.timerId) {
    clearInterval(state.challenge.timerId);
    state.challenge.timerId = null;
  }
}

function cancelChallengeSilently() {
  clearChallengeTimer();
  state.challenge.active = false;
  state.challenge.timeLeft = 60;
  state.challenge.score = 0;
  state.challenge.total = 0;
  state.challenge.current = null;

  els.challengeStart.disabled = false;
  els.challengeAnswer.disabled = true;
  els.challengeSubmit.disabled = true;
  els.challengeAnswer.value = "";
  els.challengeQuestion.textContent = CHALLENGE_IDLE_TEXT;
  setFeedback(els.challengeInlineResult, "", "");
  updateChallengeUI();
}

function stopChallenge() {
  clearChallengeTimer();
  state.challenge.active = false;
  els.challengeStart.disabled = false;
  els.challengeAnswer.disabled = true;
  els.challengeSubmit.disabled = true;
  setFeedback(els.challengeInlineResult, "", "");
  const pct = state.challenge.total ? Math.round((state.challenge.score / state.challenge.total) * 100) : 0;
  setFeedback(els.challengeInlineResult, "good", `Défi fini : ${state.challenge.score}/${state.challenge.total} (${pct}%).`);
}

function nextChallengeQuestion() {
  state.challenge.current = pickFact({
    filter: "all",
    avoidId: state.challenge.current ? state.challenge.current.id : null,
    dueBias: false,
  });

  if (!state.challenge.current) {
    stopChallenge();
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
  if (!state.settings.enabledTables.length) {
    setFeedback(els.challengeInlineResult, "bad", "Aucune table active. Va dans Configuration.");
    return;
  }

  state.challenge.active = true;
  state.challenge.timeLeft = 60;
  state.challenge.score = 0;
  state.challenge.total = 0;
  state.challenge.current = null;

  els.challengeStart.disabled = true;
  els.challengeAnswer.disabled = false;
  els.challengeSubmit.disabled = false;
  setFeedback(els.challengeInlineResult, "", "");
  updateChallengeUI();
  nextChallengeQuestion();

  state.challenge.timerId = setInterval(() => {
    state.challenge.timeLeft -= 1;
    updateChallengeUI();
    if (state.challenge.timeLeft <= 0) {
      stopChallenge();
      renderProgress();
    }
  }, 1000);
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
  if (ok) {
    state.challenge.score += 1;
  }
  updateProgress(state.challenge.current.id, ok);
  updateChallengeUI();

  if (ok) {
    setFeedback(
      els.challengeInlineResult,
      "good",
      `Bravo ! ${state.challenge.current.a} x ${state.challenge.current.b} = ${state.challenge.current.result}.`,
    );
  } else {
    setFeedback(
      els.challengeInlineResult,
      "bad",
      `Essaye encore : ${state.challenge.current.a} x ${state.challenge.current.b} = ${state.challenge.current.result}.`,
    );
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
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      progress: state.progress,
      learnTable: state.learnTable,
      learnMultiplier: state.learnMultiplier,
      settings: {
        enabledTables: state.settings.enabledTables,
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

  els.settingsTableButtons.forEach((btn) => {
    btn.addEventListener("click", onSettingsTableToggle);
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
  updateTrainCounters();
  showNextTrainQuestion();
  cancelChallengeSilently();
  renderProgress();
}

init();
