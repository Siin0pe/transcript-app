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
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <h1 className="text-base font-medium tracking-tight text-slate-900 dark:text-white flex items-center">
                Transcript<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">.IO</span>
              </h1>
              <div className="ml-6 flex items-center gap-2">
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
          <footer className="relative flex h-12 shrink-0 items-center justify-center px-4 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"> 
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span>© 2026 <Link href="https://github.com/Siin0pe" className="text-red-500 dark:text-red-300">Siin0pe</Link></span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
