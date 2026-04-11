import { isIP } from "node:net";
import { config } from "../config.js";

export type GeoLookupResult = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  provider: string | null;
};

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

  return false;
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

export async function resolveServerLocation(
  ipAddress: string,
): Promise<GeoLookupResult> {
  const ip = ipAddress.trim();

  if (!ip || isIP(ip) === 0 || isPrivateOrLocalIp(ip)) {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      timezone: null,
      provider: null,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.GEO_IP_LOOKUP_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Geo lookup failed with ${response.status}`);
    }

    const data = (await response.json()) as {
      success?: boolean;
      country?: string;
      country_code?: string;
      city?: string;
      timezone?: { id?: string };
    };

    if (!data.success) {
      return {
        country: null,
        countryCode: null,
        region: null,
        city: null,
        timezone: null,
        provider: "ipwho.is",
      };
    }

    const countryCode = data.country_code ?? null;

    return {
      country: data.country ?? null,
      countryCode,
      region: mapCountryToRoutingRegion(countryCode),
      city: data.city ?? null,
      timezone: data.timezone?.id ?? null,
      provider: "ipwho.is",
    };
  } catch {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
      timezone: null,
      provider: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
