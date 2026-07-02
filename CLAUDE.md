# Contexte projet — Coris-Point-Hebdo

Application de reporting commercial pour Coris Mésofinance Côte d'Ivoire, utilisée par Badra Ali COULIBALY (Responsable Commercial) et son équipe de 23 Chargés d'Affaires (CAFs).

## Hiérarchie
- Chef d'agence : KOUADIO SABOU MELAINE
- DEX : ESMEL WILFRED
- DG : LINGANY ABDOUL
- Responsable Commercial (utilisateur principal) : COULIBALY Badra Ali

## Stack technique
- Fichier unique `index.html` (HTML/CSS/JS vanilla, pas de framework)
- Backend : Supabase (PostgreSQL + REST API)
  - URL : https://sdwrmdkldnyfgwnmryqd.supabase.co
  - Clé anon stockée dans le fichier (variable `SB_URL` / `SB_KEY`)
- Hébergement : GitHub Pages
  - Dépôt : abadracoulibaly-max/Coris-Point-Hebdo
  - URL prod : https://abadracoulibaly-max.github.io/Coris-Point-Hebdo/
  - Le fichier de production doit toujours s'appeler `index.html` à la racine

## Charte graphique (à respecter strictement)
- Navy : `#1A3A7A`
- Bleu : `#1A5CA8`
- Gold : `#C8A84B`
- Rouge : `#CC0000`
- Police : Inter (Google Fonts)

## Architecture base de données

### Table `dossiers`
Colonnes principales : `id, mod, semaine, date, caf, code, nom, montant, type, duree, secteur, obs, comtype, stade, ref, deadline, created_at`

Colonnes du cycle de vie (ajoutées récemment) :
- `statut_dossier` TEXT DEFAULT 'depose' — valeurs possibles : `depose / exploit / risque / vmep / regul / mep / ajourne / defavorable`
- `statut_date` TIMESTAMPTZ — date du dernier changement de statut
- `statut_historique` JSONB DEFAULT '[]' — historique complet des transitions
- `montant_valide` NUMERIC — montant validé (si différent du montant demandé)
- `duree_validee` INTEGER
- `sous_statut_exploit` TEXT — niveau de validation quand `statut_dossier = 'exploit'` : `chef_agence / resp_commercial / dex`

### Table `profiles`
`id, email, nom, role, actif, is_admin` — rôles : `manager` (DG/DEX/Chef d'agence, voit tout) ou `caf` (ne voit que ses propres dossiers)

### Table `objectifs`
`id, caf, mois, nb_objectif, vol_objectif`

## Règle métier fondamentale — Cycle de vie des dossiers
Un dossier est créé **une seule fois**, dans le module Déposés (`mod = "deposes"`, ce champ ne change JAMAIS après création — c'est l'identifiant d'origine du module de saisie).

Seul `statut_dossier` évolue au fil du temps, via l'onglet **📁 Dossiers** ou en cliquant sur une ligne dans les vues en lecture seule (Risque, Exploitation, VMEP, MEP, Régularisation).

**Ne jamais confondre** :
- Les 4 KPI en haut du Dashboard (Déposés / En analyse / VMEP / MEP) filtrent par `mod` + `semaine` → répondent à "combien déposés cette semaine", peu importe le statut actuel. Comportement intentionnel, ne pas modifier.
- Les 8 cartes de statut en bas du Dashboard filtrent par `statut_dossier` → répondent à "où en sont les dossiers maintenant".

**Objectifs (MEP)** : le calcul des objectifs réalisés doit se baser sur `statut_dossier IN ('mep', 'regul')` et non sur `mod = "mep"` (l'ancien système, où les dossiers étaient saisis directement dans le module MEP, n'existe plus pour les nouveaux dossiers — voir fonction `getMepRows()` dans le code).

## Sécurité / conformité
- Session verrouillée après 15 min d'inactivité (`sessionStorage`, clé `cmf_session` / `cmf_last_activity`)
- Pièces jointes : trace documentaire uniquement (nom + taille), jamais de stockage réel du fichier — décision définitive de conformité IT

## Style de travail attendu
- Toujours fournir le fichier `index.html` complet et fonctionnel, jamais des fragments à assembler manuellement
- Corrections ciblées et silencieuses plutôt que des refontes complètes
- Toujours vérifier la syntaxe JS avant de livrer (`node --check`)
- Toute nouvelle colonne Supabase doit être signalée clairement avec le `ALTER TABLE` correspondant à exécuter manuellement (le réseau ne permet pas d'exécuter de requêtes Supabase directement depuis ici)
- Langue de travail : français

## Autres applications liées (dépôts séparés)
- **CréditTrack** (circuit de validation crédit) : dépôt `CreditTrack-Coris`, prod sur https://abadracoulibaly-max.github.io/CreditTrack-Coris/
- **ProspectTrack** (CRM prospection) : construit (`ProspectTrack_Coris.html`) mais pas encore déployé — bloqué sur la limite de 2 projets gratuits Supabase
