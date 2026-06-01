export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ftpCyclingWatts(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const w = Number(i.wattsPromedio20) || 0;
  const ftp = w * 0.95;
  const resumen = __lang === 'en'
    ? `FTP ≈ ${ftp.toFixed(0)} W. Maximum sustainable power for 1 hour.`
    : `FTP ≈ ${ftp.toFixed(0)} W. Potencia máxima sostenible 1 hora.`;
  return { ftp: ftp.toFixed(0) + ' W', wKg: '—', resumen };
}
