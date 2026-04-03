// map.js — Leaflet map initialization and country click handling

let map;
let markersLayer;

const MAP_COUNTRIES = [
  // Active war zones
  { name: "Ukraine", lat: 48.38, lng: 31.17, status: "war", flag: "🇺🇦" },
  { name: "Russia", lat: 61.52, lng: 105.32, status: "war", flag: "🇷🇺" },
  { name: "Israel", lat: 31.05, lng: 34.85, status: "war", flag: "🇮🇱" },
  { name: "Palestine", lat: 31.90, lng: 35.20, status: "war", flag: "🇵🇸" },
  { name: "Sudan", lat: 12.86, lng: 30.22, status: "war", flag: "🇸🇩" },
  { name: "Myanmar", lat: 19.15, lng: 95.96, status: "war", flag: "🇲🇲" },
  { name: "Yemen", lat: 15.55, lng: 48.52, status: "war", flag: "🇾🇪" },
  { name: "Syria", lat: 34.80, lng: 38.99, status: "war", flag: "🇸🇾" },
  { name: "Somalia", lat: 5.15, lng: 46.20, status: "war", flag: "🇸🇴" },
  { name: "Mali", lat: 17.57, lng: -3.99, status: "war", flag: "🇲🇱" },
  { name: "Haiti", lat: 18.97, lng: -72.29, status: "war", flag: "🇭🇹" },
  { name: "DR Congo", lat: -4.04, lng: 21.76, status: "war", flag: "🇨🇩" },
  { name: "Nigeria", lat: 9.08, lng: 8.68, status: "war", flag: "🇳🇬" },
  { name: "Ethiopia", lat: 9.15, lng: 40.49, status: "war", flag: "🇪🇹" },
  { name: "Afghanistan", lat: 33.93, lng: 67.71, status: "war", flag: "🇦🇫" },
  { name: "Iraq", lat: 33.22, lng: 43.68, status: "war", flag: "🇮🇶" },
  { name: "Libya", lat: 26.34, lng: 17.23, status: "war", flag: "🇱🇾" },
  { name: "Burkina Faso", lat: 12.36, lng: -1.53, status: "war", flag: "🇧🇫" },
  { name: "Mozambique", lat: -18.66, lng: 35.53, status: "war", flag: "🇲🇿" },

  // Medium tension / sanctions / news
  { name: "Iran", lat: 32.43, lng: 53.69, status: "medium", flag: "🇮🇷" },
  { name: "North Korea", lat: 40.34, lng: 127.51, status: "medium", flag: "🇰🇵" },
  { name: "Venezuela", lat: 6.42, lng: -66.59, status: "medium", flag: "🇻🇪" },
  { name: "Pakistan", lat: 30.38, lng: 69.35, status: "medium", flag: "🇵🇰" },
  { name: "Lebanon", lat: 33.85, lng: 35.86, status: "medium", flag: "🇱🇧" },
  { name: "Belarus", lat: 53.71, lng: 27.95, status: "medium", flag: "🇧🇾" },
  { name: "Serbia", lat: 44.02, lng: 21.01, status: "medium", flag: "🇷🇸" },
  { name: "Niger", lat: 17.61, lng: 8.08, status: "medium", flag: "🇳🇪" },
  { name: "Chad", lat: 15.45, lng: 18.73, status: "medium", flag: "🇹🇩" },
  { name: "Cuba", lat: 21.52, lng: -77.78, status: "medium", flag: "🇨🇺" },

  // Oil producers
  { name: "Saudi Arabia", lat: 23.89, lng: 45.08, status: "oil", flag: "🇸🇦" },
  { name: "United Arab Emirates", lat: 23.42, lng: 53.85, status: "oil", flag: "🇦🇪" },
  { name: "Kuwait", lat: 29.31, lng: 47.48, status: "oil", flag: "🇰🇼" },
  { name: "Qatar", lat: 25.35, lng: 51.18, status: "oil", flag: "🇶🇦" },
  { name: "Algeria", lat: 28.03, lng: 1.66, status: "oil", flag: "🇩🇿" },

  // News / trending
  { name: "India", lat: 20.59, lng: 78.96, status: "news", flag: "🇮🇳" },
  { name: "China", lat: 35.86, lng: 104.20, status: "news", flag: "🇨🇳" },
  { name: "United Kingdom", lat: 55.38, lng: -3.44, status: "news", flag: "🇬🇧" },
  { name: "Taiwan", lat: 23.70, lng: 120.96, status: "news", flag: "🇹🇼" },
  { name: "South Korea", lat: 35.91, lng: 127.77, status: "news", flag: "🇰🇷" },
  { name: "Turkey", lat: 38.96, lng: 35.24, status: "news", flag: "🇹🇷" },
  { name: "Mexico", lat: 23.63, lng: -102.55, status: "news", flag: "🇲🇽" },
  { name: "Argentina", lat: -38.42, lng: -63.62, status: "news", flag: "🇦🇷" },

  // Stable
  { name: "United States", lat: 37.09, lng: -95.71, status: "stable", flag: "🇺🇸" },
  { name: "Germany", lat: 51.17, lng: 10.45, status: "stable", flag: "🇩🇪" },
  { name: "Japan", lat: 36.20, lng: 138.25, status: "stable", flag: "🇯🇵" },
  { name: "France", lat: 46.23, lng: 2.21, status: "stable", flag: "🇫🇷" },
  { name: "Canada", lat: 56.13, lng: -106.35, status: "stable", flag: "🇨🇦" },
  { name: "Australia", lat: -25.27, lng: 133.78, status: "stable", flag: "🇦🇺" },
  { name: "Brazil", lat: -14.24, lng: -51.93, status: "stable", flag: "🇧🇷" },
  { name: "South Africa", lat: -30.56, lng: 22.94, status: "stable", flag: "🇿🇦" },
  { name: "Indonesia", lat: -0.79, lng: 113.92, status: "stable", flag: "🇮🇩" },
  { name: "Spain", lat: 40.46, lng: -3.75, status: "stable", flag: "🇪🇸" },
];

const STATUS_COLORS = {
  war: "#c0392b",
  medium: "#b45309",
  news: "#1a56db",
  stable: "#1d7a45",
  oil: "#7c3aed",
};

function initMap() {
  map = L.map("map", {
    center: [20, 10],
    zoom: 2.5,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  renderMarkers();
}

function renderMarkers() {
  markersLayer.clearLayers();

  MAP_COUNTRIES.forEach((country) => {
    const color = STATUS_COLORS[country.status] || "#888";

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

async function selectCountry(countryName, flagEmoji) {
  const overlay = document.getElementById("country-overlay");
  const overlayName = document.getElementById("overlay-name");
  const overlayMeta = document.getElementById("overlay-meta");
  const overlayFlag = document.getElementById("overlay-flag");
  const overlayTags = document.getElementById("overlay-tags");
  const overlayNewsList = document.getElementById("overlay-news-list");
  const loadingEl = document.getElementById("country-news-loading");

  switchTab("map");

  overlay.classList.remove("hidden");
  overlayFlag.textContent = flagEmoji || "🌍";
  overlayName.textContent = countryName;
  overlayMeta.textContent = "Loading...";
  overlayTags.innerHTML = "";
  overlayNewsList.innerHTML = "";
  loadingEl.style.display = "block";
  loadingEl.textContent = "Loading data...";

  document.querySelectorAll(".country-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.country === countryName);
  });

  const found = MAP_COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  if (found && map) {
    map.flyTo([found.lat, found.lng], 5, { duration: 1.2 });
  }

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
