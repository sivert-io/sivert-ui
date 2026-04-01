import { createRequire } from "module";
import { config } from "../config.js";

const require = createRequire(import.meta.url);
const SteamAuth = require("node-steam-openid");

export const steam = new SteamAuth({
  realm: config.STEAM_REALM,
  returnUrl: config.STEAM_RETURN_URL,
  apiKey: config.STEAM_API_KEY,
});
