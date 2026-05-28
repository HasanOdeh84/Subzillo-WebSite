# Subzillo — Landing Page & Waitlist System

Pre-launch marketing website for Subzillo — the AI copilot that tracks, cancels and negotiates subscriptions.

**Live site:** https://subzillo.com
**GCP Project:** `subzillo-website-prod`
**Cloud Run Service:** `subzillo` (region: `us-central1`)

---

## Architecture

```
Browser → subzillo.com (GoDaddy DNS → Google Cloud)
               ↓
          Cloud Run  (Node.js container, auto-scales to zero)
          ├── Serves static files (index.html, logo, OG image)
          └── /api/waitlist  (POST / GET count / GET export)
               ↓
          Firestore  (database: "default", collection: "waitlist")
               +
          SMTP → info@subzillo.com  (via dev@subzillo.com App Password)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Single-file HTML/CSS/JS (`index.html`) |
| Backend | Node.js + Express (`server.js`) |
| Database | Google Cloud Firestore (Native mode) |
| Hosting | Google Cloud Run (containerised, auto-scales to zero) |
| Domain | subzillo.com via GoDaddy DNS → Cloud Run |
| SSL | Auto-provisioned by Google (Let's Encrypt) |
| Email | Nodemailer → Gmail SMTP (dev@subzillo.com) |
| Container | Docker (node:20-slim, multi-stage build) |

---

## File Structure

```
Subzillo-WebSite/
├── index.html              # Entire frontend (HTML + CSS + JS)
├── server.js               # Express backend — waitlist API + static serving
├── package.json            # Node dependencies
├── Dockerfile              # Container definition for Cloud Run
├── .dockerignore           # Files excluded from container build
├── .env                    # Local secrets — NOT committed to git
├── .env.example            # Template showing all required env vars
├── .gitignore
│
├── logo-transparent.png    # Subzillo logo (background removed) — used in nav
├── logo-favicon.png        # 64×64 favicon
├── og-image.png            # 1200×630 Open Graph image for social sharing
├── favicon.svg             # SVG favicon fallback
│
└── .claude/                # Claude Code project files (local only, not committed)
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/waitlist` | None | Submit email. Returns `{success:true}` or `{already:true}` for duplicates |
| `GET` | `/api/waitlist/count` | None | Returns `{count: N}` — total signups |
| `GET` | `/api/waitlist/export` | `x-admin-token` header | Download all signups as CSV |

**Export example:**
```bash
curl -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  https://subzillo.com/api/waitlist/export > waitlist.csv
```

---

## Environment Variables

Set on Cloud Run — never stored in code or git.

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server (smtp.gmail.com) |
| `SMTP_PORT` | 465 |
| `SMTP_SECURE` | true |
| `SMTP_USER` | dev@subzillo.com |
| `SMTP_PASS` | Gmail App Password (no spaces) |
| `ADMIN_TOKEN` | Secret token for CSV export endpoint |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID (subzillo-website-prod) |
| `FIRESTORE_DATABASE` | Firestore DB name — defaults to `default` |
| `PORT` | Auto-set by Cloud Run (8080) |

**Update any variable without redeploying:**
```bash
gcloud run services update subzillo \
  --region us-central1 \
  --update-env-vars "VARIABLE=new_value"
```

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/HasanOdeh84/Subzillo-WebSite.git
cd Subzillo-WebSite

# 2. Install dependencies
npm install

# 3. Set up credentials
cp .env.example .env
# Edit .env with your real SMTP values

# 4. Authenticate with GCP for local Firestore access
gcloud auth application-default login

# 5. Start server
node server.js

# Open http://localhost:3001
```

---

## Deployment

**Standard deploy (after any change):**
```bash
cd /Users/Hasan/Desktop/Subzillo-WebSite

gcloud run deploy subzillo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```
Takes ~3 minutes. Zero downtime — Cloud Run shifts traffic to the new revision automatically.

**Roll back to previous version:**
```bash
# List all revisions
gcloud run revisions list --service subzillo --region us-central1

# Roll back instantly
gcloud run services update-traffic subzillo \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

---

## Viewing Waitlist Data

**Firestore Console (GUI):**
https://console.cloud.google.com/firestore/databases/default/data/editor?project=subzillo-website-prod

**CSV export:**
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  https://subzillo.com/api/waitlist/export > waitlist.csv
```

**Live count:**
```bash
curl https://subzillo.com/api/waitlist/count
```

---

## Logs & Monitoring

```bash
# Stream live logs
gcloud run services logs tail subzillo --region us-central1

# Recent logs
gcloud run services logs read subzillo --region us-central1 --limit 50
```

GCP Console dashboard:
https://console.cloud.google.com/run/detail/us-central1/subzillo/metrics?project=subzillo-website-prod

---

## Cost

| Service | Free tier | Expected |
|---|---|---|
| Cloud Run | 2M requests/month free | ~$0 pre-launch |
| Firestore | 50K reads + 40K writes/day free | ~$0 |
| Cloud Build | 120 min/day free | ~$0 |
| **Total** | | **~$0–2/month** |

---

## Key Contacts

| Role | Email |
|---|---|
| GCP Owner | dev@subzillo.com |
| Waitlist notifications | info@subzillo.com (→ odeh@ + alkassab@) |
| Domain registrar | GoDaddy — subzillo.com |
