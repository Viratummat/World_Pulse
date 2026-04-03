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

## Setup Instructions

### Step 1 — Clone and enter the project

```bash
git clone https://github.com/YOUR_USERNAME/worldpulse.git
cd worldpulse
```

### Step 2 — Set up the backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3 — Add your API keys

```bash
# Copy the example file
cp .env.example .env
```

Open `.env` and fill in your real API keys:
```
NEWSAPI_KEY=your_key_here
GNEWS_KEY=your_key_here
EIA_KEY=your_key_here
```

**Never commit the `.env` file to GitHub.**

### Step 4 — Run the backend

```bash
uvicorn main:app --reload
```

Backend will be running at: `http://localhost:8000`

You can test it in your browser:
- `http://localhost:8000/news/global`
- `http://localhost:8000/oil`
- `http://localhost:8000/country/india`

### Step 5 — Open the frontend

Open `frontend/index.html` directly in your browser.

Or use a simple local server (recommended):
```bash
cd ../frontend
python -m http.server 3000
```
Then open `http://localhost:3000`

---

## API Keys (Free)

| API | URL | Free Tier |
|-----|-----|-----------|
| NewsAPI | newsapi.org | 100 req/day |
| GNews | gnews.io | 100 req/day |
| EIA | eia.gov/developer | Unlimited |
| REST Countries | restcountries.com | No key needed |
| GDELT | gdeltproject.org | No key needed |

---

## Deployment

### Backend → Render.com (free)
1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Go to render.com → New Web Service → connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
6. Add your API keys under Environment Variables in Render dashboard

### Frontend → Vercel (free)
1. Go to vercel.com → New Project → connect your repo
2. Set root directory to `frontend`
3. Deploy

After deploying backend, update `frontend/js/config.js`:
```js
const API_BASE = "https://your-app.onrender.com";
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
Portfolio project targeting HENNGE Global Internship Program
