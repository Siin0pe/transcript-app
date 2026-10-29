"use client"

import { useEffect, useState } from "react"
import { Languages, Menu, Monitor, Moon, Smartphone, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"

import { setLang, setView } from "@/actions/prefs"
import { Button } from "@/components/ui/button"
import { dictionaries, type Lang, type View } from "@/lib/i18n"

interface Props {
  lang: Lang
  view: View
}

export function Header({ lang, view }: Props) {
  const t = dictionaries[lang]
  const { resolvedTheme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  function toggleLang() {
    setLang(lang === "fr" ? "en" : "fr")
  }

  function toggleView() {
    closeMenu()
    setView(view === "mobile" ? "desktop" : "mobile")
  }

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b bg-background mob:h-14">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 desk:px-6">
        <h1 className="text-lg font-medium tracking-tight mob:text-xl">
          <a href="#editor">
            Transcript
            <span className="bg-linear-to-r from-indigo-500 to-pink-500 bg-clip-text font-semibold text-transparent">
              .IO
            </span>
          </a>
        </h1>

        <div className="flex items-center gap-2 mob:hidden">
          <Button variant="outline" title={t.switchLangLabel} onClick={toggleLang}>
            <Languages />
            {t.switchLangShort}
          </Button>
          <Button variant="outline" onClick={toggleView}>
            <Smartphone />
            {t.toMobile}
          </Button>
          <Button variant="outline" size="icon" title={t.themeToggle} onClick={toggleTheme}>
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="desk:hidden" title={t.menu} onClick={() => setMenuOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </div>

      {menuOpen && (
        <div className="fixed inset-y-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 overflow-hidden desk:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

          <nav className="absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col gap-6 border-l bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{t.menu}</span>
              <Button variant="ghost" size="icon" title={t.closeMenu} onClick={closeMenu}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <a
                href="#editor"
                className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                onClick={closeMenu}
              >
                {t.newNote}
              </a>
              <a
                href="#notes"
                className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                onClick={closeMenu}
              >
                {t.myNotes}
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="px-1 text-xs font-medium text-muted-foreground uppercase">{t.settings}</span>
              <Button variant="outline" className="justify-start" onClick={toggleLang}>
                <Languages />
                {t.switchLang}
              </Button>
              <Button variant="outline" className="justify-start" onClick={toggleTheme}>
                {isDark ? <Sun /> : <Moon />}
                {isDark ? t.themeLight : t.themeDark}
              </Button>
              <Button variant="outline" className="justify-start" onClick={toggleView}>
                <Monitor />
                {t.toDesktop}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
