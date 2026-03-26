---
name: linear-design-system
description: Design system Linear.app pour le redesign Devizly. Utilise quand tu modifies la landing page ou des composants UI.
metadata:
  tags: design, ui, linear, landing, devizly
---

## Style Linear.app — règles non négociables

### Typographie
- font-feature-settings: "ss01", "cv01", "cv02"
- H1 : letter-spacing -0.03em, font-weight 700
- Muted text : #8b8fa8 (jamais gray-500)
- Pas de gradient text sauf exception unique

### Couleurs exactes Linear
- bg principal : #08090a
- surface : #0f0f10
- border : rgba(255,255,255,0.06)
- accent : #5e6ad2
- text : #e8e9f0
- muted : #8b8fa8

### Layout
- Titres de section alignés GAUCHE — jamais centré
- Labels section : 11px uppercase tracking-widest
- Sections séparées par border-top subtle
- Hero : layout 2 colonnes (texte | mockup)

### Ce qu'on SUPPRIME
- Gradient blobs
- Glow/shadow effects colorés
- Badges pills centrés au-dessus des sections
- Animations d'entrée (fadeIn, slideUp, stagger)
- Cards grille 2x3 toutes identiques
- Checkmarks verts dans les features
- Fond qui change entre chaque section

### Ce qu'on GARDE
- Hover transitions 200ms opacity
- FAQ accordion smooth
- Contenu textuel intact
- Mockup produit dashboard
