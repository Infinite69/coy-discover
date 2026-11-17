# Coy Discover

A standalone, mobile-first swipe discovery app for the Coy SDE Intern assignment. It includes 30 fictional profiles aged 18–26 with original AI-generated avatars, swipe gestures, mutual matching, a Matches view, and a MongoDB-backed Express API. It is an independent demo and is not affiliated with or endorsed by Coy.

## Stack

- Next.js and React frontend (`client/`)
- Node.js and Express API (`server/`)
- MongoDB through Mongoose
- Postman collection at `postman/Coy-Discover.postman_collection.json`

## Requirements

- Node.js 20 or newer and npm
- MongoDB running locally, or a MongoDB connection string

MongoDB Compass is only the database viewer. The MongoDB server must also be installed and running, or set `MONGODB_URI` to a MongoDB Atlas connection string.

## Run locally

1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` if your MongoDB connection differs from the local default.
3. Install dependencies in each project folder:

   ```sh
   npm install
   npm --prefix client install
   npm --prefix server install
   ```

4. Start the frontend and API together:

   ```sh
   npm run dev
   ```

The frontend runs at http://localhost:3000. The API runs at http://localhost:4000. Home is intentionally blank; Discover and Matches are implemented. On first start, the server seeds 30 profiles. When upgrading from the earlier celebrity demo, it replaces those profiles and clears the old demo swipes once. Seven fictional profiles have sample incoming likes so the mutual-match demo can be shown. All profiles, bios, likes, and match activity are fictional. Avatar portraits are AI-generated.

You can also start each app in a separate terminal with `npm run dev:client` and `npm run dev:server`.

## API

- `GET /feed` returns profiles that the demo user has not swiped on. The response never includes whether a profile already liked the user.
- `POST /swipe` accepts `{ "profileId": "<id>", "direction": "like" | "pass" }`. A repeated swipe returns `409`. `match` is true only for a like on a profile that previously liked the demo user; only then is `matchedProfile` included.
- `GET /matches` returns mutual likes only.
- `GET /health` reports API and MongoDB connection status.

Swipes are stored in MongoDB and survive refreshes. To restart the demo from scratch, clear the `coy_discover` database in MongoDB Compass; on the next API start it will seed the profiles again.

## Postman

Import `postman/Coy-Discover.postman_collection.json` into Postman. Run `GET /feed` first; it stores the first profile ID in a collection variable for the sample `POST /swipe` request.

## Demo data

The profile definitions are in `server/src/data/profiles.generated.ts`. The 30 AI-generated avatar crops are in `client/public/avatars/`.
