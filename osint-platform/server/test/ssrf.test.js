import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPrivateIp,
  isPrivateIpv4,
  isPrivateIpv6,
  extractHostname,
} from '../src/utils/ssrf.js';

describe('isPrivateIpv4', () => {
  const privateCases = [
    '10.0.0.1',
    '172.16.5.5',
    '172.31.255.255',
    '192.168.1.1',
    '127.0.0.1',
    '169.254.169.254', // cloud metadata endpoint
    '100.64.0.5', // CGNAT
    '0.0.0.0',
    '255.255.255.255',
    '192.0.2.5', // TEST-NET-1
    '198.51.100.7', // TEST-NET-2
    '203.0.113.9', // TEST-NET-3
    '224.0.0.1', // multicast
  ];
  const publicCases = ['8.8.8.8', '1.1.1.1', '172.32.0.1', '100.128.0.1', '93.184.216.34'];

  for (const ip of privateCases) {
    test(`${ip} is private`, () => assert.equal(isPrivateIpv4(ip), true));
  }
  for (const ip of publicCases) {
    test(`${ip} is public`, () => assert.equal(isPrivateIpv4(ip), false));
  }
});

describe('isPrivateIpv6', () => {
  const privateCases = [
    '::1', // loopback
    '::', // unspecified
    'fe80::1', // link-local
    'fc00::1', // unique local
    'fd12:3456:789a::1', // unique local
    'ff02::1', // multicast
    '2001:db8::1', // documentation range
    '::ffff:127.0.0.1', // IPv4-mapped loopback
    '::ffff:169.254.169.254', // IPv4-mapped cloud metadata
    '::ffff:10.0.0.5', // IPv4-mapped RFC1918
  ];
  const publicCases = [
    '2001:4860:4860::8888', // Google public DNS
    '2606:4700:4700::1111', // Cloudflare public DNS
    '::ffff:8.8.8.8', // IPv4-mapped public address
  ];

  for (const ip of privateCases) {
    test(`${ip} is private`, () => assert.equal(isPrivateIpv6(ip), true));
  }
  for (const ip of publicCases) {
    test(`${ip} is public`, () => assert.equal(isPrivateIpv6(ip), false));
  }
});

describe('isPrivateIp (dispatch)', () => {
  test('routes IPv4 correctly', () => assert.equal(isPrivateIp('10.0.0.1'), true));
  test('routes IPv6 correctly', () => assert.equal(isPrivateIp('fe80::1'), true));
  test('treats unparseable input as unsafe', () => assert.equal(isPrivateIp('not-an-ip'), true));
});

describe('extractHostname', () => {
  test('extracts hostname from a normal https URL', () => {
    assert.equal(extractHostname('https://example.com/path?q=1'), 'example.com');
  });
  test('extracts hostname from an http URL with an IP literal', () => {
    assert.equal(extractHostname('http://169.254.169.254/latest/meta-data/'), '169.254.169.254');
  });
  test('rejects non-http(s) protocols', () => {
    assert.equal(extractHostname('file:///etc/passwd'), null);
    assert.equal(extractHostname('ftp://example.com/file'), null);
    assert.equal(extractHostname('gopher://example.com'), null);
  });
  test('rejects unparseable strings', () => {
    assert.equal(extractHostname('not a url'), null);
  });
});
