const { chromium } = require("playwright");
const sharp = require("sharp");
const path = require("path");

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;
const W = 1400, H = 780;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${FONT}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:${W}px; height:${H}px; overflow:hidden; font-family:'Inter',-apple-system,sans-serif; background:#F8F9FC; color:#0F172A; }
.layout { display:flex; height:100%; }
.sidebar { width:220px; border-right:1px solid #e2e8f0; background:#fff; display:flex; flex-direction:column; }
.sidebar-logo { display:flex; align-items:center; gap:8px; padding:16px 20px; border-bottom:1px solid #e2e8f0; }
.sidebar-logo .icon { width:28px; height:28px; background:#6366F1; border-radius:8px; }
.sidebar-logo span { font-size:18px; font-weight:800; }
.nav { padding:12px; flex:1; }
.nav-section { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#94A3B8; padding:16px 12px 4px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:0 8px 8px 0; font-size:13px; font-weight:500; color:#64748b; margin:1px 0; border-left:3px solid transparent; }
.nav-item.active { background:#F3F0FF; color:#5B5BD6; border-left-color:#5B5BD6; font-weight:600; }
.nav-item .dot { width:15px; }
.user-bottom { padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; }
.avatar { width:32px; height:32px; border-radius:50%; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#6366F1; }
.user-name { font-size:12px; font-weight:600; } .user-email { font-size:10px; color:#94a3b8; }

.main { flex:1; padding:24px 28px; display:flex; gap:24px; }
.left { flex:1; }
.left h1 { font-size:22px; font-weight:700; margin-bottom:4px; }
.left .sub { font-size:13px; color:#64748b; margin-bottom:16px; }

/* Devis table */
.table-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
table { width:100%; border-collapse:collapse; }
th { text-align:left; font-size:11px; font-weight:600; color:#64748b; padding:10px 14px; border-bottom:1px solid #e2e8f0; }
td { padding:12px 14px; font-size:13px; border-bottom:1px solid #f1f5f9; }
.mono { font-family:monospace; font-size:12px; color:#64748b; }
.bold { font-weight:600; }
.badge { display:inline-flex; padding:3px 10px; border-radius:6px; font-size:10px; font-weight:600; }
.badge-sent { background:#dbeafe; color:#2563eb; }
.badge-viewed { background:#fef3c7; color:#d97706; }
.relance-info { display:flex; align-items:center; gap:6px; }
.relance-dot { width:8px; height:8px; border-radius:50%; }
.relance-dot.done { background:#22c55e; }
.relance-dot.pending { background:#f59e0b; animation:pulse 1.5s infinite; }
.relance-dot.waiting { background:#e2e8f0; }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
.relance-text { font-size:10px; color:#64748b; }
.relance-text.active { color:#f59e0b; font-weight:600; }
.btn-relance { font-size:10px; padding:4px 12px; border-radius:6px; background:#6366F1; color:#fff; font-weight:600; border:none; cursor:pointer; }

/* Right panel: email preview */
.right { width:340px; display:flex; flex-direction:column; gap:16px; }
.timeline-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; }
.timeline-title { font-size:14px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
.timeline-title .icon { font-size:16px; }
.step { display:flex; gap:12px; margin-bottom:16px; position:relative; }
.step:last-child { margin-bottom:0; }
.step-line { position:absolute; left:15px; top:28px; bottom:-16px; width:2px; }
.step:last-child .step-line { display:none; }
.step-circle { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
.step-circle.done { background:#dcfce7; color:#16a34a; }
.step-circle.active { background:#fef3c7; color:#d97706; border:2px solid #f59e0b; }
.step-circle.waiting { background:#f1f5f9; color:#94a3b8; }
.step-content { flex:1; }
.step-label { font-size:13px; font-weight:600; }
.step-desc { font-size:11px; color:#64748b; margin-top:2px; }
.step-status { font-size:10px; margin-top:3px; font-weight:600; }
.step-status.sent { color:#16a34a; }
.step-status.sending { color:#f59e0b; }

.email-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; flex:1; }
.email-header { background:#6366F1; padding:12px 16px; }
.email-header span { color:#fff; font-size:14px; font-weight:700; }
.email-body { padding:16px; }
.email-subject { font-size:12px; font-weight:600; margin-bottom:8px; }
.email-from { font-size:10px; color:#94a3b8; margin-bottom:12px; }
.email-text { font-size:11px; color:#374151; line-height:1.6; margin-bottom:12px; }
.email-btn { display:block; text-align:center; background:#22c55e; color:#fff; padding:10px; border-radius:8px; font-size:12px; font-weight:600; text-decoration:none; }
.email-footer { font-size:9px; color:#94a3b8; text-align:center; margin-top:12px; }
</style></head><body>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-logo"><div class="icon"></div><span>Devizly</span></div>
    <div class="nav">
      <div class="nav-item"><span class="dot">📊</span> Dashboard</div>
      <div class="nav-item"><span class="dot">⚡</span> Briefing IA</div>
      <div class="nav-section">COMMERCIAL</div>
      <div class="nav-item active"><span class="dot">📄</span> Devis</div>
      <div class="nav-item"><span class="dot">📋</span> Templates</div>
      <div class="nav-item"><span class="dot">🔄</span> Pipeline</div>
      <div class="nav-section">FINANCES</div>
      <div class="nav-item"><span class="dot">🧾</span> Factures</div>
      <div class="nav-section">CLIENTS</div>
      <div class="nav-item"><span class="dot">👥</span> Clients</div>
    </div>
    <div class="user-bottom"><div class="avatar">DZ</div><div><div class="user-name">Devizly Demo</div><div class="user-email">demo@devizly.fr</div></div></div>
  </div>
  <div class="main">
    <div class="left">
      <h1>Relances automatiques</h1>
      <div class="sub">Vos devis en attente sont relancés automatiquement — J+2, J+5, J+7</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Devis</th><th>Client</th><th>Montant</th><th>Statut</th><th>Relances</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><span class="mono">DEV-0009</span><br><span class="bold" style="font-size:12px;">Renovation cuisine pro</span></td>
              <td>Restaurant Le Gourmet</td>
              <td class="bold">30 720 €</td>
              <td><span class="badge badge-viewed">👁 Vu</span></td>
              <td>
                <div class="relance-info"><span class="relance-dot done"></span><span class="relance-dot done"></span><span class="relance-dot pending"></span></div>
                <div class="relance-text active">⏳ J+5 dans 2h</div>
              </td>
              <td><button class="btn-relance">📧 Relancer</button></td>
            </tr>
            <tr>
              <td><span class="mono">DEV-0008</span><br><span class="bold" style="font-size:12px;">Bureau cabinet architecte</span></td>
              <td>Sophie Laurent</td>
              <td class="bold">14 592 €</td>
              <td><span class="badge badge-sent">Envoyé</span></td>
              <td>
                <div class="relance-info"><span class="relance-dot done"></span><span class="relance-dot waiting"></span><span class="relance-dot waiting"></span></div>
                <div class="relance-text">✓ J+2 envoyé</div>
              </td>
              <td><button class="btn-relance">📧 Relancer</button></td>
            </tr>
            <tr>
              <td><span class="mono">DEV-0007</span><br><span class="bold" style="font-size:12px;">Site e-commerce Shopify</span></td>
              <td>Martin Dupont</td>
              <td class="bold">9 350 €</td>
              <td><span class="badge badge-sent">Envoyé</span></td>
              <td>
                <div class="relance-info"><span class="relance-dot waiting"></span><span class="relance-dot waiting"></span><span class="relance-dot waiting"></span></div>
                <div class="relance-text">Envoyé il y a 1j</div>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right: Timeline + Email preview -->
    <div class="right">
      <div class="timeline-card">
        <div class="timeline-title"><span class="icon">🔔</span> Séquence de relance</div>
        <div class="step">
          <div class="step-circle done">✓</div>
          <div class="step-content">
            <div class="step-label">J+2 — Rappel de consultation</div>
            <div class="step-desc">Votre devis attend votre réponse</div>
            <div class="step-status sent">✓ Envoyé le 09/03</div>
          </div>
          <div class="step-line" style="background:#22c55e;"></div>
        </div>
        <div class="step">
          <div class="step-circle active">⏳</div>
          <div class="step-content">
            <div class="step-label">J+5 — Relance signature</div>
            <div class="step-desc">Signez en 10 secondes depuis votre mobile</div>
            <div class="step-status sending">⏳ Envoi dans 2h</div>
          </div>
          <div class="step-line" style="background:#e2e8f0;"></div>
        </div>
        <div class="step">
          <div class="step-circle waiting">3</div>
          <div class="step-content">
            <div class="step-label">J+7 — Proposition acompte</div>
            <div class="step-desc">Payez 30% d'acompte pour démarrer</div>
            <div class="step-status" style="color:#94a3b8;">Programmé</div>
          </div>
        </div>
      </div>

      <div class="email-card">
        <div class="email-header"><span>📧 Aperçu — Relance J+5</span></div>
        <div class="email-body">
          <div class="email-subject">Votre devis DEV-0009 attend votre signature</div>
          <div class="email-from">De : NBHC via Devizly · noreply@devizly.fr</div>
          <div class="email-text">
            Bonjour,<br><br>
            Nous n'avons pas encore reçu votre retour pour le devis
            <strong>Renovation cuisine pro</strong> d'un montant de <strong>30 720 €</strong>.<br><br>
            Vous pouvez le signer en 10 secondes depuis votre mobile.
          </div>
          <a class="email-btn" href="#">✍️ Consulter et signer le devis</a>
          <div class="email-footer">NBHC SAS — SIREN 102 637 899 — devizly.fr</div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const pngBuf = await page.screenshot({ fullPage: false });
  await page.close();
  await browser.close();
  const outPath = path.join("public", "landing-screens", "hero-relance.webp");
  await sharp(pngBuf).webp({ quality: 92 }).toFile(outPath);
  const fs = require("fs");
  console.log("✓ hero-relance.webp", (fs.statSync(outPath).size / 1024).toFixed(0) + "KB");
})();
