import assert from "node:assert/strict";
import { test } from "node:test";
import { isMutualMatch, toPublicProfile } from "./domain.js";
import { seedProfiles } from "./data/profiles.generated.js";

test("only two likes create a match", () => {
  assert.equal(isMutualMatch("like", true), true);
  assert.equal(isMutualMatch("like", false), false);
  assert.equal(isMutualMatch("pass", true), false);
});

test("the feed-safe profile shape does not disclose incoming likes", () => {
  const profile = toPublicProfile({
    _id: "profile-1", name: "Aarav", age: 25, photo: "photo.jpg", bio: "Hello",
    location: "Mumbai", interests: ["Music"]
  });
  assert.deepEqual(Object.keys(profile).sort(), ["_id", "age", "bio", "interests", "location", "name", "photo"]);
  assert.equal("likedCurrentUser" in profile, false);
});

test("the demo has 30 or more profiles and incoming likes for match demos", () => {
  assert.ok(seedProfiles.length >= 30);
  assert.ok(seedProfiles.some((profile) => profile.likedCurrentUser));
});
