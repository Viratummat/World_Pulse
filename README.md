# WorldPulse — Global Intelligence Dashboard

A real-time geopolitical intelligence dashboard featuring an interactive world map, country news, global headlines, crude oil prices, and a conflict tracker.

**Tech Stack:** Python (FastAPI) · HTML · CSS · JavaScript · Leaflet.js · Chart.js

---

## Project Structure

```
worldpulse/
├── backend/
│   ├── main.py              # FastAPI app — all API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # API key template (copy to .env)
├── frontend/
│   ├── index.html           # Main HTML
│   ├── css/
│   │   └── style.css        # All styles
│   └── js/
│       ├── config.js        # API base URL config
│       ├── api.js           # All fetch calls to backend
│       ├── map.js           # Leaflet map + markers
│       └── app.js           # Tab switching, data loading, charts
├── .gitignore
└── README.md
```

---


## Features

- Interactive world map with clickable country markers (Leaflet.js)
- Country detail overlay with metadata and live news
- Global news feed (NewsAPI)
- Country-specific news on click (GNews)
- Crude oil price chart — Brent & WTI (EIA API)
- Conflict tracker with GDELT data
- In-memory caching on backend (10 min TTL) to protect free tier limits
- Fully deployed on free infrastructure

---

## Built By

Virat — B.Tech CSE, Semester 2  
Portfolio project
