import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const schemaPath = path.resolve(__dirname, "../../schema.sql");
  const schemaSql = await readFile(schemaPath, "utf8");
  await db.query(schemaSql);
  console.log("Database schema ensured");
}
