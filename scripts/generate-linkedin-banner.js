const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Try to load logos, fallback to null
function tryLoadBase64(paths) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const ext = path.extname(p).slice(1) === 'svg' ? 'svg+xml' : 'png';
        return `data:image/${ext};base64,${fs.readFileSync(p).toString('base64')}`;
      }
    } catch { /* skip */ }
  }
  return null;
}

const root = path.resolve(__dirname, '..');
const devizlyLogo = tryLoadBase64([
  path.join(root, 'public/devizly-app-icon.png'),
  path.join(root, 'public/icons/icon-96x96.png'),
]);
const worthifastLogo = tryLoadBase64([
  path.join(root, 'public/worthifast-logo.png'),
  path.join(root, 'public/worthifast-app-icon.png'),
]);

const devizlyLogoHtml = devizlyLogo
  ? `<img src="${devizlyLogo}" style="width:100%;height:100%;object-fit:cover;" />`
  : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7C3AED,#5B5BD6);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;border-radius:12px;">D</div>`;

const worthifastLogoHtml = worthifastLogo
  ? `<img src="${worthifastLogo}" style="width:100%;height:100%;object-fit:cover;" />`
  : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#0d1428,#132030);border:2px solid #22D3A5;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#22D3A5;border-radius:12px;">W</div>`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1584px;
    height: 396px;
    overflow: hidden;
    background: linear-gradient(135deg, #070b18 0%, #0d1428 50%, #0a1020 100%);
    font-family: 'Inter', -apple-system, sans-serif;
    position: relative;
  }

  /* Dot grid */
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #1e2545 1px, transparent 1px);
    background-size: 36px 36px;
    opacity: 0.6;
  }

  /* Ambient glows */
  .orb-purple {
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -150px; left: 380px;
    border-radius: 50%;
    filter: blur(50px);
  }
  .orb-teal {
    position: absolute;
    width: 450px; height: 450px;
    background: radial-gradient(circle, rgba(34,211,165,0.18) 0%, transparent 70%);
    top: -120px; left: 660px;
    border-radius: 50%;
    filter: blur(50px);
  }
  .orb-small {
    position: absolute;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(91,91,214,0.15) 0%, transparent 70%);
    bottom: 40px; left: 200px;
    border-radius: 50%;
    filter: blur(30px);
  }

  /* LEFT: Identity */
  .identity {
    position: absolute;
    left: 54px;
    top: 72px;
    z-index: 10;
  }
  .identity h1 {
    font-size: 50px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -1.5px;
    line-height: 1;
    text-shadow: 0 2px 30px rgba(0,0,0,0.5);
  }
  .identity .sub {
    font-size: 16px;
    color: #7a84a6;
    margin-top: 12px;
    font-weight: 400;
  }
  .identity .badge {
    display: inline-block;
    margin-top: 16px;
    background: rgba(91,91,214,0.3);
    color: #a5a5ff;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 16px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    border: 1px solid rgba(91,91,214,0.4);
  }

  /* CARDS */
  .cards {
    position: absolute;
    left: 370px;
    top: 0;
    width: 780px;
    height: 344px;
    perspective: 1200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card {
    width: 225px;
    height: 165px;
    border-radius: 20px;
    padding: 18px;
    position: absolute;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: transform 0.3s;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 12%; right: 12%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    border-radius: 1px;
  }

  .card-devizly {
    background: linear-gradient(145deg, rgba(91,91,214,0.28) 0%, rgba(15,18,40,0.88) 100%);
    border: 1.5px solid rgba(124,58,237,0.6);
    box-shadow:
      0 0 50px rgba(124,58,237,0.35),
      0 0 100px rgba(124,58,237,0.15),
      0 8px 32px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.12);
    transform: perspective(1200px) rotateY(16deg) rotateX(-5deg) translateX(-55px) translateY(8px);
    z-index: 3;
  }

  .card-worthifast {
    background: linear-gradient(145deg, rgba(34,211,165,0.22) 0%, rgba(12,18,35,0.9) 100%);
    border: 1.5px solid rgba(34,211,165,0.55);
    box-shadow:
      0 0 50px rgba(34,211,165,0.3),
      0 0 100px rgba(34,211,165,0.12),
      0 8px 32px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.1);
    transform: perspective(1200px) rotateY(-10deg) rotateX(3deg) translateX(105px) translateY(25px);
    z-index: 4;
  }

  .card-soon {
    background: rgba(255,255,255,0.025);
    border: 2px dashed rgba(55,65,105,0.55);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transform: perspective(1200px) rotateY(-22deg) rotateX(-2deg) translateX(268px) translateY(3px);
    z-index: 2;
  }

  .card-logo {
    width: 44px; height: 44px;
    border-radius: 12px;
    overflow: hidden;
    float: left;
    margin-right: 12px;
  }
  .card-name {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
    padding-top: 3px;
  }
  .card-desc {
    font-size: 12px;
    color: rgba(145,158,195,0.85);
    margin-top: 6px;
    clear: both;
    padding-top: 6px;
  }
  .card-badge {
    position: absolute;
    bottom: 14px; left: 16px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
  }
  .badge-live {
    background: rgba(91,91,214,0.3);
    color: #a0a8ff;
    border: 1px solid rgba(91,91,214,0.45);
  }
  .badge-beta {
    background: rgba(34,211,165,0.2);
    color: #5eedcc;
    border: 1px solid rgba(34,211,165,0.35);
  }
  .badge-coming {
    background: rgba(35,42,80,0.4);
    color: #4a5580;
    border: 1px solid rgba(55,65,105,0.3);
  }

  .soon-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(20,26,55,0.8);
    border: 1px solid rgba(55,65,105,0.5);
    display: flex; align-items: center; justify-content: center;
    float: left; margin-right: 12px;
    font-size: 20px; color: #3a4470; font-weight: 700;
  }
  .soon-name { font-size: 20px; font-weight: 700; color: #3a4470; padding-top: 3px; }
  .soon-desc { font-size: 12px; color: #262e52; clear: both; padding-top: 6px; margin-top: 6px; }

  /* RIGHT: NBHC */
  .nbhc {
    position: absolute;
    right: 54px;
    top: 68px;
    text-align: right;
    z-index: 10;
  }
  .nbhc h2 {
    font-size: 46px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 3px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  }
  .nbhc-line {
    height: 2.5px;
    background: linear-gradient(90deg, transparent, #5b5bd6);
    margin: 8px 0;
    border-radius: 2px;
  }
  .nbhc .studio { font-size: 17px; color: #5b5bd6; font-weight: 600; }
  .nbhc .year { font-size: 12px; color: #3a4470; margin-top: 5px; }

  /* BOTTOM */
  .bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 52px;
    border-top: 1px solid rgba(28,33,65,0.7);
    display: flex;
    align-items: center;
    padding: 0 54px;
    z-index: 10;
  }
  .bottom-url {
    font-size: 12px;
    color: #2a3258;
    flex: 1;
    font-weight: 400;
  }
  .pills { display: flex; gap: 10px; }
  .pill {
    font-size: 11px;
    font-weight: 500;
    padding: 5px 14px;
    border-radius: 20px;
  }
  .pill-v { background: rgba(91,91,214,0.12); color: #7878ee; border: 1px solid rgba(91,91,214,0.3); }
  .pill-t { background: rgba(34,211,165,0.1); color: #3dd9a8; border: 1px solid rgba(34,211,165,0.25); }
  .pill-b { background: rgba(56,120,240,0.1); color: #5a8ae8; border: 1px solid rgba(56,120,240,0.25); }
</style>
</head>
<body>
  <div class="orb-purple"></div>
  <div class="orb-teal"></div>
  <div class="orb-small"></div>

  <div class="identity">
    <h1>Haroun Chikh</h1>
    <div class="sub">Co-fondateur NBHC &middot; SaaS Developer</div>
    <div class="badge">Founder</div>
  </div>

  <div class="cards">
    <div class="card card-devizly">
      <div class="card-logo">${devizlyLogoHtml}</div>
      <div class="card-name">Devizly</div>
      <div class="card-desc">Devis &middot; Factures &middot; Paiement</div>
      <div class="card-badge badge-live">&check; Live</div>
    </div>

    <div class="card card-worthifast">
      <div class="card-logo">${worthifastLogoHtml}</div>
      <div class="card-name">Worthifast</div>
      <div class="card-desc">OCR &middot; TVA &middot; Banking</div>
      <div class="card-badge badge-beta">Beta</div>
    </div>

    <div class="card card-soon">
      <div class="soon-icon">?</div>
      <div class="soon-name">Coming Soon</div>
      <div class="soon-desc">Next NBHC SaaS</div>
      <div class="card-badge badge-coming">2026 &rarr;</div>
    </div>
  </div>

  <div class="nbhc">
    <h2>NBHC</h2>
    <div class="nbhc-line"></div>
    <div class="studio">SaaS Studio</div>
    <div class="year">Immatricul&eacute;e &middot; 2026</div>
  </div>

  <div class="bottom">
    <div class="bottom-url">devizly.fr &middot; worthifast.vercel.app</div>
    <div class="pills">
      <div class="pill pill-v">Devis en 30 sec</div>
      <div class="pill pill-t">OCR Factures</div>
      <div class="pill pill-b">TVA &amp; Banking</div>
    </div>
  </div>
</body>
</html>`;

// Write HTML for debug
fs.writeFileSync(path.join(__dirname, 'banner.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1584, height: 396 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  // Wait for font to load
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './public/linkedin-banner.png', fullPage: false });
  await page.screenshot({ path: './linkedin-banner.png', fullPage: false });
  await browser.close();
  console.log('Banner saved: 1584x396px');
  console.log('-> public/linkedin-banner.png');
  console.log('-> linkedin-banner.png');
})();
