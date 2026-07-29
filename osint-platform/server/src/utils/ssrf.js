import * as dns from 'node:dns';
import { isIP } from 'node:net';

const resolve4 = dns.promises.resolve4;
const resolve6 = dns.promises.resolve6;

// ---------------------------------------------------------------------------
// IPv4
// ---------------------------------------------------------------------------

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function ipv4InCidr(ip, cidr) {
  const [range, bitsStr] = cidr.split('/');
  const bits = Number(bitsStr);
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

// RFC 1918/5735/6598 and friends, plus cloud metadata (169.254.169.254 falls
// under link-local) and the special-use test ranges.
const IPV4_PRIVATE_RANGES = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
  '255.255.255.255/32',
];

export function isPrivateIpv4(ip) {
  return IPV4_PRIVATE_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
}

// ---------------------------------------------------------------------------
// IPv6
// ---------------------------------------------------------------------------

function expandIpv6(ip) {
  let addr = ip.split('%')[0]; // strip zone index, e.g. fe80::1%eth0
  let embeddedV4 = null;

  const v4Match = addr.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4Match && addr.includes(':')) {
    embeddedV4 = v4Match[1];
    const v4Int = ipv4ToInt(embeddedV4);
    if (v4Int !== null) {
      const hi = ((v4Int >>> 16) & 0xffff).toString(16);
      const lo = (v4Int & 0xffff).toString(16);
      addr = addr.slice(0, v4Match.index) + hi + ':' + lo;
    }
  }

  let headParts;
  if (addr.includes('::')) {
    const [head, tail] = addr.split('::');
    const headP = head ? head.split(':').filter(Boolean) : [];
    const tailP = tail ? tail.split(':').filter(Boolean) : [];
    const missing = 8 - (headP.length + tailP.length);
    headParts = [...headP, ...new Array(Math.max(missing, 0)).fill('0'), ...tailP];
  } else {
    headParts = addr.split(':');
  }

  while (headParts.length < 8) headParts.push('0');
  const parts = headParts.slice(0, 8).map((p) => parseInt(p || '0', 16) || 0);
  return { parts, embeddedV4 };
}

function ipv6ToBigInt(ip) {
  const { parts } = expandIpv6(ip);
  let big = 0n;
  for (const p of parts) big = (big << 16n) + BigInt(p);
  return big;
}

function ipv6InCidr(ip, cidr) {
  const [range, bitsStr] = cidr.split('/');
  const bits = BigInt(Number(bitsStr));
  const ipBig = ipv6ToBigInt(ip);
  const rangeBig = ipv6ToBigInt(range);
  const mask = bits === 0n ? 0n : (((1n << 128n) - 1n) << (128n - bits)) & ((1n << 128n) - 1n);
  return (ipBig & mask) === (rangeBig & mask);
}

const IPV6_PRIVATE_RANGES = [
  '::1/128', // loopback
  '::/128', // unspecified
  '64:ff9b::/96', // NAT64
  '100::/64', // discard-only
  '2001:db8::/32', // documentation
  'fc00::/7', // unique local (ULA)
  'fe80::/10', // link-local
  'ff00::/8', // multicast
];

export function isPrivateIpv6(ip) {
  const { embeddedV4 } = expandIpv6(ip);
  // IPv4-mapped (::ffff:a.b.c.d) and 6to4 (2002::/16) addresses embed a real
  // IPv4 address — that embedded address must be checked too, or an
  // attacker can smuggle a private IPv4 target through an IPv6 literal.
  if (embeddedV4 && isPrivateIpv4(embeddedV4)) return true;
  return IPV6_PRIVATE_RANGES.some((cidr) => ipv6InCidr(ip, cidr));
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export function isPrivateIp(ip) {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true; // not a parseable IP literal — treat as unsafe
}

export async function resolveAllIps(hostname) {
  if (isIP(hostname)) return [hostname];
  const settled = await Promise.allSettled([resolve4(hostname), resolve6(hostname)]);
  const ips = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') ips.push(...result.value);
  }
  return ips;
}

export async function isPublicHostname(hostname) {
  try {
    const ips = await resolveAllIps(hostname);
    if (!ips.length) return false;
    return ips.every((ip) => !isPrivateIp(ip));
  } catch {
    return false;
  }
}

export function extractHostname(urlString) {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

export async function isPublicUrl(urlString) {
  const hostname = extractHostname(urlString);
  if (!hostname) return false;
  return isPublicHostname(hostname);
}
