import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { logger } from "../lib/logger";

const verifyRouter: IRouter = Router();
const certificateIdPattern = /^[A-Za-z0-9-]{6,40}$/;
const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ valid: false }),
});

let firestore: Firestore | undefined;

function getVolunteerCollection() {
  if (!firestore) {
    const requiredEnv = (name: string) => {
      const value = process.env[name];
      if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
      }
      return value;
    };

    const app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert({
              projectId: requiredEnv("FIREBASE_PROJECT_ID"),
              clientEmail: requiredEnv("FIREBASE_CLIENT_EMAIL"),
              privateKey: requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
            }),
          });
    firestore = getFirestore(app);
  }

  return firestore.collection("Volunteer_Data");
}

verifyRouter.get("/:id", verifyRateLimit, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !certificateIdPattern.test(id)) {
    return res.status(400).json({ valid: false });
  }

  try {
    const collection = getVolunteerCollection();
    const snapshot = await collection.where("id", "==", id).limit(1).get();
    const record =
      snapshot.docs[0]?.data() ??
      (await collection.doc(id).get()).data();

    if (
      !record ||
      record.id !== id ||
      typeof record.name !== "string" ||
      !record.name.trim()
    ) {
      return res.json({ valid: false });
    }

    return res.json({
      valid: true,
      id: record.id,
      name: record.name.trim(),
    });
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "unknown";
    logger.error({ errorCode }, "Certificate verification lookup failed");
    return res.status(500).json({ valid: false });
  }
});

export { verifyRouter };
