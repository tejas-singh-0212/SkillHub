// Normalize location data
// Converts between different formats used across the app
export function toClientLocation(firestoreLocation) {
  if (!firestoreLocation) return null;

  return {
    lat: firestoreLocation.latitude || firestoreLocation.lat,
    lng: firestoreLocation.longitude || firestoreLocation.lng,
    city: firestoreLocation.city || "",
    area: firestoreLocation.area || "",
    fullAddress: firestoreLocation.fullAddress || "",
  };
}

// Convert Client format → Firestore format
// Used before saving to Firestore
export function toFirestoreLocation(clientLocation) {
  if (!clientLocation) return null;

  return {
    lat: clientLocation.lat || clientLocation.latitude,
    lng: clientLocation.lng || clientLocation.longitude,
    city: clientLocation.city || "",
    area: clientLocation.area || "",
    fullAddress: clientLocation.fullAddress || "",
  };
}

// Format location for display
export function formatLocationDisplay(location) {
  if (!location) return "Location not set";

  const area = location.area || location.suburb || "";
  const city = location.city || location.town || "";

  if (area && city) return `${area}, ${city}`;
  if (city) return city;
  if (area) return area;

  const lat = location.lat || location.latitude;
  const lng = location.lng || location.longitude;

  if (lat && lng) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  return "Location not set";
}

// Get current location using browser API
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}&zoom=16`
          );
          const data = await res.json();

          resolve({
            lat: latitude,
            lng: longitude,
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "",
            area:
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.county ||
              "",
            fullAddress: data.display_name || "",
          });
        } catch {
          resolve({
            lat: latitude,
            lng: longitude,
            city: "",
            area: "",
            fullAddress: "",
          });
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

// Search for address using Nominatim
export async function searchAddress(query) {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
  );
  const results = await res.json();

  return results.map((r) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
    city: r.address?.city || r.address?.town || "",
    area: r.address?.suburb || "",
  }));
}