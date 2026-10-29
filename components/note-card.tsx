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
        "flex flex-col gap-3 border-2 border-border p-5 text-foreground",
        isEditing && "panel border-cyan",
        isDeleting && "border-red"
      )}
    >
      <div className="flex items-start gap-3">
        <h3 className="min-w-0 flex-1 font-heading text-3xl leading-[0.9] font-extrabold wrap-anywhere uppercase">
          {note.title}
        </h3>
        <div className="-mt-1 -mr-1 flex shrink-0 gap-1 mob:gap-2">
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
              className="hover:bg-red hover:text-white"
              title={t.remove}
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {note.content && <p className="line-clamp-3 leading-snug font-medium opacity-80">{note.content}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-sm font-semibold uppercase">
        <span className="mr-auto tracking-wide opacity-70">{note.date}</span>
        {note.tagName && (
          <span className="bg-primary px-2 py-0.5 tracking-wider text-primary-foreground">{note.tagName}</span>
        )}
        {note.dictated && (
          <span className="inline-flex items-center gap-1 bg-cyan px-2 py-0.5 tracking-wider text-ink">
            <Mic className="size-3.5" />
            {t.dictated}
          </span>
        )}
      </div>
    </article>
  )
}
