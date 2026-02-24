// ═══════════════════════════════════════════
//  MEDAGLIERE MILANO CORTINA 2026
//  app.js  –  logica applicazione
// ═══════════════════════════════════════════

const DATA_URL = './data.json';

// ── STATE ──────────────────────────────────
let state = {
  nations: [],
  sort: 'gold',    // 'total' | 'gold' | 'silver' | 'bronze' | 'alpha'
  query: '',
  meta: {}
};

// ── INIT ───────────────────────────────────
async function init() {
  try {
    const res  = await fetch(DATA_URL);
    const json = await res.json();
    state.meta    = { event: json.event, dates: json.dates };
    state.nations = json.nations.map(n => ({
      ...n,
      total: n.gold + n.silver + n.bronze,
      flagUrl: `https://flagcdn.com/w80/${n.code.toLowerCase()}.png`
    }));
    renderMeta();
    renderSummary();
    render();
  } catch (e) {
    document.getElementById('table-body').innerHTML =
      '<div class="no-results">⚠️ Impossibile caricare i dati.</div>';
    console.error(e);
  }
}

// ── META ───────────────────────────────────
function renderMeta() {
  const el = document.getElementById('event-meta');
  if (el) el.textContent = `${state.meta.event} · ${state.meta.dates}`;
}

// ── SUMMARY CARDS ──────────────────────────
function renderSummary() {
  const totG = state.nations.reduce((a, n) => a + n.gold,   0);
  const totS = state.nations.reduce((a, n) => a + n.silver, 0);
  const totB = state.nations.reduce((a, n) => a + n.bronze, 0);
  document.getElementById('sum-gold').textContent   = totG;
  document.getElementById('sum-silver').textContent = totS;
  document.getElementById('sum-bronze').textContent = totB;
  document.getElementById('sum-nations').textContent =
    state.nations.filter(n => n.total > 0).length;
}

// ── SORT ───────────────────────────────────
function setSort(key) {
  state.sort = key;
  document.querySelectorAll('.sort-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.sort === key);
  });
  render();
}

// ── FILTER ─────────────────────────────────
function onSearch(e) {
  state.query = e.target.value.toLowerCase().trim();
  render();
}

// ── SORT LOGIC ─────────────────────────────
function sorted(nations) {
  const arr = [...nations];
  switch (state.sort) {
    case 'gold':
      return arr.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total);
    case 'silver':
      return arr.sort((a, b) => b.silver - a.silver || b.gold - a.gold || b.bronze - a.bronze || b.total - a.total);
    case 'bronze':
      return arr.sort((a, b) => b.bronze - a.bronze || b.gold - a.gold || b.silver - a.silver || b.total - a.total);
    case 'alpha':
      return arr.sort((a, b) => a.country.localeCompare(b.country, 'it'));
    default: // total
      return arr.sort((a, b) => b.total - a.total || b.gold - a.gold || b.silver - a.silver);
  }
}

// ── RENDER ─────────────────────────────────
function render() {
  const maxTotal = Math.max(...state.nations.map(n => n.total)) || 1;

  let list = state.nations;

  // Filter by search
  if (state.query) {
    list = list.filter(n =>
      n.country.toLowerCase().includes(state.query) ||
      n.code.toLowerCase().includes(state.query) ||
      (n.emoji && n.emoji.includes(state.query))
    );
  }

  list = sorted(list);

  const body = document.getElementById('table-body');

  if (list.length === 0) {
    body.innerHTML = '<div class="no-results">Nessuna nazione trovata 🔍</div>';
    return;
  }

  body.innerHTML = list.map((n, i) => buildRow(n, i, maxTotal)).join('');
}

// ── BUILD ROW ──────────────────────────────
function buildRow(n, i, maxTotal) {
  const rank     = i + 1;
  const isPodium = rank <= 3 && !state.query;
  const isHost   = false; // rimosso highlight speciale per l'Italia

  // Medal bar widths (proportional to maxTotal)
  const scale = 100 / maxTotal;
  const gW = (n.gold   * scale).toFixed(1);
  const sW = (n.silver * scale).toFixed(1);
  const bW = (n.bronze * scale).toFixed(1);

  const medal = (val, cls) => val > 0
    ? `<span class="${cls}">${val}</span>`
    : `<span class="zero">0</span>`;

  return `
  <div class="row${isHost ? ' host-nation' : ''}" style="animation-delay:${Math.min(i * 0.03, 0.6)}s">

    <div class="col-rank${isPodium ? ' podium' : ''}">${rank}</div>

    <div class="col-country">
      <img class="flag-img" src="${n.flagUrl}" alt="${n.country}" loading="lazy"
           onerror="this.style.opacity='0.3'">
      <div class="country-info">
        <div class="country-name">
          <span class="country-emoji">${n.emoji}</span>
          ${n.country}
          ${isHost ? '<span class="host-badge">🏠 Host</span>' : ''}
        </div>
        <div class="country-meta">
          <span class="country-code">${n.code}</span>
          <div class="medal-bar">
            <div class="bar-g" style="width:${gW}%"></div>
            <div class="bar-s" style="width:${sW}%"></div>
            <div class="bar-b" style="width:${bW}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-medal col-g">${medal(n.gold,   'col-g')}</div>
    <div class="col-medal col-s">${medal(n.silver, 'col-s')}</div>
    <div class="col-medal col-b">${medal(n.bronze, 'col-b')}</div>
    <div class="col-total">${n.total > 0 ? n.total : '<span class="zero">0</span>'}</div>

  </div>`;
}

// ── START ──────────────────────────────────
document.addEventListener('DOMContentLoaded', init);