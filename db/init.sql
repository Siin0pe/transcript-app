CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  dictated INTEGER NOT NULL DEFAULT 0,
  tag_id INTEGER REFERENCES tags(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO tags (name_fr, name_en) VALUES
  ('Cours', 'Class'),
  ('Idées', 'Ideas'),
  ('Réunion', 'Meeting'),
  ('Perso', 'Personal');

INSERT INTO notes (title, content, dictated, tag_id, created_at, updated_at) VALUES
  ('Vocabulaire anglais, semaine 2', 'to reckon = estimer ; to shed light on = éclairer ; a caveat = une réserve ; to hinge on = dépendre de.', 0, 1, unixepoch() - 4 * 86400, unixepoch() - 4 * 86400),
  ('Courses', 'Pâtes, sauce tomate, parmesan, café, lessive. Passer à la pharmacie avant 19 h.', 1, 4, unixepoch() - 3 * 86400, unixepoch() - 3 * 86400),
  ('Idées pour le TP React', 'Utiliser useActionState pour afficher les erreurs de validation sans recharger. Tester le formulaire sans JS activé.', 0, 2, unixepoch() - 2 * 86400, unixepoch() - 2 * 86400),
  ('Réunion projet BAWE', 'Une seule page : éditeur et liste des notes. Max 15 fichiers client et 10 serveur. Whisper tiny dans le navigateur, pas de clé API.', 1, 3, unixepoch() - 86400, unixepoch() - 86400);
