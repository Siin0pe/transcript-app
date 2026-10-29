import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"

import "./globals.css"
import { Header } from "@/components/header"
import { dictionaries } from "@/lib/i18n"
import { getPrefs } from "@/actions/prefs"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

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
      className={`antialiased font-sans ${geist.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-svh flex-col desk:min-w-5xl mob:mx-auto mob:w-full mob:max-w-md mob:sm:border-x">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Header lang={lang} view={view} />
          {children}
          <footer className="border-t px-4 py-4 text-center text-sm text-muted-foreground">
            © 2026 Siin0pe · {t.credit}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
