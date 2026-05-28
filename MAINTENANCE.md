# Subzillo — Maintenance & Update Guide

Everything you need to keep the site running, update content, add new pages, and scale as the product grows.

---

## Table of Contents

1. [The Golden Rule — Edit → Deploy](#1-the-golden-rule)
2. [Updating Existing Content](#2-updating-existing-content)
3. [Adding a New Section to the Landing Page](#3-adding-a-new-section)
4. [Adding a New Page](#4-adding-a-new-page)
5. [Linking to the App Once It's Ready](#5-linking-to-the-app)
6. [Managing Waitlist Signups](#6-managing-waitlist-signups)
7. [Updating Secrets (SMTP, Admin Token)](#7-updating-secrets)
8. [Deploying & Rolling Back](#8-deploying--rolling-back)
9. [Scaling](#9-scaling)
10. [Monitoring & Alerts](#10-monitoring--alerts)
11. [Domain & SSL Management](#11-domain--ssl)
12. [Adding Team Members to GCP](#12-adding-team-members)
13. [Common Issues & Fixes](#13-common-issues)

---

## 1. The Golden Rule

Every change follows the same 3-step flow:

```
1. Edit files locally  →  2. Test on localhost:3001  →  3. Deploy (3 min)
```

**Never edit files directly on the server.** All changes go through git → Cloud Run.

---

## 2. Updating Existing Content

Everything visible on the site lives in **`index.html`**. Open it in VS Code, make your change, test locally, deploy.

### Change text / copy
Search (`Cmd+F`) for the text you want to change and edit it directly.

```bash
# After editing:
node server.js        # test at http://localhost:3001
# Looks good? Deploy:
gcloud run deploy subzillo --source . --region us-central1 --allow-unauthenticated
```

### Change colours
The design uses CSS variables at the top of `index.html`. Search for `:root {` — you'll find:
```css
--grad: linear-gradient(135deg, #A719DD, #7C5BCC, #4489EB);   /* purple→blue gradient */
--accent: #A719DD;   /* primary purple */
```
Change these values and every element using them updates automatically.

### Change the logo
Replace `logo-transparent.png` with a new file of the same name, same size (1002×962px recommended). Then deploy.

### Change the OG image (social sharing preview)
Replace `og-image.png` (must be 1200×630px). Deploy.

### Change the favicon
Replace `logo-favicon.png` (64×64px recommended). Deploy.

---

## 3. Adding a New Section

Open `index.html`. Sections follow this pattern — copy one and paste it where you want the new one:

```html
<!-- ── YOUR NEW SECTION ─────────────────────────────────── -->
<section id="your-section-id" class="section">
  <div class="container">
    <div class="section-label">LABEL TEXT</div>
    <h2 class="section-title">Your Heading</h2>
    <p class="section-sub">Your subtitle or description.</p>

    <!-- Your content here -->

  </div>
</section>
<div class="section-divider"></div>
```

Then add it to the nav (search for `<ul class="nav-links">` and the mobile drawer `id="navDrawer"`):
```html
<li><a href="#your-section-id">Section Name</a></li>
```

---

## 4. Adding a New Page

When Subzillo has a blog, pricing detail page, terms of service, etc:

### Step 1 — Create the HTML file
```bash
# Copy the existing index as a starting point
cp index.html /Users/Hasan/Desktop/Subzillo-WebSite/blog.html
# Edit blog.html — keep the nav and footer, replace the main content
```

### Step 2 — Update the Dockerfile
Add the new file to the Dockerfile so it's included in the container:
```dockerfile
# Add this line in the Dockerfile after COPY index.html ./
COPY blog.html ./
```

### Step 3 — Deploy
```bash
gcloud run deploy subzillo --source . --region us-central1 --allow-unauthenticated
```

Your new page will be live at `https://subzillo.com/blog.html`

### Step 4 — Link to it from the nav
In `index.html`, add to the nav links:
```html
<li><a href="/blog.html">Blog</a></li>
```

### Pro tip — Clean URLs
To use `/blog` instead of `/blog.html`, add a route in `server.js`:
```javascript
app.get('/blog', (_req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});
```

---

## 5. Linking to the App

Once the Subzillo app is live (e.g. at `app.subzillo.com`), update the CTAs:

### Option A — External link (quickest)
Search `index.html` for the CTA buttons and update `href`:
```html
<!-- Before: scrolls to waitlist section -->
<button onclick="document.getElementById('waitlist').scrollIntoView(...)">
  Get early access
</button>

<!-- After: link to the app -->
<a href="https://app.subzillo.com" class="nav-cta">
  Open app
</a>
```

### Option B — Subdomain for the app
Set up `app.subzillo.com` to point to your app's hosting (separate from this Cloud Run service). In GoDaddy DNS, add:
```
CNAME   app   →   your-app-hosting.com
```

### Option C — Keep the waitlist + add app link
Add a second CTA button alongside the existing one:
```html
<a href="https://app.subzillo.com" class="btn-secondary">Open app →</a>
```

---

## 6. Managing Waitlist Signups

### View in Firestore (GUI — easiest)
1. Go to https://console.cloud.google.com/firestore/databases/default/data/editor?project=subzillo-website-prod
2. Click **waitlist** collection in the left panel
3. Every signup is a document with: email, ip, createdAt, referrer

### Export as CSV (for email campaigns)
```bash
curl -H "x-admin-token: 42fbbed6fbe6974be9a74749c0a40f65" \
  https://subzillo.com/api/waitlist/export > waitlist-$(date +%Y%m%d).csv
```

### Get live count
```bash
curl https://subzillo.com/api/waitlist/count
```

### Delete a signup (spam / test)
In the Firestore console: click the document → three-dot menu → **Delete document**

### Email the waitlist
Export the CSV → import into Mailchimp, Loops, Resend, or any email platform.

---

## 7. Updating Secrets

**Never put secrets in code or git.** They live only on Cloud Run.

### Update SMTP password (if you regenerate the App Password)
```bash
gcloud run services update subzillo \
  --region us-central1 \
  --update-env-vars "SMTP_PASS=yournewapppassword"
```

### Update admin token
```bash
# Generate new token
openssl rand -hex 16

# Apply it
gcloud run services update subzillo \
  --region us-central1 \
  --update-env-vars "ADMIN_TOKEN=your_new_token"
```

### Update multiple variables at once
```bash
gcloud run services update subzillo \
  --region us-central1 \
  --update-env-vars "SMTP_PASS=newpass,ADMIN_TOKEN=newtoken"
```

No redeploy needed — Cloud Run creates a new revision automatically (~30 sec).

---

## 8. Deploying & Rolling Back

### Standard deploy (after any change)
```bash
cd /Users/Hasan/Desktop/Subzillo-WebSite

# Always commit before deploying
git add -A && git commit -m "your change description"
git push

# Deploy
gcloud run deploy subzillo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### List all deployments (revisions)
```bash
gcloud run revisions list --service subzillo --region us-central1
```
Output shows each revision with its traffic % and deploy time.

### Roll back instantly (zero downtime)
```bash
# Replace REVISION_NAME with e.g. subzillo-00003-x2k
gcloud run services update-traffic subzillo \
  --to-revisions subzillo-00003-x2k=100 \
  --region us-central1
```

### Split traffic (A/B test)
```bash
# Send 20% to new revision, 80% to old
gcloud run services update-traffic subzillo \
  --to-revisions subzillo-00005-abc=20,subzillo-00004-xyz=80 \
  --region us-central1
```

---

## 9. Scaling

Cloud Run scales automatically — you don't manage servers.

### Current config (suitable for pre-launch → early growth)
- Min instances: 0 (scales to zero when no traffic = $0 cost)
- Max instances: 100 (GCP default)
- Concurrency: 80 requests per instance

### When you start getting real traffic
Reduce cold starts by setting a minimum instance:
```bash
gcloud run services update subzillo \
  --region us-central1 \
  --min-instances 1
```
Cost: ~$5–10/month for 1 warm instance. Worth it once you're getting consistent traffic.

### If the waitlist grows beyond free tier (unlikely until 50K+ signups/day)
Firestore free tier is extremely generous. No action needed until you're at scale.

### Future: Add a CDN
For maximum global speed, put Cloudflare in front:
1. Change GoDaddy nameservers to Cloudflare's
2. Add your A records in Cloudflare (same IPs)
3. Enable "Proxy" (orange cloud) — free CDN + DDoS protection

---

## 10. Monitoring & Alerts

### Check if the site is up
```bash
curl -s -o /dev/null -w "%{http_code}" https://subzillo.com/
# Should return 200
```

### View live logs
```bash
gcloud run services logs tail subzillo --region us-central1
```

### View recent logs
```bash
gcloud run services logs read subzillo --region us-central1 --limit 100
```

### GCP Console dashboards
- **Traffic & errors:** https://console.cloud.google.com/run/detail/us-central1/subzillo/metrics?project=subzillo-website-prod
- **Firestore usage:** https://console.cloud.google.com/firestore/databases/default/usage?project=subzillo-website-prod
- **Billing:** https://console.cloud.google.com/billing

### Set up a free uptime alert
Use https://uptimerobot.com — free plan monitors every 5 min and emails you if the site goes down.

---

## 11. Domain & SSL

### SSL
Auto-renews — no action ever needed. Google manages the certificate.

### Check SSL expiry
```bash
echo | openssl s_client -connect subzillo.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Add a new subdomain (e.g. app.subzillo.com)
1. In GoDaddy DNS: add `CNAME app → your-app-host.com`
2. If routing to the same Cloud Run service:
```bash
gcloud beta run domain-mappings create \
  --service subzillo \
  --domain app.subzillo.com \
  --region us-central1
```

### Transfer domain away from GoDaddy (optional)
For lower fees, transfer to Cloudflare Registrar (~$10/yr at cost price).

---

## 12. Adding Team Members to GCP

### Give someone read-only access (see logs, metrics, not deploy)
```bash
gcloud projects add-iam-policy-binding subzillo-website-prod \
  --member="user:colleague@subzillo.com" \
  --role="roles/viewer"
```

### Give someone deploy access
```bash
gcloud projects add-iam-policy-binding subzillo-website-prod \
  --member="user:colleague@subzillo.com" \
  --role="roles/run.developer"
```

### Give full admin access (same as dev@subzillo.com)
```bash
gcloud projects add-iam-policy-binding subzillo-website-prod \
  --member="user:colleague@subzillo.com" \
  --role="roles/owner"
```

---

## 13. Common Issues & Fixes

### Site not loading after deploy
```bash
# Check if the service is running
gcloud run services describe subzillo --region us-central1 | grep -i "status\|url"

# Check logs for errors
gcloud run services logs read subzillo --region us-central1 --limit 20
```

### Waitlist form shows "Something went wrong"
```bash
# Check logs for Firestore errors
gcloud run services logs read subzillo --region us-central1 --limit 20 | grep -i "firestore\|error"

# Verify Firestore permissions
gcloud projects get-iam-policy subzillo-website-prod \
  --flatten="bindings[].members" \
  --filter="bindings.members:131483183308-compute@developer.gserviceaccount.com"
```

### Email notifications not arriving
```bash
# Check logs for SMTP errors
gcloud run services logs read subzillo --region us-central1 --limit 20 | grep -i "email\|smtp"

# Update SMTP password (most common fix — App Passwords expire if 2FA is changed)
gcloud run services update subzillo \
  --region us-central1 \
  --update-env-vars "SMTP_PASS=new_app_password"
```

### Domain not loading (after DNS change)
```bash
# Check current DNS
dig +short A subzillo.com
# Should show 216.239.x.x — if still showing old IP, DNS is still propagating (wait 30 min)
```

### Accidentally broke something — instant rollback
```bash
gcloud run revisions list --service subzillo --region us-central1
# Find the last working revision name, then:
gcloud run services update-traffic subzillo \
  --to-revisions LAST_GOOD_REVISION=100 \
  --region us-central1
```

### Port 3001 already in use locally
```bash
lsof -ti :3001 | xargs kill -9
node server.js
```

---

## Quick Reference Card

| Task | Command |
|---|---|
| Start locally | `node server.js` |
| Deploy | `gcloud run deploy subzillo --source . --region us-central1 --allow-unauthenticated` |
| View logs | `gcloud run services logs tail subzillo --region us-central1` |
| Export waitlist | `curl -H "x-admin-token: TOKEN" https://subzillo.com/api/waitlist/export` |
| Roll back | `gcloud run services update-traffic subzillo --to-revisions REV=100 --region us-central1` |
| Update env var | `gcloud run services update subzillo --region us-central1 --update-env-vars "KEY=value"` |
| Check site | `curl -s -o /dev/null -w "%{http_code}" https://subzillo.com/` |
