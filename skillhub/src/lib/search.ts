import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { db } from "./firebase";
import type { SearchResult, TextSearchResult, SmartMatch, SmartMatchResult, UserProfile } from "@/types";

// Search nearby skills (with pagination and rating)
export async function searchNearbySkills(
  centerLat: number,
  centerLng: number,
  radiusInKm: number,
  categoryFilter: string,
  priceTypeFilter: string,
  minRatingFilter: number = 0,
  pageSize: number = 20,
  existingResults: SearchResult[] = []
): Promise<SearchResult[]> {
  const center: [number, number] = [centerLat, centerLng];
  const radiusInM = radiusInKm * 1000;

  const bounds = geohashQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = query(
      collection(db, "users"),
      orderBy("location.geohash"),
      startAt(b[0]),
      endAt(b[1])
    );
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);

  const results: SearchResult[] = [];
  const existingIds = new Set(existingResults.map((r) => r.id));

  for (const snap of snapshots) {
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const loc = data.location;

      if (!loc || !loc.latitude || !loc.longitude) continue;

      const distanceInKm = distanceBetween(
        [loc.latitude, loc.longitude],
        center
      );

      if (distanceInKm <= radiusInKm) {
        if (!data.skillsOffered || data.skillsOffered.length === 0) continue;

        if (categoryFilter) {
          const hasCategory = data.skillsOffered.some(
            (s: { category: string }) => s.category === categoryFilter
          );
          if (!hasCategory) continue;
        }

        if (priceTypeFilter) {
          const hasPriceType = data.skillsOffered.some(
            (s: { priceType: string }) => s.priceType === priceTypeFilter
          );
          if (!hasPriceType) continue;
        }

        // filter by minimum rating
        if (minRatingFilter > 0) {
          const userRating = data.averageRating || 0;
          if (userRating < minRatingFilter) continue;
        }

        if (
          !results.find((r) => r.id === docSnap.id) &&
          !existingIds.has(docSnap.id)
        ) {
          results.push({
            id: docSnap.id,
            ...data,
            distance: Math.round(distanceInKm * 10) / 10,
          } as SearchResult);
        }
      }
    }
  }

  return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// Search by skill name (with pagination)
export async function searchBySkillName(
  keyword: string,
  minRatingFilter: number = 0,
  lastDoc: DocumentSnapshot | null = null,
  pageSize: number = 20
): Promise<TextSearchResult> {
  const usersRef = collection(db, "users");

  let q;
  if (lastDoc) {
    q = query(usersRef, orderBy("name"), startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(usersRef, orderBy("name"), limit(pageSize));
  }

  const snapshot = await getDocs(q);

  const results: SearchResult[] = [];
  const keywordLower = keyword.toLowerCase();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    
    // filter by minimum rating
    if (minRatingFilter > 0) {
      const userRating = data.averageRating || 0;
      if (userRating < minRatingFilter) return;
    }

    const matchingSkills = data.skillsOffered?.filter(
      (s: { name: string; category: string; description?: string }) =>
        s.name.toLowerCase().includes(keywordLower) ||
        s.category.toLowerCase().includes(keywordLower) ||
        s.description?.toLowerCase().includes(keywordLower)
    );

    if (matchingSkills?.length > 0) {
      results.push({
        id: docSnap.id,
        ...data,
        matchingSkills,
      } as SearchResult);
    }
  });

  return {
    results,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

// Smart barter matches (with pagination)
export async function getSmartMatches(
  userId: string,
  userProfile: UserProfile | null,
  lastDoc: DocumentSnapshot | null = null,
  pageSize: number = 20
): Promise<SmartMatchResult> {
  if (!userProfile) return { matches: [], lastDoc: null, hasMore: false };

  const myNeededSkills =
    userProfile.skillsNeeded?.map((s) => s.category) || [];
  const myOfferedSkills =
    userProfile.skillsOffered?.map((s) => s.category) || [];

  if (myNeededSkills.length === 0 || myOfferedSkills.length === 0) {
    return { matches: [], lastDoc: null, hasMore: false };
  }

  const usersRef = collection(db, "users");

  let q;
  if (lastDoc) {
    q = query(usersRef, orderBy("name"), startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(usersRef, orderBy("name"), limit(pageSize));
  }

  const snapshot = await getDocs(q);

  const matches: SmartMatch[] = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id === userId) return;

    const data = docSnap.data();
    const theirOffered = data.skillsOffered?.map((s: { category: string }) => s.category) || [];
    const theirNeeded = data.skillsNeeded?.map((s: { category: string }) => s.category) || [];

    const theyOfferWhatINeed = myNeededSkills.some((cat) =>
      theirOffered.includes(cat)
    );
    const theyNeedWhatIOffer = myOfferedSkills.some((cat) =>
      theirNeeded.includes(cat)
    );

    if (theyOfferWhatINeed && theyNeedWhatIOffer) {
      matches.push({
        id: docSnap.id,
        ...data,
        matchType: "perfect_barter",
      } as SmartMatch);
    } else if (theyOfferWhatINeed) {
      matches.push({
        id: docSnap.id,
        ...data,
        matchType: "they_offer",
      } as SmartMatch);
    }
  });

  matches.sort((a, b) => {
    if (a.matchType === "perfect_barter" && b.matchType !== "perfect_barter")
      return -1;
    if (b.matchType === "perfect_barter" && a.matchType !== "perfect_barter")
      return 1;
    return 0;
  });

  return {
    matches,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}
