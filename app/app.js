// Leonida Platinum — GTA VI trophy guide + tracker.
// Loads the official 55 from data/trophies.json, renders the checklist,
// saves earned ticks and counters in localStorage, and exports/imports them.
// Filters: kind (story / missable / collectibles / activities / online),
// grade, text search, hide-earned, and a spoiler setting that masks
// hidden story trophies until they are earned.
const SAVE_KEY = 'leonida-platinum-progress-v1';
const COUNT_KEY = 'leonida-platinum-counts-v1';
const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const progressText = document.getElementById('progressText');
const gradeText = document.getElementById('gradeText');
const progressFill = document.getElementById('progressFill');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const roadmapEl = document.getElementById('roadmap');
const emptyMsg = document.getElementById('emptyMsg');
const listHeading = document.getElementById('listHeading');

const ROADMAP_STAGES = [
  { n: 1, title: 'Play the story', text: 'Chapters 1–5 and every mission trophy. Do the Chapter 1 balcony meditation first — the one possibly missable trophy.' },
  { n: 2, title: 'Side characters', text: 'Andy, Kenton, Billy, Randy, Tyrone — finish each strand, plus 8 stranger strands for the silver.' },
  { n: 3, title: 'Activities', text: 'Shooting range golds (42), drone races (14), 20 races, stunts, challenges, bowling, arcade, fishing.' },
  { n: 4, title: 'Crime & partner', text: 'Bank vaults (5), armored truck, gang operations (9), shops with your partner, Combat Focus, VCIA.' },
  { n: 5, title: 'Collectibles & Leonida', text: 'Card sets (3), WAiNK (100), vehicles (100), all 52 areas, garages (8), money trophies.' },
  { n: 6, title: '100% & platinum', text: 'Finish the in-game 100% checklist for the gold, then the platinum pops.' },
];
const SEED_EARNED = [2, 3, 8, 10, 15, 16, 18, 19, 21, 28, 30, 33, 42];

let trophies = [];
let earned = new Set(loadJson(SAVE_KEY, []));
let counts = loadJson(COUNT_KEY, {});
let kindFilter = 'all';
let selectedId = null;

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
}
function trophyById(id) {
  return trophies.find((t) => t.id === id);
}
function isSpoilerMasked(t) {
  return spoilerEl.checked && t.hidden && t.kind === 'story' && !earned.has(t.name);
}
function displayName(t) {
  return isSpoilerMasked(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
}
function displayDescription(t) {
  return isSpoilerMasked(t) ? 'Hidden on PlayStation until earned.' : t.description;
}
function countLabel(t) {
  if (t.count == null) return '';
  const done = counts[t.id] || 0;
  const unit = t.count >= 1000 ? '$' + t.count.toLocaleString('en-US') : String(t.count);
  return done + ' / ' + unit;
}
function matchesFilters(t) {
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.kind).toLowerCase().includes(q)) return false;
  return true;
}
function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const items = trophies.filter((t) => t.roadmap === stage.n);
    const li = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = 'Stage ' + stage.n + ' — ' + stage.title;
    const text = document.createElement('div');
    text.textContent = stage.text;
    const count = document.createElement('div');
    count.className = 'n';
    count.textContent = items.length + ' trophies';
    li.append(title, text, count);
    roadmapEl.append(li);
  }
}
function renderList() {
  listEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!matchesFilters(t)) continue;
    shown += 1;
    const li = document.createElement('li');
    if (earned.has(t.name)) li.classList.add('earned');
    if (t.id === selectedId) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveProgress();
      renderAll();
    });
    box.addEventListener('click', (event) => event.stopPropagation());
    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tname';
    name.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = displayDescription(t);
    const tags = document.createElement('div');
    tags.className = 'tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = 'tag ' + t.grade;
    gradeTag.textContent = t.grade;
    tags.append(gradeTag);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag kind';
    kindTag.textContent = t.kind;
    tags.append(kindTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden';
      hiddenTag.textContent = 'hidden';
      tags.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'MISSABLE';
      tags.append(missTag);
    }
    main.append(name, desc, tags);
    const side = document.createElement('div');
    side.className = 'counter';
    side.textContent = countLabel(t);
    li.append(box, main, side);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderAll();
    });
    listEl.append(li);
  }
  emptyMsg.hidden = shown !== 0;
  listHeading.textContent = 'Checklist — ' + shown + ' of 55 trophies';
}
function renderProgress() {
  const total = trophies.length || 55;
  const pct = Math.round((earned.size / total) * 100);
  progressText.textContent = earned.size + ' of ' + total + ' earned — ' + pct + '% to platinum';
  progressFill.style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) {
    if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  }
  const parts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => (byGrade[g] || 0) + ' ' + g)
    .join(' · ');
  gradeText.textContent = parts;
}
function renderDetail() {
  const t = trophyById(selectedId) || trophies[0];
  if (!t) {
    detailEl.textContent = 'Loading trophies…';
    return;
  }
  selectedId = t.id;
  detailEl.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = displayName(t);
  detailEl.append(heading);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = '“' + displayDescription(t) + '” — ' + t.grade + (t.hidden ? ' · hidden on PlayStation' : '');
  detailEl.append(official);
  const tagRow = document.createElement('div');
  tagRow.className = 'tags';
  for (const label of [t.kind, t.missable ? 'MISSABLE' : null, 'Roadmap stage ' + t.roadmap]) {
    if (!label) continue;
    const tag = document.createElement('span');
    tag.className = 'tag' + (label === 'MISSABLE' ? ' missable' : ' kind');
    tag.textContent = label;
    tagRow.append(tag);
  }
  detailEl.append(tagRow);
  if (isSpoilerMasked(t)) {
    const masked = document.createElement('p');
    masked.className = 'masked';
    masked.textContent = 'Spoiler-safe mode is on: this story trophy stays hidden until you tick it earned. Turn the spoiler setting off, or earn it, to read its guide.';
    detailEl.append(masked);
    return;
  }
  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'GUIDE';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailEl.append(guideTitle, guide);
  if (t.steps && t.steps.length) {
    const stepsTitle = document.createElement('h3');
    stepsTitle.textContent = 'STEPS';
    const steps = document.createElement('ol');
    for (const step of t.steps) {
      const item = document.createElement('li');
      item.textContent = step;
      steps.append(item);
    }
    detailEl.append(stepsTitle, steps);
  }
  if (t.count != null) {
    const countTitle = document.createElement('h3');
    countTitle.textContent = 'YOUR COUNTER — TARGET ' + (t.count >= 1000 ? '$' + t.count.toLocaleString('en-US') : t.count);
    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.addEventListener('click', () => {
      counts[t.id] = Math.max(0, (counts[t.id] || 0) - 1);
      saveProgress();
      renderAll();
    });
    const value = document.createElement('b');
    value.textContent = String(counts[t.id] || 0);
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      counts[t.id] = Math.min(t.count, (counts[t.id] || 0) + 1);
      saveProgress();
      renderAll();
    });
    stepper.append(minus, value, plus);
    detailEl.append(countTitle, stepper);
  }
  const sourcesTitle = document.createElement('h3');
  sourcesTitle.textContent = 'SOURCES — WHERE EACH FACT COMES FROM';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const source of t.sources || []) {
    const item = document.createElement('li');
    item.textContent = source;
    sources.append(item);
  }
  detailEl.append(sourcesTitle, sources);
}
function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}
function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('seed') === '1' && earned.size === 0) {
    for (const id of SEED_EARNED) {
      const t = trophyById(id);
      if (t) earned.add(t.name);
    }
    counts[15] = 120;
    counts[31] = 40;
    saveProgress();
  }
  const detailParam = Number(params.get('detail'));
  if (detailParam) selectedId = detailParam;
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (params.get('kind')) {
    kindFilter = params.get('kind');
    for (const button of document.querySelectorAll('#kinds button')) {
      button.classList.toggle('on', button.dataset.kind === kindFilter);
    }
  }
  if (params.get('q')) searchEl.value = params.get('q');
}
async function bootGuide() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies;
  applyUrlState();
  if (!selectedId) selectedId = 17;
  renderRoadmap();
  renderAll();
  window.__guideReady = true;
}
document.getElementById('kinds').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  kindFilter = button.dataset.kind;
  for (const item of document.querySelectorAll('#kinds button')) {
    item.classList.toggle('on', item === button);
  }
  renderAll();
});
searchEl.addEventListener('input', renderAll);
gradeEl.addEventListener('change', renderAll);
spoilerEl.addEventListener('change', renderAll);
hideEarnedEl.addEventListener('change', renderAll);
document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', earned: [...earned], counts };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set((names || []).filter((name) => known.has(name)));
    if (data.counts) counts = data.counts;
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks and counters?')) return;
  earned = new Set();
  counts = {};
  saveProgress();
  renderAll();
});
await bootGuide();
