import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1),

  APP_ORIGIN: z.string().url(),
  API_ORIGIN: z.string().url(),

  STEAM_REALM: z.string().url(),
  STEAM_RETURN_URL: z.string().url(),
  STEAM_API_KEY: z.string().min(1),

  SESSION_COOKIE_NAME: z.string().default("sid"),
  SESSION_TTL_DAYS: z.coerce.number().default(30),
});

export const config = envSchema.parse(process.env);

export const isProd = config.NODE_ENV === "production";
