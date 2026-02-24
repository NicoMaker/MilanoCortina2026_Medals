// ═══════════════════════════════════════════
//  MEDAGLIERE MILANO CORTINA 2026  –  app.js
// ═══════════════════════════════════════════

// ── STATO ─────────────────────────────────
const state = {
  nations: [],
  sort: "gold", // default: oro
  query: "",
  meta: {},
};

// ── CARICA DATI ────────────────────────────
async function init() {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();

    state.meta = { event: json.event, dates: json.dates };
    state.nations = json.nations.map((n) => ({
      ...n,
      total: n.gold + n.silver + n.bronze,
      displayName: n.shortName || n.country,
      flagUrl: "https://flagcdn.com/w80/" + n.code.toLowerCase() + ".png",
    }));

    renderMeta();
    renderSummary();
    setSort("gold"); // imposta bottone attivo E renderizza
  } catch (err) {
    document.getElementById("table-body").innerHTML =
      '<div class="no-results">⚠️ Apri con un server locale (es. Live Server in VS Code)</div>';
    console.error(err);
  }
}

// ── META HEADER ────────────────────────────
function renderMeta() {
  const el = document.getElementById("event-meta");
  if (el)
    el.textContent =
      state.meta.event + " · Milano Cortina 2026 · " + state.meta.dates;
}

// ── SUMMARY CARDS ──────────────────────────
function renderSummary() {
  const g = state.nations.reduce((a, n) => a + n.gold, 0);
  const s = state.nations.reduce((a, n) => a + n.silver, 0);
  const b = state.nations.reduce((a, n) => a + n.bronze, 0);
  document.getElementById("sum-gold").textContent = g;
  document.getElementById("sum-silver").textContent = s;
  document.getElementById("sum-bronze").textContent = b;
  document.getElementById("sum-nations").textContent = state.nations.filter(
    (n) => n.total > 0,
  ).length;
}

// ── SORT ───────────────────────────────────
function setSort(key) {
  state.sort = key;
  document
    .querySelectorAll(".sort-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.sort === key));
  render();
}

// ── SEARCH ─────────────────────────────────
function onSearch(e) {
  state.query = e.target.value.toLowerCase().trim();
  render();
}

// ── ORDINAMENTO ────────────────────────────
function sorted(list) {
  const arr = [...list];
  switch (state.sort) {
    case "gold":
      return arr.sort(
        (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze,
      );
    case "silver":
      return arr.sort(
        (a, b) => b.silver - a.silver || b.gold - a.gold || b.bronze - a.bronze,
      );
    case "bronze":
      return arr.sort(
        (a, b) => b.bronze - a.bronze || b.gold - a.gold || b.silver - a.silver,
      );
    case "alpha":
      return arr.sort((a, b) => a.country.localeCompare(b.country, "it"));
    default:
      return arr.sort(
        (a, b) => b.total - a.total || b.gold - a.gold || b.silver - a.silver,
      );
  }
}

// ── RENDER TABELLA ─────────────────────────
function render() {
  const maxTotal = Math.max(...state.nations.map((n) => n.total), 1);

  let list = state.nations;
  if (state.query) {
    list = list.filter(
      (n) =>
        n.country.toLowerCase().includes(state.query) ||
        n.code.toLowerCase().includes(state.query),
    );
  }
  list = sorted(list);

  const body = document.getElementById("table-body");
  if (list.length === 0) {
    body.innerHTML = '<div class="no-results">Nessuna nazione trovata 🔍</div>';
    return;
  }
  body.innerHTML = list.map((n, i) => buildRow(n, i, maxTotal)).join("");
}

// ── COSTRUZIONE RIGA ───────────────────────
function buildRow(n, i, maxTotal) {
  const rank = i + 1;
  const isPodium = rank <= 3 && !state.query;
  const sc = 100 / maxTotal;
  const gW = (n.gold * sc).toFixed(1);
  const sW = (n.silver * sc).toFixed(1);
  const bW = (n.bronze * sc).toFixed(1);

  const cell = (val, cls) =>
    '<td class="med-cell ' +
    cls +
    '">' +
    '<span class="med-val">' +
    (val > 0 ? val : "0") +
    "</span>" +
    "</td>";

  return (
    '<tr class="row' +
    (isPodium ? " podium-row" : "") +
    '" style="animation-delay:' +
    Math.min(i * 0.03, 0.6) +
    's">' +
    '<td class="col-rank"><span class="' +
    (isPodium ? "rank-gold" : "rank-num") +
    '">' +
    rank +
    "</span></td>" +
    '<td class="col-country">' +
    '<img class="flag" src="' +
    n.flagUrl +
    '" alt="' +
    n.country +
    '" loading="lazy" onerror="this.style.opacity=\'0.2\'">' +
    '<div class="cinfo">' +
    '<div class="cname">' +
    n.emoji +
    " " +
    n.displayName +
    "</div>" +
    '<div class="cmeta">' +
    '<span class="ccode">' +
    n.code +
    "</span>" +
    '<div class="mbar"><div class="bg" style="width:' +
    gW +
    '%"></div><div class="bs" style="width:' +
    sW +
    '%"></div><div class="bb" style="width:' +
    bW +
    '%"></div></div>' +
    "</div>" +
    "</div>" +
    "</td>" +
    cell(n.gold, "cg") +
    cell(n.silver, "cs") +
    cell(n.bronze, "cb") +
    '<td class="col-tot">' +
    n.total +
    "</td>" +
    "</tr>"
  );
}

// ── AVVIO ──────────────────────────────────
document.addEventListener("DOMContentLoaded", init);