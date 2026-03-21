const { chromium } = require("playwright");
const path = require("path");

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`;

const BASE_STYLES = `
${FONT_IMPORT}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px; overflow: hidden;
  background: linear-gradient(145deg, #070b18 0%, #0d1428 50%, #0a1020 100%);
  font-family: 'Inter', -apple-system, sans-serif;
  position: relative; color: #fff;
}
body::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle, #1e2545 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.5;
}
.orb { position: absolute; border-radius: 50%; filter: blur(80px); }
.orb-v { width: 500px; height: 500px; background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%); }
.orb-t { width: 500px; height: 500px; background: radial-gradient(circle, rgba(34,211,165,0.25) 0%, transparent 70%); }
.content { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 60px; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; }
.pill-v { background: rgba(91,91,214,0.25); color: #a0a8ff; border: 1px solid rgba(91,91,214,0.4); }
.pill-t { background: rgba(34,211,165,0.2); color: #5eedcc; border: 1px solid rgba(34,211,165,0.35); }
.divider { width: 80px; height: 3px; background: #5B5BD6; border-radius: 2px; margin: 24px 0; }
.glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(10,14,30,0.85) 100%);
  border-radius: 20px; padding: 24px; position: relative;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
}
.glass::before {
  content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
}
.bottom-bar {
  position: absolute; bottom: 40px; left: 60px; right: 60px;
  display: flex; align-items: center; justify-content: space-between;
  z-index: 10;
}
.logo-text { font-size: 20px; font-weight: 800; color: #5B5BD6; }
.url { font-size: 16px; color: #5B5BD6; font-weight: 600; }
`;

/* ═══════════════════════════════════════════════════ */

const post01Html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLES}
</style></head><body>
<div class="orb orb-v" style="top:-150px;left:-100px;"></div>
<div class="orb orb-t" style="bottom:-150px;right:-100px;"></div>
<div class="content" style="justify-content:center;text-align:center;">
  <div class="pill pill-v" style="margin-bottom:32px;">🚀 Disponible maintenant</div>
  <h1 style="font-size:68px;font-weight:900;line-height:1.1;letter-spacing:-2px;">
    Créez un devis<br>professionnel<br>en 2 minutes.
  </h1>
  <p style="font-size:22px;color:#8892b0;margin-top:16px;font-weight:400;">L'IA s'occupe du reste.</p>
  <div class="divider" style="margin:28px auto;"></div>
  <div style="display:flex;gap:40px;margin-top:8px;">
    <div style="display:flex;align-items:center;gap:8px;font-size:15px;color:#a0a8c0;">
      <span style="font-size:20px;">⚡</span> IA générative
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-size:15px;color:#a0a8c0;">
      <span style="font-size:20px;">🔄</span> Pipeline
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-size:15px;color:#a0a8c0;">
      <span style="font-size:20px;">💳</span> Paiement Stripe
    </div>
  </div>
  <div style="margin-top:40px;">
    <div class="pill pill-v" style="font-size:16px;padding:10px 28px;">devizly.fr →</div>
  </div>
</div>
<div class="bottom-bar">
  <span class="logo-text">Devizly</span>
  <span style="font-size:12px;color:#3d4878;">NBHC SAS · 2026</span>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════ */

const post02Html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLES}
.step-card { width: 100%; margin-bottom: 20px; padding: 28px 32px; }
.step-num { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.step-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.step-desc { font-size: 14px; color: #8892b0; line-height: 1.5; }
.glow-v { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 30px rgba(124,58,237,0.2); }
.glow-b { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 30px rgba(59,130,246,0.2); }
.glow-t { border-color: rgba(34,211,165,0.5); box-shadow: 0 0 30px rgba(34,211,165,0.2); }
.mini-table { margin-top:12px; width:100%; }
.mini-row { display:flex; justify-content:space-between; padding:6px 12px; border-radius:6px; font-size:12px; }
.mini-row:nth-child(odd) { background:rgba(255,255,255,0.04); }
.mini-row .desc { color:#a0a8c0; } .mini-row .amt { color:#fff; font-weight:600; }
</style></head><body>
<div class="orb orb-v" style="top:-200px;right:-100px;"></div>
<div class="content" style="padding-top:50px;">
  <h2 style="font-size:44px;font-weight:800;text-align:center;margin-bottom:36px;letter-spacing:-1px;">Comment ça marche ?</h2>

  <div class="glass step-card glow-v">
    <div class="step-num" style="color:#7C3AED;">01</div>
    <div class="step-title">Décrivez en langage naturel</div>
    <div class="step-desc" style="font-style:italic;">"Site vitrine 5 pages pour un restaurant à Lyon"</div>
  </div>

  <div class="glass step-card glow-b">
    <div class="step-num" style="color:#3B82F6;">02</div>
    <div class="step-title">L'IA structure et chiffre</div>
    <div class="mini-table">
      <div class="mini-row"><span class="desc">Design & maquettes</span><span class="amt">1 200 €</span></div>
      <div class="mini-row"><span class="desc">Développement WordPress</span><span class="amt">2 800 €</span></div>
      <div class="mini-row"><span class="desc">Contenu & SEO</span><span class="amt">600 €</span></div>
    </div>
  </div>

  <div class="glass step-card glow-t">
    <div class="step-num" style="color:#22D3A5;">03</div>
    <div class="step-title">Envoyez, signez, encaissez</div>
    <div class="step-desc">
      <span class="pill pill-t" style="font-size:12px;padding:4px 12px;margin-top:8px;">🔒 Stripe sécurisé</span>
    </div>
  </div>
</div>
<div class="bottom-bar">
  <span class="logo-text">Devizly</span>
  <span class="url">devizly.fr</span>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════ */

const post03Html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLES}
</style></head><body>
<div class="orb orb-v" style="top:200px;left:200px;width:700px;height:700px;filter:blur(120px);"></div>
<div class="content" style="justify-content:center;text-align:center;">
  <p style="font-size:16px;color:#64748b;margin-bottom:24px;font-weight:500;">Le temps moyen pour créer un devis manuellement</p>
  <p style="font-size:140px;font-weight:900;line-height:1;letter-spacing:-4px;text-shadow:0 0 60px rgba(124,58,237,0.3);">47 min</p>
  <div style="font-size:40px;color:#5B5BD6;margin:24px 0;">↓</div>
  <p style="font-size:120px;font-weight:900;line-height:1;letter-spacing:-3px;color:#5B5BD6;">2 min</p>
  <p style="font-size:20px;color:#8892b0;margin-top:16px;font-weight:500;">avec Devizly IA</p>
  <div class="divider" style="margin:32px auto;"></div>
  <div class="pill pill-v" style="font-size:16px;padding:10px 28px;">devizly.fr →</div>
</div>
<div class="bottom-bar">
  <span class="logo-text">Devizly</span>
  <span style="font-size:12px;color:#3d4878;">NBHC SAS · 2026</span>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════ */

const post04Html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLES}
.feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; margin-top: 32px; }
.feat-card {
  padding: 24px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(10,14,30,0.8) 100%);
  border: 1px solid rgba(255,255,255,0.08);
}
.feat-card .icon { font-size: 28px; margin-bottom: 10px; }
.feat-card .title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.feat-card .desc { font-size: 12px; color: #8892b0; line-height: 1.4; }
</style></head><body>
<div class="orb orb-v" style="top:-100px;left:-80px;"></div>
<div class="orb orb-t" style="bottom:-100px;right:-80px;"></div>
<div class="content" style="padding-top:50px;">
  <h2 style="font-size:48px;font-weight:800;text-align:center;line-height:1.15;letter-spacing:-1.5px;">
    Tout ce qu'il vous faut<br>pour vos devis.
  </h2>
  <div class="feat-grid">
    <div class="feat-card" style="box-shadow:0 0 25px rgba(124,58,237,0.15);">
      <div class="icon">⚡</div><div class="title">Devis IA</div>
      <div class="desc">Généré en 2 min par l'IA Mistral</div>
    </div>
    <div class="feat-card" style="box-shadow:0 0 25px rgba(59,130,246,0.15);">
      <div class="icon">🔄</div><div class="title">Pipeline kanban</div>
      <div class="desc">Suivez chaque devis en temps réel</div>
    </div>
    <div class="feat-card" style="box-shadow:0 0 25px rgba(34,211,165,0.15);">
      <div class="icon">💳</div><div class="title">Paiement Stripe</div>
      <div class="desc">Votre client paie en un clic</div>
    </div>
    <div class="feat-card" style="box-shadow:0 0 25px rgba(245,158,11,0.15);">
      <div class="icon">📄</div><div class="title">PDF professionnel</div>
      <div class="desc">Conforme, avec signature eIDAS</div>
    </div>
    <div class="feat-card" style="box-shadow:0 0 25px rgba(239,68,68,0.12);">
      <div class="icon">🔔</div><div class="title">Relances auto</div>
      <div class="desc">J+2, J+5, J+7 sans action de votre part</div>
    </div>
    <div class="feat-card" style="box-shadow:0 0 25px rgba(139,92,246,0.15);">
      <div class="icon">📊</div><div class="title">Tableau de bord</div>
      <div class="desc">CA, conversion, pipeline en un coup d'œil</div>
    </div>
  </div>
  <div style="margin-top:28px;text-align:center;">
    <span class="pill" style="background:rgba(255,255,255,0.05);color:#64748b;border:1px solid rgba(255,255,255,0.1);font-size:13px;">
      Essai gratuit · Sans CB · Résiliable à tout moment
    </span>
  </div>
</div>
<div class="bottom-bar">
  <span class="logo-text">Devizly</span>
  <span class="url">devizly.fr</span>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════ */

const posts = [
  { name: "post-01", html: post01Html },
  { name: "post-02", html: post02Html },
  { name: "post-03", html: post03Html },
  { name: "post-04", html: post04Html },
];

(async () => {
  const browser = await chromium.launch();

  for (const post of posts) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1080 });
    await page.setContent(post.html, { waitUntil: "networkidle" });
    // Wait for font load
    await page.waitForTimeout(500);
    const outPath = path.join("public", "linkedin-posts", `${post.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    await page.close();
    console.log(`✓ ${post.name}.png`);
  }

  await browser.close();
  console.log(`\nDone! 4 visuals saved to public/linkedin-posts/`);
})();
