export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ftpCyclingWatts(i: Inputs): Outputs {
  const w = Number(i.wattsPromedio20) || 0;
  const ftp = w * 0.95;
  return { ftp: ftp.toFixed(0) + ' W', wKg: '—', resumen: `FTP ≈ ${ftp.toFixed(0)} W. Potencia máxima sostenible 1 hora.` };
}
