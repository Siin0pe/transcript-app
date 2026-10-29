import { getNotes } from "@/actions/notes"
import { getPrefs } from "@/actions/prefs"
import { NotesBoard } from "@/components/notes-board"

export default async function Page() {
  const { lang } = await getPrefs()
  const { notes, tags } = await getNotes(lang)

  return <NotesBoard lang={lang} notes={notes} tags={tags} />
}
