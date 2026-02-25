# TableQuest (MVP)

Application web responsive (mobile, tablette, ordinateur) pour apprendre les tables de multiplication de 1 à 10.

## Fonctionnalités

- Mode `Apprendre` avec représentation visuelle (groupes), table complète, et claviers virtuels pour choisir la table et le deuxième nombre.
- Mode `S'entraîner` adaptatif: les faits les moins maîtrisés reviennent plus souvent.
- Mode `Défi` chrono de 60 secondes.
- Clavier numérique tactile intégré (boutons 0-9, Effacer, Retour + bouton Valider séparé).
- Mode `Progrès`: précision globale, faits maîtrisés, faits à revoir, carte de maîtrise.
- Mode `Configuration` avec choix des tables actives pour `S'entraîner` et `Défi`.
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
