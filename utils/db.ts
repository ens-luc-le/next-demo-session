import Database from "better-sqlite3";

const db = new Database("sqlite.db");

export async function getGreeting() {
  return db.prepare("SELECT name FROM greeting WHERE id = 1").get() as { name: string };
}

export async function updateGreeting(name: string) {
  db.prepare("UPDATE greeting SET name = ? WHERE id = 1").run(name);

  return { name };
}

export async function deleteGreeting() {
  db.prepare('UPDATE greeting SET name = "Enosta" WHERE id = 1').run();
  return { name: "Enosta" };
}
