export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoDescargaArchivoAnchoBanda(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorVelocidad: 'Velocidad no puede ser 0.',
      seg: 'seg',
      resumen: (mb: number, mbps: number, h: number, m: number, s: number) => `Descarga de ${mb}MB a ${mbps}Mbps = ${h}h ${m}m ${s}s.`,
    },
    en: {
      errorVelocidad: 'Speed cannot be 0.',
      seg: 'sec',
      resumen: (mb: number, mbps: number, h: number, m: number, s: number) => `Download of ${mb}MB at ${mbps}Mbps = ${h}h ${m}m ${s}s.`,
    },
  } as const)[__lang];
  const mb=Number(i.tamano)||0; const mbps=Number(i.velocidad)||0;
  if (mbps===0) return { tiempo:'—', tiempoH:'—', resumen: T.errorVelocidad };
  const seg=mb*8/mbps;
  const h=Math.floor(seg/3600); const m=Math.floor((seg%3600)/60); const s=Math.round(seg%60);
  return { tiempo:`${seg.toFixed(1)} ${T.seg}`, tiempoH:`${h}h ${m}m ${s}s`, resumen: T.resumen(mb, mbps, h, m, s) };
}
