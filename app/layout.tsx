import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
  
const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center border-b bg-background">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 lg:px-6">
              <h1 className="text-lg font-medium tracking-tight">
                Transcript<span className="bg-linear-to-r from-indigo-500 to-pink-500 bg-clip-text font-semibold text-transparent">.IO</span>
              </h1>
              <ModeToggle />
            </div>
          </header>
          {children}
          <footer className="flex h-12 shrink-0 items-center justify-center border-t px-4 text-xs text-muted-foreground">
            <span>
              © 2026{" "}
              <Link
                href="https://github.com/Siin0pe"
                className="font-medium text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-80 transition-opacity"
              >
                Siin0pe
              </Link>
            </span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
