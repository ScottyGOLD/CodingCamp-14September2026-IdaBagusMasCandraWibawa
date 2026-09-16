const btnMoon = document.getElementById("btn-moon");
const btnSun = document.getElementById("btn-sun");
const iconMoon = document.getElementById("icon-moon");
const iconSun = document.getElementById("icon-sun");

// Icons8 URL builder — swaps the color param
function buildIconUrl(id, color) {
  return `https://img.icons8.com/?size=100&id=${id}&format=png&color=${color}`;
}

const MOON_ID = 648;
const SUN_ID = 26031;

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
    iconMoon.src = buildIconUrl(MOON_ID, "ffffff");
    iconSun.src = buildIconUrl(SUN_ID, "ffffff");
  } else {
    document.body.classList.remove("dark");
    iconMoon.src = buildIconUrl(MOON_ID, "000000");
    iconSun.src = buildIconUrl(SUN_ID, "000000");
  }
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Moon button → dark mode
btnMoon.addEventListener("click", () => applyTheme(false));

// Sun button → light mode
btnSun.addEventListener("click", () => applyTheme(true));

// Restore saved preference on load
const saved = localStorage.getItem("theme");
applyTheme(saved === "dark");
