import { app } from "./app.js";
import { config } from "./config.js";
import { db } from "./db.js";

async function main() {
  await db.query("SELECT 1");

  app.listen(config.PORT, () => {
    console.log(`API running on ${config.API_ORIGIN}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
