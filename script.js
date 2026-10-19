/* ==========================================================================
   Planet | script
   - Loads planet data (API_URL), renders the planet card and comparison table
   - Search by planet name, with a "No results found" state
   - Light / dark theme toggle (remembered in localStorage)
   ========================================================================== */
"use strict";

(() => {
  /* ---------- Configuration ---------- */

  // Local copy of the API response. Replace with the live API URL if you have one.
  const API_URL = "planets.json";
  const THEME_KEY = "planet-theme";
  const DEFAULT_PLANET = "earth";

  // Row layout of the comparison table, as shown in the design.
  const TABLE_LAYOUT = [
    { group: "Terrestrial Planets", sub: null, planets: ["Mercury", "Venus", "Earth", "Mars"] },
    { group: "Jovian Planets", sub: "Gas Giants", planets: ["Jupiter", "Saturn"] },
    { group: "Jovian Planets", sub: "Ice Giants", planets: ["Uranus", "Neptune"] },
    { group: "Dwarf Planets", sub: null, planets: ["Pluto"] },
  ];

  // Used only if a planet image fails to load.
  const PLANET_COLORS = {
    mercury: "#9a8f86",
    venus: "#d9a86c",
    earth: "#1f4f8f",
    mars: "#b5502f",
    jupiter: "#c9a27a",
    saturn: "#d8c08a",
    uranus: "#8fd3d9",
    neptune: "#3b5bdb",
    pluto: "#b9a79a",
  };

  /* ---------- Icons (inline SVG so they follow the theme colour) ---------- */

  const MOON_PATH = '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/>';
  const SUN_PATH =
    '<circle cx="12" cy="12" r="4" fill="currentColor"/>' +
    '<path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>';

  const icon = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;

  const ICONS = {
    temperature: icon(
      '<path d="M8 14.2V5a2.5 2.5 0 0 1 5 0v9.2a4.5 4.5 0 1 1-5 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="18.5" cy="5.5" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/>'
    ),
    moons: icon(MOON_PATH),
    diameter: icon('<circle cx="12" cy="12" r="9" fill="currentColor"/>'),
    distance: icon(
      '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="2.945 2.945"/>' +
        '<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/>'
    ),
  };

  /* ---------- DOM references and state ---------- */

  const $ = (selector) => document.querySelector(selector);

  const el = {
    form: $("#search-form"),
    input: $("#search-input"),
    error: $("#search-error"),
    result: $("#result"),
    tableBody: $("#facts-body"),
    themeToggle: $("#theme-toggle"),
    themeLabel: $("#theme-label"),
    themeIcon: $("#theme-icon"),
  };

  let planets = [];

  /* ---------- Helpers ---------- */

  const normalise = (value) => String(value).trim().toLowerCase();

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const isEmpty = (value) => value === null || value === undefined || value === "";

  // Card values are shown as-is (12756); table numbers use thousands separators (12,756).
  const plain = (value) => (isEmpty(value) ? "n/a" : String(value));
  const grouped = (value) =>
    typeof value === "number" ? value.toLocaleString("en-US", { maximumFractionDigits: 7 }) : plain(value);

  const findPlanet = (name) => planets.find((planet) => normalise(planet.name) === normalise(name));

  /* ---------- Planet card ---------- */

  function createPlaceholder(planet) {
    const placeholder = document.createElement("div");
    placeholder.className = "planet-img planet-img--placeholder";
    placeholder.style.setProperty("--planet-color", PLANET_COLORS[normalise(planet.name)] || "#2c4a8a");
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", planet.name);
    return placeholder;
  }

  function renderCard(planet) {
    el.result.innerHTML = `
      <article class="card">
        <div class="planet-media"></div>
        <div class="card-body">
          <div class="planet-heading">
            <h2 class="planet-name">${escapeHTML(planet.name)}</h2>
            <p class="planet-type">${escapeHTML(plain(planet.type))}</p>
          </div>
          <p class="planet-desc">${escapeHTML(plain(planet.description))}</p>
          <dl class="stats">
            <div><dt>Gravity</dt><dd>${escapeHTML(plain(planet.gravity))}</dd></div>
            <div><dt>Mass</dt><dd>${escapeHTML(plain(planet.mass))}</dd></div>
            <div><dt>Period</dt><dd>${escapeHTML(plain(planet.period))}</dd></div>
          </dl>
          <ul class="meta">
            <li>${ICONS.temperature}<span><span class="visually-hidden">Temperature: </span>${escapeHTML(plain(planet.temperature))}</span></li>
            <li>${ICONS.moons}<span><span class="visually-hidden">Moons: </span>${escapeHTML(plain(planet.moons))}</span></li>
            <li>${ICONS.diameter}<span><span class="visually-hidden">Diameter: </span>${escapeHTML(plain(planet.diameter))}</span></li>
            <li>${ICONS.distance}<span><span class="visually-hidden">Distance from sun: </span>${escapeHTML(plain(planet.distanceFromSun))}</span></li>
          </ul>
        </div>
      </article>`;

    const media = el.result.querySelector(".planet-media");
    if (planet.image) {
      const img = new Image();
      img.className = "planet-img";
      img.width = 120;
      img.height = 120;
      img.alt = planet.name;
      img.decoding = "async";
      img.addEventListener("error", () => img.replaceWith(createPlaceholder(planet)), { once: true });
      img.src = planet.image;
      media.append(img);
    } else {
      media.append(createPlaceholder(planet));
    }

    el.result.setAttribute("aria-busy", "false");
    highlightRow(planet.name);
  }

  function renderMessage(title, text, { retry = false } = {}) {
    el.result.innerHTML = `
      <article class="card card--message">
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(text)}</p>
        ${retry ? '<button type="button" class="btn-retry" data-action="retry">Try again</button>' : ""}
      </article>`;
    el.result.setAttribute("aria-busy", "false");
    highlightRow(null);
  }

  function renderLoading() {
    el.result.innerHTML = '<article class="card card--loading" aria-hidden="true"></article>';
    el.result.setAttribute("aria-busy", "true");
  }

  /* ---------- Comparison table ---------- */

  function highlightRow(name) {
    const active = name ? normalise(name) : null;
    el.tableBody.querySelectorAll("tr").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.planet === active);
    });
  }

  function buildTable() {
    const row = (name, leadingCells) => {
      const planet = findPlanet(name);
      return (
        `<tr data-planet="${normalise(name)}">` +
        leadingCells +
        `<th scope="row">${name}</th>` +
        `<td>${planet ? grouped(planet.mass) : "n/a"}</td>` +
        `<td>${planet ? grouped(planet.diameter) : "n/a"}</td>` +
        "</tr>"
      );
    };

    const [terrestrial, gas, ice, dwarf] = TABLE_LAYOUT;
    let html = "";

    terrestrial.planets.forEach((name, i) => {
      html += row(
        name,
        i === 0
          ? `<th scope="rowgroup" colspan="2" rowspan="${terrestrial.planets.length}">${terrestrial.group}</th>`
          : ""
      );
    });

    gas.planets.forEach((name, i) => {
      const jovianSpan = gas.planets.length + ice.planets.length;
      html += row(
        name,
        i === 0
          ? `<th scope="rowgroup" rowspan="${jovianSpan}">${gas.group}</th>` +
              `<th scope="rowgroup" rowspan="${gas.planets.length}">${gas.sub}</th>`
          : ""
      );
    });

    ice.planets.forEach((name, i) => {
      html += row(name, i === 0 ? `<th scope="rowgroup" rowspan="${ice.planets.length}">${ice.sub}</th>` : "");
    });

    dwarf.planets.forEach((name, i) => {
      html += row(
        name,
        i === 0 ? `<th scope="rowgroup" colspan="2" rowspan="${dwarf.planets.length}">${dwarf.group}</th>` : ""
      );
    });

    el.tableBody.innerHTML = html;
  }

  /* ---------- Search ---------- */

  function setSearchError(hasError) {
    el.form.classList.toggle("has-error", hasError);
    el.error.hidden = !hasError;
    el.input.setAttribute("aria-invalid", String(hasError));
  }

  function searchPlanet(term) {
    const query = normalise(term);
    const match =
      planets.find((planet) => normalise(planet.name) === query) ||
      planets.find((planet) => normalise(planet.name).startsWith(query)) ||
      planets.find((planet) => normalise(planet.name).includes(query));

    if (match) {
      setSearchError(false);
      renderCard(match);
    } else {
      setSearchError(true);
      renderMessage(
        "No results found!",
        "We couldn't find any planet matching your search. Please double-check the name and try again."
      );
    }
  }

  el.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!normalise(el.input.value)) {
      el.input.focus();
      return;
    }
    searchPlanet(el.input.value);
  });

  el.input.addEventListener("input", () => setSearchError(false));

  /* ---------- Theme ---------- */

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    el.themeLabel.textContent = isDark ? "LIGHT" : "DARK";
    el.themeIcon.innerHTML = isDark ? SUN_PATH : MOON_PATH;
    el.themeToggle.setAttribute("aria-pressed", String(isDark));
    el.themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  function savedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  el.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      /* storage unavailable: the theme still changes for this visit */
    }
  });

  // Follow the system setting until the visitor picks a theme themselves.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!savedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  /* ---------- Data loading ---------- */

  async function fetchPlanets() {
    const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.planets;
    if (!Array.isArray(list) || list.length === 0) throw new Error("The response contained no planets");
    return list;
  }

  async function loadApp() {
    renderLoading();

    try {
      planets = await fetchPlanets();
    } catch (error) {
      console.error("Could not load planet data:", error);
      planets = [];
      buildTable();
      renderMessage(
        "Couldn't load planet data",
        "Please check your connection and try again. If you opened this file directly, serve it from a local server instead.",
        { retry: true }
      );
      return;
    }

    buildTable();
    renderCard(findPlanet(DEFAULT_PLANET) || planets[0]);
  }

  el.result.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="retry"]')) loadApp();
  });

  /* ---------- Start ---------- */

  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  loadApp();
})();
