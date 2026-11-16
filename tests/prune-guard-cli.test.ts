import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('prune guard CLI', () => {
  it('renders its help with the literal percent required by argparse', () => {
    // Python 3.14 validates help at add_argument time; older versions fail
    // only when --help expands an unescaped percent. Exercise both paths.
    const result = spawnSync('python3', ['scripts/prune_guard.py', '--help'], {
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('100% protegidos');
  });
});
