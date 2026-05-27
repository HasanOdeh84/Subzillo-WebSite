# Subzillo — Marketing Website

The official pre-launch marketing website for **Subzillo**, an AI-powered subscription management app.

## Pages

| File | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Main landing page |
| `privacy.html` | `/privacy` | Privacy Policy |
| `terms.html` | `/terms` | Terms of Service |
| `404.html` | (auto) | Custom 404 error page |

## Tech stack

- Pure HTML / CSS / JS — no build step, no dependencies
- Hosted on **Firebase Hosting** (Google Cloud Platform)
- CI/CD via **GitHub Actions** — every push to `main` auto-deploys

## Local development

Open any HTML file directly in your browser, or use a simple local server:

```bash
# Python (built-in)
python3 -m http.server 3000

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:3000`.

## Deployment — Firebase Hosting (GCP)

### One-time setup

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in and initialise the project:
   ```bash
   firebase login
   firebase use subzillo-website   # or: firebase use --add
   ```

3. Add the `FIREBASE_SERVICE_ACCOUNT` secret to GitHub:
   - Go to **Firebase Console → Project Settings → Service Accounts**
   - Generate a new private key (JSON)
   - In GitHub repo → **Settings → Secrets → Actions** → add `FIREBASE_SERVICE_ACCOUNT` with the JSON content

### Manual deploy

```bash
firebase deploy --only hosting
```

### Automatic deploy (CI/CD)

Every push to the `main` branch automatically deploys to production via `.github/workflows/deploy.yml`.

## Custom domain

After deploying, connect your domain in **Firebase Console → Hosting → Add custom domain** (`subzillo.com`).

## Security headers

The following headers are set globally via `firebase.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

HTML files are served with `Cache-Control: no-cache` (always fresh).  
Static assets (fonts, JS, CSS) use `max-age=31536000, immutable`.
