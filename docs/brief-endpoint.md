# Brief endpoint

The site is static. The project brief (`#brif`) is sent by the browser to **your own backend**, whose URL is
set at build time in `VITE_BRIEF_ENDPOINT`. That value is bundled into public JavaScript, so it must be a
plain URL — never a token. Telegram bot tokens, SMTP passwords and API keys live only on the server.

If `VITE_BRIEF_ENDPOINT` is empty, the form never pretends to send: after the last step it offers
"Nusxalash" (copy) and ".txt yuklab olish" (download), plus any real contacts from `app/content/site.ts`.
A production build with neither an endpoint nor a contact channel prints a **release blocker** warning.

## Request

```
POST {VITE_BRIEF_ENDPOINT}
Content-Type: application/json
Accept: application/json
Idempotency-Key: 6d97ec48-31bb-422d-990a-2b7cbe713367
```

- Sent with `credentials: "omit"` and `mode: "cors"`. If the endpoint is on another origin, allow the site's
  origin, `POST`, and the headers `Content-Type` and `Idempotency-Key` (CORS preflight).
- `Idempotency-Key` is a UUID created once per brief and **reused on every retry** of the same answers.
  Store it (e.g. in Redis for 24 h) and return the first result for a repeated key instead of notifying twice.
  Editing answers after a failure produces a new key.
- The browser aborts after **15 seconds** and shows the error state with "Qayta urinish".

Body:

```json
{
  "services": ["web", "avtomatlashtirish"],
  "about": "Buyurtmalar va omborni bitta tizimda yuritmoqchimiz.",
  "stage": "idea",
  "link": "https://example.uz/",
  "budget": "3k-10k",
  "timeline": "1-3m",
  "contact": {
    "name": "Aziz",
    "phone": "+998901234567",
    "telegram": "@nyro_soft",
    "email": null,
    "preferred": "telegram"
  },
  "website": "",
  "locale": "uz",
  "page": "https://example.uz/?xizmat=web-platformalar#brif"
}
```

| Field | Values |
| --- | --- |
| `services` | one or more of `web`, `mobil`, `dizayn`, `avtomatlashtirish`, `unknown` |
| `about` | trimmed text, at least 20 characters |
| `stage` | `idea` · `design` · `existing` · `null` |
| `link` | normalized `http(s)` URL or `null` |
| `budget` | `lt-3k` · `3k-10k` · `10k-25k` · `gt-25k` · `unknown` · `null` (ranges in `app/content/brief.ts`) |
| `timeline` | `lt-1m` · `1-3m` · `gt-3m` · `unknown` · `null` |
| `contact.phone` | `+998XXXXXXXXX` for Uzbek numbers, `+<digits>` otherwise, or `null` |
| `contact.telegram` | `@username` (5–32 of `A–Z a–z 0–9 _`) or `null` |
| `contact.email` / `contact.preferred` | string or `null`; `preferred` is `telegram` · `phone` · `email` |
| `website` | **honeypot** — empty for people. Non-empty means a bot. |

The client validates all of this, but the server must validate again: the request can be made by anyone.

## Response

| Status | Meaning for the site |
| --- | --- |
| `2xx` | Success. Only a real 2xx shows "Brifingiz qabul qilindi". An optional JSON body `{ "reference": "NS-1042" }` is shown to the visitor. |
| `408` | Shown as a timeout (retry offered). |
| other `4xx` | Rejected (validation failed, rate-limited with `429`, honeypot). Shown as the error state; the answers stay. |
| `5xx` / network error | Server or network failure. Error state with retry; the same `Idempotency-Key` is sent again. |

For a honeypot hit, answer `202` with no reference and drop the brief silently, so bots learn nothing.

## Server-side duties

- **Rate limiting** per IP (e.g. 5 briefs / 10 min) → `429`.
- **Honeypot**: reject or silently drop when `website` is not empty.
- **Validation** of every field (lengths, enums, phone/email/telegram formats); cap `about` at a few thousand characters.
- **Idempotency** by `Idempotency-Key`.
- **Secrets** (bot token, chat id, SMTP) from server environment variables only.

## Minimal FastAPI example (forwards to Telegram)

```python
# pip install fastapi uvicorn httpx redis pydantic
import os, json
import httpx, redis
from fastapi import FastAPI, Header, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]      # server-only secret
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "https://example.uz")
r = redis.Redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[SITE_ORIGIN],
    allow_methods=["POST"],
    allow_headers=["Content-Type", "Idempotency-Key"],
)

SERVICES = {"web", "mobil", "dizayn", "avtomatlashtirish", "unknown"}

class Contact(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str | None = Field(default=None, pattern=r"^\+\d{10,15}$")
    telegram: str | None = Field(default=None, pattern=r"^@[A-Za-z0-9_]{5,32}$")
    email: str | None = Field(default=None, max_length=254)
    preferred: str | None = None

class Brief(BaseModel):
    services: list[str] = Field(min_length=1)
    about: str = Field(min_length=20, max_length=5000)
    stage: str | None = None
    link: str | None = Field(default=None, max_length=2000)
    budget: str | None = None
    timeline: str | None = None
    contact: Contact
    website: str = ""
    locale: str = "uz"
    page: str | None = None

    @field_validator("services")
    @classmethod
    def known_services(cls, v: list[str]) -> list[str]:
        if not set(v) <= SERVICES:
            raise ValueError("unknown service")
        return v

@app.post("/brief", status_code=201)
async def brief(body: Brief, request: Request, response: Response,
                idempotency_key: str = Header(min_length=8, max_length=64)):
    ip = request.client.host if request.client else "unknown"
    hits = r.incr(f"brief:rate:{ip}")
    if hits == 1:
        r.expire(f"brief:rate:{ip}", 600)
    if hits > 5:
        raise HTTPException(429, "Too many briefs")

    if body.website:                      # honeypot: drop silently
        response.status_code = 202
        return {}
    if not (body.contact.phone or body.contact.telegram or body.contact.email):
        raise HTTPException(422, "No contact channel")

    seen = r.get(f"brief:idem:{idempotency_key}")
    if seen:                              # a retry of a brief we already handled
        return json.loads(seen)

    reference = f"NS-{r.incr('brief:seq'):04d}"
    text = "\n".join([
        f"Yangi brif {reference}",
        f"Xizmat: {', '.join(body.services)}",
        f"Loyiha: {body.about}",
        f"Holat: {body.stage or '—'} · Budjet: {body.budget or '—'} · Muddat: {body.timeline or '—'}",
        f"Havola: {body.link or '—'}",
        f"Ism: {body.contact.name}",
        f"Telefon: {body.contact.phone or '—'} · Telegram: {body.contact.telegram or '—'} · Email: {body.contact.email or '—'}",
        f"Afzal: {body.contact.preferred or '—'}",
    ])
    async with httpx.AsyncClient(timeout=10) as client:
        tg = await client.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                               json={"chat_id": CHAT_ID, "text": text})
    if tg.status_code != 200:
        raise HTTPException(502, "Delivery failed")   # 5xx → the site offers a retry

    result = {"reference": reference}
    r.setex(f"brief:idem:{idempotency_key}", 86400, json.dumps(result))
    return result
```

Run behind Nginx with HTTPS and set `VITE_BRIEF_ENDPOINT=https://api.example.uz/brief` before `npm run build`.
