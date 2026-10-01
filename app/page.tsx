import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <main className="flex w-full max-w-6xl flex-1 flex-col gap-6 self-center px-4 py-4 sm:py-6 md:flex-row md:items-start lg:px-6">
      {/* Notes list: below the editor on mobile, sticky left column from md */}
      <section className="order-last flex flex-col gap-3 md:sticky md:top-18 md:order-first md:max-h-[calc(100svh-6rem)] md:w-72 md:shrink-0 md:overflow-y-auto lg:w-80">
        <div className="flex h-8 items-center">
          <h2 className="text-base font-semibold tracking-tight">Mes notes</h2>
        </div>
        <div className="flex flex-col gap-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Titre de la note</CardTitle>
              <CardDescription className="line-clamp-2">Aperçu du contenu…</CardDescription>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Titre de la note</CardTitle>
              <CardDescription className="line-clamp-2">Aperçu du contenu…</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Note editor */}
      <section className="flex min-w-0 flex-col gap-3 md:flex-1">
        <div className="flex h-8 items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-tight">Nouvelle note</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-4">
            {/* Titre, dictée, contenu */}
          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            {/* Enregistrer, Annuler */}
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
