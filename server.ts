import { Elysia } from "elysia";
import { Database } from "bun:sqlite";

const db = new Database("sqlite.db");

db.run(`
  CREATE TABLE IF NOT EXISTS greeting (
    id INTEGER PRIMARY KEY,
    name TEXT DEFAULT 'Enosta'
  );
  INSERT OR IGNORE INTO greeting (id, name) VALUES (1, 'Enosta');
`);

const app = new Elysia()
  .get("/greeting", () => {
    const row = db.query("SELECT name FROM greeting WHERE id = 1").get();
    return row;
  })
  .post("/greeting", ({ body }) => {
    const { name } = body as { name: string };
    db.query("UPDATE greeting SET name = ? WHERE id = 1").run(name);
    return { name };
  })
  .delete("/greeting", () => {
    db.query('UPDATE greeting SET name = "Enosta" WHERE id = 1').run();
    return { name: "Enosta" };
  })
  .listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
