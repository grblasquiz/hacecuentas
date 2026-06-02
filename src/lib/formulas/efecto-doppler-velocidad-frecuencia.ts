export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function efectoDopplerVelocidadFrecuencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá',
      masAguda: '(más aguda)',
      masGrave: '(más grave)',
      resumen: (hz: string, pitch: string) => `Frecuencia percibida: ${hz} Hz ${pitch}.`,
      insTitleUp: 'Se percibe más aguda',
      insTitleDown: 'Se percibe más grave',
      insText: (f0: string, fp: string, acerca: boolean) =>
        `La fuente emite **${f0} Hz**, pero ${acerca ? 'al acercarse las ondas se comprimen' : 'al alejarse las ondas se estiran'} y se percibe **${fp} Hz**. Es el mismo efecto de la sirena que cambia de tono al pasar.`,
    },
    en: {
      error: 'Fill in all fields',
      masAguda: '(higher pitch)',
      masGrave: '(lower pitch)',
      resumen: (hz: string, pitch: string) => `Perceived frequency: ${hz} Hz ${pitch}.`,
      insTitleUp: 'Perceived as higher-pitched',
      insTitleDown: 'Perceived as lower-pitched',
      insText: (f0: string, fp: string, acerca: boolean) =>
        `The source emits **${f0} Hz**, but ${acerca ? 'as it approaches the waves compress' : 'as it recedes the waves stretch'} and you hear **${fp} Hz**. It is the same effect as a siren shifting pitch as it passes by.`,
    },
  } as const)[__lang];
  const f = Number(i.f); const vs = Number(i.vs); const vo = Number(i.vo) || 0;
  const v = Number(i.v) || 343; const dir = String(i.direccion);
  if (!f || vs === undefined) throw new Error(T.error);
  let fp: number;
  if (dir === 'acerca') fp = f * (v + vo) / (v - vs);
  else fp = f * (v - vo) / (v + vs);
  const pitch = dir === 'acerca' ? T.masAguda : T.masGrave;
  const acerca = dir === 'acerca';
  const _insight = {
    title: acerca ? T.insTitleUp : T.insTitleDown,
    text: T.insText(f.toString(), fp.toFixed(0), acerca),
    tone: 'neutral',
    icon: acerca ? '🔊' : '🔉',
  };
  return { fPercibida: fp.toFixed(1) + ' Hz', resumen: T.resumen(fp.toFixed(0), pitch), _insight };
}
