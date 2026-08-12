import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyContraTool, decideOperation } from '../dist/policy.js';

test('allows reads automatically in tiered mode', () => {
  assert.equal(decideOperation('tiered', 'READ', false).decision, 'PROCEED');
});

test('requires confirmation for financial actions', () => {
  assert.equal(decideOperation('tiered', 'FINANCIAL', true).decision, 'CONFIRM');
});

test('never bypasses native confirmation in maximum mode', () => {
  assert.equal(decideOperation('maximum', 'FINANCIAL', true).decision, 'CONFIRM');
});

test('fails closed for unknown mutation tools', () => {
  assert.equal(classifyContraTool({ name: 'mystery', description: 'changes an account', readOnlyHint: false }), 'DESTRUCTIVE');
});

test('keeps destructive actions behind approval even in maximum mode', () => {
  assert.equal(decideOperation('maximum', 'DESTRUCTIVE', false).decision, 'CONFIRM');
});
