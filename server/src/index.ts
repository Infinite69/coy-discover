import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedProfiles } from "./data/profiles.generated.js";
import { isMutualMatch, toPublicProfile } from "./domain.js";
import { Profile } from "./models/Profile.js";
import { Swipe } from "./models/Swipe.js";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const userId = "demo-user";

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/feed", async (_req, res, next) => {
  try {
    const swiped = await Swipe.find({ userId }).distinct("profileId");
    const profiles = await Profile.find({ _id: { $nin: swiped } }).sort({ createdAt: 1 }).lean();
    res.json({ profiles: profiles.map(toPublicProfile) });
  } catch (error) { next(error); }
});

app.post("/swipe", async (req, res, next) => {
  try {
    const { profileId, direction } = req.body ?? {};
    if (typeof profileId !== "string" || !mongoose.isValidObjectId(profileId)) {
      res.status(400).json({ error: "A valid profileId is required." }); return;
    }
    if (direction !== "like" && direction !== "pass") {
      res.status(400).json({ error: 'direction must be "like" or "pass".' }); return;
    }
    const profile = await Profile.findById(profileId).select("+likedCurrentUser");
    if (!profile) { res.status(404).json({ error: "Profile not found." }); return; }
    if (await Swipe.exists({ userId, profileId: profile._id })) {
      res.status(409).json({ error: "You have already swiped on this profile." }); return;
    }
    await Swipe.create({ userId, profileId: profile._id, direction });
    const match = isMutualMatch(direction, profile.likedCurrentUser);
    res.status(201).json({ match, ...(match ? { matchedProfile: toPublicProfile(profile) } : {}) });
  } catch (error: any) {
    if (error?.code === 11000) { res.status(409).json({ error: "You have already swiped on this profile." }); return; }
    next(error);
  }
});

app.get("/matches", async (_req, res, next) => {
  try {
    const likes = await Swipe.find({ userId, direction: "like" }).sort({ createdAt: -1 }).lean();
    const likedIds = likes.map((swipe) => swipe.profileId);
    const profiles = await Profile.find({ _id: { $in: likedIds }, likedCurrentUser: true }).select("+likedCurrentUser").lean();
    const byId = new Map<string, any>(profiles.map((profile: any) => [String(profile._id), profile]));
    const matches = likes.flatMap((swipe) => {
      const profile = byId.get(String(swipe.profileId));
      return profile ? [{ ...toPublicProfile(profile), matchedAt: swipe.createdAt }] : [];
    });
    res.json({ matches });
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API request failed:", error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is required. Copy .env.example to .env and configure it.");

  await mongoose.connect(mongoUri);
  const currentSeed = await Profile.exists({ name: seedProfiles[0].name, photo: seedProfiles[0].photo });
  if (!currentSeed) {
    await Swipe.deleteMany({ userId });
    await Profile.deleteMany({});
    await Profile.insertMany(seedProfiles);
    console.log(`Replaced demo data with ${seedProfiles.length} fictional AI-avatar profiles.`);
  }
  await Swipe.init();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start().catch((error: unknown) => {
  console.error("Could not start API:", error);
  process.exit(1);
});
