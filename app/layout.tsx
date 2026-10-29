import type { Metadata } from "next"
import { Rajdhani, Saira_Extra_Condensed } from "next/font/google"
import { ThemeProvider } from "next-themes"

import "./globals.css"
import { Header } from "@/components/header"
import { dictionaries } from "@/lib/i18n"
import { getPrefs } from "@/actions/prefs"

const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" })
const saira = Saira_Extra_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" })

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getPrefs()
  return { title: "Transcript.IO", description: dictionaries[lang].description }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { lang, view } = await getPrefs()
  const t = dictionaries[lang]

  return (
    <html
      lang={lang}
      data-view={view}
      suppressHydrationWarning
      className={`antialiased font-sans ${rajdhani.variable} ${saira.variable}`}
    >
      <body className="flex min-h-svh flex-col desk:min-w-5xl mob:mx-auto mob:w-full mob:max-w-md">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Header lang={lang} view={view} />
          {children}
          <footer className="mt-12 bg-ink px-4 py-5 text-center text-sm tracking-wide text-[#ece8d4] uppercase dark:border-t dark:border-yellow/30">
            © 2026{" "}
            <a
              href="https://github.com/Siin0pe"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-yellow underline-offset-4 hover:underline"
            >
              Siin0pe
            </a>{" "}
            · {t.credit}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
