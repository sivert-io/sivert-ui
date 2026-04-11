import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/require-auth.js";
import { hostService } from "./host.service.js";

const router = Router();

const createApplicationSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
});

const createServerSchema = z.object({
  address: z.string().trim().min(1).max(255),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  displayName: z.string().trim().min(1).max(120),
  country: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  contact: z.string().trim().max(255).optional(),
});

const verifyServerSchema = z.object({
  token: z.string().trim().min(1),
  pluginVersion: z.string().trim().max(64).optional(),
});

const drainModeSchema = z.object({
  enabled: z.boolean(),
});

const heartbeatSchema = z.object({
  serverId: z.string().uuid(),
  token: z.string().trim().min(1),
  pluginVersion: z.string().trim().max(64).optional(),
  status: z.enum(["online", "offline", "idle", "in_match"]).optional(),
  payload: z.unknown().optional(),
});

const discoverSchema = z.object({
  address: z.string().trim().min(1).max(255),
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await hostService.getHostProfile(req.user!.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.post("/applications", requireAuth, async (req, res, next) => {
  try {
    const body = createApplicationSchema.parse(req.body);

    const profile = await hostService.createOrUpdateApplication({
      userId: req.user!.id,
      notes: body.notes ?? null,
    });

    return res.status(201).json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.post("/discover", requireAuth, async (req, res, next) => {
  try {
    const body = discoverSchema.parse(req.body);
    const location = await hostService.discoverServerLocation(body.address);

    return res.status(200).json({
      location: {
        resolvedIp: location.resolvedIp,
        country: location.country,
        region: location.region,
        port: location.port,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me/servers", requireAuth, async (req, res, next) => {
  try {
    const servers = await hostService.getServersForUser(req.user!.id);
    return res.status(200).json({ servers });
  } catch (error) {
    return next(error);
  }
});

router.post("/servers", requireAuth, async (req, res, next) => {
  try {
    const body = createServerSchema.parse(req.body);

    const server = await hostService.createServer({
      userId: req.user!.id,
      address: body.address,
      port: body.port ?? null,
      displayName: body.displayName,
      country: body.country ?? null,
      region: body.region ?? null,
      contact: body.contact ?? null,
    });

    return res.status(201).json({ server });
  } catch (error) {
    return next(error);
  }
});

router.get("/servers/:serverId", requireAuth, async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const result = await hostService.getServerForUser(req.user!.id, serverId);

    if (!result) {
      return res.status(404).json({ error: "Server not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/servers/:serverId/verify",
  requireAuth,
  async (req, res, next) => {
    try {
      const { serverId } = req.params;
      const body = verifyServerSchema.parse(req.body);

      const result = await hostService.verifyServer({
        userId: req.user!.id,
        serverId,
        token: body.token,
        pluginVersion: body.pluginVersion ?? null,
      });

      if (!result) {
        return res.status(404).json({ error: "Server not found" });
      }

      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(200).json({ server: result.server });
    } catch (error) {
      return next(error);
    }
  },
);

router.post("/servers/:serverId/token", requireAuth, async (req, res, next) => {
  try {
    const { serverId } = req.params;

    const server = await hostService.rotateServerToken({
      userId: req.user!.id,
      serverId,
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    return res.status(200).json({ server });
  } catch (error) {
    return next(error);
  }
});

router.post("/servers/:serverId/drain", requireAuth, async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const body = drainModeSchema.parse(req.body);

    const server = await hostService.setDrainMode({
      userId: req.user!.id,
      serverId,
      enabled: body.enabled,
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    return res.status(200).json({ server });
  } catch (error) {
    return next(error);
  }
});

router.post("/heartbeat", async (req, res, next) => {
  try {
    const body = heartbeatSchema.parse(req.body);

    const result = await hostService.recordHeartbeat({
      serverId: body.serverId,
      token: body.token,
      pluginVersion: body.pluginVersion ?? null,
      status: body.status,
      payload: body.payload,
    });

    if (!result) {
      return res.status(404).json({ error: "Server not found" });
    }

    if (!result.ok) {
      return res.status(401).json({ error: result.error });
    }

    return res.status(200).json({
      ok: true,
      server: result.server,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
