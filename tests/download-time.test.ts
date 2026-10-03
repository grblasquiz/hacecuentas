import { describe, expect, it } from 'vitest';
import { calculateDownload } from '../src/lib/download-time';

describe('download time with explicit decimal and binary units', () => {
  it('100 Mbps and 1 decimal GB gives 12.5 MB/s and 80 seconds', () => {
    expect(calculateDownload(100, 1, 'GB')).toEqual({ bytes: 1e9, megabytesPerSecond: 12.5, seconds: 80 });
  });
  it('1,000 MB equals 1 GB, while 1,024 MiB equals 1 GiB', () => {
    expect(calculateDownload(100, 1000, 'MB')).toEqual(calculateDownload(100, 1, 'GB'));
    expect(calculateDownload(100, 1024, 'MiB')).toEqual(calculateDownload(100, 1, 'GiB'));
    expect(calculateDownload(100, 1, 'GiB')?.seconds).toBeCloseTo(85.89934592);
  });
  it('scales with file size and inversely with speed, without an efficiency discount', () => {
    expect(calculateDownload(50, 1, 'GB')?.seconds).toBe(160);
    expect(calculateDownload(100, 2, 'GB')?.seconds).toBe(160);
    expect(calculateDownload(300, 8, 'GB')?.seconds).toBeCloseTo(213.3333333);
  });
  it('accepts fractional sizes and speeds', () => {
    expect(calculateDownload(0.5, 0.25, 'MB')?.seconds).toBe(4);
  });
  it('rejects empty/zero, negative, nonfinite, overflowing and unknown-unit inputs', () => {
    for (const bad of [0, -1, NaN, Infinity, -Infinity]) {
      expect(calculateDownload(bad, 1, 'GB')).toBeNull();
      expect(calculateDownload(100, bad, 'GB')).toBeNull();
    }
    expect(calculateDownload(100, Number.MAX_VALUE, 'GB')).toBeNull();
    expect(calculateDownload(100, 1, 'toString')).toBeNull();
    expect(calculateDownload(100, 1, 'gb')).toBeNull();
  });
});
