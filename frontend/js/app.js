// app.js — main controller: tabs, data loading, oil chart

let oilChartInstance = null;

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadRightPanelNews();
  loadOilSnapshot();
  setupTabs();
  setupSidebar();
  setupSearch();
  setupOverlayClose();
  updateClock();
  setInterval(updateClock, 60000);
});

// ---- CLOCK ----
function updateClock() {
  const el = document.getElementById("update-time");
  if (el) {
    const now = new Date();
    el.textContent = now.toUTCString().slice(17, 22) + " UTC";
  }
}

// ---- TABS ----
function setupTabs() {
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".nav-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((p) => {
    p.classList.toggle("active", p.id === `tab-${tabName}`);
  });

  // Lazy load each tab's content on first open
  if (tabName === "news") loadGlobalNews();
  if (tabName === "oil") loadOilTab();
  if (tabName === "conflicts") loadConflictNews();
}

// ---- SIDEBAR COUNTRY CLICKS ----
function setupSidebar() {
  document.querySelectorAll(".country-item").forEach((item) => {
    item.addEventListener("click", () => {
      const name = item.dataset.country;
      const flag = item.querySelector(".cflag")?.textContent || "🌍";
      selectCountry(name, flag);
    });
  });
}

// ---- SEARCH ----
function setupSearch() {
  const input = document.getElementById("country-search");
  const btn = document.getElementById("search-btn");

  const doSearch = () => {
    const val = input.value.trim();
    if (val) selectCountry(val, "🌍");
  };

  btn.addEventListener("click", doSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
}

// ---- OVERLAY CLOSE ----
function setupOverlayClose() {
  document.getElementById("overlay-close").addEventListener("click", () => {
    document.getElementById("country-overlay").classList.add("hidden");
    document.querySelectorAll(".country-item").forEach((el) =>
      el.classList.remove("active")
    );
  });
}

// ---- RIGHT PANEL: BREAKING NEWS ----
async function loadRightPanelNews() {
  const list = document.getElementById("right-news-list");
  const loading = document.getElementById("right-news-loading");
  try {
    const articles = await API.globalNews();
    loading.style.display = "none";
    list.innerHTML = articles
      .slice(0, 7)
      .map(
        (a) => `
        <li class="right-news-item">
          <span class="rn-dot"></span>
          <div>
            <div class="rn-title"><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a></div>
            <div class="rn-source">${a.source || ""}</div>
            <div class="rn-time">${timeAgo(a.publishedAt)}</div>
          </div>
        </li>`
      )
      .join("");
  } catch (e) {
    loading.textContent = "Could not load news. Check backend.";
  }
}

// ---- RIGHT PANEL: OIL SNAPSHOT ----
async function loadOilSnapshot() {
  try {
    const data = await API.oilPrices();
    const ticker = document.getElementById("oil-ticker");

    // EIA returns rows with product names — pick Brent and WTI
    const brent = data.find((d) => d.product && d.product.toLowerCase().includes("brent"));
    const wti = data.find((d) => d.product && d.product.toLowerCase().includes("wti"));

    const brentVal = brent ? `$${parseFloat(brent.value).toFixed(2)}` : "N/A";
    const wtiVal = wti ? `$${parseFloat(wti.value).toFixed(2)}` : "N/A";

    if (ticker) ticker.textContent = `Brent ${brentVal} · WTI ${wtiVal}`;

    document.getElementById("snap-brent").textContent = brentVal;
    document.getElementById("snap-wti").textContent = wtiVal;
  } catch (e) {
    const ticker = document.getElementById("oil-ticker");
    if (ticker) ticker.textContent = "Oil prices unavailable";
  }
}

// ---- GLOBAL NEWS TAB ----
let globalNewsLoaded = false;
async function loadGlobalNews() {
  if (globalNewsLoaded) return;
  globalNewsLoaded = true;

  const list = document.getElementById("global-news-list");
  const loading = document.getElementById("global-news-loading");
  try {
    const articles = await API.globalNews();
    loading.style.display = "none";
    list.innerHTML = articles
      .map(
        (a, i) => `
        <li class="global-news-item">
          <span class="gn-num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <div class="gn-source">${a.source || "Unknown"}</div>
            <div class="gn-title"><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a></div>
            ${a.description ? `<div class="gn-desc">${a.description.slice(0, 120)}${a.description.length > 120 ? "..." : ""}</div>` : ""}
            <div class="gn-time">${timeAgo(a.publishedAt)}</div>
          </div>
        </li>`
      )
      .join("");
  } catch (e) {
    loading.textContent = "Failed to load news. Is the backend running on localhost:8000?";
  }

  // Wire refresh button
  document.getElementById("refresh-news").addEventListener("click", () => {
    globalNewsLoaded = false;
    list.innerHTML = "";
    loading.style.display = "block";
    loading.textContent = "Refreshing...";
    loadGlobalNews();
  });
}

// ---- OIL TAB ----
let oilTabLoaded = false;
async function loadOilTab() {
  if (oilTabLoaded) return;
  oilTabLoaded = true;

  try {
    const data = await API.oilPrices();

    // Split Brent and WTI rows
    const brentRows = data.filter((d) => d.product && d.product.toLowerCase().includes("brent")).slice(0, 7).reverse();
    const wtiRows = data.filter((d) => d.product && d.product.toLowerCase().includes("wti")).slice(0, 7).reverse();

    const latestBrent = data.find((d) => d.product && d.product.toLowerCase().includes("brent"));
    const latestWti = data.find((d) => d.product && d.product.toLowerCase().includes("wti"));

    if (latestBrent) {
      document.getElementById("brent-price").textContent = `$${parseFloat(latestBrent.value).toFixed(2)}`;
    }
    if (latestWti) {
      document.getElementById("wti-price").textContent = `$${parseFloat(latestWti.value).toFixed(2)}`;
    }

    // Chart
    const labels = brentRows.map((d) => d.period);
    const brentVals = brentRows.map((d) => parseFloat(d.value));
    const wtiVals = wtiRows.map((d) => parseFloat(d.value));

    const ctx = document.getElementById("oil-chart").getContext("2d");
    if (oilChartInstance) oilChartInstance.destroy();
    oilChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Brent Crude",
            data: brentVals,
            borderColor: "#1a56db",
            backgroundColor: "rgba(26,86,219,0.07)",
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#1a56db",
            fill: true,
          },
          {
            label: "WTI",
            data: wtiVals,
            borderColor: "#1d7a45",
            backgroundColor: "rgba(29,122,69,0.07)",
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#1d7a45",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { family: "DM Sans", size: 12 }, boxWidth: 12 } },
        },
        scales: {
          y: {
            ticks: { font: { family: "DM Mono", size: 11 }, callback: (v) => `$${v}` },
            grid: { color: "#e4e2db" },
          },
          x: {
            ticks: { font: { family: "DM Mono", size: 10 } },
            grid: { display: false },
          },
        },
      },
    });

    // Table
    const tbody = document.getElementById("oil-table-body");
    tbody.innerHTML = data
      .slice(0, 14)
      .map(
        (d) => `
        <tr>
          <td>${d.period}</td>
          <td>${d.product}</td>
          <td>${d.value ? "$" + parseFloat(d.value).toFixed(2) : "N/A"}</td>
        </tr>`
      )
      .join("");
  } catch (e) {
    document.getElementById("brent-price").textContent = "Error";
    document.getElementById("wti-price").textContent = "Error";
  }
}

// ---- CONFLICTS TAB ----
let conflictsLoaded = false;
async function loadConflictNews() {
  if (conflictsLoaded) return;
  conflictsLoaded = true;

  const list = document.getElementById("conflict-news-list");
  const loading = document.getElementById("conflict-news-loading");
  try {
    const articles = await API.conflicts();
    loading.style.display = "none";
    list.innerHTML = articles
      .map(
        (a, i) => `
        <li class="global-news-item">
          <span class="gn-num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <div class="gn-source">${a.source || "GDELT"}</div>
            <div class="gn-title"><a href="${a.url || "#"}" target="_blank" rel="noopener">${a.title}</a></div>
            <div class="gn-time">${a.seendate ? timeAgo(a.seendate) : ""}</div>
          </div>
        </li>`
      )
      .join("");
  } catch (e) {
    loading.textContent = "Could not load conflict data.";
  }
}
