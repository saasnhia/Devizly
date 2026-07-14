-- Migration 048: Système template — "Prestation d'automatisation IA" (NBHC)
-- Modèle de contrat de prestation B2B avec variables {{}}, pensé pour être
-- rempli en quelques secondes par un commercial au téléphone.
--
-- AVERTISSEMENT : ce contenu est un modèle de base fourni à titre indicatif.
-- Il doit être relu et validé par un professionnel du droit avant tout usage
-- commercial réel. Devizly ne fournit pas de conseil juridique.

DO $$
DECLARE
  tpl_content text := $content$AVERTISSEMENT : ce modèle de contrat est fourni à titre indicatif. Il doit être relu et validé par un professionnel du droit avant toute utilisation commerciale réelle. Devizly ne fournit pas de conseil juridique.

CONTRAT DE PRESTATION DE SERVICES
Automatisation de workflows par intelligence artificielle

ENTRE LES SOUSSIGNÉS :

Le Prestataire : {{prestataire_nom}}, immatriculée sous le numéro SIRET {{prestataire_siret}}, dont le siège social est situé {{prestataire_adresse}}, représentée par {{prestataire_representant}} en qualité de représentant légal,
Ci-après désignée « le Prestataire »,

ET

Le Client : {{client_nom}}, immatriculée sous le numéro SIRET {{client_siret}}, dont le siège social est situé {{client_adresse}}, représentée par {{client_representant}},
Ci-après désigné « le Client »,

Ci-après ensemble désignés « les Parties ».

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 — OBJET DU CONTRAT

Le présent contrat a pour objet la conception, le développement et la mise en place, par le Prestataire, de solutions d'automatisation de workflows par intelligence artificielle pour le compte du Client, s'appuyant notamment sur une stack technique souveraine européenne (orchestration n8n, modèles de langage Mistral AI hébergés en France).

Objet spécifique de la prestation : {{objet}}

Le détail des livrables, jalons et spécifications techniques fera l'objet d'une annexe technique signée par les deux Parties, laquelle fait partie intégrante du présent contrat.

ARTICLE 2 — DURÉE

Le présent contrat est conclu pour une durée de {{duree}}, à compter de sa signature par les deux Parties.

Il pourra être renouvelé par accord exprès et écrit des Parties, au moins un (1) mois avant son terme. À défaut d'accord de renouvellement, il prendra fin de plein droit à l'échéance sans formalité supplémentaire.

ARTICLE 3 — PRIX ET MODALITÉS DE PAIEMENT

Le prix de la prestation est fixé à {{montant}} € HT.

Modalités de règlement : un acompte pourra être demandé à la signature du contrat, le solde étant dû selon l'échéancier convenu entre les Parties et précisé sur les factures émises par le Prestataire.

Tout retard de paiement entraîne, de plein droit et sans mise en demeure préalable, l'application de pénalités calculées au taux d'intérêt légal en vigueur majoré de trois (3) fois ce taux, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 € (article L441-10 et D441-5 du Code de commerce), sans préjudice d'une indemnisation complémentaire si les frais de recouvrement effectivement engagés sont supérieurs à ce montant.

ARTICLE 4 — OBLIGATIONS DU PRESTATAIRE

Le Prestataire s'engage à exécuter la prestation avec diligence et selon les règles de l'art, dans le cadre d'une obligation de moyens.

Le Prestataire s'engage à :
- mettre en œuvre les compétences techniques nécessaires à la réalisation des livrables convenus ;
- tenir le Client informé de l'avancement du projet ;
- respecter la confidentialité des informations, données et process du Client auxquels il aurait accès dans le cadre de la prestation ;
- livrer les solutions d'automatisation conformément aux spécifications validées en annexe technique.

ARTICLE 5 — OBLIGATIONS DU CLIENT

Le Client s'engage à :
- fournir au Prestataire, dans des délais raisonnables, l'ensemble des accès, informations, documents et éléments nécessaires à la bonne exécution de la prestation (accès aux outils, comptes, API, données) ;
- désigner un interlocuteur référent pour le suivi du projet ;
- régler les sommes dues dans les délais convenus à l'article 3.

ARTICLE 6 — PROPRIÉTÉ INTELLECTUELLE

Sauf stipulation contraire prévue en annexe technique, les workflows d'automatisation, scripts, configurations et développements spécifiques réalisés par le Prestataire dans le cadre de la présente prestation sont cédés au Client à compter du paiement intégral du prix, pour les besoins propres de son activité.

Le Prestataire conserve la propriété de ses méthodologies, savoir-faire, briques logicielles génériques et composants réutilisables développés antérieurement ou indépendamment du présent contrat, et en concède au Client une licence d'utilisation non exclusive, pour la durée nécessaire au fonctionnement des livrables.

ARTICLE 7 — DONNÉES PERSONNELLES (RGPD)

Dans le cadre de l'exécution de la prestation, le Prestataire est susceptible de traiter des données à caractère personnel pour le compte du Client. Il agit alors en qualité de sous-traitant au sens du Règlement (UE) 2016/679 (RGPD) et s'engage à :
- ne traiter les données que sur instruction documentée du Client et pour les seules finalités de la prestation ;
- garantir un niveau de sécurité adapté aux risques ;
- notifier le Client de toute violation de données dans les meilleurs délais ;
- assister le Client dans le respect de ses obligations réglementaires.

Les modalités précises du traitement (nature, finalité, durée, catégories de données) feront l'objet, si nécessaire, d'un accord de traitement des données (DPA) annexé au présent contrat.

ARTICLE 8 — CONFIDENTIALITÉ

Chacune des Parties s'engage à conserver strictement confidentielles toutes les informations de nature technique, commerciale ou financière dont elle pourrait avoir connaissance à l'occasion de l'exécution du présent contrat, et à ne pas les divulguer à des tiers sans l'accord préalable écrit de l'autre Partie. Cette obligation perdure pendant toute la durée du contrat et pour une durée de deux (2) ans après son terme.

ARTICLE 9 — RESPONSABILITÉ

Le Prestataire est tenu à une obligation de moyens. Sa responsabilité ne pourra être engagée qu'en cas de faute prouvée dans l'exécution de ses obligations.

En tout état de cause, la responsabilité du Prestataire est limitée aux dommages directs et ne saurait excéder le montant total des sommes effectivement perçues par le Prestataire au titre du présent contrat au cours des douze (12) derniers mois. Le Prestataire ne pourra être tenu responsable des dommages indirects (perte d'exploitation, perte de données, préjudice commercial).

Le Prestataire déclare être couvert par une assurance responsabilité civile professionnelle pour les activités objet du présent contrat.

ARTICLE 10 — RÉSILIATION

Chaque Partie pourra résilier le présent contrat de manière anticipée en cas de manquement grave de l'autre Partie à ses obligations, non réparé dans un délai de trente (30) jours suivant une mise en demeure écrite restée sans effet.

En dehors de tout manquement, le Client pourra résilier le contrat moyennant un préavis écrit de trente (30) jours, sous réserve du règlement des prestations déjà réalisées ou engagées à la date de résiliation.

ARTICLE 11 — LITIGES ET DROIT APPLICABLE

Le présent contrat est soumis au droit français.

En cas de différend relatif à la formation, l'exécution ou l'interprétation du présent contrat, les Parties s'efforceront de trouver une solution amiable, y compris par voie de médiation, avant toute action contentieuse.

À défaut d'accord amiable, tout litige sera porté devant les tribunaux compétents du ressort du siège social du Prestataire.

ARTICLE 12 — SIGNATURES

Fait à ______________, le {{date}}, en deux exemplaires originaux.

Pour le Prestataire :
{{prestataire_nom}}
{{prestataire_representant}}

Pour le Client :
{{client_nom}}
{{client_representant}}$content$;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_templates')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contract_templates' AND column_name = 'content')
     AND NOT EXISTS (
       SELECT 1 FROM contract_templates
       WHERE is_system = true AND name = 'Prestation d''automatisation IA'
     ) THEN
    INSERT INTO contract_templates (
      id, user_id, name, description, is_system, category,
      default_amount, default_frequency, default_duration_months, items,
      content, variables
    )
    VALUES (
      gen_random_uuid(),
      NULL,
      'Prestation d''automatisation IA',
      'Contrat de prestation de services pour la conception et la mise en place de solutions d''automatisation de workflows par intelligence artificielle.',
      true,
      'prestation',
      NULL,
      'monthly',
      NULL,
      '[]',
      tpl_content,
      '["prestataire_nom","prestataire_siret","prestataire_adresse","prestataire_representant","client_nom","client_siret","client_adresse","client_representant","date","montant","duree","objet"]'::jsonb
    );
  END IF;
END $$;
