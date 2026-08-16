import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

describe('integridad de datos derivados', () => {
  it('mantiene IPC consistente entre snapshot, tabla, snippet y FAQ', () => {
    expect(() => execFileSync('node', ['--experimental-strip-types', 'scripts/check-derived-data-consistency.ts'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    })).not.toThrow();
  });
});
