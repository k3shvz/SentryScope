// Wraps fetch() so that every TCP connection it makes — including ones made
// while following redirects — is validated against the SSRF private-IP
// blocklist at the moment of connecting, not just for the URL the caller
// passed in.
//
// This closes two gaps a simple "check the URL, then fetch()" approach has:
//   1. Redirects: fetch(url, { redirect: 'follow' }) will happily follow a
//      3xx response to an internal address; checking response.url *after*
//      the fact is too late — the request has already gone out.
//   2. DNS rebinding: resolving a hostname once to validate it, then letting
//      fetch() resolve it again independently, leaves a window where the
//      attacker's DNS can answer differently the second time.
//
// Using undici's Agent with a custom `connect.lookup`, the same resolution
// that's validated is the one actually used to open the socket — for the
// initial request and for every redirect hop — which removes the gap in
// both cases at once.
import * as dns from 'node:dns';
import { Agent, fetch as undiciFetch } from 'undici';
import { extractHostname, isPrivateIp, isPublicHostname } from './ssrf.js';

function guardedLookup(hostname, options, callback) {
  // Always ask for every address so we can filter safely, regardless of
  // whether the caller (net/undici's connector) wants one result or all.
  dns.lookup(hostname, { ...options, all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = Array.isArray(addresses) ? addresses : [addresses];
    const safe = list.filter((a) => !isPrivateIp(a.address));
    if (!safe.length) {
      return callback(new Error(`SSRF blocked: "${hostname}" resolves only to private/internal addresses.`));
    }
    if (options?.all) {
      return callback(null, safe);
    }
    return callback(null, safe[0].address, safe[0].family);
  });
}

const guardedAgent = new Agent({
  connect: { lookup: guardedLookup },
});

export class SsrfBlockedError extends Error {}

/**
 * A drop-in fetch() replacement that refuses to connect to private/internal
 * hosts, including across redirects. `options.timeout` (ms) sets an overall
 * request timeout; everything else is passed through to fetch().
 */
export async function guardedFetch(url, options = {}) {
  const { timeout = 8000, ...rest } = options;

  const hostname = extractHostname(url);
  if (!hostname) {
    throw new SsrfBlockedError('Provide a valid http(s) URL with a hostname.');
  }
  const publicHost = await isPublicHostname(hostname);
  if (!publicHost) {
    throw new SsrfBlockedError('Requests to private, internal, or local hostnames are not allowed.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await undiciFetch(url, {
      ...rest,
      redirect: 'follow',
      dispatcher: guardedAgent,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
