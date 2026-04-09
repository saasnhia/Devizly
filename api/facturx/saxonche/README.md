# saxonche stub

Ce n'est PAS une dépendance installée via pip. C'est un stub vide
local qui shadow la vraie lib saxonche pour les imports statiques
de factur-x Akretion v4.2.

Voir `api/facturx/saxonche/__init__.py` pour le contexte complet.

NE PAS SUPPRIMER ce dossier — sans lui, facturx.py crash au top-level
import sur Vercel (où saxonche n'est volontairement pas installée pour
rester sous la limite 250 MB du bundle serverless).
