import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const skillRoot = resolve(process.cwd(), '../../.agents/skills/contra-operator');

test('skill preserves authentication and authority boundaries', async () => {
  const skill = await readFile(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const auth = await readFile(resolve(skillRoot, 'references/authentication.md'), 'utf8');
  const publishing = await readFile(resolve(skillRoot, 'references/portfolio-publishing.md'), 'utf8');
  const money = await readFile(resolve(skillRoot, 'references/hiring-and-money.md'), 'utf8');
  const combined = `${skill}\n${auth}\n${publishing}\n${money}`;
  for (const phrase of [
    'official MCP/OAuth',
    'tiered',
    'maximum',
    'identity mismatch',
    'VERIFIED_RUNTIME',
    'SYNTHETIC_DEMO',
    'never manufacture a slug',
    'No fake KPIs',
  ]) assert.match(combined, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  assert.match(combined, /password/i);
  assert.match(combined, /cookie/i);
  assert.match(combined, /raw OAuth/i);
  assert.match(combined, /never self-confirm/i);
});
