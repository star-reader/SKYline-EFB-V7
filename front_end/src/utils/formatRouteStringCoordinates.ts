export default function formatRouteStringCoordinates(
  latitude: number,
  longitude: number,
): string {
  const latitudeD = Math.trunc(latitude)
  const latitudeM = Math.trunc(60 * Math.abs(latitude - latitudeD))
  const latitudeS = 3600 * Math.abs(latitude - latitudeD) - 60 * latitudeM
  const latitudeDirection = latitude >= 0 ? "N" : "S"

  const longitudeD = Math.trunc(longitude)
  const longitudeM = Math.trunc(60 * Math.abs(longitude - longitudeD))
  const longitudeS = 3600 * Math.abs(longitude - longitudeD) - 60 * longitudeM
  const longitudeDirection = longitude >= 0 ? "E" : "W"

  return [
    [
      `${Math.abs(latitudeD).toString().padStart(2, "0")}`,
      `${latitudeM.toFixed(0).padStart(2, "0")}`,
      `${latitudeS.toFixed(0).padStart(2, "0")}`,
      latitudeDirection,
    ].join(""),
    [
      `${Math.abs(longitudeD).toString().padStart(3, "0")}`,
      `${longitudeM.toFixed(0).padStart(2, "0")}`,
      `${longitudeS.toFixed(0).padStart(2, "0")}`,
      longitudeDirection,
    ].join(""),
  ].join("")
}
