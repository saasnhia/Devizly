const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;
const W = 1400, H = 780;

const BASE = `
${FONT}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:${W}px; height:${H}px; overflow:hidden; font-family:'Inter',-apple-system,sans-serif; background:#F8F9FC; color:#0F172A; }
`;

/* ═══════════════════════════════════════════════════
   SLIDE 1 — Nouveau devis (AI generation form)
   Reproduces: the real /devis/nouveau page
   ═══════════════════════════════════════════════════ */
const slide1 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.layout { display:flex; height:100%; }
.sidebar { width:220px; border-right:1px solid #e2e8f0; background:#fff; display:flex; flex-direction:column; padding:0; }
.sidebar-logo { display:flex; align-items:center; gap:8px; padding:16px 20px; border-bottom:1px solid #e2e8f0; }
.sidebar-logo .icon { width:28px; height:28px; background:#6366F1; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.sidebar-logo .icon svg { width:16px; height:16px; fill:#fff; }
.sidebar-logo span { font-size:18px; font-weight:800; color:#0F172A; }
.nav { padding:12px 12px; flex:1; }
.nav-section { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#94A3B8; padding:16px 12px 4px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:0 8px 8px 0; font-size:13px; font-weight:500; color:#64748b; margin:1px 0; border-left:3px solid transparent; }
.nav-item.active { background:#F3F0FF; color:#5B5BD6; border-left-color:#5B5BD6; font-weight:600; }
.nav-item .dot { width:15px; height:15px; display:flex; align-items:center; justify-content:center; font-size:13px; }
.main { flex:1; padding:28px 32px; overflow:hidden; }
.main h1 { font-size:22px; font-weight:700; margin-bottom:20px; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
.card-header { padding:16px 20px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:8px; }
.card-header .title { font-size:14px; font-weight:700; }
.card-body { padding:16px 20px; }
.input { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; color:#0F172A; background:#fff; }
.textarea { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; font-size:12px; color:#64748b; background:#fff; min-height:60px; resize:none; line-height:1.5; }
.label { font-size:12px; font-weight:500; color:#374151; margin-bottom:6px; display:block; }
.btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid #e2e8f0; background:#fff; color:#374151; cursor:pointer; }
.btn-primary { background:#6366F1; color:#fff; border-color:#6366F1; }
.btn-outline { background:#fff; }
.spark { color:#F59E0B; }
.badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; }
.badge-line { background:#f1f5f9; color:#64748b; }
.line-item { border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; margin-bottom:10px; }
.line-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.line-input { width:100%; padding:8px 12px; border:1px solid #e2e8f0; border-radius:6px; font-size:12px; margin-bottom:6px; }
.line-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.line-grid .sm-label { font-size:10px; color:#94a3b8; margin-bottom:2px; }
.line-grid input { width:100%; padding:6px 10px; border:1px solid #e2e8f0; border-radius:6px; font-size:12px; }
.totals { margin-top:12px; font-size:13px; }
.totals .row { display:flex; justify-content:space-between; padding:4px 0; }
.totals .row.bold { font-weight:800; font-size:16px; border-top:1px solid #e2e8f0; padding-top:8px; margin-top:4px; }
.ai-glow { border:1.5px solid #6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
.green-check { color:#16a34a; font-weight:600; font-size:12px; display:flex; align-items:center; gap:4px; }
.user-bottom { padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; }
.avatar { width:32px; height:32px; border-radius:50%; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#6366F1; }
.user-name { font-size:12px; font-weight:600; } .user-email { font-size:10px; color:#94a3b8; }
</style></head><body>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M12 11l-2 4h4l-2 4" fill="none" stroke="#fff" stroke-width="1.5"/></svg></div>
      <span>Devizly</span>
    </div>
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
    <div class="user-bottom">
      <div class="avatar">DZ</div>
      <div><div class="user-name">Devizly Demo</div><div class="user-email">demo@devizly.fr</div></div>
    </div>
  </div>
  <div class="main">
    <h1>Nouveau devis</h1>
    <div class="grid">
      <div>
        <!-- AI Card -->
        <div class="card ai-glow" style="margin-bottom:16px;">
          <div class="card-header"><span class="spark">⚡</span><span class="title">Générer avec l'IA</span></div>
          <div class="card-body">
            <div class="textarea" style="color:#0F172A;">Rénovation complète d'une cuisine professionnelle pour un restaurant gastronomique à Bordeaux. Plan de travail inox 6m, hotte extraction, installation gaz, sol antidérapant, éclairage LED.</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
              <span class="green-check">✓ Devis généré en 8 secondes</span>
              <button class="btn btn-outline"><span class="spark">⚡</span> Générer avec l'IA</button>
            </div>
          </div>
        </div>
        <!-- Details -->
        <div class="card">
          <div class="card-header"><span class="title">Détails du devis</span></div>
          <div class="card-body">
            <label class="label">Titre du devis</label>
            <input class="input" value="Renovation cuisine professionnelle" style="margin-bottom:12px;" />
            <label class="label">Client</label>
            <div class="input" style="display:flex;align-items:center;gap:8px;margin-bottom:12px;color:#6366F1;">
              <span>👥</span> <span style="font-weight:600;color:#0F172A;">Restaurant Le Gourmet</span> <span style="color:#94a3b8;font-size:11px;">Bordeaux</span>
            </div>
            <label class="label">Valide jusqu'au</label>
            <input class="input" value="2026-05-01" type="text" />
          </div>
        </div>
      </div>
      <div>
        <!-- Lines -->
        <div class="card">
          <div class="card-header" style="justify-content:space-between;">
            <span class="title">Lignes du devis</span>
            <span style="font-size:11px;color:#6366F1;font-weight:600;">Depuis un template</span>
          </div>
          <div class="card-body">
            <div class="line-item">
              <div class="line-header"><span class="badge badge-line">Ligne 1</span></div>
              <input class="line-input" value="Plan de travail inox professionnel (6m linéaire)" />
              <div class="line-grid"><div><div class="sm-label">Quantité</div><input value="1" /></div><div><div class="sm-label">Prix unitaire</div><input value="4800" /></div><div><div class="sm-label">Total</div><input value="4 800,00 €" style="background:#f8fafc;" disabled /></div></div>
            </div>
            <div class="line-item">
              <div class="line-header"><span class="badge badge-line">Ligne 2</span></div>
              <input class="line-input" value="Hotte extraction industrielle" />
              <div class="line-grid"><div><div class="sm-label">Quantité</div><input value="1" /></div><div><div class="sm-label">Prix unitaire</div><input value="5200" /></div><div><div class="sm-label">Total</div><input value="5 200,00 €" style="background:#f8fafc;" disabled /></div></div>
            </div>
            <div class="line-item">
              <div class="line-header"><span class="badge badge-line">Ligne 3</span></div>
              <input class="line-input" value="Installation gaz + raccordements" />
              <div class="line-grid"><div><div class="sm-label">Quantité</div><input value="1" /></div><div><div class="sm-label">Prix unitaire</div><input value="3600" /></div><div><div class="sm-label">Total</div><input value="3 600,00 €" style="background:#f8fafc;" disabled /></div></div>
            </div>
            <div class="totals">
              <div class="row"><span style="color:#64748b;">Total HT</span><span>25 600,00 €</span></div>
              <div class="row"><span style="color:#64748b;">TVA (20%)</span><span>5 120,00 €</span></div>
              <div class="row bold"><span>Total TTC</span><span>30 720,00 €</span></div>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;">
              <button class="btn btn-outline" style="flex:1;">📝 Brouillon</button>
              <button class="btn btn-primary" style="flex:1;">📤 Envoyer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════
   SLIDE 2 — Devis list + "Partager le devis" modal
   Reproduces: the real /devis page with share modal overlay
   ═══════════════════════════════════════════════════ */
const slide2 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.layout { display:flex; height:100%; }
.sidebar { width:220px; border-right:1px solid #e2e8f0; background:#fff; display:flex; flex-direction:column; }
.sidebar-logo { display:flex; align-items:center; gap:8px; padding:16px 20px; border-bottom:1px solid #e2e8f0; }
.sidebar-logo .icon { width:28px; height:28px; background:#6366F1; border-radius:8px; }
.sidebar-logo span { font-size:18px; font-weight:800; }
.nav { padding:12px 12px; flex:1; }
.nav-section { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#94A3B8; padding:16px 12px 4px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:0 8px 8px 0; font-size:13px; font-weight:500; color:#64748b; margin:1px 0; border-left:3px solid transparent; }
.nav-item.active { background:#F3F0FF; color:#5B5BD6; border-left-color:#5B5BD6; font-weight:600; }
.nav-item .dot { width:15px; }
.user-bottom { padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; }
.avatar { width:32px; height:32px; border-radius:50%; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#6366F1; }
.user-name { font-size:12px; font-weight:600; } .user-email { font-size:10px; color:#94a3b8; }
.main { flex:1; padding:24px 28px; position:relative; }
.main h1 { font-size:22px; font-weight:700; margin-bottom:16px; }
.devis-table { width:100%; border-collapse:collapse; }
.devis-table th { text-align:left; font-size:11px; font-weight:600; color:#64748b; padding:10px 12px; border-bottom:1px solid #e2e8f0; }
.devis-table td { padding:12px; font-size:13px; border-bottom:1px solid #f1f5f9; }
.devis-table tr:hover { background:#f8fafc; }
.badge { display:inline-flex; padding:3px 10px; border-radius:6px; font-size:10px; font-weight:600; }
.badge-sent { background:#dbeafe; color:#2563eb; }
.badge-signed { background:#dcfce7; color:#16a34a; }
.badge-draft { background:#f1f5f9; color:#64748b; }
.badge-paid { background:#f3e8ff; color:#7c3aed; }
/* Modal overlay */
.overlay { position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:100; backdrop-filter:blur(2px); }
.modal { background:#fff; border-radius:16px; padding:32px; width:460px; box-shadow:0 20px 60px rgba(0,0,0,0.2); position:relative; }
.modal-title { font-size:18px; font-weight:700; margin-bottom:20px; }
.modal-close { position:absolute; top:16px; right:16px; width:28px; height:28px; border-radius:50%; border:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; color:#64748b; cursor:pointer; }
.link-box { display:flex; align-items:center; gap:8px; padding:12px 16px; border:2px solid #6366F1; border-radius:10px; background:#f8f7ff; margin-bottom:20px; }
.link-box input { flex:1; border:none; background:transparent; font-size:13px; color:#6366F1; font-weight:500; outline:none; font-family:monospace; }
.link-box .copy-btn { width:32px; height:32px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; }
.share-btns { display:flex; gap:12px; }
.share-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#fff; cursor:pointer; transition:border-color 0.15s; }
.share-btn:hover { border-color:#6366F1; }
.share-btn .icon-circle { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; }
.share-btn .label { font-size:12px; font-weight:600; color:#374151; }
.share-hint { text-align:center; margin-top:16px; font-size:12px; color:#94a3b8; }
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
    <h1>Devis</h1>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <table class="devis-table">
        <thead><tr><th>Numéro</th><th>Titre</th><th>Client</th><th style="text-align:right;">Montant TTC</th><th>Statut</th><th>Date</th></tr></thead>
        <tbody>
          <tr><td style="font-family:monospace;font-size:12px;">DEV-0009</td><td style="font-weight:600;">Renovation cuisine pro</td><td>Restaurant Le Gourmet</td><td style="text-align:right;font-weight:600;">30 720,00 €</td><td><span class="badge badge-sent">Envoyé</span></td><td style="color:#64748b;">07/03/2026</td></tr>
          <tr><td style="font-family:monospace;font-size:12px;">DEV-0008</td><td style="font-weight:600;">Aménagement bureau cabinet</td><td>Sophie Laurent</td><td style="text-align:right;font-weight:600;">14 592,00 €</td><td><span class="badge badge-signed">Signé</span></td><td style="color:#64748b;">05/03/2026</td></tr>
          <tr style="opacity:0.6;"><td style="font-family:monospace;font-size:12px;">DEV-0007</td><td style="font-weight:600;">Site e-commerce Shopify</td><td>Martin Dupont</td><td style="text-align:right;font-weight:600;">9 350,00 €</td><td><span class="badge badge-sent">Envoyé</span></td><td style="color:#64748b;">03/03/2026</td></tr>
          <tr style="opacity:0.6;"><td style="font-family:monospace;font-size:12px;">DEV-0006</td><td style="font-weight:600;">Landing page SaaS</td><td>Emma Moreau</td><td style="text-align:right;font-weight:600;">2 400,00 €</td><td><span class="badge badge-paid">Payé</span></td><td style="color:#64748b;">28/02/2026</td></tr>
          <tr style="opacity:0.5;"><td style="font-family:monospace;font-size:12px;">DEV-0005</td><td style="font-weight:600;">Dashboard analytics</td><td>Tech Solutions SAS</td><td style="text-align:right;font-weight:600;">5 800,00 €</td><td><span class="badge badge-signed">Signé</span></td><td style="color:#64748b;">25/02/2026</td></tr>
        </tbody>
      </table>
    </div>
    <!-- Share modal overlay -->
    <div class="overlay">
      <div class="modal">
        <div class="modal-title">Partager le devis</div>
        <div class="modal-close">✕</div>
        <div class="link-box">
          <input value="https://devizly.fr/devis/a3f8c2e1-9d7b-4e5f..." readonly />
          <div class="copy-btn">📋</div>
        </div>
        <div class="share-btns">
          <div class="share-btn">
            <div class="icon-circle" style="background:#dcfce7;color:#16a34a;">💬</div>
            <span class="label">WhatsApp</span>
          </div>
          <div class="share-btn" style="border-color:#6366F1;background:#f8f7ff;">
            <div class="icon-circle" style="background:#dbeafe;color:#2563eb;">✉️</div>
            <span class="label">Email</span>
          </div>
          <div class="share-btn">
            <div class="icon-circle" style="background:#fef3c7;color:#d97706;">💬</div>
            <span class="label">SMS</span>
          </div>
        </div>
        <div class="share-hint">Le client pourra consulter, accepter ou refuser le devis en ligne.</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

/* ═══════════════════════════════════════════════════
   SLIDE 3 — Pipeline Kanban
   Reproduces: the real /dashboard/pipeline page
   ═══════════════════════════════════════════════════ */
const slide3 = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}
.layout { display:flex; height:100%; }
.sidebar { width:220px; border-right:1px solid #e2e8f0; background:#fff; display:flex; flex-direction:column; }
.sidebar-logo { display:flex; align-items:center; gap:8px; padding:16px 20px; border-bottom:1px solid #e2e8f0; }
.sidebar-logo .icon { width:28px; height:28px; background:#6366F1; border-radius:8px; }
.sidebar-logo span { font-size:18px; font-weight:800; }
.nav { padding:12px 12px; flex:1; }
.nav-section { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#94A3B8; padding:16px 12px 4px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:0 8px 8px 0; font-size:13px; font-weight:500; color:#64748b; margin:1px 0; border-left:3px solid transparent; }
.nav-item.active { background:#F3F0FF; color:#5B5BD6; border-left-color:#5B5BD6; font-weight:600; }
.nav-item .dot { width:15px; }
.user-bottom { padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; }
.avatar { width:32px; height:32px; border-radius:50%; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#6366F1; }
.user-name { font-size:12px; font-weight:600; } .user-email { font-size:10px; color:#94a3b8; }
.main { flex:1; padding:24px 28px; background:#f8f9fc; }
.main h1 { font-size:22px; font-weight:700; margin-bottom:4px; }
.main .sub { font-size:13px; color:#64748b; margin-bottom:20px; }
.pipeline { display:flex; gap:16px; height:calc(100% - 70px); }
.col { flex:1; display:flex; flex-direction:column; gap:10px; min-width:0; }
.col-head { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.col-dot { width:10px; height:10px; border-radius:50%; }
.col-name { font-size:13px; font-weight:700; }
.col-count { font-size:11px; color:#94a3b8; }
.col-total { font-size:11px; color:#64748b; margin-left:auto; font-weight:600; }
.deal { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; }
.deal-name { font-size:13px; font-weight:600; margin-bottom:2px; }
.deal-desc { font-size:11px; color:#94a3b8; margin-bottom:8px; }
.deal-amount { font-size:15px; font-weight:800; }
.deal-footer { display:flex; align-items:center; gap:8px; margin-top:8px; }
.deal-date { font-size:10px; color:#94a3b8; }
.deal-badge { font-size:10px; padding:2px 8px; border-radius:4px; font-weight:600; }
.badge-new { background:#dbeafe; color:#2563eb; }
.badge-hot { background:#fef3c7; color:#d97706; }
.badge-signed { background:#dcfce7; color:#16a34a; }
.btn-relance { font-size:10px; padding:3px 10px; border-radius:6px; background:#6366F1; color:#fff; font-weight:600; border:none; }
.amt-prospect { color:#f59e0b; } .amt-sent { color:#3b82f6; } .amt-signed { color:#16a34a; } .amt-paid { color:#8b5cf6; }
</style></head><body>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-logo"><div class="icon"></div><span>Devizly</span></div>
    <div class="nav">
      <div class="nav-item"><span class="dot">📊</span> Dashboard</div>
      <div class="nav-item"><span class="dot">⚡</span> Briefing IA</div>
      <div class="nav-section">COMMERCIAL</div>
      <div class="nav-item"><span class="dot">📄</span> Devis</div>
      <div class="nav-item"><span class="dot">📋</span> Templates</div>
      <div class="nav-item active"><span class="dot">🔄</span> Pipeline</div>
      <div class="nav-section">FINANCES</div>
      <div class="nav-item"><span class="dot">🧾</span> Factures</div>
      <div class="nav-section">CLIENTS</div>
      <div class="nav-item"><span class="dot">👥</span> Clients</div>
    </div>
    <div class="user-bottom"><div class="avatar">DZ</div><div><div class="user-name">Devizly Demo</div><div class="user-email">demo@devizly.fr</div></div></div>
  </div>
  <div class="main">
    <h1>Pipeline</h1>
    <div class="sub">Gérez vos prospects et devis par étape.</div>
    <div class="pipeline">
      <!-- Prospect -->
      <div class="col">
        <div class="col-head"><div class="col-dot" style="background:#f59e0b;"></div><span class="col-name">Prospect</span><span class="col-count">2</span><span class="col-total">5 400 €</span></div>
        <div class="deal"><div class="deal-name">Marie Petit - Coiffeuse</div><div class="deal-desc">Aménagement salon de coiffure</div><div class="deal-amount amt-prospect">8 160,00 €</div><div class="deal-footer"><span class="deal-date">Mar. 07</span><span class="deal-badge badge-hot">🔥 Hot</span></div></div>
        <div class="deal"><div class="deal-name">Restaurant Le Gourmet</div><div class="deal-desc">Rénovation cuisine professionnelle</div><div class="deal-amount amt-prospect">30 720,00 €</div><div class="deal-footer"><span class="deal-date">Mar. 07</span><button class="btn-relance">📧 Relancer</button></div></div>
      </div>
      <!-- Envoyé -->
      <div class="col">
        <div class="col-head"><div class="col-dot" style="background:#3b82f6;"></div><span class="col-name">Envoyé</span><span class="col-count">2</span><span class="col-total">3 950 €</span></div>
        <div class="deal"><div class="deal-name">Martin Dupont</div><div class="deal-desc">Site e-commerce Shopify</div><div class="deal-amount amt-sent">9 350,00 €</div><div class="deal-footer"><span class="deal-date">Mar. 05</span><span class="deal-badge badge-new">Nouveau</span></div></div>
        <div class="deal"><div class="deal-name">Sophie Laurent - Architecte</div><div class="deal-desc">Aménagement bureau cabinet</div><div class="deal-amount amt-sent">14 592,00 €</div><div class="deal-footer"><span class="deal-date">Mar. 03</span><button class="btn-relance">📧 Relancer</button></div></div>
      </div>
      <!-- Signé -->
      <div class="col">
        <div class="col-head"><div class="col-dot" style="background:#16a34a;"></div><span class="col-name">Signé</span><span class="col-count">1</span></div>
        <div class="deal" style="border-color:#bbf7d0;"><div class="deal-name">Tech Solutions SAS</div><div class="deal-desc">Dashboard analytics complet</div><div class="deal-amount amt-signed">5 800,00 €</div><div class="deal-footer"><span class="deal-date">Mar. 02</span><span class="deal-badge badge-signed">✓ Signé</span></div></div>
      </div>
      <!-- Payé -->
      <div class="col">
        <div class="col-head"><div class="col-dot" style="background:#8b5cf6;"></div><span class="col-name">Payé</span><span class="col-count">1</span><span class="col-total" style="color:#8b5cf6;">Encaissé</span></div>
        <div class="deal" style="border-color:#ddd6fe;"><div class="deal-name">Emma Moreau</div><div class="deal-desc">Landing page SaaS</div><div class="deal-amount amt-paid">2 400,00 €</div><div class="deal-footer"><span class="deal-date">Fév. 28</span><span class="deal-badge" style="background:#f3e8ff;color:#7c3aed;">💰 Payé</span></div></div>
      </div>
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
    const pngBuf = await page.screenshot({ fullPage: false });
    await page.close();
    const outPath = path.join("public", "landing-screens", `${s.name}.webp`);
    await sharp(pngBuf).webp({ quality: 92 }).toFile(outPath);
    console.log("✓", s.name + ".webp", (fs.statSync(outPath).size / 1024).toFixed(0) + "KB");
  }
  await browser.close();
  console.log("\nDone! 3 screens in public/landing-screens/");
})();
