#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const ignored = path => path.startsWith('docs/') || path.startsWith('cerebro/') || (!path.includes('/') && path.endsWith('.md'));

export function checkDeployHead(cwd, built = 'HEAD', latest = 'origin/main') {
  const builtSha = git(cwd, 'rev-parse', built);
  const latestSha = git(cwd, 'rev-parse', latest);
  if (builtSha === latestSha) return { allowed: true, builtSha, latestSha, changed: [] };
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', builtSha, latestSha], { cwd });
  if (ancestor.status !== 0) return { allowed: false, builtSha, latestSha, changed: [], reason: 'La revisión compilada no es ancestro del main actual.' };
  const changed = git(cwd, 'diff', '--name-only', builtSha, latestSha).split('\n').filter(Boolean).filter(p => !ignored(p));
  return { allowed: changed.length === 0, builtSha, latestSha, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cwd = git(process.cwd(), 'rev-parse', '--show-toplevel');
  execFileSync('git', ['fetch', 'origin', 'main'], { cwd, stdio: ['ignore', 'ignore', 'inherit'] });
  const result = checkDeployHead(cwd);
  console.log(`[release-head] ${result.allowed ? 'READY' : 'SUPERSEDED'} built=${result.builtSha.slice(0,10)} main=${result.latestSha.slice(0,10)} relevant_changes=${result.changed.length}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `can_deploy=${result.allowed}\n`);
  } else if (!result.allowed) {
    process.exitCode = 1;
  }
}
