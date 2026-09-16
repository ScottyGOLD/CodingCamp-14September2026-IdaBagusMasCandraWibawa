/* ═══════════════════════════════════════════════
   Expense & Budget Visualizer — script.js
   TC-1: Vanilla JS  TC-2: LocalStorage only
═══════════════════════════════════════════════ */

// ── DOM refs ─────────────────────────────────
const balanceDisplay = document.getElementById("balance-display");

const form = document.getElementById("transaction-form");
const inputName = document.getElementById("input-name");
const inputAmount = document.getElementById("input-amount");
const inputCategory = document.getElementById("input-category");
const inputNewCategory = document.getElementById("input-new-category");

const transacContainer = document.getElementById("transaction-container");
const emptyState = document.getElementById("empty-state");
const filterSelect = document.getElementById("filter-category");

const pieCanvas = document.getElementById("pie-chart");
const chartLegend = document.getElementById("chart-legend");
const chartEmpty = document.getElementById("chart-empty");

const btnSun = document.getElementById("btn-sun");
const btnMoon = document.getElementById("btn-moon");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");

// ── Constants ────────────────────────────────
const STORAGE_KEY = "ebv_transactions";
const CATEGORIES_KEY = "ebv_categories";
const THEME_KEY = "ebv_theme";

const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun"];

const CHART_COLORS = [
  "#e63946",
  "#2a9d8f",
  "#e9c46a",
  "#457b9d",
  "#f4a261",
  "#6a4c93",
  "#52b788",
  "#f77f00",
  "#4cc9f0",
  "#b5838d",
];

// ── State ────────────────────────────────────
let transactions = [];
let categories = [];
let activeFilter = "all";

// ── LocalStorage ─────────────────────────────
function loadData() {
  try {
    transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [
      ...DEFAULT_CATEGORIES,
    ];
  } catch {
    transactions = [];
    categories = [...DEFAULT_CATEGORIES];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function saveCategories() {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// ── Theme ─────────────────────────────────────
function buildIconUrl(id, color) {
  return `https://img.icons8.com/?size=100&id=${id}&format=png&color=${color}`;
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  const color = isDark ? "ffffff" : "000000";
  iconSun.src = buildIconUrl(648, color);
  iconMoon.src = buildIconUrl(26031, color);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  // Redraw chart so slice gaps match new surface color
  renderChart();
}

btnSun.addEventListener("click", () => applyTheme(false)); // sun  → light
btnMoon.addEventListener("click", () => applyTheme(true)); // moon → dark

// ── Category select ───────────────────────────
function rebuildCategorySelect(selectedValue = "") {
  inputCategory.innerHTML = `<option value="" disabled selected>Select category</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedValue) opt.selected = true;
    inputCategory.appendChild(opt);
  });

  // Always add "+ New Category" as last option
  const newOpt = document.createElement("option");
  newOpt.value = "__new__";
  newOpt.textContent = "+ New Category";
  inputCategory.appendChild(newOpt);

  // Show/hide new category field based on selection
  toggleNewCategoryField(inputCategory.value === "__new__");

  const prev = filterSelect.value;
  filterSelect.innerHTML = `<option value="all">All</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });
  if ([...filterSelect.options].some((o) => o.value === prev)) {
    filterSelect.value = prev;
  }
}

function toggleNewCategoryField(show) {
  const field = inputNewCategory.closest(".field");
  field.style.display = show ? "flex" : "none";
  inputNewCategory.required = show;
}

// Show new category field when "+ New Category" is selected
inputCategory.addEventListener("change", () => {
  toggleNewCategoryField(inputCategory.value === "__new__");
  if (inputCategory.value === "__new__") {
    inputNewCategory.focus();
  }
});

// ── Add Transaction ───────────────────────────
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = inputName.value.trim();
  const amount = parseFloat(inputAmount.value);
  let cat = inputCategory.value;
  const newCat = inputNewCategory.value.trim();

  if (!name || isNaN(amount) || amount <= 0) return;

  // Handle new custom category
  if (cat === "__new__" || newCat) {
    if (!newCat) {
      inputNewCategory.focus();
      return;
    }
    const normalised =
      newCat.charAt(0).toUpperCase() + newCat.slice(1).toLowerCase();
    if (!categories.includes(normalised)) {
      categories.push(normalised);
      saveCategories();
    }
    cat = normalised;
    rebuildCategorySelect(normalised);
  }

  if (!cat || cat === "__new__") {
    inputCategory.focus();
    return;
  }

  transactions.unshift({ id: Date.now(), name, amount, category: cat });
  saveTransactions();

  inputName.value = "";
  inputAmount.value = "";
  inputCategory.value = "";
  inputNewCategory.value = "";
  toggleNewCategoryField(false);

  render();
});

// ── Delete ────────────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
}

// ── Filter ────────────────────────────────────
filterSelect.addEventListener("change", () => {
  activeFilter = filterSelect.value;
  renderTransactions();
});

// ── Helpers ───────────────────────────────────
function formatMoney(amount) {
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── Render ────────────────────────────────────
function render() {
  updateBalance();
  renderTransactions();
  renderChart();
}

function updateBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  balanceDisplay.textContent = formatMoney(total);
}

function renderTransactions() {
  const filtered =
    activeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.category === activeFilter);

  transacContainer.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((t) => {
    const item = document.createElement("div");
    item.className = "transac-item";
    item.innerHTML = `
      <span class="transac-type-dot" aria-hidden="true"></span>
      <span class="transac-name" title="${t.name}">${t.name}</span>
      <span class="transac-amount">−${formatMoney(t.amount)}</span>
      <span class="transac-category">${t.category}</span>
      <button class="transac-delete" aria-label="Delete ${t.name}">✕</button>
    `;
    item
      .querySelector(".transac-delete")
      .addEventListener("click", () => deleteTransaction(t.id));
    transacContainer.appendChild(item);
  });
}

function renderChart() {
  if (transactions.length === 0) {
    pieCanvas.style.display = "none";
    chartLegend.style.display = "none";
    chartEmpty.style.display = "block";
    return;
  }

  pieCanvas.style.display = "block";
  chartLegend.style.display = "flex";
  chartEmpty.style.display = "none";

  const totals = {};
  transactions.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = entries.reduce((s, [, v]) => s + v, 0);

  const ctx = pieCanvas.getContext("2d");
  const W = pieCanvas.width;
  const H = pieCanvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) / 2 - 6;

  ctx.clearRect(0, 0, W, H);

  const surfaceColor =
    getComputedStyle(document.body).getPropertyValue("--surface").trim() ||
    "#fff";

  let startAngle = -Math.PI / 2;
  entries.forEach(([, value], i) => {
    const slice = (value / grandTotal) * 2 * Math.PI;
    const color = CHART_COLORS[i % CHART_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = surfaceColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle += slice;
  });

  chartLegend.innerHTML = "";
  entries.forEach(([cat, value], i) => {
    const pct = ((value / grandTotal) * 100).toFixed(1);
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const li = document.createElement("li");
    li.className = "legend-item";
    li.innerHTML = `
      <span class="legend-dot" style="background:${color}"></span>
      <span class="legend-label">${cat}</span>
      <span class="legend-amount">${formatMoney(value)}</span>
      <span class="legend-pct">${pct}%</span>
    `;
    chartLegend.appendChild(li);
  });
}

// ── Init ──────────────────────────────────────
(function init() {
  loadData();
  rebuildCategorySelect();
  applyTheme(localStorage.getItem(THEME_KEY) === "dark");
  render();
})();
