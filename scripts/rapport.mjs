import { mkdirSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "playwright-core"

const BASE_URL = process.env.SITE_URL ?? "http://localhost:3000"
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium"
const PROXY = process.env.https_proxy ?? process.env.HTTPS_PROXY
const SHOTS = join(tmpdir(), "transcript-rapport")
mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    "--enable-unsafe-webgpu",
    "--use-webgpu-adapter=swiftshader",
    "--enable-features=Vulkan",
  ],
  proxy: PROXY ? { server: PROXY, bypass: "localhost,127.0.0.1" } : undefined,
})

async function openPage({ lang = "fr", view = "desktop" } = {}) {
  const mobile = view === "mobile"
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 860 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    locale: lang === "fr" ? "fr-FR" : "en-GB",
    permissions: ["microphone"],
  })
  const host = new URL(BASE_URL).hostname
  await context.addCookies([
    { name: "lang", value: lang, domain: host, path: "/" },
    { name: "view", value: view, domain: host, path: "/" },
  ])
  await context.addInitScript(() => localStorage.setItem("theme", "light"))
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  return page
}

async function shot(page, name, options = {}) {
  const path = join(SHOTS, name + ".jpg")
  const target = options.element ? page.locator(options.element) : page
  await target.screenshot({ path, type: "jpeg", quality: 75, fullPage: options.fullPage, animations: "disabled" })
  return path
}

const figures = {}

let page = await openPage()
figures.home = await shot(page, "home", { fullPage: true })

await page.getByLabel("Titre").fill("Réunion de projet")
await page.getByLabel("Contenu").fill("Points à voir : maquette de la page d'accueil, traduction anglaise et version mobile.")
figures.form = await shot(page, "form", { element: "#editor" })

await page.getByRole("button", { name: "Dicter" }).click()
await page.getByText("Téléchargement du modèle").waitFor()
await page.waitForTimeout(1500)
figures.loading = await shot(page, "loading", { element: "#editor form" })
await page.getByText("Enregistrement en cours").waitFor({ timeout: 180000 })
await page.waitForTimeout(3200)
figures.recording = await shot(page, "recording", { element: "#editor form" })
await page.getByRole("button", { name: "Arrêter" }).click()
await page.getByText("Transcription en cours").waitFor()
figures.transcribing = await shot(page, "transcribing", { element: "#editor form" })
await page.context().close()

page = await openPage()
await page.getByTitle("Modifier").nth(1).click()
await page.getByTitle("Supprimer").nth(2).click()
await page.evaluate(() => window.scrollTo(0, 0))
figures.edit = await shot(page, "edit", { fullPage: true })
await page.context().close()

page = await openPage({ lang: "en" })
figures.english = await shot(page, "english", { fullPage: true })
await page.context().close()

page = await openPage({ view: "mobile" })
figures.mobile = await shot(page, "mobile")
await page.getByTitle("Menu").click()
figures.menu = await shot(page, "menu")
await page.context().close()

page = await openPage({ lang: "en", view: "mobile" })
figures.mobileEnglish = await shot(page, "mobile-en")
await page.context().close()

const img = (name) => "data:image/jpeg;base64," + readFileSync(figures[name]).toString("base64")

const figure = (name, caption, height = "9cm") => `
  <figure><img src="${img(name)}" style="max-height:${height}"><figcaption>${caption}</figcaption></figure>`

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 1.6cm 1.8cm; }
  body { font: 10.5pt/1.45 "DejaVu Sans", Arial, sans-serif; color: #111; }
  h1 { font-size: 20pt; margin: 0 0 4pt; }
  h2 { font-size: 13.5pt; margin: 14pt 0 4pt; border-bottom: 2px solid #111; padding-bottom: 2pt; }
  h3 { font-size: 11pt; margin: 10pt 0 2pt; }
  p, ul { margin: 0 0 6pt; }
  ul { padding-left: 16pt; }
  code { font-family: "DejaVu Sans Mono", monospace; font-size: 9pt; }
  figure { margin: 8pt 0; text-align: center; break-inside: avoid; }
  figure img { max-width: 100%; border: 1px solid #999; }
  figcaption { font-size: 9pt; color: #444; margin-top: 3pt; }
  .row { display: flex; gap: 10pt; justify-content: center; break-inside: avoid; }
  .row figure { flex: 1; }
  .break { break-before: page; }
</style>
</head>
<body>
<h1>Transcript.IO</h1>
<p>Transcript.IO est un site de prise de notes. On peut écrire une note au clavier ou la dicter au micro. La dictée est transcrite par Whisper directement dans le navigateur. Les notes sont enregistrées dans une base de données.</p>

<h2>1. Technologies utilisées</h2>
<p>J'ai fait le site avec <b>Next.js 16</b> (React et TypeScript). Next.js permet d'avoir la partie client et la partie serveur dans le même projet : la lecture et les modifications des notes passent par des <i>Server Actions</i>, rangées dans le dossier <code>actions/</code>.</p>
<p>Le style est fait avec <b>Tailwind CSS</b>, avec quelques composants de base de shadcn/ui (bouton, champ, liste déroulante). Le design s'inspire du site de la série <i>Cyberpunk: Edgerunners</i> : fond jaune, blocs noirs, titres condensés en majuscules.</p>
<p>La base de données est <b>SQLite</b>, utilisée avec Drizzle ORM. La base est un simple fichier créé au premier lancement à partir de <code>db/init.sql</code>, il n'y a donc pas de serveur de base de données à installer. Elle contient 2 tables :</p>
<ul>
  <li><code>tags</code> : id, name_fr, name_en (les étiquettes, avec leur nom dans les deux langues) ;</li>
  <li><code>notes</code> : id, title, content, dictated, tag_id, created_at, updated_at.</li>
</ul>
<p>Le site fait un SELECT avec une jointure pour afficher la liste des notes, et des INSERT, UPDATE et DELETE pour ajouter, modifier et supprimer une note.</p>
<p><b>Nombre de fichiers.</b> La partie client contient 15 fichiers : <code>app/layout.tsx</code>, <code>app/page.tsx</code>, <code>app/globals.css</code>, 5 composants dans <code>components/</code>, 5 composants dans <code>components/ui/</code>, <code>hooks/use-whisper.ts</code> et <code>lib/i18n.ts</code>. La partie serveur contient 10 fichiers : <code>actions/notes.ts</code>, <code>actions/prefs.ts</code>, les 3 fichiers de <code>db/</code>, et 5 fichiers de configuration obligatoires avec Next.js et npm (<code>package.json</code>, <code>tsconfig.json</code>, <code>next.config.ts</code>, <code>postcss.config.mjs</code>, <code>.npmrc</code>). Le fichier <code>package-lock.json</code> est généré par npm, et <code>scripts/rapport.mjs</code> sert seulement à générer ce rapport.</p>
<p><b>Installation sur la VM.</b> Compiler le site demande environ 1,5 Go, plus que les 500 Mo de la VM. Le site est donc compilé à l'avance en mode <i>standalone</i> de Next.js et publié sur GitHub. Le script <code>install.sh</code> installe Node.js et télécharge cette version compilée : environ 170 Mo au total (détails dans le README).</p>

<h2 class="break">2. Utilisation du site</h2>
<h3>La page principale</h3>
<p>Le site tient sur une seule page. En haut, il y a le titre et trois boutons : <b>EN</b> pour passer le site en anglais, <b>Version mobile</b> pour passer à la version téléphone, et un bouton pour le thème sombre. En dessous, il y a le formulaire pour écrire une note, puis la liste des notes, de la plus récente à la plus ancienne.</p>
${figure("home", "Figure 1 : version bureau en français, avec les boutons de l'en-tête", "10cm")}
<h3>Ajouter une note</h3>
<p>On écrit un titre (obligatoire), on choisit une étiquette si on veut (Cours, Idées, Réunion ou Perso), puis on écrit le contenu. On clique ensuite sur <b>Enregistrer</b> : la note est ajoutée dans la base et apparaît en haut de la liste.</p>
${figure("form", "Figure 2 : formulaire rempli avant l'enregistrement", "5.5cm")}

<h3 class="break">Dicter une note</h3>
<p>Le bouton <b>Dicter</b> lance la dictée. La première fois, le modèle Whisper est téléchargé (une seule fois, il est gardé en cache). Le navigateur demande ensuite l'autorisation d'utiliser le micro. On parle, puis on clique sur <b>Arrêter</b>. Le texte est ajouté à la fin du contenu et la note est marquée « dictée ».</p>
${figure("loading", "Figure 3 : téléchargement du modèle", "5.5cm")}
${figure("recording", "Figure 4 : enregistrement en cours", "5.5cm")}
${figure("transcribing", "Figure 5 : transcription", "5.5cm")}

<h3 class="break">Modifier ou supprimer une note</h3>
<p>Le crayon sur une note la charge dans le formulaire, qui passe en « Modifier la note ». Il suffit de changer ce qu'on veut puis d'enregistrer. La corbeille devient un bouton <b>Confirmer</b> : il faut cliquer une deuxième fois pour supprimer, ce qui évite de supprimer une note par erreur.</p>
${figure("edit", "Figure 6 : modification d'une note et confirmation de suppression", "18cm")}

<h3 class="break">Version anglaise</h3>
<p>Le bouton <b>EN</b> traduit tout le site, y compris les dates et les noms des étiquettes. Il devient <b>FR</b> pour revenir en français. Le choix est gardé dans un cookie.</p>
${figure("english", "Figure 7 : version bureau en anglais", "20cm")}

<h3 class="break">Version mobile</h3>
<p>La version mobile s'affiche sur une seule colonne, avec des boutons plus grands. Les réglages (langue, thème, retour à la version bureau) sont dans un menu caché qu'on ouvre avec le bouton ☰. Sans choix, le site s'adapte tout seul à la largeur de l'écran.</p>
<div class="row">
  ${figure("mobile", "Figure 8 : mobile, français", "13cm")}
  ${figure("menu", "Figure 9 : menu ouvert", "13cm")}
  ${figure("mobileEnglish", "Figure 10 : mobile, anglais", "13cm")}
</div>

<h2 class="break">3. Détails techniques</h2>
<h3>Le bouton mobile / bureau</h3>
<p>Le site est écrit « mobile d'abord » avec Tailwind : les classes de base sont pour le téléphone, et les classes de taille plus grande ajoutent la version bureau. Une media query comme <code>md:</code> ne dépend que de la largeur de l'écran : un bouton ne peut pas forcer la version mobile sur un ordinateur. J'ai donc utilisé les <i>container queries</i> de Tailwind : toute la page est dans un conteneur (<code>@container</code>), et les classes <code>@3xl:</code> s'appliquent quand ce conteneur fait au moins 48rem de large. Sans choix, le conteneur prend la largeur de l'écran et le site est responsive normalement. Le bouton enregistre le choix dans un cookie, et le serveur donne au conteneur une largeur de téléphone (<code>max-w-md</code>) ou d'ordinateur (<code>min-w-5xl</code>). Les couleurs sont les variables de shadcn/ui (<code>--background</code>, <code>--primary</code>…), redéfinies pour les thèmes clair et sombre. La langue marche aussi avec un cookie, ce qui permet de traduire ce qui est généré côté serveur, comme les dates.</p>
<h3>La dictée avec Whisper dans le navigateur</h3>
<p>J'ai choisi de faire tourner Whisper dans le navigateur plutôt que d'envoyer l'audio à une API : pas de clé payante, pas de serveur d'IA, et l'audio reste sur l'ordinateur. J'ai utilisé la bibliothèque <code>browser-whisper</code>, en me basant sur sa documentation et son exemple Next.js. Le code est dans <code>hooks/use-whisper.ts</code>. Les principales difficultés :</p>
<ul>
  <li><b>Le modèle pèse environ 64 Mo.</b> Il est téléchargé au premier clic sur « Dicter », puis gardé en cache par le navigateur.</li>
  <li><b>L'isolation de la page.</b> Le WebAssembly multi-thread demande les en-têtes <code>Cross-Origin-Opener-Policy</code> et <code>Cross-Origin-Embedder-Policy</code>, que j'ai ajoutés dans <code>next.config.ts</code>.</li>
  <li><b>Le format de l'audio.</b> Whisper attend du son mono à 16 kHz. Je décode l'enregistrement du micro avec un <code>AudioContext</code> réglé à 16 kHz, qui fait la conversion tout seul.</li>
  <li><b>La barre de téléchargement reculait parfois.</b> Je garde donc toujours la plus grande valeur reçue.</li>
</ul>
<p>Sources : documentation de browser-whisper (whisper.tanpreet.xyz/docs) et son exemple Next.js (github.com/tanpreetjolly/browser-whisper-nextjs-demo) ; article sur COOP et COEP sur web.dev (web.dev/articles/coop-coep).</p>
</body>
</html>`

const pdfPage = await browser.newPage()
await pdfPage.setContent(html, { waitUntil: "load" })
await pdfPage.pdf({ path: "rapport.pdf", format: "A4", printBackground: true })
await browser.close()
console.log("rapport.pdf généré")
