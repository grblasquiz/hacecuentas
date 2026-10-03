/** NIST units: Mbps = 10^6 bit/s; a byte contains 8 bits. */
export const FILE_SIZE_BYTES = { MB: 1e6, GB: 1e9, MiB: 2 ** 20, GiB: 2 ** 30 } as const;
export type FileSizeUnit = keyof typeof FILE_SIZE_BYTES;

/** Constant-rate estimate. No assumed protocol efficiency or speed measurement. */
export function calculateDownload(mbps: number, size: number, unit: string) {
  if (!Number.isFinite(mbps) || mbps <= 0 || !Number.isFinite(size) || size <= 0
      || !Object.hasOwn(FILE_SIZE_BYTES, unit)) return null;
  const bytes = size * FILE_SIZE_BYTES[unit as FileSizeUnit];
  const megabytesPerSecond = mbps / 8;
  const seconds = bytes / (mbps * 1e6 / 8);
  if (!Number.isFinite(bytes) || !Number.isFinite(seconds) || seconds <= 0 || megabytesPerSecond <= 0) return null;
  return { bytes, megabytesPerSecond, seconds };
}
