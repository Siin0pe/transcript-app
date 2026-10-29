# Transcript.IO

Petit site de prise de notes. On écrit une note, ou on la dicte : la voix est transcrite par Whisper directement dans le navigateur (`@remotion/whisper-webgpu`, sur la carte graphique via WebGPU), sans serveur d'IA ni clé d'API. Les notes et leurs étiquettes sont stockées dans une base SQLite.

Technologie principale : Next.js 16 (React 19, TypeScript, Tailwind CSS 4), base SQLite via Drizzle ORM et libSQL.

## Prérequis

- Node.js 20.9 ou plus récent (avec npm), téléchargeable sur https://nodejs.org
- Rien d'autre : pas de Docker, pas de serveur de base de données à installer. SQLite est un simple fichier créé automatiquement.

## Installation sur une VM vierge (Debian / Ubuntu, sans Node)

Il faut un utilisateur avec `sudo` (ou root) et un accès Internet. Ouvrir un terminal dans le dossier du projet (archive décompressée, ou `git clone https://github.com/Siin0pe/transcript-app.git`).

### Avec le script

```bash
./install.sh
npm start
```

Le script installe Node.js 22 s'il manque (ou s'il est trop ancien), puis lance `npm ci` et `npm run build`. Il fait exactement les étapes ci-dessous. Le site répond ensuite sur http://localhost:3000.

### Sans le script

```bash
# 1. Node.js 22 (dépôt NodeSource)
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Dépendances et build de production
npm ci
npm run build

# 3. Lancement
npm start
```

Il n'y a ni `.env` ni base de données à configurer : le fichier SQLite `transcript.db` est créé au premier affichage de la page.

**Micro depuis une autre machine** : le navigateur n'autorise le micro qu'en HTTPS ou sur `localhost`. Si la VM est ouverte via `http://<ip-vm>:3000`, la dictée est bloquée. Le plus simple est un tunnel SSH : `ssh -L 3000:localhost:3000 user@ip-vm`, puis ouvrir http://localhost:3000.

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
- **Dicter** : cliquer sur « Dicter ». La première fois, le modèle Whisper tiny (environ 120 Mo) est téléchargé puis gardé en cache par le navigateur. Il faut un navigateur avec WebGPU (Chrome ou Edge récents). Le navigateur demande l'accès au micro. Parler, puis cliquer sur « Arrêter » : le texte s'ajoute à la fin du contenu.
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

- `app/` : page (`page.tsx`), gabarit commun avec en-tête et pied de page (`layout.tsx`), styles (`globals.css`)
- `components/` : en-tête et menu, liste des notes, carte d'une note, éditeur de note, bloc de dictée, composants d'interface (`ui/`)
- `hooks/use-whisper.ts` : enregistrement du micro et transcription Whisper
- `actions/` : server actions, lecture et modification des notes (`notes.ts`), préférences langue et version (`prefs.ts`)
- `lib/i18n.ts` : textes français et anglais
- `db/` : connexion, schéma et script SQL d'initialisation

## Répartition des fichiers (15 client / 10 serveur)

**Client (15 / 15)** : tout ce qui sert uniquement à l'affichage.

- `app/` : `layout.tsx`, `page.tsx`, `globals.css`
- `components/` : `header.tsx`, `notes-board.tsx`, `note-card.tsx`, `note-editor.tsx`, `dictation.tsx`
- `components/ui/` : `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`
- `hooks/use-whisper.ts`
- `lib/i18n.ts`

**Serveur (9 / 10)** : server actions, base de données et configuration.

- `actions/notes.ts`, `actions/prefs.ts` (`"use server"`)
- `db/index.ts`, `db/schema.ts`, `db/init.sql`
- Configuration obligatoire avec Next.js et npm : `package.json`, `tsconfig.json`, `postcss.config.mjs`, `.npmrc` (évite le téléchargement CUDA d'`onnxruntime-node`, dépendance de `@remotion/whisper-webgpu`, inutile car Whisper tourne dans le navigateur)

**Hors quota** : ces fichiers ne contiennent pas de code du site.

| Fichier | Justification |
| --- | --- |
| `package-lock.json` | Généré automatiquement par npm |
| `.gitignore` | Exclusions Git |
| `install.sh` | Script d'installation sur VM |
| `README.md`, `AGENTS.md`, `rapport.pdf` | Documentation |
| `app/favicon.ico` | Icône, pas du code |
