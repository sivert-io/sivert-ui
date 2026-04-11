import express from "express";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import authRoutes from "./modules/auth/auth.routes.js";
import { sessionMiddleware } from "./middleware/session.middleware.js";
import { config } from "./config.js";
import inviteRoutes from "./modules/invites/invite.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import lobbyRoutes from "./modules/lobbies/lobby.routes.js";
import friendRoutes from "./modules/friends/friend.routes.js";
import hostRoutes from "./modules/hosts/host.routes.js";

export const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", config.APP_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(sessionMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/auth", authRoutes);

app.get("/protected", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

app.use("/invites", inviteRoutes);
app.use("/notifications", notificationRoutes);
app.use("/lobbies", lobbyRoutes);
app.use("/friends", friendRoutes);
app.use("/hosts", hostRoutes);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid request",
        details: err.flatten(),
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  },
);
