"use client"

import { Check, Mic, Pencil, Trash2 } from "lucide-react"
import { cn } from "cn"

import type { NoteItem } from "@/components/notes-board"
import { Button } from "@/components/ui/button"
import { dictionaries, type Lang } from "@/lib/i18n"

interface Props {
  lang: Lang
  note: NoteItem
  isEditing: boolean
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export function NoteCard({ lang, note, isEditing, isDeleting, onEdit, onDelete }: Props) {
  const t = dictionaries[lang]

  return (
    <article
      className={cn(
        "group flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors desk:hover:border-ring",
        isEditing && "border-foreground desk:hover:border-foreground"
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 leading-7 font-semibold wrap-anywhere mob:text-base">{note.title}</h3>
        <div className="-mr-1.5 flex shrink-0 gap-1 transition-opacity mob:-my-2 mob:gap-2 desk:opacity-50 desk:group-hover:opacity-100">
          <Button variant="ghost" size="icon-sm" title={t.edit} onClick={onEdit}>
            <Pencil />
          </Button>
          {isDeleting ? (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Check />
              {t.confirmRemove}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              title={t.remove}
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {note.content && (
        <p className="line-clamp-2 text-sm text-muted-foreground mob:line-clamp-3 mob:text-base">{note.content}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{note.date}</span>
        {note.tagName && (
          <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-foreground">
            {note.tagName}
          </span>
        )}
        {note.dictated && (
          <span className="inline-flex h-5 items-center gap-1 rounded-full border px-2">
            <Mic className="size-3" />
            {t.dictated}
          </span>
        )}
      </div>
    </article>
  )
}
