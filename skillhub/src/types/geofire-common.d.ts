declare module "geofire-common" {
 export function geohashForLocation(location: [number, number]): string;
 export function geohashQueryBounds(
 center: [number, number],
 radiusInM: number
 ): [string, string][];
 export function distanceBetween(
 location1: [number, number],
 location2: [number, number]
 ): number;
}
