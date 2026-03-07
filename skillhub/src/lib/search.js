import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
} from "firebase/firestore";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { db } from "./firebase";


export async function searchNearbySkills(
  centerLat,
  centerLng,
  radiusInKm,
  categoryFilter,
  priceTypeFilter
) {
  const center = [centerLat, centerLng];
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

  const results = [];
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
            (s) => s.category === categoryFilter
          );
          if (!hasCategory) continue;
        }

        
        if (priceTypeFilter) {
          const hasPriceType = data.skillsOffered.some(
            (s) => s.priceType === priceTypeFilter
          );
          if (!hasPriceType) continue;
        }

      
        if (!results.find((r) => r.id === docSnap.id)) {
          results.push({
            id: docSnap.id,
            ...data,
            distance: Math.round(distanceInKm * 10) / 10,
          });
        }
      }
    }
  }

  
  return results.sort((a, b) => a.distance - b.distance);
}


export async function searchBySkillName(keyword) {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const results = [];
  const keywordLower = keyword.toLowerCase();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const matchingSkills = data.skillsOffered?.filter(
      (s) =>
        s.name.toLowerCase().includes(keywordLower) ||
        s.category.toLowerCase().includes(keywordLower) ||
        s.description?.toLowerCase().includes(keywordLower)
    );

    if (matchingSkills?.length > 0) {
      results.push({
        id: docSnap.id,
        ...data,
        matchingSkills,
      });
    }
  });

  return results;
}


export async function getSmartMatches(userId, userProfile) {
  if (!userProfile) return [];

  const myNeededSkills = userProfile.skillsNeeded?.map((s) => s.category) || [];
  const myOfferedSkills =
    userProfile.skillsOffered?.map((s) => s.category) || [];

  if (myNeededSkills.length === 0 || myOfferedSkills.length === 0) return [];

  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const matches = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id === userId) return; 

    const data = docSnap.data();
    const theirOffered = data.skillsOffered?.map((s) => s.category) || [];
    const theirNeeded = data.skillsNeeded?.map((s) => s.category) || [];

    
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
      });
    } else if (theyOfferWhatINeed) {
      matches.push({
        id: docSnap.id,
        ...data,
        matchType: "they_offer",
      });
    }
  });

  
  return matches.sort((a, b) => {
    if (a.matchType === "perfect_barter" && b.matchType !== "perfect_barter")
      return -1;
    if (b.matchType === "perfect_barter" && a.matchType !== "perfect_barter")
      return 1;
    return 0;
  });
}