"use client"

import { useEffect, useState } from "react"
import { Languages, Menu, Monitor, Moon, Smartphone, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"

import { setLang, setView } from "@/actions/prefs"
import { Button } from "@/components/ui/button"
import { dictionaries, type Lang } from "@/lib/i18n"

interface Props {
  lang: Lang
}

export function Header({ lang }: Props) {
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

  function chooseView(view: "mobile" | "desktop") {
    closeMenu()
    setView(view)
  }

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b-4 border-rose-600 bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <a
          href="#editor"
          className="font-heading text-3xl font-extrabold text-yellow-300 uppercase"
        >
          Transcript<span className="text-rose-600">.IO</span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" title={t.switchLangLabel} onClick={toggleLang}>
            <Languages />
            {t.switchLangShort}
          </Button>
          <Button variant="outline" onClick={() => chooseView("mobile")}>
            <Smartphone />
            {t.toMobile}
          </Button>
          <Button variant="outline" size="icon" title={t.themeToggle} onClick={toggleTheme}>
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="md:hidden" title={t.menu} onClick={() => setMenuOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </div>

      {menuOpen && (
        <div className="fixed inset-y-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-neutral-950/70" onClick={closeMenu} />

          <nav className="absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col gap-8 border-l-4 border-yellow-300 bg-neutral-950 p-5 text-neutral-100">
            <div className="flex items-center justify-between">
              <span className="font-heading text-3xl font-extrabold text-yellow-300 uppercase">{t.menu}</span>
              <Button variant="ghost" size="icon" title={t.closeMenu} onClick={closeMenu}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex flex-col">
              <a
                href="#editor"
                className="flex min-h-14 items-center border-b border-yellow-300/30 font-heading text-2xl font-bold uppercase hover:text-yellow-300"
                onClick={closeMenu}
              >
                {t.newNote}
              </a>
              <a
                href="#notes"
                className="flex min-h-14 items-center border-b border-yellow-300/30 font-heading text-2xl font-bold uppercase hover:text-yellow-300"
                onClick={closeMenu}
              >
                {t.myNotes}
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase">{t.settings}</span>
              <Button variant="outline" className="justify-start" onClick={toggleLang}>
                <Languages />
                {t.switchLang}
              </Button>
              <Button variant="outline" className="justify-start" onClick={toggleTheme}>
                {isDark ? <Sun /> : <Moon />}
                {isDark ? t.themeLight : t.themeDark}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => chooseView("desktop")}>
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
