import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/require-auth.js";
import { pushService } from "./push.service.js";

const router = Router();

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

const deleteSubscriptionSchema = z.object({
  endpoint: z.string().url(),
});

router.get("/vapid-public-key", requireAuth, (_req, res) => {
  const publicKey = pushService.getPublicKey();

  if (!publicKey) {
    return res.status(503).json({
      error: "Push notifications are not configured",
    });
  }

  return res.status(200).json({
    publicKey,
  });
});

router.post("/subscriptions", requireAuth, async (req, res, next) => {
  try {
    if (!pushService.isConfigured()) {
      return res.status(503).json({
        error: "Push notifications are not configured",
      });
    }

    const parsed = subscriptionSchema.parse(req.body);

    await pushService.saveSubscription({
      userId: req.user!.id,
      subscription: parsed.subscription,
      userAgent: req.headers["user-agent"] ?? null,
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/subscriptions", requireAuth, async (req, res, next) => {
  try {
    const parsed = deleteSubscriptionSchema.parse(req.body);

    await pushService.deleteSubscription({
      userId: req.user!.id,
      endpoint: parsed.endpoint,
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/test", requireAuth, async (req, res, next) => {
  try {
    await pushService.sendToUser(req.user!.id, {
      kind: "lobby_invite",
      title: "FLOW test notification",
      body: "Push notifications are working on this device.",
      url: "/settings",
      tag: "flow-test-notification",
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
