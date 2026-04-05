// api/src/server.ts
import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { config } from "./config.js";
import { registerRealtime } from "./realtime/index.js";
import { initDb } from "./lib/init-db.js";

async function bootstrap() {
  await initDb();

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: config.APP_ORIGIN,
      credentials: true,
    },
  });

  registerRealtime(io);

  httpServer.listen(config.PORT, () => {
    console.log(`API listening on :${config.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
