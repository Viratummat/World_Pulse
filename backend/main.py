from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="WorldPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
GNEWS_KEY = os.getenv("GNEWS_KEY")
EIA_KEY = os.getenv("EIA_KEY")

# Simple in-memory cache: { cache_key: { "data": ..., "ts": timestamp } }
_cache = {}
CACHE_TTL = 600  # 10 minutes


def get_cache(key):
    if key in _cache:
        if time.time() - _cache[key]["ts"] < CACHE_TTL:
            return _cache[key]["data"]
    return None


def set_cache(key, data):
    _cache[key] = {"data": data, "ts": time.time()}


@app.get("/")
def root():
    return {"status": "WorldPulse API is running"}


@app.get("/news/global")
async def global_news():
    cached = get_cache("global_news")
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://newsapi.org/v2/top-headlines",
            params={"category": "general", "language": "en", "pageSize": 10, "apiKey": NEWSAPI_KEY},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="NewsAPI error")

    articles = resp.json().get("articles", [])
    result = [
        {
            "title": a.get("title"),
            "source": a.get("source", {}).get("name"),
            "url": a.get("url"),
            "publishedAt": a.get("publishedAt"),
            "description": a.get("description"),
        }
        for a in articles
        if a.get("title") and "[Removed]" not in a.get("title", "")
    ]
    set_cache("global_news", result)
    return result


@app.get("/news/country")
async def country_news(q: str):
    cache_key = f"news_{q}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://gnews.io/api/v4/search",
            params={"q": q, "lang": "en", "max": 8, "token": GNEWS_KEY},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="GNews error")

    articles = resp.json().get("articles", [])
    result = [
        {
            "title": a.get("title"),
            "source": a.get("source", {}).get("name"),
            "url": a.get("url"),
            "publishedAt": a.get("publishedAt"),
            "description": a.get("description"),
        }
        for a in articles
    ]
    set_cache(cache_key, result)
    return result


@app.get("/oil")
async def oil_prices():
    cached = get_cache("oil")
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://api.eia.gov/v2/petroleum/pri/spt/data/",
            params={
                "api_key": EIA_KEY,
                "frequency": "daily",
                "data[0]": "value",
                "sort[0][column]": "period",
                "sort[0][direction]": "desc",
                "length": 14,
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="EIA API error")

    data = resp.json().get("response", {}).get("data", [])
    result = [
        {"period": d.get("period"), "product": d.get("product-name"), "value": d.get("value")}
        for d in data
    ]
    set_cache("oil", result)
    return result


@app.get("/country/{name}")
async def country_info(name: str):
    cache_key = f"country_{name}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"https://restcountries.com/v3.1/name/{name}")
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Country not found")

    data = resp.json()[0]
    result = {
        "name": data.get("name", {}).get("common"),
        "capital": data.get("capital", ["N/A"])[0] if data.get("capital") else "N/A",
        "population": data.get("population"),
        "region": data.get("region"),
        "subregion": data.get("subregion"),
        "flag": data.get("flags", {}).get("svg"),
        "flagEmoji": data.get("flag"),
        "gdp": data.get("gdp"),
        "languages": list(data.get("languages", {}).values()),
        "currencies": [v.get("name") for v in data.get("currencies", {}).values()],
        "latlng": data.get("latlng"),
    }
    set_cache(cache_key, result)
    return result


@app.get("/conflicts")
async def conflicts():
    # GDELT does not require a key — querying for conflict-related events
    cached = get_cache("conflicts")
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://api.gdeltproject.org/api/v2/doc/doc",
            params={
                "query": "war conflict battle attack military",
                "mode": "artlist",
                "maxrecords": 10,
                "format": "json",
                "timespan": "1d",
            },
        )

    if resp.status_code != 200:
        # Return fallback static data if GDELT is unavailable
        return _fallback_conflicts()

    try:
        articles = resp.json().get("articles", [])
        result = [
            {
                "title": a.get("title"),
                "url": a.get("url"),
                "source": a.get("domain"),
                "seendate": a.get("seendate"),
            }
            for a in articles
        ]
        if not result:
            return _fallback_conflicts()
        set_cache("conflicts", result)
        return result
    except Exception:
        return _fallback_conflicts()


def _fallback_conflicts():
    return [
        {"title": "Russia-Ukraine war: frontline updates", "source": "Static fallback", "url": "#", "seendate": ""},
        {"title": "Israel-Gaza conflict: latest developments", "source": "Static fallback", "url": "#", "seendate": ""},
        {"title": "Sudan: RSF advances continue in Darfur", "source": "Static fallback", "url": "#", "seendate": ""},
        {"title": "Myanmar resistance operations ongoing", "source": "Static fallback", "url": "#", "seendate": ""},
    ]
