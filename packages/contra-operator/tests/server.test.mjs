import test from 'node:test';
import assert from 'node:assert/strict';
import { operatorStatus, canProceedHandler, classifyToolHandler } from '../dist/server.js';

test('status exposes no credentials', () => {
  const status = operatorStatus({ mode: 'tiered', expectedIdentity: { accountId: 'x' }, observedIdentity: { accountId: 'x' } });
  const text = JSON.stringify(status);
  assert.equal(status.credentialsStored, false);
  assert.doesNotMatch(text, /token|password|cookie|bearer/i);
});

test('canProceed preserves native confirmation', () => {
  const result = canProceedHandler({
    mode: 'maximum',
    authorityClass: 'FINANCIAL',
    nativeConfirmationRequired: true,
    expectedIdentity: { accountId: 'x' },
    observedIdentity: { accountId: 'x' },
  });
  assert.equal(result.decision, 'CONFIRM');
});

test('writes fail closed when identity is unverified', () => {
  const result = canProceedHandler({ mode: 'tiered', authorityClass: 'PUBLISH', nativeConfirmationRequired: false });
  assert.equal(result.decision, 'BLOCK');
});

test('unknown mutation-capable tool fails closed', () => {
  assert.equal(classifyToolHandler({ name: 'change_everything', readOnlyHint: false }).authorityClass, 'DESTRUCTIVE');
});
