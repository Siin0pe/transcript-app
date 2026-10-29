# Transcript.IO

Petit site de prise de notes. On écrit une note, ou on la dicte : la voix est transcrite par Whisper **directement dans le navigateur**, sans serveur d'IA ni clé d'API. Les notes et leurs étiquettes sont stockées dans une base SQLite.

- **Technologies** : Next.js 16 (React 19, TypeScript, Tailwind CSS 4), SQLite via Drizzle ORM et libSQL, dictée avec la bibliothèque `browser-whisper`.
- **Code source** : https://github.com/Siin0pe/transcript-app

## Sommaire

1. [Installation rapide sur la VM](#installation-rapide-sur-la-vm)
2. [Installation sur la VM en détail](#installation-sur-la-vm-en-détail)
3. [Dépannage](#dépannage)
4. [Développement sur sa machine](#développement-sur-sa-machine)
5. [Utilisation du site](#utilisation-du-site)
6. [Fonctionnement de la dictée](#fonctionnement-de-la-dictée)
7. [Base de données](#base-de-données)
8. [Organisation et répartition des fichiers](#organisation-et-répartition-des-fichiers)

## Installation rapide sur la VM

Sur une Debian x86_64 avec Internet, **sans être root**, dans le dossier du projet décompressé :

```bash
bash install.sh
cd dist && HOSTNAME=0.0.0.0 ./node server.js
```

Puis ouvrir http://localhost:3000 (ou `http://<ip-de-la-vm>:3000`). Pour arrêter le site : `Ctrl+C`.

Le reste de cette section explique ce que font ces commandes et comment les faire à la main.

## Installation sur la VM en détail

### Pourquoi le site est compilé à l'avance

La VM n'a que 500 Mo de disque. Or compiler un site Next.js demande environ 1,5 Go pendant l'installation : `node_modules` pèse 1,1 Go (Next.js seul fait 300 Mo avec son compilateur), plus le cache npm et Node.js lui-même. La compilation ne peut donc pas se faire sur la VM.

Le site est compilé une fois sur ma machine avec `npm run bundle`, en mode `standalone` de Next.js (voir `next.config.ts`). Ce mode ne garde que les fichiers nécessaires pour faire tourner le site, sans tout `node_modules`. Le résultat, `transcript-app.tar.gz`, est compilé à partir exactement du code de ce dépôt et publié dans la [release v2.2.0](https://github.com/Siin0pe/transcript-app/releases/tag/v2.2.0).

Je n'ai pas de GitHub Actions : l'archive est compilée sur ma machine et envoyée à la main dans la release (voir [Recompiler l'archive](#recompiler-larchive)).

Place occupée sur la VM :

| Élément | Taille |
| --- | --- |
| Site compilé (`transcript-app.tar.gz`, 13 Mo compressé) | 46 Mo |
| Node.js 24 (seulement le binaire `node`, sans npm) | 122 Mo |
| **Total** | **environ 170 Mo** |

Le modèle Whisper (environ 64 Mo) est téléchargé par le navigateur de la personne qui utilise le site, pas par la VM.

### Prérequis

- Debian 12 ou 13, processeur x86_64, accès Internet.
- `wget` (installé d'office sur une Debian standard) ou `curl`.
- **Pas besoin d'être root** : le site et Node.js sont installés dans le dossier `dist/` du projet, rien n'est écrit ailleurs.

Seul cas où il faut root : une Debian minimale qui n'a ni `wget`, ni `curl`, ni `unzip` (pour décompresser le rendu). Dans ce cas, en root :

```bash
apt-get update && apt-get install -y --no-install-recommends wget ca-certificates unzip
```

### Avec le script

Dans le dossier du projet décompressé :

```bash
bash install.sh
```

Le script `install.sh` :

1. utilise `curl` ou `wget`, selon ce qui est installé ;
2. télécharge le site compilé depuis la release v2.2.0, vérifie sa somme SHA-256 et l'extrait dans `dist/` ;
3. télécharge Node.js 24 depuis nodejs.org, vérifie sa somme SHA-256 et ne garde que le binaire `node`, copié dans `dist/node`.

On peut le relancer sans risque : il recrée `dist/` à chaque fois (ce qui remet aussi la base à zéro).

### Sans le script

Les mêmes étapes à la main, dans le dossier du projet décompressé. Avec `curl` au lieu de `wget`, remplacer `wget -q` par `curl -fsSLO`.

```bash
# 1. Le site compilé
wget -q https://github.com/Siin0pe/transcript-app/releases/download/v2.2.0/transcript-app.tar.gz
echo "0e2c288c449f83ee80e90ca81a342c2185a25ac0d3d5639d73e390a6c5bce164  transcript-app.tar.gz" | sha256sum -c -
mkdir dist && tar -xzf transcript-app.tar.gz -C dist && rm transcript-app.tar.gz

# 2. Node.js 24 : seul le binaire node est nécessaire (pas npm)
wget -q https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt
FILE=$(awk '/linux-x64\.tar\.gz$/ {print $2}' SHASUMS256.txt)
wget -q https://nodejs.org/dist/latest-v24.x/$FILE
grep " $FILE\$" SHASUMS256.txt | sha256sum -c -
tar -xzf $FILE -C dist --strip-components=2 ${FILE%.tar.gz}/bin/node
rm $FILE SHASUMS256.txt

# 3. Lancement
cd dist && HOSTNAME=0.0.0.0 ./node server.js
```

### Télécharger l'archive depuis un navigateur

L'archive du site compilé est publique et se télécharge aussi directement :

- Lien : https://github.com/Siin0pe/transcript-app/releases/download/v2.2.0/transcript-app.tar.gz
- SHA-256 : `0e2c288c449f83ee80e90ca81a342c2185a25ac0d3d5639d73e390a6c5bce164`

Il suffit ensuite de l'extraire dans `dist/` (étape 1 ci-dessus, sans le `wget`) et de faire les étapes 2 et 3.

### Lancer le site

Depuis le dossier `dist/` :

```bash
HOSTNAME=0.0.0.0 ./node server.js
```

- Le site répond sur le **port 3000**. Pour un autre port : `PORT=8080 HOSTNAME=0.0.0.0 ./node server.js`.
- `HOSTNAME=0.0.0.0` rend le site accessible depuis les autres machines (sinon il peut n'écouter que sur le nom de la machine).
- Pour le laisser tourner après la fermeture du terminal : `nohup env HOSTNAME=0.0.0.0 ./node server.js > site.log 2>&1 &`
- Il n'y a ni `.env` ni base de données à configurer : le fichier SQLite `dist/transcript.db` est créé au premier affichage de la page, avec quelques notes d'exemple.

### Accéder au site depuis un autre ordinateur

Le navigateur n'autorise le micro que sur une page en HTTPS ou sur `localhost`. Si la VM est ouverte via `http://<ip-de-la-vm>:3000`, le site marche mais **la dictée est bloquée**.

Le plus simple est un tunnel SSH depuis son ordinateur :

```bash
ssh -L 3000:localhost:3000 utilisateur@ip-de-la-vm
```

puis ouvrir http://localhost:3000 dans le navigateur de son ordinateur.

### Désinstaller

Tout est dans le dossier `dist/` : il suffit de le supprimer (`rm -rf dist`).

### Recompiler l'archive

Sur une machine avec Node.js 20.9 ou plus récent et environ 2 Go libres :

```bash
npm ci
npm run bundle    # compile et crée transcript-app.tar.gz
sha256sum transcript-app.tar.gz
```

Puis publier `transcript-app.tar.gz` dans une nouvelle release GitHub, et mettre à jour `RELEASE` et `ARCHIVE_SHA256` en haut de `install.sh` (et les liens de ce README).

## Dépannage

| Problème | Solution |
| --- | --- |
| `Ni curl ni wget n'est installé` | En root : `apt-get install -y wget ca-certificates`, puis relancer `bash install.sh`. |
| Erreur de certificat pendant le téléchargement | Le paquet `ca-certificates` manque : en root, `apt-get install -y ca-certificates`. |
| `sha256sum: WARNING: ... did NOT match` | Le téléchargement est incomplet ou modifié : relancer `bash install.sh`. |
| `EADDRINUSE` au lancement | Le port 3000 est déjà pris : lancer avec `PORT=8080`. |
| Le site ne répond pas depuis une autre machine | Vérifier `HOSTNAME=0.0.0.0` dans la commande de lancement. |
| La dictée ne démarre pas, micro refusé | La page n'est ni en HTTPS ni sur `localhost` : utiliser le tunnel SSH ci-dessus. |
| Message `WebGPU initialization failed ... Falling back to WASM` dans la console | Normal : le navigateur n'a pas WebGPU (Firefox par exemple), la dictée passe en WebAssembly. |
| La première dictée est lente | Le modèle (environ 64 Mo) est téléchargé une seule fois, puis gardé en cache. |
| Remettre les notes d'exemple | Arrêter le site, supprimer `dist/transcript.db`, relancer. |

## Développement sur sa machine

Il faut Node.js 20.9 ou plus récent avec npm (https://nodejs.org) et environ 2 Go libres.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. Au premier affichage, `transcript.db` est créé à la racine du projet à partir de `db/init.sql`.

Version de production en local :

```bash
npm run bundle
npm start          # lance .next/standalone/server.js
```

Régénérer `rapport.pdf` (captures prises avec Playwright sur le site lancé, base remise à zéro avant) :

```bash
SITE_URL=http://localhost:3000 npm run rapport
```

Le script utilise le Chromium de la machine (`/usr/bin/chromium`, ou le chemin donné dans `CHROMIUM_PATH`).

## Utilisation du site

- **Écrire une note** : remplir le titre, choisir une étiquette si besoin, écrire le contenu puis cliquer sur « Enregistrer ».
- **Dicter** : cliquer sur « Dicter » et choisir la langue de la dictée. La première fois, le modèle Whisper est téléchargé puis gardé en cache par le navigateur. Le navigateur demande l'accès au micro. Parler, puis cliquer sur « Arrêter » : le texte s'ajoute à la fin du contenu et la note est marquée « dictée ».
- **Modifier** une note : icône crayon sur la carte. **Supprimer** : icône corbeille puis « Confirmer ».
- **Langue** : bouton « EN » / « FR » dans l'en-tête (ou dans le menu en version mobile).
- **Version mobile / bureau** : le site s'adapte à la largeur de l'écran. Le bouton « Version mobile » (en-tête) ou « Version bureau » (menu) force l'autre version, retenue dans un cookie. Choisir la version qui correspond à l'écran supprime le cookie et le site redevient responsive.
- **Thème clair / sombre** : bouton soleil / lune.

## Fonctionnement de la dictée

- La dictée utilise le modèle **Whisper tiny** (environ 64 Mo) avec la bibliothèque `browser-whisper`. Tout se passe dans le navigateur : l'audio ne quitte pas l'ordinateur.
- Le modèle tourne sur la **carte graphique via WebGPU** quand le navigateur le permet (Chrome, Edge récents). Sinon, `browser-whisper` passe tout seul en **WebAssembly** sur le processeur (Firefox par exemple), un peu plus lentement.
- Le WebAssembly multi-thread demande que la page soit « isolée » : `next.config.ts` ajoute les en-têtes `Cross-Origin-Opener-Policy` et `Cross-Origin-Embedder-Policy`.
- Le code est dans `hooks/use-whisper.ts` : enregistrement du micro avec `MediaRecorder`, conversion en son mono 16 kHz, puis transcription.

## Base de données

- Script de création et de remplissage initial : `db/init.sql` (tables `tags` et `notes`, et quelques notes d'exemple).
- Schéma utilisé par le code : `db/schema.ts`. Connexion : `db/index.ts`.
- Remettre la base à zéro en développement : arrêter le serveur, lancer `npm run db:reset`, puis relancer `npm run dev`. Sur la VM : supprimer `dist/transcript.db`.

## Organisation et répartition des fichiers

### Client (15 / 15)

| Fichier | Rôle |
| --- | --- |
| `app/layout.tsx` | En-tête et pied |
| `app/page.tsx` | Page d'accueil |
| `app/globals.css` | Styles et thèmes |
| `components/header.tsx` | En-tête et menu |
| `components/notes-board.tsx` | Page des notes |
| `components/note-card.tsx` | Carte d'une note |
| `components/note-editor.tsx` | Formulaire de note |
| `components/dictation.tsx` | Bloc de dictée |
| `components/ui/button.tsx` | Bouton |
| `components/ui/input.tsx` | Champ texte |
| `components/ui/label.tsx` | Libellé |
| `components/ui/select.tsx` | Liste déroulante |
| `components/ui/textarea.tsx` | Zone de texte |
| `hooks/use-whisper.ts` | Micro et Whisper |
| `lib/i18n.ts` | Textes FR et EN |

### Serveur (10 / 10)

| Fichier | Rôle |
| --- | --- |
| `actions/notes.ts` | Requêtes des notes |
| `actions/prefs.ts` | Langue et version |
| `db/index.ts` | Connexion SQLite |
| `db/schema.ts` | Schéma des tables |
| `db/init.sql` | Création de la base |
| `package.json` | Dépendances |
| `tsconfig.json` | Config TypeScript |
| `postcss.config.mjs` | Config Tailwind |
| `next.config.ts` | Config Next.js |
| `.npmrc` | Config npm |

### Hors quota (pas de code du site)

| Fichier | Rôle |
| --- | --- |
| `package-lock.json` | Généré par npm |
| `.gitignore` | Exclusions Git |
| `install.sh` | Installation VM |
| `scripts/rapport.mjs` | Génère le rapport |
| `README.md` | Documentation |
| `rapport.pdf` | Rapport |
| `app/favicon.ico` | Icône du site |
