import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  USERNAME_REGEX,
  EMAIL_REGEX,
  DOMAIN_REGEX,
  HEX_PREFIX_REGEX,
  URL_REGEX,
} from '../src/utils/validators.js';

describe('DOMAIN_REGEX', () => {
  const valid = ['example.com', 'sub.example.com', 'a-b.co', 'xn--exmple-cua.com'];
  const invalid = ['-example.com', 'example-.com', 'example', 'exa mple.com', ''];

  for (const v of valid) test(`accepts "${v}"`, () => assert.equal(DOMAIN_REGEX.test(v), true));
  for (const v of invalid) test(`rejects "${v}"`, () => assert.equal(DOMAIN_REGEX.test(v), false));
});

describe('EMAIL_REGEX', () => {
  test('accepts a normal email', () => assert.equal(EMAIL_REGEX.test('user@example.com'), true));
  test('rejects missing @', () => assert.equal(EMAIL_REGEX.test('userexample.com'), false));
  test('rejects missing domain dot', () => assert.equal(EMAIL_REGEX.test('user@example'), false));
  test('rejects embedded spaces', () => assert.equal(EMAIL_REGEX.test('us er@example.com'), false));
});

describe('USERNAME_REGEX', () => {
  test('accepts alnum/underscore/dot/dash', () => assert.equal(USERNAME_REGEX.test('john_doe-99.x'), true));
  test('rejects over 39 chars', () => assert.equal(USERNAME_REGEX.test('a'.repeat(40)), false));
  test('rejects spaces', () => assert.equal(USERNAME_REGEX.test('john doe'), false));
});

describe('HEX_PREFIX_REGEX', () => {
  test('accepts a 5-char hex prefix', () => assert.equal(HEX_PREFIX_REGEX.test('ABCDE'), true));
  test('rejects wrong length', () => assert.equal(HEX_PREFIX_REGEX.test('ABCD'), false));
  test('rejects non-hex chars', () => assert.equal(HEX_PREFIX_REGEX.test('ABCDG'), false));
});

describe('URL_REGEX', () => {
  test('accepts a bare domain', () => assert.equal(URL_REGEX.test('example.com'), true));
  test('accepts a domain with a path', () => assert.equal(URL_REGEX.test('example.com/path'), true));
  test('rejects a string with no TLD-like suffix', () => assert.equal(URL_REGEX.test('localhost'), false));
});
