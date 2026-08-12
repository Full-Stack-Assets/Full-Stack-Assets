import test from 'node:test';
import assert from 'node:assert/strict';
import { bindIdentity } from '../dist/session.js';

test('blocks writes on identity mismatch', () => {
  const state = bindIdentity({ accountId: 'actual', handle: 'nic' }, { accountId: 'expected' });
  assert.equal(state.identityStatus, 'mismatch');
  assert.equal(state.writeBlocked, true);
});

test('keeps identity unverified when no stable identity is observable', () => {
  const state = bindIdentity({}, {});
  assert.equal(state.identityStatus, 'unverified');
  assert.equal(state.writeBlocked, true);
});

test('verifies matching stable account id', () => {
  const state = bindIdentity({ accountId: 'acct_1' }, { accountId: 'acct_1' });
  assert.equal(state.identityStatus, 'verified');
  assert.equal(state.writeBlocked, false);
});
