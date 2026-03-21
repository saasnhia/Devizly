const { chromium } = require("playwright");
const path = require("path");

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;
const W = 1400, H = 780;

const BASE = `
${FONT}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:${W}px; height:${H}px; overflow:hidden; font-family:'Inter',sans-serif;
  background:#0c1022; color:#fff; position:relative; }
body::before { content:''; position:absolute; inset:0;
  background-image:radial-gradient(circle,#1a2040 1px,transparent 1px);
  background-size:28px 28px; opacity:0.35; }
.wrap { position:relative; z-index:1; width:100%; height:100%; padding:40px; display:flex; flex-direction:column; }
.orb { position:absolute; border-radius:50%; filter:blur(80px); z-index:0; }
.card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
  border-radius:16px; backdrop-filter:blur(12px); }
.card-glow-v { box-shadow:0 0 40px rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.3); }
.card-glow-g { box-shadow:0 0 40px rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.3); }
.card-glow-b { box-shadow:0 0 40px rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.3); }
.btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:10px;
  font-size:13px; font-weight:600; border:none; cursor:pointer; }
.btn-v { background:#5B5BD6; color:#fff; }
.btn-g { background:#16a34a; color:#fff; }
.lbl { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#64748b; }
`;

/* ═══ SLIDE 1 — AI Builder ═══ */
const slide1 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.input-box { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12);
  border-radius:12px; padding:16px 20px; font-size:15px; color:#94a3b8; width:100%;
  display:flex; align-items:center; gap:12px; }
.input-box .cursor { display:inline-block; width:2px; height:18px; background:#5B5BD6;
  animation:blink 1s infinite; }
@keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
.items-table { margin-top:24px; }
.row { display:flex; align-items:center; padding:14px 20px; border-radius:10px; }
.row:nth-child(odd) { background:rgba(255,255,255,0.03); }
.row .desc { flex:1; font-size:14px; color:#cbd5e1; }
.row .qty { width:50px; text-align:center; font-size:13px; color:#64748b; }
.row .price { width:100px; text-align:right; font-size:14px; font-weight:700; color:#fff; }
.total-bar { display:flex; justify-content:flex-end; align-items:center; gap:16px;
  margin-top:16px; padding:16px 20px; border-top:1px solid rgba(255,255,255,0.08); }
.total-label { font-size:14px; color:#64748b; }
.total-value { font-size:24px; font-weight:800; color:#fff; }
.check { display:inline-flex; align-items:center; justify-content:center;
  width:24px; height:24px; border-radius:50%; background:#16a34a; font-size:13px; }
</style></head><body>
<div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(91,91,214,0.25),transparent 70%);top:-100px;left:200px;"></div>
<div class="wrap">
  <div class="lbl" style="margin-bottom:16px;">Génération IA</div>
  <div class="card card-glow-v" style="padding:32px;flex:1;display:flex;flex-direction:column;">
    <div class="input-box">
      <span style="font-size:18px;">⚡</span>
      <span>Site vitrine 5 pages pour un restaurant à Lyon</span>
      <span class="cursor"></span>
    </div>
    <div class="items-table" style="flex:1;">
      <div style="display:flex;padding:8px 20px;margin-bottom:4px;">
        <span class="lbl" style="flex:1;letter-spacing:1px;">Description</span>
        <span class="lbl" style="width:50px;text-align:center;">Qté</span>
        <span class="lbl" style="width:100px;text-align:right;">Montant</span>
      </div>
      <div class="row"><span class="desc">Design UX/UI (maquettes + charte graphique)</span><span class="qty">1</span><span class="price">1 200 €</span></div>
      <div class="row"><span class="desc">Développement Next.js + CMS</span><span class="qty">1</span><span class="price">2 800 €</span></div>
      <div class="row"><span class="desc">Rédaction contenu + SEO (5 pages)</span><span class="qty">5</span><span class="price">600 €</span></div>
      <div class="row"><span class="desc">Hébergement Vercel + nom de domaine (1 an)</span><span class="qty">1</span><span class="price">350 €</span></div>
      <div class="row"><span class="desc">Formation + support post-livraison</span><span class="qty">1</span><span class="price">250 €</span></div>
    </div>
    <div class="total-bar">
      <div style="display:flex;align-items:center;gap:8px;margin-right:auto;">
        <span class="check">✓</span>
        <span style="font-size:13px;color:#16a34a;font-weight:600;">Devis généré en 8 secondes</span>
      </div>
      <span class="total-label">Total HT</span>
      <span class="total-value">5 200 €</span>
    </div>
  </div>
</div>
</body></html>`;

/* ═══ SLIDE 2 — Signature mobile ═══ */
const slide2 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.phone { width:340px; height:620px; border-radius:40px; border:3px solid rgba(255,255,255,0.15);
  background:#0f1428; overflow:hidden; position:relative; margin:0 auto; }
.phone-notch { width:120px; height:28px; background:#000; border-radius:0 0 16px 16px;
  position:absolute; top:0; left:50%; transform:translateX(-50%); z-index:5; }
.phone-screen { padding:44px 20px 20px; height:100%; display:flex; flex-direction:column; }
.pdf-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.pdf-title { font-size:16px; font-weight:700; }
.pdf-ref { font-size:11px; color:#64748b; }
.pdf-line { display:flex; justify-content:space-between; padding:8px 0;
  border-bottom:1px solid rgba(255,255,255,0.06); font-size:12px; }
.pdf-line .n { color:#94a3b8; } .pdf-line .v { font-weight:600; }
.sig-box { margin-top:auto; }
.sig-done { display:flex; align-items:center; gap:8px; padding:12px 16px;
  background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3);
  border-radius:12px; margin-bottom:12px; }
.sig-img { font-style:italic; color:#22c55e; font-size:18px; font-weight:700; }
.info-panel { position:absolute; right:40px; top:50%; transform:translateY(-50%);
  width:380px; display:flex; flex-direction:column; gap:16px; }
.info-card { padding:20px 24px; }
.info-title { font-size:15px; font-weight:700; margin-bottom:4px; }
.info-desc { font-size:12px; color:#94a3b8; line-height:1.5; }
</style></head><body>
<div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(34,197,94,0.2),transparent 70%);top:100px;left:100px;"></div>
<div class="orb" style="width:300px;height:300px;background:radial-gradient(circle,rgba(91,91,214,0.15),transparent 70%);bottom:50px;right:200px;"></div>
<div class="wrap" style="flex-direction:row;align-items:center;gap:48px;">
  <div style="flex:0 0 auto;">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="pdf-header">
          <div><div class="pdf-title">DEV-0024</div><div class="pdf-ref">Salon de coiffure — Marie Petit</div></div>
          <div style="font-size:10px;padding:4px 10px;background:rgba(59,130,246,0.2);color:#60a5fa;border-radius:6px;font-weight:600;">ENVOYÉ</div>
        </div>
        <div class="pdf-line"><span class="n">Postes de coiffage (×3)</span><span class="v">2 850 €</span></div>
        <div class="pdf-line"><span class="n">Bac à shampoing (×2)</span><span class="v">1 560 €</span></div>
        <div class="pdf-line"><span class="n">Comptoir accueil</span><span class="v">1 200 €</span></div>
        <div class="pdf-line"><span class="n">Éclairage LED</span><span class="v">890 €</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid rgba(255,255,255,0.1);margin-top:8px;">
          <span style="font-weight:800;font-size:14px;">Total TTC</span>
          <span style="font-weight:800;font-size:16px;">8 160 €</span>
        </div>
        <div class="sig-box">
          <div class="sig-done">
            <span style="font-size:16px;">✓</span>
            <div><div style="font-size:12px;font-weight:600;color:#22c55e;">Signé électroniquement</div>
            <div style="font-size:10px;color:#4ade80;">Marie Petit · 07/03/2026</div></div>
          </div>
          <button class="btn btn-g" style="width:100%;justify-content:center;padding:12px;font-size:14px;border-radius:12px;">
            💳 Payer acompte 30% — 2 448 €
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="info-panel" style="position:static;transform:none;">
    <div class="card info-card card-glow-g">
      <div class="info-title">✓ Signature eIDAS</div>
      <div class="info-desc">Certificat SHA-256, horodatage, IP enregistrée. Valeur juridique en France et en Europe.</div>
    </div>
    <div class="card info-card card-glow-b">
      <div class="info-title">💳 Paiement Stripe intégré</div>
      <div class="info-desc">Votre client paie l'acompte ou le total en un clic. Les fonds arrivent sur votre compte sous 48h.</div>
    </div>
    <div class="card info-card" style="border-color:rgba(245,158,11,0.3);box-shadow:0 0 30px rgba(245,158,11,0.1);">
      <div class="info-title">🔔 Relances automatiques</div>
      <div class="info-desc">J+2, J+5, J+7 — vos clients reçoivent un rappel sans action de votre part.</div>
    </div>
  </div>
</div>
</body></html>`;

/* ═══ SLIDE 3 — Pipeline Kanban ═══ */
const slide3 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.pipeline { display:flex; gap:16px; flex:1; }
.col { flex:1; display:flex; flex-direction:column; gap:10px; }
.col-header { display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px; border-radius:10px; background:rgba(255,255,255,0.04); margin-bottom:4px; }
.col-title { font-size:13px; font-weight:700; }
.col-count { font-size:11px; font-weight:600; padding:2px 8px; border-radius:6px;
  background:rgba(255,255,255,0.08); color:#94a3b8; }
.deal { padding:14px 16px; border-radius:12px; background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08); }
.deal-name { font-size:13px; font-weight:600; margin-bottom:2px; }
.deal-info { font-size:11px; color:#64748b; }
.deal-amount { font-size:14px; font-weight:800; margin-top:6px; }
.deal-drag { border:2px dashed rgba(34,197,94,0.5); background:rgba(34,197,94,0.05); }
.kpi-bar { display:flex; gap:20px; margin-bottom:24px; }
.kpi { padding:16px 24px; border-radius:14px; flex:1; }
.kpi-label { font-size:11px; color:#64748b; font-weight:500; }
.kpi-value { font-size:28px; font-weight:800; margin-top:4px; }
.kpi-sub { font-size:11px; margin-top:2px; }
</style></head><body>
<div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(59,130,246,0.2),transparent 70%);top:-100px;right:100px;"></div>
<div class="wrap">
  <div class="kpi-bar">
    <div class="card kpi card-glow-v">
      <div class="kpi-label">CA ce mois</div>
      <div class="kpi-value" style="color:#22c55e;">12 480 €</div>
      <div class="kpi-sub" style="color:#4ade80;">+23% vs mois dernier</div>
    </div>
    <div class="card kpi card-glow-b">
      <div class="kpi-label">Devis envoyés</div>
      <div class="kpi-value">7</div>
      <div class="kpi-sub" style="color:#64748b;">3 en attente de réponse</div>
    </div>
    <div class="card kpi card-glow-g">
      <div class="kpi-label">Taux de conversion</div>
      <div class="kpi-value" style="color:#22c55e;">72%</div>
      <div class="kpi-sub" style="color:#64748b;">Moy. secteur : 65%</div>
    </div>
    <div class="card kpi" style="border-color:rgba(245,158,11,0.3);box-shadow:0 0 30px rgba(245,158,11,0.1);">
      <div class="kpi-label">En attente</div>
      <div class="kpi-value">3 850 €</div>
      <div class="kpi-sub" style="color:#64748b;">2 devis</div>
    </div>
  </div>
  <div class="pipeline">
    <div class="col">
      <div class="col-header"><span class="col-title" style="color:#f59e0b;">Prospect</span><span class="col-count">2</span></div>
      <div class="deal"><div class="deal-name">Lucas Martin</div><div class="deal-info">E-commerce Shopify</div><div class="deal-amount" style="color:#f59e0b;">4 200 €</div></div>
      <div class="deal"><div class="deal-name">Sophie Durand</div><div class="deal-info">App mobile React Native</div><div class="deal-amount" style="color:#f59e0b;">6 500 €</div></div>
    </div>
    <div class="col">
      <div class="col-header"><span class="col-title" style="color:#3b82f6;">Envoyé</span><span class="col-count">1</span></div>
      <div class="deal"><div class="deal-name">Thomas Bernard</div><div class="deal-info">Refonte identité visuelle</div><div class="deal-amount" style="color:#3b82f6;">1 850 €</div></div>
    </div>
    <div class="col">
      <div class="col-header"><span class="col-title" style="color:#22c55e;">Signé</span><span class="col-count">3</span></div>
      <div class="deal deal-drag"><div class="deal-name">Marie Petit</div><div class="deal-info">Aménagement salon coiffure</div><div class="deal-amount" style="color:#22c55e;">8 160 €</div></div>
      <div class="deal"><div class="deal-name">Pierre Lefebvre</div><div class="deal-info">Site vitrine avocat</div><div class="deal-amount" style="color:#22c55e;">3 200 €</div></div>
      <div class="deal"><div class="deal-name">Camille Roux</div><div class="deal-info">Audit SEO + contenu</div><div class="deal-amount" style="color:#22c55e;">1 120 €</div></div>
    </div>
    <div class="col">
      <div class="col-header"><span class="col-title" style="color:#8b5cf6;">Payé</span><span class="col-count">€12.4k</span></div>
      <div class="deal"><div class="deal-name">Emma Moreau</div><div class="deal-info">Landing page SaaS</div><div class="deal-amount" style="color:#8b5cf6;">2 400 €</div></div>
      <div class="deal"><div class="deal-name">Jules Girard</div><div class="deal-info">Dashboard analytics</div><div class="deal-amount" style="color:#8b5cf6;">5 800 €</div></div>
    </div>
  </div>
</div>
</body></html>`;

const slides = [
  { name: "hero-ai-builder", html: slide1 },
  { name: "hero-signature", html: slide2 },
  { name: "hero-pipeline", html: slide3 },
];

(async () => {
  const browser = await chromium.launch();
  for (const s of slides) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: W, height: H });
    await page.setContent(s.html, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const out = path.join("public", "landing-screens", `${s.name}.webp`);
    await page.screenshot({ path: out, fullPage: false, type: "png" });
    await page.close();
    // Convert to webp via sharp
    const sharp = require("sharp");
    const pngPath = out;
    await sharp(pngPath).webp({ quality: 90 }).toFile(pngPath.replace(".webp", ".tmp.webp"));
    const fs = require("fs");
    fs.renameSync(pngPath.replace(".webp", ".tmp.webp"), pngPath);
    console.log("✓", s.name + ".webp");
  }
  await browser.close();
  console.log("\nDone! 3 hero screens in public/landing-screens/");
})();
