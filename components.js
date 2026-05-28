/**
 * Subzillo — Shared Page Components
 * Single source of truth for nav logo + footer across all pages.
 * To update the footer: edit THIS file only, then deploy.
 */
(function () {
  'use strict';

  /* ── Detect page context ─────────────────────────────────────── */
  const path = location.pathname;
  const isHome = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('/');
  const base   = isHome ? '' : 'index.html'; // prefix for in-page anchor links

  /* ── Inject shared CSS (sfooter- prefix avoids conflicts) ──────── */
  if (!document.getElementById('sz-shared-styles')) {
    const style = document.createElement('style');
    style.id = 'sz-shared-styles';
    style.textContent = `
/* ── Shared Footer ────────────────────────────────────────────── */
#sz-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.10);
  padding: 64px 0 36px;
  background: linear-gradient(180deg, transparent, rgba(167,25,221,0.03));
}
.sz-footer-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}
.sz-footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.sz-footer-logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #F4F1FB;
  text-decoration: none;
  margin-bottom: 12px;
}
.sz-footer-logo-link img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 2px 10px rgba(78,197,232,0.4));
}
.sz-footer-tagline {
  font-size: 13px;
  color: rgba(244,241,251,0.55);
  line-height: 1.6;
  margin-bottom: 16px;
}
.sz-footer-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(244,241,251,0.55);
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  margin-bottom: 16px;
}
.sz-footer-pill:hover {
  color: #F4F1FB;
  border-color: rgba(167,25,221,0.4);
  background: rgba(167,25,221,0.06);
}
.sz-footer-pill svg { color: #A719DD; flex-shrink: 0; }
.sz-footer-social {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.sz-footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px; height: 34px;
  border-radius: 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(244,241,251,0.45);
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.sz-footer-social-link:hover {
  color: #F4F1FB;
  border-color: rgba(167,25,221,0.35);
  background: rgba(167,25,221,0.08);
}
.sz-footer-col { display: flex; flex-direction: column; gap: 11px; }
.sz-footer-col-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #F4F1FB;
  font-weight: 600;
  margin-bottom: 4px;
}
.sz-footer-col a {
  font-size: 13px;
  color: rgba(244,241,251,0.55);
  text-decoration: none;
  transition: color 0.2s;
}
.sz-footer-col a:hover { color: #F4F1FB; }
.sz-footer-col a.sz-active { color: #F4F1FB; }
.sz-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding-top: 28px;
}
.sz-footer-copy {
  font-size: 12px;
  color: rgba(244,241,251,0.30);
  font-family: 'JetBrains Mono', monospace;
}
.sz-footer-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(244,241,251,0.30);
}
.sz-status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #5CE4A8;
  box-shadow: 0 0 6px #5CE4A8;
  animation: sz-pulse 2s ease-in-out infinite;
}
@keyframes sz-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

@media (max-width: 700px) {
  .sz-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; padding-bottom: 32px; }
  .sz-footer-brand { grid-column: 1 / -1; }
  .sz-footer-bottom { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 440px) {
  .sz-footer-grid { grid-template-columns: 1fr; gap: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .sz-status-dot { animation: none !important; }
}
`;
    document.head.appendChild(style);
  }

  /* ── Mark active legal link ──────────────────────────────────── */
  const page = path.split('/').pop() || 'index.html';

  /* ── Build footer HTML ───────────────────────────────────────── */
  const footerHTML = `
<footer id="sz-footer" role="contentinfo">
  <div class="sz-footer-wrap">
    <div class="sz-footer-grid">

      <!-- Brand column -->
      <div class="sz-footer-brand">
        <a href="${base || 'index.html'}" class="sz-footer-logo-link" aria-label="Subzillo home">
          <img src="logo-transparent.png" alt="Subzillo logo" width="36" height="36"/>
          Subzillo
        </a>
        <p class="sz-footer-tagline">Smart subscriptions. Smart spending. Smarter life.</p>
        <a href="mailto:info@subzillo.com" class="sz-footer-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3"/>
            <path d="M22 7l-10 7L2 7"/>
          </svg>
          info@subzillo.com
        </a>
        <div class="sz-footer-social" aria-label="Social media">
          <a href="#" class="sz-footer-social-link" aria-label="Follow Subzillo on Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0022 12z"/>
            </svg>
          </a>
          <a href="#" class="sz-footer-social-link" aria-label="Follow Subzillo on Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="#" class="sz-footer-social-link" aria-label="Follow Subzillo on TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.6 7.4a5.5 5.5 0 01-3.2-1.05 5.5 5.5 0 01-2.16-3.85h-3.4v13.4a2.7 2.7 0 11-2.7-2.7c.28 0 .55.05.8.13v-3.5a6.2 6.2 0 105.3 6.13V9.7a8.85 8.85 0 005.36 1.8V8.05a5.4 5.4 0 01-0-.65z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Product column -->
      <div class="sz-footer-col">
        <div class="sz-footer-col-title">Product</div>
        <a href="${base}#features">Features</a>
        <a href="${base}#ai-browser">AI Browser</a>
        <a href="${base}#ai-demo">Subzi AI</a>
        <a href="${base}#platforms">Platforms</a>
        <a href="${base}#pricing">Pricing</a>
        <a href="${base}#referrals">Referrals</a>
      </div>

      <!-- Legal column -->
      <div class="sz-footer-col">
        <div class="sz-footer-col-title">Legal</div>
        <a href="privacy.html" class="${page === 'privacy.html' ? 'sz-active' : ''}">Privacy Policy</a>
        <a href="terms.html"   class="${page === 'terms.html'   ? 'sz-active' : ''}">Terms of Service</a>
        <a href="mailto:info@subzillo.com?subject=Contact%20Subzillo">Contact us</a>
      </div>

    </div>

    <div class="sz-footer-bottom">
      <div class="sz-footer-copy">© 2026 Subzillo. Made with care, for everyone tired of subscription chaos.</div>
      <div class="sz-footer-status">
        <span class="sz-status-dot"></span>
        All systems normal · v0.9 pre-launch
      </div>
    </div>
  </div>
</footer>`;

  /* ── Mount footer ─────────────────────────────────────────────── */
  const placeholder = document.getElementById('site-footer');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  }

})();
