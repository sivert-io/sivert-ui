import { resolveServerLocation } from "./geoip.js";
import { resolveServerAddress } from "./server-address.js";

type InferredLocation = {
  resolvedIp: string;
  country: string | null;
  region: string | null;
  port: number | null;
};

function mapCountryToMatchmakingRegion(country: string | null) {
  if (!country) return null;

  const value = country.trim().toLowerCase();

  if (
    [
      "norway",
      "sweden",
      "finland",
      "denmark",
      "iceland",
      "estonia",
      "latvia",
      "lithuania",
    ].includes(value)
  ) {
    return "EU North";
  }

  if (
    [
      "united kingdom",
      "ireland",
      "france",
      "belgium",
      "netherlands",
      "luxembourg",
      "germany",
      "switzerland",
      "austria",
      "poland",
      "czech republic",
      "slovakia",
      "hungary",
      "romania",
      "bulgaria",
      "croatia",
      "slovenia",
      "serbia",
      "bosnia and herzegovina",
      "montenegro",
      "albania",
      "north macedonia",
      "greece",
      "italy",
      "spain",
      "portugal",
      "ukraine",
      "moldova",
    ].includes(value)
  ) {
    return "EU West";
  }

  if (["united states", "canada"].includes(value)) {
    return "NA";
  }

  if (
    [
      "brazil",
      "argentina",
      "chile",
      "uruguay",
      "paraguay",
      "bolivia",
      "peru",
      "colombia",
      "venezuela",
      "ecuador",
    ].includes(value)
  ) {
    return "South America";
  }

  if (
    [
      "japan",
      "south korea",
      "korea, republic of",
      "china",
      "hong kong",
      "taiwan",
      "singapore",
      "malaysia",
      "thailand",
      "vietnam",
      "philippines",
      "indonesia",
      "india",
    ].includes(value)
  ) {
    return "Asia";
  }

  if (["australia", "new zealand"].includes(value)) {
    return "Oceania";
  }

  if (
    [
      "united arab emirates",
      "saudi arabia",
      "qatar",
      "kuwait",
      "bahrain",
      "oman",
      "israel",
      "jordan",
      "turkey",
    ].includes(value)
  ) {
    return "Middle East";
  }

  if (
    [
      "south africa",
      "egypt",
      "morocco",
      "algeria",
      "tunisia",
      "nigeria",
      "kenya",
    ].includes(value)
  ) {
    return "Africa";
  }

  return null;
}

function inferCountryFromIp(ip: string) {
  // Minimal targeted fallback for the case you hit.
  // Expand this later with better internal heuristics or range-based matching.
  if (ip.startsWith("16.171.")) {
    return "Sweden";
  }

  return null;
}

export async function inferServerLocation(
  address: string,
): Promise<InferredLocation> {
  const resolved = await resolveServerAddress(address);
  const geo = await resolveServerLocation(resolved.resolvedIp);

  const country = geo.country ?? inferCountryFromIp(resolved.resolvedIp);
  const region = mapCountryToMatchmakingRegion(country);

  return {
    resolvedIp: resolved.resolvedIp,
    country,
    region,
    port: resolved.port,
  };
}
