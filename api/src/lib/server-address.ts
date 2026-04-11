import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export type ParsedServerAddress = {
  originalInput: string;
  host: string;
  port: number | null;
  isIp: boolean;
};

export type ResolvedServerAddress = {
  originalInput: string;
  hostInput: string;
  resolvedIp: string;
  port: number | null;
  isIpInput: boolean;
};

function normalizeHost(host: string) {
  return host.trim().replace(/^\[|\]$/g, "");
}

export function parseServerAddress(input: string): ParsedServerAddress {
  const raw = input.trim();

  if (!raw) {
    throw new Error("Address is required");
  }

  // [ipv6]:port
  const bracketedIpv6 = raw.match(/^\[([^\]]+)\](?::(\d+))?$/);
  if (bracketedIpv6) {
    const host = normalizeHost(bracketedIpv6[1]);
    const port = bracketedIpv6[2] ? Number(bracketedIpv6[2]) : null;

    if (
      port !== null &&
      (!Number.isInteger(port) || port < 1 || port > 65535)
    ) {
      throw new Error("Invalid port");
    }

    return {
      originalInput: raw,
      host,
      port,
      isIp: isIP(host) !== 0,
    };
  }

  const colonCount = (raw.match(/:/g) ?? []).length;

  // hostname:port or ipv4:port
  if (colonCount === 1 && !raw.includes("]")) {
    const [left, right] = raw.split(":");
    const host = normalizeHost(left);

    if (/^\d+$/.test(right)) {
      const port = Number(right);

      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("Invalid port");
      }

      return {
        originalInput: raw,
        host,
        port,
        isIp: isIP(host) !== 0,
      };
    }
  }

  // raw ipv6, raw ipv4, raw hostname
  return {
    originalInput: raw,
    host: normalizeHost(raw),
    port: null,
    isIp: isIP(normalizeHost(raw)) !== 0,
  };
}

export async function resolveServerAddress(
  input: string,
): Promise<ResolvedServerAddress> {
  const parsed = parseServerAddress(input);

  if (parsed.isIp) {
    return {
      originalInput: parsed.originalInput,
      hostInput: parsed.host,
      resolvedIp: parsed.host,
      port: parsed.port,
      isIpInput: true,
    };
  }

  const result = await lookup(parsed.host, { all: false, family: 0 });

  return {
    originalInput: parsed.originalInput,
    hostInput: parsed.host,
    resolvedIp: result.address,
    port: parsed.port,
    isIpInput: false,
  };
}
