import { isIP } from "node:net";
import { GeoIpDbName, open } from "geolite2-redist";
import maxmind, { type CityResponse, type Reader } from "maxmind";

export type GeoLookupResult = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  provider: string | null;
};

let cityReaderPromise: Promise<Reader<CityResponse>> | null = null;

function isPrivateOrLocalIp(ip: string) {
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  ) {
    return true;
  }

  const lower = ip.toLowerCase();

  return (
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80:")
  );
}

function normalizeIp(ipAddress: string) {
  let ip = ipAddress.trim();

  if (ip.startsWith("::ffff:")) {
    ip = ip.slice("::ffff:".length);
  }

  return ip;
}

function emptyGeoResult(provider: string | null = null): GeoLookupResult {
  return {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    timezone: null,
    provider,
  };
}

function mapCountryToRoutingRegion(countryCode: string | null) {
  if (!countryCode) return null;

  const code = countryCode.toUpperCase();

  if (["NO", "SE", "FI", "DK", "IS", "EE", "LV", "LT"].includes(code)) {
    return "EU North";
  }

  if (
    [
      "GB",
      "IE",
      "FR",
      "BE",
      "NL",
      "LU",
      "DE",
      "CH",
      "AT",
      "PL",
      "CZ",
      "SK",
      "HU",
      "RO",
      "BG",
      "HR",
      "SI",
      "RS",
      "BA",
      "ME",
      "AL",
      "MK",
      "GR",
      "IT",
      "ES",
      "PT",
      "UA",
      "MD",
    ].includes(code)
  ) {
    return "EU West";
  }

  if (["US", "CA"].includes(code)) {
    return "NA";
  }

  if (
    ["BR", "AR", "CL", "UY", "PY", "BO", "PE", "CO", "VE", "EC"].includes(code)
  ) {
    return "South America";
  }

  if (["AU", "NZ"].includes(code)) {
    return "Oceania";
  }

  if (
    [
      "JP",
      "KR",
      "CN",
      "HK",
      "TW",
      "SG",
      "MY",
      "TH",
      "VN",
      "PH",
      "ID",
      "IN",
    ].includes(code)
  ) {
    return "Asia";
  }

  if (["AE", "SA", "QA", "KW", "BH", "OM", "IL", "JO", "TR"].includes(code)) {
    return "Middle East";
  }

  if (["ZA", "EG", "MA", "DZ", "TN", "NG", "KE"].includes(code)) {
    return "Africa";
  }

  return null;
}

async function getCityReader() {
  cityReaderPromise ??= open(GeoIpDbName.City, (databasePath) =>
    maxmind.open<CityResponse>(databasePath),
  );

  return cityReaderPromise;
}

type LocalizedNames = {
  en?: string;
  [key: string]: string | undefined;
};

function getLocalizedName(names?: { en?: string } | null) {
  if (!names) {
    return null;
  }

  return names.en ?? null;
}

export async function resolveServerLocation(
  ipAddress: string,
): Promise<GeoLookupResult> {
  const ip = normalizeIp(ipAddress);

  if (!ip || isIP(ip) === 0 || isPrivateOrLocalIp(ip)) {
    return emptyGeoResult();
  }

  try {
    const reader = await getCityReader();
    const result = reader.get(ip);

    if (!result) {
      return emptyGeoResult("maxmind-geolite2-city");
    }

    const countryCode =
      result.country?.iso_code?.toUpperCase() ??
      result.registered_country?.iso_code?.toUpperCase() ??
      null;

    return {
      country:
        getLocalizedName(result.country?.names) ??
        getLocalizedName(result.registered_country?.names),
      countryCode,
      region: mapCountryToRoutingRegion(countryCode),
      city: getLocalizedName(result.city?.names),
      timezone: result.location?.time_zone ?? null,
      provider: "maxmind-geolite2-city",
    };
  } catch (error) {
    console.error("GeoIP lookup failed:", error);
    return emptyGeoResult("maxmind-geolite2-city");
  }
}
