# Transcript.IO

Petit site de prise de notes. On écrit une note, ou on la dicte : la voix est transcrite par Whisper directement dans le navigateur (`@remotion/whisper-webgpu`, sur la carte graphique via WebGPU), sans serveur d'IA ni clé d'API. Les notes et leurs étiquettes sont stockées dans une base SQLite.

Technologie principale : Next.js 16 (React 19, TypeScript, Tailwind CSS 4), base SQLite via Drizzle ORM et libSQL.

## Prérequis

- Pour développer : Node.js 20.9 ou plus récent (avec npm), téléchargeable sur https://nodejs.org
- Pour la VM : seulement Node.js, voir la section suivante.
- Pas de Docker, pas de serveur de base de données à installer : SQLite est un simple fichier créé automatiquement.

## Installation sur la VM (Debian brute, 500 Mo de disque)

### Pourquoi le site est compilé à l'avance

Compiler un site Next.js demande environ 1,5 Go pendant l'installation : `node_modules` pèse 1,1 Go (Next.js seul fait 300 Mo avec son compilateur), plus le cache npm et Node lui-même. Ça ne tient pas dans les 500 Mo de la VM.

Le site est donc compilé une fois sur ma machine, en mode `standalone` de Next.js (voir `next.config.ts`) : ce mode ne garde que les fichiers nécessaires pour faire tourner le site. Le résultat, `transcript-app.tar.gz` (18 Mo, 65 Mo une fois extrait), est publié dans la [release v2.0.0](https://github.com/Siin0pe/transcript-app/releases/tag/v2.0.0) du dépôt. Il est compilé à partir exactement du code de cette archive, avec `npm run bundle`.

Sur la VM, il suffit de Node.js (122 Mo) et de cette archive : **environ 190 Mo au total**. Le modèle Whisper (environ 120 Mo) est téléchargé par le navigateur du visiteur, pas par la VM.

Prérequis : une Debian (12 ou 13) x86_64, un accès Internet et le compte root (ou un utilisateur avec `sudo`).

### Avec le script

En root, dans le dossier du projet décompressé :

```bash
apt-get update && apt-get install -y unzip     # si l'archive du rendu n'est pas encore décompressée
bash install.sh
cd dist && HOSTNAME=0.0.0.0 node server.js
```

Le script fait exactement les étapes de la section suivante : il installe `curl` s'il manque, installe Node.js 24 s'il n'y a pas déjà un Node 20.9 ou plus récent, télécharge l'archive du site dans `dist/` et vérifie les sommes SHA-256 des deux téléchargements. On peut le relancer sans risque.

### Sans le script

En root :

```bash
# 1. curl et certificats
apt-get update
apt-get install -y --no-install-recommends curl ca-certificates

# 2. Node.js 24 : seul le binaire node est nécessaire (pas npm)
cd /tmp
curl -fsSLO https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt
FILE=$(awk '/linux-x64\.tar\.gz$/ {print $2}' SHASUMS256.txt)
curl -fsSLO https://nodejs.org/dist/latest-v24.x/$FILE
grep " $FILE\$" SHASUMS256.txt | sha256sum -c -
tar -xzf $FILE -C /usr/local/bin --strip-components=2 ${FILE%.tar.gz}/bin/node
rm $FILE SHASUMS256.txt
node -v

# 3. Le site compilé (dans le dossier du projet)
cd /chemin/vers/le/projet
curl -fsSLO https://github.com/Siin0pe/transcript-app/releases/download/v2.0.0/transcript-app.tar.gz
mkdir dist && tar -xzf transcript-app.tar.gz -C dist && rm transcript-app.tar.gz

# 4. Lancement
cd dist && HOSTNAME=0.0.0.0 node server.js
```

L'archive peut aussi se télécharger à la main depuis un navigateur : https://github.com/Siin0pe/transcript-app/releases/download/v2.0.0/transcript-app.tar.gz (SHA-256 : `6afd413cfed97130fbc1312c42ad72ca8cb148ebcb5a316e1f5fded1396cb804`).

Le site répond sur le port 3000. Pour un autre port : `PORT=8080 HOSTNAME=0.0.0.0 node server.js`. `HOSTNAME=0.0.0.0` le rend accessible depuis les autres machines. Il n'y a ni `.env` ni base de données à configurer : le fichier SQLite `dist/transcript.db` est créé au premier affichage de la page.

**Micro depuis une autre machine** : le navigateur n'autorise le micro qu'en HTTPS ou sur `localhost`. Si la VM est ouverte via `http://<ip-vm>:3000`, la dictée est bloquée. Le plus simple est un tunnel SSH : `ssh -L 3000:localhost:3000 root@ip-vm`, puis ouvrir http://localhost:3000. La dictée demande aussi un navigateur avec WebGPU (Chrome ou Edge récents).

### Recompiler l'archive

Sur une machine avec Node.js et de la place : `npm ci && npm run bundle`, puis publier `transcript-app.tar.gz` dans une nouvelle release et mettre à jour `RELEASE` et `ARCHIVE_SHA256` dans `install.sh`.

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

**Serveur (10 / 10)** : server actions, base de données et configuration.

- `actions/notes.ts`, `actions/prefs.ts` (`"use server"`)
- `db/index.ts`, `db/schema.ts`, `db/init.sql`
- Configuration obligatoire avec Next.js et npm : `package.json`, `tsconfig.json`, `next.config.ts` (mode `standalone` pour la VM), `postcss.config.mjs`, `.npmrc` (évite le téléchargement CUDA d'`onnxruntime-node`, dépendance de `@remotion/whisper-webgpu`, inutile car Whisper tourne dans le navigateur)

**Hors quota** : ces fichiers ne contiennent pas de code du site.

| Fichier | Justification |
| --- | --- |
| `package-lock.json` | Généré automatiquement par npm |
| `.gitignore` | Exclusions Git |
| `install.sh` | Script d'installation sur la VM (Node.js et site compilé) |
| `README.md`, `AGENTS.md`, `rapport.pdf` | Documentation |
| `app/favicon.ico` | Icône, pas du code |
