// api.js — all calls to the WorldPulse FastAPI backend

const API = {
  async globalNews() {
    const res = await fetch(`${API_BASE}/news/global`);
    if (!res.ok) throw new Error("Failed to fetch global news");
    return res.json();
  },

  async countryNews(country) {
    const res = await fetch(`${API_BASE}/news/country?q=${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error("Failed to fetch country news");
    return res.json();
  },

  async oilPrices() {
    const res = await fetch(`${API_BASE}/oil`);
    if (!res.ok) throw new Error("Failed to fetch oil prices");
    return res.json();
  },

  async countryInfo(name) {
    const res = await fetch(`${API_BASE}/country/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Country not found");
    return res.json();
  },

  async conflicts() {
    const res = await fetch(`${API_BASE}/conflicts`);
    if (!res.ok) throw new Error("Failed to fetch conflicts");
    return res.json();
  },
};

// Utility: format ISO date to relative time like "3h ago"
function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Utility: format population number
function formatPop(n) {
  if (!n) return "N/A";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  return n.toLocaleString();
}
