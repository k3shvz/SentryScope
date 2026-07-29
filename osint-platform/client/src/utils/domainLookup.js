// Uses public, keyless APIs only:
// - RDAP (the IANA-standardized successor to WHOIS) via rdap.org bootstrap
// - Google's public DNS-over-HTTPS JSON API for DNS/MX records
// Both are free, public, and require no authentication or scraping.

export function isValidDomain(domain) {
  return /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/.test(domain);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function fetchRDAP(domain) {
  // rdap.org resolves the correct registry RDAP server for the TLD automatically
  return fetchJSON(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
}

export async function fetchDNSRecord(domain, type) {
  const data = await fetchJSON(
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
  );
  return data.Answer || [];
}

export async function investigateDomain(domain) {
  const [rdapResult, aRecords, mxRecords, nsRecords, txtRecords] = await Promise.allSettled([
    fetchRDAP(domain),
    fetchDNSRecord(domain, 'A'),
    fetchDNSRecord(domain, 'MX'),
    fetchDNSRecord(domain, 'NS'),
    fetchDNSRecord(domain, 'TXT'),
  ]);

  return {
    rdap: rdapResult.status === 'fulfilled' ? rdapResult.value : null,
    rdapError: rdapResult.status === 'rejected' ? rdapResult.reason.message : null,
    a: aRecords.status === 'fulfilled' ? aRecords.value : [],
    mx: mxRecords.status === 'fulfilled' ? mxRecords.value : [],
    ns: nsRecords.status === 'fulfilled' ? nsRecords.value : [],
    txt: txtRecords.status === 'fulfilled' ? txtRecords.value : [],
  };
}
