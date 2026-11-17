export type SwipeDirection = "like" | "pass";
export function isMutualMatch(direction: SwipeDirection, profileLikedUser: boolean): boolean {
  return direction === "like" && profileLikedUser;
}

export function toPublicProfile(profile: any) {
  return {
    _id: profile._id.toString(),
    name: profile.name,
    age: profile.age,
    photo: profile.photo,
    bio: profile.bio,
    location: profile.location,
    interests: profile.interests
  };
}
