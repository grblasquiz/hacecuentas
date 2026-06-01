export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function efectoDopplerVelocidadFrecuencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá',
      masAguda: '(más aguda)',
      masGrave: '(más grave)',
      resumen: (hz: string, pitch: string) => `Frecuencia percibida: ${hz} Hz ${pitch}.`,
    },
    en: {
      error: 'Fill in all fields',
      masAguda: '(higher pitch)',
      masGrave: '(lower pitch)',
      resumen: (hz: string, pitch: string) => `Perceived frequency: ${hz} Hz ${pitch}.`,
    },
  } as const)[__lang];
  const f = Number(i.f); const vs = Number(i.vs); const vo = Number(i.vo) || 0;
  const v = Number(i.v) || 343; const dir = String(i.direccion);
  if (!f || vs === undefined) throw new Error(T.error);
  let fp: number;
  if (dir === 'acerca') fp = f * (v + vo) / (v - vs);
  else fp = f * (v - vo) / (v + vs);
  const pitch = dir === 'acerca' ? T.masAguda : T.masGrave;
  return { fPercibida: fp.toFixed(1) + ' Hz', resumen: T.resumen(fp.toFixed(0), pitch) };
}
