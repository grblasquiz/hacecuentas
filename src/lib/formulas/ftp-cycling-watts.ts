export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ftpCyclingWatts(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const w = Number(i.wattsPromedio20) || 0;
  const ftp = w * 0.95;
  const resumen = __lang === 'en'
    ? `FTP ≈ ${ftp.toFixed(0)} W. Maximum sustainable power for 1 hour.`
    : `FTP ≈ ${ftp.toFixed(0)} W. Potencia máxima sostenible 1 hora.`;
  const z2lo = Math.round(ftp * 0.56), z2hi = Math.round(ftp * 0.75);
  const z4lo = Math.round(ftp * 0.91), z4hi = Math.round(ftp * 1.05);
  const _insight = {
    title: __lang === 'en' ? 'What your FTP means' : 'Qué significa tu FTP',
    text: __lang === 'en'
      ? `Your FTP is **${ftp.toFixed(0)} W** (95% of your 20-min average of **${w.toFixed(0)} W**). Use it to set your zones: easy endurance sits around **${z2lo}–${z2hi} W** and threshold work around **${z4lo}–${z4hi} W**.`
      : `Tu FTP es **${ftp.toFixed(0)} W** (el 95% de tu promedio de 20 min de **${w.toFixed(0)} W**). Te sirve para fijar las zonas: el fondo suave va por **${z2lo}–${z2hi} W** y el trabajo de umbral por **${z4lo}–${z4hi} W**.`,
    tone: 'neutral',
    icon: '🚴',
  };
  return { ftp: ftp.toFixed(0) + ' W', wKg: '—', resumen, _insight };
}
