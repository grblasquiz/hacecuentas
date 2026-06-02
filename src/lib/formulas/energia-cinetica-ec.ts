export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaCineticaEc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Completá', title: 'Energía cinética', icon: '⚡' },
    en: { error: 'Fill in the fields', title: 'Kinetic energy', icon: '⚡' },
    pt: { error: 'Preencha os campos', title: 'Energia cinética', icon: '⚡' },
  } as const)[__lang];
  const m = Number(i.masa); const v = Number(i.velocidad);
  if (!m || v === undefined) throw new Error(T.error);
  const Ec = 0.5 * m * v * v;
  const ekKJ = Ec / 1000;
  const resumen = __lang === 'en'
    ? `Ec = ${Ec.toFixed(1)} J with m=${m}kg at ${v}m/s.`
    : __lang === 'pt'
    ? `Ec = ${Ec.toFixed(1)} J com m=${m}kg a ${v}m/s.`
    : `Ec = ${Ec.toFixed(1)} J con m=${m}kg a ${v}m/s.`;
  const insightText = __lang === 'en'
    ? `A mass of **${m} kg** at **${v} m/s** carries **${Ec.toFixed(1)} J** (${ekKJ.toFixed(2)} kJ) of kinetic energy. Energy scales with the *square* of speed, so doubling ${v} m/s would quadruple it.`
    : __lang === 'pt'
    ? `Uma massa de **${m} kg** a **${v} m/s** carrega **${Ec.toFixed(1)} J** (${ekKJ.toFixed(2)} kJ) de energia cinética. A energia cresce com o *quadrado* da velocidade: dobrar ${v} m/s a quadruplicaria.`
    : `Una masa de **${m} kg** a **${v} m/s** lleva **${Ec.toFixed(1)} J** (${ekKJ.toFixed(2)} kJ) de energía cinética. La energía crece con el *cuadrado* de la velocidad: duplicar ${v} m/s la cuadruplicaría.`;
  const _insight = { title: T.title, text: insightText, tone: 'neutral' as const, icon: T.icon };
  return { energia: Ec.toFixed(2) + ' J', resumen, _insight };
}
