import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

async function filesUnder(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await filesUnder(path));
    else out.push(path);
  }
  return out;
}

test('package contains no populated secrets or credential artifacts', async () => {
  const packageRoot = resolve(process.cwd());
  const skillRoot = resolve(process.cwd(), '../../.agents/skills/contra-operator');
  const files = [...await filesUnder(join(packageRoot, 'src')), ...await filesUnder(skillRoot), join(packageRoot, '.env.example'), join(packageRoot, 'README.md')];
  const combined = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
  assert.doesNotMatch(combined, /Bearer\s+[A-Za-z0-9._-]{16,}/i);
  assert.doesNotMatch(combined, /(?:password|cookie|refresh[_ -]?token|access[_ -]?token|2fa[_ -]?seed|backup[_ -]?code)\s*[=:]\s*[^\s"']{6,}/i);
  const env = await readFile(join(packageRoot, '.env.example'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const [, value = ''] = line.split('=', 2);
    if (line.startsWith('CONTRA_OPERATOR_AUTONOMY=')) assert.equal(value, 'tiered');
    else assert.equal(value, '');
  }
});
