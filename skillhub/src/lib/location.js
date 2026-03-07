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