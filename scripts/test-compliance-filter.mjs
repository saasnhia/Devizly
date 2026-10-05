// Cas de test du filtre de conformité (src/lib/ai/compliance-filter.ts).
// Usage : node scripts/test-compliance-filter.mjs
import { stripClaimFromDescription, stripClaimSentences, COMPLIANCE_TERM } from "../src/lib/ai/compliance-filter.ts";

// [entrée, sortie attendue] — null = ligne retirée
const descriptions = [
  // Légitimes : ne doivent PAS être touchées
  ["Carrelage sol 6 m²", "Carrelage sol 6 m²"],
  ["Carrelage murs (12 m², format 20x30)", "Carrelage murs (12 m², format 20x30)"],
  ["Pose douche à l'italienne (sans bac)", "Pose douche à l'italienne (sans bac)"],
  ["Normalisation des données clients", "Normalisation des données clients"],
  ["Rédaction 8 articles blog (500 mots)", "Rédaction 8 articles blog (500 mots)"],
  ["Création étiquette produit", "Création étiquette produit"],
  ["Pose d'un tableau électrique 13 modules", "Pose d'un tableau électrique 13 modules"],
  ["Informatique : conférence et formation", "Informatique : conférence et formation"],
  ["Énorme chantier de démolition", "Énorme chantier de démolition"],
  ["Remplacement porte d'entrée", "Remplacement porte d'entrée"],
  ["Réseau plomberie (évacuation, arrivée eau)", "Réseau plomberie (évacuation, arrivée eau)"],
  ["Démolition et évacuation déchets", "Démolition et évacuation déchets"],
  // Affirmation dans une description plus longue : on retire l'affirmation, on garde la prestation
  ["Électricité salle de bain (NF C 15-100)", "Électricité salle de bain"],
  ["Électricité aux normes NF C 15-100", "Électricité"],
  ["Mise aux normes du tableau électrique", "Tableau électrique"],
  ["Pose carrelage - garantie 10 ans", "Pose carrelage"],
  ["Pose carrelage conforme DTU 52.2", "Pose carrelage"],
  ["Isolation combles RE 2020", "Isolation combles"],
  ["Isolation combles, conforme RT2012", "Isolation combles"],
  ["Pose fenêtres certifiées NF", "Pose fenêtres"],
  ["Plomberie complète, garantie décennale", "Plomberie complète"],
  ["Pose chaudière (installateur labellisé)", "Pose chaudière"],
  ["ÉLECTRICITÉ CONFORMITÉ NORMES", "ÉLECTRICITÉ"],
  ["electricite conformite normes (sans accents)", "Electricite (sans accents)"],
  ["Plomberie garantie decennale", "Plomberie"],
  ["Peinture façade CERTIFIEE", "Peinture façade"],
  // Qualifications professionnelles
  ["Pose pompe à chaleur (artisan RGE)", "Pose pompe à chaleur"],
  ["Isolation combles par entreprise RGE Reconnu Garant de l'Environnement", "Isolation combles"],
  ["Pose panneaux solaires, installateur QualiPV", "Pose panneaux solaires"],
  ["Installation chaudière Qualit'EnR", "Installation chaudière"],
  ["Électricien agréé Qualifelec", "Électricien"],
  ["Maçonnerie gros œuvre (Qualibat)", "Maçonnerie gros œuvre"],
  ["Ravalement façade entreprise agréée", "Ravalement façade"],
  ["Cadre de travail agréable et lumineux", "Cadre de travail agréable et lumineux"],
  ["Pose de forge décorative", "Pose de forge décorative"],
  ["Merge des fichiers sources", "Merge des fichiers sources"],
  // La description n'est QUE l'affirmation : ligne retirée
  ["Entreprise RGE", null],
  ["Artisans agréés", null],
  ["Garantie décennale", null],
  ["Conformité aux normes en vigueur", null],
  ["Certification NF", null],
  ["Respect des normes", null],
];

const notes = [
  [
    "Délai estimé : 3 semaines. Normes NF C 15-100 et RT 2012 respectées. Non inclus : peinture.",
    "Délai estimé : 3 semaines. Non inclus : peinture.",
  ],
  [
    "Prix HT. Travaux garantis 10 ans.\nDevis valable 30 jours.",
    "Prix HT. Devis valable 30 jours.",
  ],
  ["Délai prévisionnel : 10 jours ouvrés. Hypothèse : sol plat.", "Délai prévisionnel : 10 jours ouvrés. Hypothèse : sol plat."],
  ["Installation conforme.", ""],
  [
    "Délai : 2 semaines. Entreprise certifiée RGE, éligible MaPrimeRénov'. Devis valable 30 jours.",
    "Délai : 2 semaines. Devis valable 30 jours.",
  ],
];

let fail = 0;
const show = (v) => (v === null ? "∅ (ligne retirée)" : JSON.stringify(v));
console.log(`Regex des termes : ${COMPLIANCE_TERM}\n`);
for (const [input, expected] of descriptions) {
  const got = stripClaimFromDescription(input);
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${input.padEnd(48)} → ${show(got)}${ok ? "" : `   (attendu ${show(expected)})`}`);
}
console.log("");
for (const [input, expected] of notes) {
  const got = stripClaimSentences(input);
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} notes ${JSON.stringify(input)}\n     → ${JSON.stringify(got)}${ok ? "" : `\n     (attendu ${JSON.stringify(expected)})`}`);
}
console.log(`\n${fail === 0 ? "TOUS LES CAS OK" : `${fail} ÉCHEC(S)`}`);
process.exitCode = fail ? 1 : 0;
