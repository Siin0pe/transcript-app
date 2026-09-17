import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const notes = mysqlTable("notes", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
