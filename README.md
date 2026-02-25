# TableQuest (MVP)

Application web responsive (mobile, tablette, ordinateur) pour apprendre les tables de multiplication de 1 à 10.

## Fonctionnalités

- Mode `Apprendre` avec représentation visuelle (groupes), table complète, et claviers virtuels pour choisir la table et le deuxième nombre.
- Mode `S'entraîner` adaptatif: insiste sur les tables et multiplicateurs les moins réussis pour favoriser l'apprentissage.
- Mode `Jeu` avec 3 types:
  - `Défi chrono`: 60 secondes avec jauge de temps décroissante pour faire le meilleur score.
  - `Découvre l'image`: révèle une grille 2x2 de 4 images tirées aléatoirement depuis une bibliothèque de 80 visuels (masqués au départ).
  - `Construit ta tour`: 10 emplacements à remplir, brique fissurée sur erreur, casse après 3 erreurs.
- À chaque victoire, un effet fun aléatoire unique pendant 5 secondes (badges, pluie d'émojis, shake, etc.).
- Dans le `Défi chrono`, l'effet fun se déclenche uniquement si le score entre dans le top 3 du leaderboard.
- Effets premium débloqués si les tables 7, 8 et 9 sont actives.
- Affichage du visuel du jeu configurable sur grand écran: à gauche (par défaut) ou à droite (mode gaucher).
- Leaderboard local du `Défi chrono` (top scores sauvegardés).
- Clavier numérique tactile intégré (boutons 0-9, Effacer + bouton Valider séparé).
- Mode `Progrès`: précision globale, faits maîtrisés, faits à revoir, carte de maîtrise.
- Mode `Configuration` avec choix des tables actives pour `S'entraîner` et `Jeu`.
- Export/import des résultats en JSON + préparation d'email pour partage.
- Remise à zéro avec confirmation explicite.
- Sauvegarde locale automatique des progrès (`localStorage`).

## Lancer en local

Cette app est statique, donc pas de build obligatoire.

1. Ouvre le dossier dans ton navigateur avec un serveur local (recommandé).
2. Exemple (si Python est installé):

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Publier sur GitHub Pages

1. Crée un nouveau repository GitHub.
2. Ajoute ces fichiers à la racine:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Push sur la branche `main`.
4. Dans GitHub:
   - `Settings` -> `Pages`
   - `Build and deployment` -> `Source: Deploy from a branch`
   - `Branch: main` et dossier `/ (root)`
5. Attends 1 à 2 minutes: l'URL Pages apparaîtra.

## Idées pour V2

- Profils multiples (plusieurs enfants).
- Suivi parent avec export CSV.
- Niveau CE1/CE2 (tables ciblées par semaine).
- Audio et mode dyslexie (police adaptée, espacement).
