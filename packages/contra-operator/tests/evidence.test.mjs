import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPublicClaims } from '../dist/evidence.js';

test('rejects unverified revenue and URLs', () => {
  const result = checkPublicClaims([
    { text: '$48,293 revenue', kind: 'metric', evidence: 'UNVERIFIED' },
    { text: 'https://example.invalid', kind: 'url', evidence: 'UNVERIFIED' },
  ]);
  assert.equal(result.allowed, false);
  assert.equal(result.violations.length, 2);
});

test('permits synthetic demo values only with a demo label', () => {
  assert.equal(checkPublicClaims([{ text: '$10k', kind: 'metric', evidence: 'SYNTHETIC_DEMO', demoLabel: false }]).allowed, false);
  assert.equal(checkPublicClaims([{ text: '$10k', kind: 'metric', evidence: 'SYNTHETIC_DEMO', demoLabel: true }]).allowed, true);
});
