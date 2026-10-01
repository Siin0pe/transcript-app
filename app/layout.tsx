import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
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
            <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <h1 className="text-base font-medium tracking-tight text-slate-900 dark:text-white flex items-center">
                Transcript<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">.IO</span>
              </h1>
              <div className="ml-6 hidden items-center gap-2 sm:flex">
                <Button variant="ghost">Ghost</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ModeToggle/>
              </div>
            </div>
          </header>
          {children}
          <footer className="flex h-12 shrink-0 items-center justify-center border-t px-4 text-xs text-muted-foreground">
            <span>
              © 2026{" "}
              <Link
                href="https://github.com/Siin0pe"
                className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-80 transition-opacity"
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
