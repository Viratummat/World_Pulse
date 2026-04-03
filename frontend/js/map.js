// map.js — Leaflet map initialization and country click handling

let map;
let markersLayer;

// Countries shown on the map with their coordinates and status
const MAP_COUNTRIES = [
  { name: "Ukraine", lat: 48.38, lng: 31.17, status: "war", flag: "🇺🇦" },
  { name: "Russia", lat: 61.52, lng: 105.32, status: "war", flag: "🇷🇺" },
  { name: "Israel", lat: 31.05, lng: 34.85, status: "war", flag: "🇮🇱" },
  { name: "Sudan", lat: 12.86, lng: 30.22, status: "war", flag: "🇸🇩" },
  { name: "Myanmar", lat: 19.15, lng: 95.96, status: "medium", flag: "🇲🇲" },
  { name: "Ethiopia", lat: 9.15, lng: 40.49, status: "medium", flag: "🇪🇹" },
  { name: "India", lat: 20.59, lng: 78.96, status: "news", flag: "🇮🇳" },
  { name: "China", lat: 35.86, lng: 104.20, status: "news", flag: "🇨🇳" },
  { name: "United States", lat: 37.09, lng: -95.71, status: "stable", flag: "🇺🇸" },
  { name: "Germany", lat: 51.17, lng: 10.45, status: "stable", flag: "🇩🇪" },
  { name: "Japan", lat: 36.20, lng: 138.25, status: "stable", flag: "🇯🇵" },
  { name: "Saudi Arabia", lat: 23.89, lng: 45.08, status: "oil", flag: "🇸🇦" },
  { name: "Brazil", lat: -14.24, lng: -51.93, status: "stable", flag: "🇧🇷" },
  { name: "France", lat: 46.23, lng: 2.21, status: "stable", flag: "🇫🇷" },
  { name: "United Kingdom", lat: 55.38, lng: -3.44, status: "news", flag: "🇬🇧" },
];

// Color map for each status type
const STATUS_COLORS = {
  war: "#c0392b",
  medium: "#b45309",
  news: "#1a56db",
  stable: "#1d7a45",
  oil: "#b45309",
};

function initMap() {
  map = L.map("map", {
    center: [20, 10],
    zoom: 2.5,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: true,
  });

  // OpenStreetMap tiles (free, no key needed)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  renderMarkers();
}

function renderMarkers() {
  markersLayer.clearLayers();

  MAP_COUNTRIES.forEach((country) => {
    const color = STATUS_COLORS[country.status] || "#888";

    // Custom circle marker
    const marker = L.circleMarker([country.lat, country.lng], {
      radius: country.status === "war" ? 9 : 7,
      fillColor: color,
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    });

    marker.bindTooltip(`${country.flag} ${country.name}`, {
      permanent: false,
      direction: "top",
      className: "map-tooltip",
    });

    marker.on("click", () => {
      selectCountry(country.name, country.flag);
    });

    markersLayer.addLayer(marker);
  });
}

// Called when a country is clicked (from marker or sidebar)
async function selectCountry(countryName, flagEmoji) {
  const overlay = document.getElementById("country-overlay");
  const overlayName = document.getElementById("overlay-name");
  const overlayMeta = document.getElementById("overlay-meta");
  const overlayFlag = document.getElementById("overlay-flag");
  const overlayTags = document.getElementById("overlay-tags");
  const overlayNewsList = document.getElementById("overlay-news-list");
  const loadingEl = document.getElementById("country-news-loading");

  // Switch to map tab if not already there
  switchTab("map");

  // Show overlay immediately with loading state
  overlay.classList.remove("hidden");
  overlayFlag.textContent = flagEmoji || "🌍";
  overlayName.textContent = countryName;
  overlayMeta.textContent = "Loading...";
  overlayTags.innerHTML = "";
  overlayNewsList.innerHTML = "";
  loadingEl.style.display = "block";
  loadingEl.textContent = "Loading data...";

  // Highlight sidebar item
  document.querySelectorAll(".country-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.country === countryName);
  });

  // Fly map to that country if we know its coords
  const found = MAP_COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  if (found && map) {
    map.flyTo([found.lat, found.lng], 5, { duration: 1.2 });
  }

  // Fetch country info and news in parallel
  try {
    const [info, news] = await Promise.all([
      API.countryInfo(countryName).catch(() => null),
      API.countryNews(countryName).catch(() => []),
    ]);

    if (info) {
      overlayFlag.textContent = info.flagEmoji || flagEmoji || "🌍";
      overlayMeta.textContent = `${info.subregion || info.region} · Pop. ${formatPop(info.population)} · Capital: ${info.capital}`;

      overlayTags.innerHTML = `
        <span class="overlay-tag region">${info.region}</span>
        <span class="overlay-tag pop">${formatPop(info.population)} people</span>
        <span class="overlay-tag cap">${info.capital}</span>
        ${info.languages && info.languages.length ? `<span class="overlay-tag region">${info.languages[0]}</span>` : ""}
      `;
    }

    loadingEl.style.display = "none";

    if (news && news.length > 0) {
      overlayNewsList.innerHTML = news
        .slice(0, 5)
        .map(
          (item) => `
          <li class="overlay-news-item">
            <span class="news-dot-small"></span>
            <div>
              <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
              <div class="news-src">${item.source || ""} · ${timeAgo(item.publishedAt)}</div>
            </div>
          </li>`
        )
        .join("");
    } else {
      overlayNewsList.innerHTML = `<li style="font-size:12px;color:var(--text3);">No recent news found.</li>`;
    }
  } catch (err) {
    loadingEl.textContent = "Error loading data. Is the backend running?";
  }
}
