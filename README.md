# Transcript.IO

Petit site de prise de notes. On écrit une note, ou on la dicte : la voix est transcrite par Whisper directement dans le navigateur, sans serveur d'IA ni clé d'API. Les notes et leurs étiquettes sont stockées dans une base SQLite.

Technologie principale : Next.js 16 (React 19, TypeScript, Tailwind CSS 4), base SQLite via Drizzle ORM et libSQL.

## Prérequis

- Node.js 20.9 ou plus récent (avec npm), téléchargeable sur https://nodejs.org
- Rien d'autre : pas de Docker, pas de serveur de base de données à installer. SQLite est un simple fichier créé automatiquement.

## Démarrer le site en développement

1. Décompresser l'archive puis ouvrir un terminal dans le dossier du projet (celui qui contient `package.json`).
2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

4. Ouvrir http://localhost:3000 dans le navigateur (Firefox, Chrome…).

Au premier affichage, le fichier `transcript.db` est créé à la racine du projet à partir de `db/init.sql` (création des tables `tags` et `notes` et quelques notes d'exemple).

## Base de données

- Script de création et de remplissage initial : `db/init.sql`
- Schéma utilisé par le code : `db/schema.ts`
- Remettre la base à zéro : arrêter le serveur, lancer `npm run db:reset`, puis relancer `npm run dev`.

## Utilisation

- **Écrire une note** : remplir le titre, choisir une étiquette si besoin, écrire le contenu puis cliquer sur « Enregistrer ».
- **Dicter** : cliquer sur « Dicter ». La première fois, le modèle Whisper tiny (quelques dizaines de Mo) est téléchargé puis gardé en cache par le navigateur. Le navigateur demande l'accès au micro. Parler, puis cliquer sur « Arrêter » : le texte s'ajoute à la fin du contenu.
- **Modifier** une note : icône crayon sur la carte. **Supprimer** : icône corbeille puis « Confirmer ».
- **Langue** : bouton « EN » / « FR » dans l'en-tête (ou dans le menu en version mobile).
- **Version mobile / bureau** : bouton « Version mobile » dans l'en-tête, ou « Version bureau » dans le menu de la version mobile. Le choix est retenu dans un cookie. Sans choix, le site prend la version qui correspond à l'appareil.
- **Thème clair / sombre** : bouton soleil / lune.

## Version de production (facultatif)

```bash
npm run build
npm start
```

## Organisation des fichiers

- `app/` : page (`page.tsx`), gabarit commun avec en-tête et pied de page (`layout.tsx`), styles (`globals.css`), actions serveur (`actions.ts`)
- `components/` : en-tête et menu, liste des notes, carte d'une note, éditeur de note, bloc de dictée, composants d'interface (`ui/`)
- `hooks/use-whisper.ts` : enregistrement du micro et transcription Whisper
- `lib/` : textes français et anglais (`i18n.ts`), lecture des préférences langue et version (`prefs.ts`)
- `db/` : connexion, schéma et script SQL d'initialisation
