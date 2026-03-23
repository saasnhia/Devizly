export interface MetierFaq {
  q: string;
  a: string;
}

export interface MetierSeo {
  slug: string;
  nom: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  contexte: string;
  mentions: string;
  tva: string;
  faq: [MetierFaq, MetierFaq, MetierFaq];
  relatedPages: string[];
  relatedBlog: string[];
}

const SITE = "https://devizly.fr";

export function metierUrl(slug: string): string {
  return `${SITE}/logiciel-devis/${slug}`;
}

export const METIERS: MetierSeo[] = [
  /* ────────────────────── 1. PLOMBIER ────────────────────── */
  {
    slug: "plombier",
    nom: "Plombier",
    title: "Logiciel de Devis pour Plombier — Gratuit",
    description:
      "Créez vos devis plomberie en 2 minutes avec l'IA. Mentions obligatoires, TVA 10 %/20 %, acompte Stripe intégré. Logiciel gratuit pour plombiers indépendants.",
    h1: "Logiciel de devis pour plombier — Gratuit et sans engagement",
    intro:
      "Entre les interventions d'urgence, les chantiers planifiés et les devis à rédiger le soir, un plombier indépendant perd en moyenne 5 heures par semaine sur l'administratif. Devizly vous permet de créer un devis plomberie conforme en 2 minutes : décrivez l'intervention (remplacement chauffe-eau, réfection colonne, dépannage fuite), l'IA structure les postes et calcule les montants.",
    contexte:
      "Un devis plomberie détaille la main-d'œuvre, les fournitures (raccords, tuyaux, robinetterie) et le déplacement. Pour les dépannages d'urgence, le client doit être informé du caractère payant avant intervention. Devizly sépare automatiquement fournitures et main-d'œuvre pour une transparence totale envers votre client.",
    mentions:
      "SIRET, assurance responsabilité civile professionnelle, garantie décennale (si travaux de construction), conditions de paiement, durée de validité, taux de TVA applicable. Pour les interventions à domicile : droit de rétractation de 14 jours.",
    tva:
      "TVA 10 % pour les travaux de réparation et d'entretien sur des logements achevés depuis plus de 2 ans. TVA 20 % pour les constructions neuves et les logements de moins de 2 ans.",
    faq: [
      {
        q: "Un devis plomberie est-il obligatoire ?",
        a: "Oui, pour toute intervention dont le montant dépasse 150 € TTC, le devis écrit est obligatoire avant le début des travaux. En dessous, le plombier doit informer le client du prix avant d'intervenir.",
      },
      {
        q: "Que doit contenir un devis de plombier ?",
        a: "Le détail de chaque prestation (main-d'œuvre, fournitures, déplacement), les prix unitaires HT, le taux de TVA (10 % ou 20 %), le montant total TTC, vos coordonnées et SIRET, votre assurance RC pro, les conditions de paiement et la durée de validité.",
      },
      {
        q: "Comment facturer un dépannage en urgence ?",
        a: "Le dépannage urgent doit faire l'objet d'un devis si le montant dépasse 150 € TTC. Vous pouvez majorer le tarif pour intervention hors horaires normaux, à condition que ce soit indiqué clairement sur le devis avant acceptation du client.",
      },
    ],
    relatedPages: ["/logiciel-devis-artisan", "/devis-batiment-gratuit", "/logiciel-devis/electricien", "/logiciel-devis/couvreur"],
    relatedBlog: ["/blog/mentions-obligatoires-devis-artisan", "/blog/acompte-devis-regles-2026"],
  },

  /* ────────────────────── 2. ÉLECTRICIEN ────────────────────── */
  {
    slug: "electricien",
    nom: "Électricien",
    title: "Créer un Devis Électricien Professionnel",
    description:
      "Logiciel de devis pour électricien. Normes NF C 15-100, TVA 10 %/20 %, mentions obligatoires, signature électronique. Créez vos devis en 2 minutes avec l'IA.",
    h1: "Créer un devis électricien professionnel en 2 minutes",
    intro:
      "Un électricien indépendant jongle entre la mise en conformité de tableaux, le câblage de maisons neuves et la pose de bornes de recharge. Chaque chantier nécessite un devis précis listant les fournitures (disjoncteurs, câbles, prises), la main-d'œuvre et les mises aux normes. Devizly génère ce devis en quelques clics grâce à l'IA, avec toutes les mentions légales pré-remplies.",
    contexte:
      "Les travaux d'électricité sont encadrés par la norme NF C 15-100. Le devis doit préciser si une attestation de conformité Consuel sera nécessaire en fin de chantier. Devizly vous permet d'ajouter cette mention automatiquement selon le type de travaux (neuf ou rénovation).",
    mentions:
      "SIRET, qualification professionnelle (habilitation électrique), assurance décennale, numéro d'assureur, conditions de paiement, TVA applicable. Mention Consuel si installation neuve ou rénovation lourde.",
    tva:
      "TVA 10 % pour les travaux de rénovation électrique sur des logements de plus de 2 ans. TVA 5,5 % si les travaux améliorent la performance énergétique (ex. : remplacement de convecteurs par des radiateurs à inertie). TVA 20 % pour le neuf.",
    faq: [
      {
        q: "Quelles normes mentionner sur un devis électricien ?",
        a: "Le devis doit indiquer que les travaux seront réalisés selon la norme NF C 15-100 en vigueur. Si une attestation Consuel est requise (installation neuve, rénovation complète), précisez-le sur le devis avec le coût associé.",
      },
      {
        q: "Un électricien doit-il avoir une assurance décennale ?",
        a: "Oui, la garantie décennale est obligatoire pour tous les travaux touchant au gros œuvre ou rendant l'ouvrage impropre à sa destination. L'installation électrique en fait partie. Le numéro de police et le nom de l'assureur doivent figurer sur chaque devis.",
      },
      {
        q: "Comment chiffrer un devis électrique rapidement ?",
        a: "Décrivez les travaux en langage naturel dans Devizly (ex. : « rénovation électrique appartement 60 m², tableau, 12 prises, 8 points lumineux »). L'IA génère les lignes de postes avec des prix marché comme base. Vous ajustez ensuite à vos tarifs.",
      },
    ],
    relatedPages: ["/logiciel-devis-artisan", "/logiciel-devis/plombier", "/logiciel-devis/climatisation", "/logiciel-devis/renovation"],
    relatedBlog: ["/blog/mentions-obligatoires-devis-artisan", "/blog/tva-devis-facture-artisan"],
  },

  /* ────────────────────── 3. PEINTRE ────────────────────── */
  {
    slug: "peintre",
    nom: "Peintre",
    title: "Devis Peinture — Logiciel pour Peintres",
    description:
      "Le logiciel de devis des peintres indépendants. Calcul au m², fournitures et main-d'œuvre séparées, TVA 10 %/20 %. Créez vos devis peinture en 2 minutes.",
    h1: "Devis peinture : le logiciel des peintres indépendants",
    intro:
      "En tant que peintre en bâtiment, chaque chantier est différent : peinture intérieure, ravalement de façade, pose de papier peint, traitement de surfaces. Le devis doit détailler les surfaces en m², distinguer la fourniture de la main-d'œuvre et appliquer le bon taux de TVA. Devizly automatise tout cela : décrivez le chantier, l'IA structure votre devis au m² avec les bonnes lignes de postes.",
    contexte:
      "Un devis de peintre professionnel distingue systématiquement la préparation des supports (lessivage, ponçage, enduit), la fourniture (peinture, sous-couche, primaire) et l'application (nombre de couches). Cette séparation est essentielle pour la transparence et pour justifier vos tarifs auprès du client.",
    mentions:
      "SIRET, assurance RC professionnelle, garantie biennale/décennale selon la nature des travaux, prix au m² ou forfaitaire, conditions de paiement, durée de validité. Mention du nombre de couches et du type de peinture utilisé.",
    tva:
      "TVA 10 % pour les travaux de peinture sur des logements de plus de 2 ans (rénovation). TVA 20 % pour les constructions neuves ou les locaux professionnels de moins de 2 ans.",
    faq: [
      {
        q: "Comment calculer un devis peinture au m² ?",
        a: "Le prix au m² inclut la préparation du support, la fourniture de peinture et l'application. Les tarifs varient de 20 à 45 € HT/m² selon la finition. Avec Devizly, décrivez les pièces et surfaces, l'IA propose un chiffrage au m² ajustable.",
      },
      {
        q: "Faut-il séparer fournitures et main-d'œuvre ?",
        a: "Ce n'est pas légalement obligatoire, mais c'est une bonne pratique qui renforce la confiance du client. Devizly structure automatiquement le devis en distinguant la préparation, les fournitures et la pose.",
      },
      {
        q: "Un devis de peinture engage-t-il le peintre ?",
        a: "Oui, un devis signé par le client vaut contrat. Le peintre s'engage à réaliser les travaux aux conditions et prix indiqués. Toute modification (surface supplémentaire, changement de finition) doit faire l'objet d'un avenant.",
      },
    ],
    relatedPages: ["/logiciel-devis-artisan", "/logiciel-devis/macon", "/logiciel-devis/carreleur", "/devis-batiment-gratuit"],
    relatedBlog: ["/blog/modele-devis-batiment-gratuit", "/blog/tva-devis-facture-artisan"],
  },

  /* ────────────────────── 4. COUVREUR ────────────────────── */
  {
    slug: "couvreur",
    nom: "Couvreur",
    title: "Logiciel de Devis pour Couvreur et Charpentier",
    description:
      "Créez vos devis toiture et couverture en 2 minutes. Décennale obligatoire, TVA 10 %/20 %, acompte intégré. Logiciel gratuit pour couvreurs indépendants.",
    h1: "Logiciel de devis pour couvreur et charpentier",
    intro:
      "Les travaux de toiture sont parmi les plus engageants financièrement pour vos clients : réfection complète, remplacement de charpente, pose de velux, traitement de charpente. Un devis précis et conforme est indispensable pour rassurer le client et sécuriser votre engagement. Devizly vous aide à structurer chaque devis toiture avec le détail des matériaux, la main-d'œuvre et les garanties obligatoires.",
    contexte:
      "Un devis de couverture doit impérativement mentionner la garantie décennale — les travaux de toiture engagent la solidité de l'ouvrage. Le devis doit aussi préciser le type de matériaux (tuiles, ardoises, zinc), la surface couverte et les travaux annexes (gouttières, zinguerie, isolation sous rampants).",
    mentions:
      "SIRET, garantie décennale obligatoire (numéro de police + assureur), qualification Qualibat si applicable, conditions de paiement avec acompte recommandé, durée de validité, mention du droit de rétractation pour les travaux à domicile.",
    tva:
      "TVA 10 % pour la réfection de toiture sur des logements de plus de 2 ans. TVA 5,5 % si les travaux incluent une isolation thermique (sarking, isolation sous rampants). TVA 20 % pour les constructions neuves.",
    faq: [
      {
        q: "La décennale est-elle obligatoire pour un couvreur ?",
        a: "Oui, la garantie décennale est obligatoire pour tous les travaux de couverture car ils touchent au clos et couvert de l'ouvrage. Le numéro de police d'assurance et le nom de l'assureur doivent figurer sur chaque devis.",
      },
      {
        q: "Quel acompte demander pour des travaux de toiture ?",
        a: "Il est courant de demander 30 à 40 % d'acompte à la signature du devis pour financer les matériaux. Devizly intègre le paiement d'acompte par carte bancaire directement dans le devis partagé avec votre client.",
      },
      {
        q: "Comment détailler un devis de réfection de toiture ?",
        a: "Séparez la dépose de l'existant, la fourniture des matériaux (tuiles, liteaux, écran sous-toiture), la pose, la zinguerie et l'évacuation des déchets. Devizly structure ces postes automatiquement à partir de votre description.",
      },
    ],
    relatedPages: ["/devis-batiment-gratuit", "/logiciel-devis/macon", "/logiciel-devis/isolation", "/logiciel-devis-artisan"],
    relatedBlog: ["/blog/acompte-devis-regles-2026", "/blog/mentions-obligatoires-devis-artisan"],
  },

  /* ────────────────────── 5. RÉNOVATION ────────────────────── */
  {
    slug: "renovation",
    nom: "Rénovation",
    title: "Logiciel de Devis Rénovation pour les Pros",
    description:
      "Créez vos devis rénovation professionnels en 2 minutes. TVA 5,5 %/10 %/20 %, multiples corps de métier, mentions légales auto. Logiciel gratuit pour entreprises du bâtiment.",
    h1: "Logiciel de devis rénovation pour les pros du bâtiment",
    intro:
      "Un chantier de rénovation implique souvent plusieurs corps de métier : maçonnerie, plomberie, électricité, peinture, menuiserie. Le devis doit organiser ces lots clairement, appliquer les bons taux de TVA selon la nature des travaux et fournir un chiffrage global cohérent. Devizly structure automatiquement votre devis en lots distincts avec les bons taux de TVA sur chaque ligne.",
    contexte:
      "La rénovation est le segment où la TVA est la plus complexe : trois taux différents peuvent coexister sur un même devis. L'entreprise générale ou l'artisan tous corps d'état doit maîtriser cette répartition pour éviter un redressement fiscal.",
    mentions:
      "SIRET, garantie décennale, assurance RC pro, détail par lot (démolition, gros œuvre, second œuvre, finitions), TVA détaillée par ligne, attestation simplifiée de TVA à taux réduit (formulaire Cerfa 1301-SD à faire signer par le client).",
    tva:
      "TVA 5,5 % pour les travaux d'amélioration énergétique. TVA 10 % pour les travaux d'amélioration, de transformation et d'entretien sur des logements de plus de 2 ans. TVA 20 % pour les travaux qui augmentent la surface habitable ou pour les logements neufs.",
    faq: [
      {
        q: "Comment gérer les différents taux de TVA sur un devis rénovation ?",
        a: "Chaque ligne de poste doit indiquer son propre taux de TVA. L'isolation relève du 5,5 %, la plomberie et l'électricité du 10 %, et les éléments de confort du 20 %. Devizly applique automatiquement le bon taux selon la nature des travaux.",
      },
      {
        q: "Faut-il une attestation TVA pour la rénovation ?",
        a: "Oui, pour bénéficier des taux réduits (5,5 % et 10 %), le client doit signer l'attestation simplifiée Cerfa 1301-SD avant le début des travaux. Cette attestation confirme que le logement a plus de 2 ans et est affecté à l'habitation.",
      },
      {
        q: "Comment structurer un devis rénovation multi-lots ?",
        a: "Organisez le devis en lots distincts (démolition, maçonnerie, plomberie, électricité, peinture). Chaque lot a ses propres lignes de postes. Devizly structure automatiquement les lots à partir de votre description du chantier.",
      },
    ],
    relatedPages: ["/devis-batiment-gratuit", "/logiciel-devis/macon", "/logiciel-devis/peintre", "/logiciel-devis/electricien"],
    relatedBlog: ["/blog/modele-devis-batiment-gratuit", "/blog/tva-devis-facture-artisan"],
  },

  /* ────────────────────── 6. MAÇON ────────────────────── */
  {
    slug: "macon",
    nom: "Maçon",
    title: "Créer un Devis Maçonnerie Professionnel",
    description:
      "Logiciel de devis pour maçon. Gros œuvre, fondations, extension. Décennale, TVA 10 %/20 %, mentions obligatoires auto. Créez vos devis maçonnerie en 2 minutes.",
    h1: "Créer un devis maçonnerie professionnel en ligne",
    intro:
      "Le maçon est au cœur de tout chantier de construction ou de rénovation : fondations, murs porteurs, dalles, extensions, clôtures. Vos devis doivent être précis sur les quantités (m³ de béton, m² de parpaings, tonnes d'acier) et conformes aux obligations légales. Devizly vous aide à structurer un devis maçonnerie détaillé en quelques minutes.",
    contexte:
      "Les travaux de maçonnerie touchent au gros œuvre et engagent systématiquement la garantie décennale. Le devis doit détailler les matériaux, les quantités et les métrés. Pour les extensions ou surélévations, un permis de construire peut être nécessaire — une mention sur le devis clarifie les responsabilités.",
    mentions:
      "SIRET, garantie décennale (obligatoire pour le gros œuvre), assurance RC pro, détail des matériaux et quantités (m², m³, unités), conditions de paiement avec échéancier recommandé, durée de validité.",
    tva:
      "TVA 10 % pour les travaux de rénovation sur des logements de plus de 2 ans (reprise de maçonnerie, rejointoiement). TVA 20 % pour les constructions neuves, extensions et fondations sur terrain vierge.",
    faq: [
      {
        q: "Un maçon doit-il obligatoirement avoir la décennale ?",
        a: "Oui, tous les travaux de gros œuvre (fondations, murs porteurs, dalles) sont couverts par la garantie décennale. Le maçon doit mentionner son numéro de police et le nom de l'assureur sur chaque devis.",
      },
      {
        q: "Comment détailler un devis de maçonnerie ?",
        a: "Listez chaque poste avec les quantités précises : m³ de béton, m² de parpaings ou briques, mètres linéaires de fondations, heures de main-d'œuvre. Devizly génère cette structure automatiquement à partir de votre description du chantier.",
      },
      {
        q: "Quel échéancier de paiement pour un gros chantier ?",
        a: "Pour les chantiers importants, un échéancier en 3 ou 4 étapes est courant : acompte à la commande (30 %), avancement gros œuvre (30 %), hors d'eau/hors d'air (30 %), solde à la réception (10 %). Devizly intègre le paiement d'acompte par carte.",
      },
    ],
    relatedPages: ["/devis-batiment-gratuit", "/logiciel-devis/couvreur", "/logiciel-devis/renovation", "/logiciel-devis-artisan"],
    relatedBlog: ["/blog/mentions-obligatoires-devis-artisan", "/blog/acompte-devis-regles-2026"],
  },

  /* ────────────────────── 7. MENUISIER ────────────────────── */
  {
    slug: "menuisier",
    nom: "Menuisier",
    title: "Logiciel de Devis pour Menuisier — Gratuit",
    description:
      "Créez vos devis menuiserie en 2 minutes. Pose, fourniture, sur-mesure. TVA 10 %/20 %, mentions obligatoires, signature électronique. Gratuit pour menuisiers indépendants.",
    h1: "Logiciel de devis pour menuisier — Simple et conforme",
    intro:
      "Menuisier d'agencement, poseur de fenêtres, fabricant de meubles sur-mesure : vos devis doivent distinguer clairement la fabrication, la fourniture et la pose. Chaque projet est unique — un escalier sur-mesure ne se chiffre pas comme une pose de fenêtres PVC. Devizly vous permet de détailler chaque poste rapidement, avec les bonnes mentions légales et le bon taux de TVA.",
    contexte:
      "Le devis de menuiserie doit préciser les matériaux utilisés (bois massif, MDF, PVC, aluminium), les dimensions, les finitions et distinguer fourniture et pose. Pour la menuiserie extérieure (fenêtres, portes), les performances thermiques (Uw, Sw) peuvent conditionner le taux de TVA applicable.",
    mentions:
      "SIRET, garantie décennale (si menuiserie intégrée au bâti), garantie biennale pour les éléments dissociables, type de matériaux et dimensions, conditions de paiement, durée de validité, délai de fabrication estimé.",
    tva:
      "TVA 10 % pour la pose de menuiseries en rénovation sur des logements de plus de 2 ans. TVA 5,5 % si les menuiseries améliorent la performance énergétique (fenêtres à isolation renforcée, Uw ≤ 1,3 W/m²K). TVA 20 % pour le neuf.",
    faq: [
      {
        q: "Comment chiffrer un projet de menuiserie sur-mesure ?",
        a: "Décrivez le projet dans Devizly (ex. : « placard coulissant 3 portes chêne, 2,50 m × 2,40 m, intérieur aménagé »). L'IA génère les postes : prise de cotes, fabrication, fourniture quincaillerie, pose et finition. Vous ajustez les tarifs.",
      },
      {
        q: "Faut-il la décennale pour un menuisier ?",
        a: "Oui, si les ouvrages sont intégrés au bâti (portes, fenêtres, escaliers, placards encastrés). Les éléments mobiles (meubles) relèvent de la garantie contractuelle, pas de la décennale.",
      },
      {
        q: "Comment gérer la TVA sur la pose de fenêtres ?",
        a: "Les fenêtres à isolation renforcée (Uw ≤ 1,3) bénéficient de la TVA à 5,5 % en rénovation. Les autres menuiseries en rénovation relèvent du 10 %. Le neuf est à 20 %. Devizly applique le bon taux selon vos indications.",
      },
    ],
    relatedPages: ["/logiciel-devis-artisan", "/logiciel-devis/peintre", "/logiciel-devis/renovation", "/logiciel-devis/isolation"],
    relatedBlog: ["/blog/devis-signe-valeur-juridique", "/blog/mentions-obligatoires-devis-artisan"],
  },

  /* ────────────────────── 8. CARRELEUR ────────────────────── */
  {
    slug: "carreleur",
    nom: "Carreleur",
    title: "Créer un Devis Carrelage Professionnel",
    description:
      "Logiciel de devis pour carreleur. Calcul au m², fourniture et pose, TVA 10 %/20 %. Créez vos devis carrelage en 2 minutes avec l'IA. Gratuit.",
    h1: "Créer un devis carrelage professionnel en 2 minutes",
    intro:
      "Le carreleur doit chiffrer précisément chaque chantier : surface à carreler, type de carrelage, préparation du support, pose droite ou diagonale, joints, plinthes. Devizly structure votre devis carrelage au m² avec la distinction fourniture/pose, les bonnes quantités (incluant les chutes) et les mentions légales obligatoires.",
    contexte:
      "Un devis de carrelage professionnel intègre la préparation du support (ragréage, primaire d'accrochage), la fourniture du carrelage et de la colle, la pose, les coupes et les joints. Il est recommandé de prévoir 10 à 15 % de marge pour les coupes et la casse.",
    mentions:
      "SIRET, assurance RC professionnelle, garantie biennale ou décennale selon la nature des travaux, prix au m² ou forfaitaire, type de carrelage (grès cérame, faïence, pierre naturelle), format et dimensions, conditions de paiement.",
    tva:
      "TVA 10 % pour les travaux de carrelage en rénovation sur des logements de plus de 2 ans. TVA 20 % pour les constructions neuves ou les locaux commerciaux.",
    faq: [
      {
        q: "Comment calculer la surface d'un devis carrelage ?",
        a: "Mesurez la surface en m² et ajoutez 10 à 15 % pour les coupes et la casse. Pour les poses en diagonale, prévoyez 15 %. Devizly calcule automatiquement la quantité nécessaire à partir de la surface que vous indiquez.",
      },
      {
        q: "Faut-il fournir le carrelage ou seulement poser ?",
        a: "Les deux options sont possibles. La fourniture-pose est plus courante et simplifie la gestion pour le client. Devizly vous permet de créer des devis fourniture-pose ou pose seule en séparant clairement les lignes.",
      },
      {
        q: "Quel prix au m² indiquer sur un devis carrelage ?",
        a: "Le prix dépend du type de carrelage, du format et de la complexité de pose. En moyenne : 30 à 50 € HT/m² pour une pose droite standard, 40 à 70 € pour une pose diagonale. L'IA de Devizly propose des tarifs marché comme base.",
      },
    ],
    relatedPages: ["/logiciel-devis-artisan", "/logiciel-devis/peintre", "/logiciel-devis/macon", "/devis-batiment-gratuit"],
    relatedBlog: ["/blog/modele-devis-batiment-gratuit", "/blog/tva-devis-facture-artisan"],
  },

  /* ────────────────────── 9. CLIMATISATION ────────────────────── */
  {
    slug: "climatisation",
    nom: "Climatisation",
    title: "Logiciel de Devis Climatisation pour Installateurs",
    description:
      "Créez vos devis climatisation et PAC en 2 minutes. Attestation fluides, TVA 10 %/20 %, mentions obligatoires. Logiciel gratuit pour installateurs et frigoristes.",
    h1: "Logiciel de devis climatisation pour installateurs",
    intro:
      "L'installation de climatisation et de pompes à chaleur est un marché en pleine croissance. Vos devis doivent refléter la technicité de vos interventions : dimensionnement, choix du matériel, mise en service, attestation de capacité à manipuler les fluides frigorigènes. Devizly structure vos devis climatisation avec tous les postes nécessaires et les mentions réglementaires spécifiques à votre métier.",
    contexte:
      "Le professionnel de la climatisation doit détenir l'attestation de capacité à manipuler les fluides frigorigènes (catégorie I à IV). Cette information doit figurer sur le devis. Pour les PAC, la qualification RGE QualiPAC permet au client de bénéficier des aides (MaPrimeRénov', CEE).",
    mentions:
      "SIRET, attestation de capacité fluides frigorigènes (numéro et catégorie), qualification RGE QualiPAC si applicable, garantie décennale, marque et modèle des équipements, puissance frigorifique et calorifique, conditions de paiement.",
    tva:
      "TVA 10 % pour le remplacement d'un système de chauffage/climatisation sur des logements de plus de 2 ans. TVA 5,5 % si la PAC améliore la performance énergétique du logement (sous conditions RGE). TVA 20 % pour les installations neuves.",
    faq: [
      {
        q: "L'attestation de fluides doit-elle figurer sur le devis ?",
        a: "Oui, le professionnel doit mentionner son numéro d'attestation de capacité et la catégorie (I à IV) sur chaque devis impliquant la manipulation de fluides frigorigènes. Devizly ajoute cette mention automatiquement.",
      },
      {
        q: "La qualification RGE est-elle obligatoire ?",
        a: "Non, mais elle est nécessaire pour que votre client bénéficie des aides financières (MaPrimeRénov', CEE). Mentionner votre qualification RGE QualiPAC sur le devis est un argument commercial fort.",
      },
      {
        q: "Comment dimensionner et chiffrer une climatisation ?",
        a: "Décrivez l'installation dans Devizly (ex. : « PAC air-air multisplit 3 unités, maison 90 m², R+1 »). L'IA génère un devis structuré : fourniture unité extérieure, unités intérieures, liaisons frigorifiques, mise en service.",
      },
    ],
    relatedPages: ["/logiciel-devis/electricien", "/logiciel-devis/isolation", "/logiciel-devis-artisan", "/devis-batiment-gratuit"],
    relatedBlog: ["/blog/tva-devis-facture-artisan", "/blog/acompte-devis-regles-2026"],
  },

  /* ────────────────────── 10. ISOLATION ────────────────────── */
  {
    slug: "isolation",
    nom: "Isolation",
    title: "Créer un Devis Isolation RGE Professionnel",
    description:
      "Logiciel de devis pour professionnels de l'isolation. TVA 5,5 %, RGE, MaPrimeRénov', CEE. Créez vos devis isolation en 2 minutes. Gratuit pour artisans certifiés.",
    h1: "Créer un devis isolation RGE professionnel",
    intro:
      "Le marché de l'isolation thermique est porté par la transition énergétique : MaPrimeRénov', CEE, éco-PTZ. Vos clients attendent un devis clair qui détaille les performances thermiques, les matériaux et les aides financières auxquelles ils peuvent prétendre. Devizly vous aide à structurer un devis isolation complet, conforme aux exigences RGE et prêt pour les dossiers d'aide.",
    contexte:
      "Un devis d'isolation RGE doit préciser la résistance thermique des matériaux (R en m²·K/W), les surfaces isolées, la technique utilisée (ITE, ITI, soufflage combles) et les performances avant/après. Ces informations sont indispensables pour constituer les dossiers MaPrimeRénov' et CEE.",
    mentions:
      "SIRET, qualification RGE obligatoire (numéro et organisme certificateur), garantie décennale, résistance thermique R des matériaux, surface traitée en m², type d'isolant (laine de verre, ouate de cellulose, polyuréthane), épaisseur posée, conditions de paiement.",
    tva:
      "TVA 5,5 % pour les travaux d'amélioration de la performance énergétique sur des logements de plus de 2 ans — c'est le taux le plus avantageux du bâtiment. Condition : la résistance thermique doit atteindre les seuils réglementaires (R ≥ 3,7 m²·K/W pour les murs, R ≥ 7 pour les combles perdus).",
    faq: [
      {
        q: "La qualification RGE est-elle obligatoire pour isoler ?",
        a: "La qualification RGE (Qualibat RGE, Qualifelec) est obligatoire pour que vos clients bénéficient des aides (MaPrimeRénov', CEE, éco-PTZ). Sans RGE, vous pouvez réaliser les travaux mais le client perd les aides financières.",
      },
      {
        q: "Quelles performances thermiques mentionner sur le devis ?",
        a: "Le devis doit indiquer la résistance thermique R de l'isolant posé. Les seuils pour la TVA à 5,5 % : R ≥ 3,7 m²·K/W pour les murs, R ≥ 4,5 pour les planchers bas, R ≥ 7 pour les combles perdus. Devizly pré-remplit ces valeurs selon le type d'isolation.",
      },
      {
        q: "Comment intégrer les aides sur le devis ?",
        a: "Mentionnez les aides auxquelles le client est éligible (MaPrimeRénov', CEE) avec une estimation du reste à charge. Cela renforce la conversion. Devizly vous permet d'ajouter une section dédiée aux aides financières.",
      },
    ],
    relatedPages: ["/logiciel-devis/couvreur", "/logiciel-devis/climatisation", "/logiciel-devis/renovation", "/devis-batiment-gratuit"],
    relatedBlog: ["/blog/tva-devis-facture-artisan", "/blog/mentions-obligatoires-devis-artisan"],
  },
];
