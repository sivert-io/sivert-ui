import { Router } from "express";
import { db } from "../../db.js";
import { requireAuth } from "../../middleware/require-auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT id, type, title, body, data, read_at, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.user!.id],
    );

    return res.status(200).json({
      notifications: result.rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        data: row.data,
        readAt: row.read_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1
        AND user_id = $2
        AND read_at IS NULL
      RETURNING id
      `,
      [id, req.user!.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM notifications
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [id, req.user!.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/", requireAuth, async (req, res, next) => {
  try {
    await db.query(
      `
      DELETE FROM notifications
      WHERE user_id = $1
      `,
      [req.user!.id],
    );

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
