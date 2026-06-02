/** pH del suelo: corrección con cal o azufre */
export interface Inputs { phActual: number; phDeseado: number; superficieM2: number; tipoSuelo?: string; __lang?: string; }
export interface Outputs { productoUsar: string; kgTotal: number; gramosM2: number; instruccion: string; _insight?: any; }

const BUFFER_SUELO: Record<string, number> = { arenoso: 0.7, franco: 1.0, arcilloso: 1.4 };

export function phSueloCorreccion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPh: 'Ingresá ambos valores de pH',
      errSup: 'Ingresá la superficie',
      errIgual: 'El pH actual ya es el deseado',
      productoCal: 'Cal agrícola (carbonato de calcio)',
      productoAzufre: 'Azufre elemental',
      instrCal: 'Esparcí la cal uniformemente sobre el suelo y mezclala con los primeros 15-20 cm. Regá bien después. Aplicá 2-3 meses antes de sembrar.',
      instrAzufre: 'Esparcí el azufre sobre el suelo y mezclalo con los primeros 15 cm. Las bacterias del suelo lo convierten en ácido sulfúrico en 1-3 meses. No aplicar cerca de raíces activas.',
      insTitle: 'Plan de corrección',
      insSubir: (kg: string, gm2: string, m2: string, de: string, a: string) => `Para subir el pH de **${de}** a **${a}** en ${m2} m² aplicá **${kg} kg de cal agrícola** (**${gm2} g/m²**). La cal actúa lento: dejala 2-3 meses antes de sembrar.`,
      insBajar: (kg: string, gm2: string, m2: string, de: string, a: string) => `Para bajar el pH de **${de}** a **${a}** en ${m2} m² aplicá **${kg} kg de azufre elemental** (**${gm2} g/m²**). Las bacterias lo acidifican en 1-3 meses, así que corregí con tiempo.`,
    },
    en: {
      errPh: 'Enter both pH values',
      errSup: 'Enter the surface area',
      errIgual: 'The current pH is already the target',
      productoCal: 'Agricultural lime (calcium carbonate)',
      productoAzufre: 'Elemental sulfur',
      instrCal: 'Spread the lime evenly over the soil and mix it into the top 15–20 cm. Water thoroughly afterwards. Apply 2–3 months before planting.',
      instrAzufre: 'Spread the sulfur over the soil and mix it into the top 15 cm. Soil bacteria convert it to sulfuric acid over 1–3 months. Do not apply near active roots.',
      insTitle: 'Correction plan',
      insSubir: (kg: string, gm2: string, m2: string, de: string, a: string) => `To raise the pH from **${de}** to **${a}** over ${m2} m², apply **${kg} kg of agricultural lime** (**${gm2} g/m²**). Lime acts slowly: allow 2–3 months before planting.`,
      insBajar: (kg: string, gm2: string, m2: string, de: string, a: string) => `To lower the pH from **${de}** to **${a}** over ${m2} m², apply **${kg} kg of elemental sulfur** (**${gm2} g/m²**). Soil bacteria acidify it over 1–3 months, so correct well ahead of time.`,
    },
  } as const)[__lang];

  const phAct = Number(i.phActual);
  const phDes = Number(i.phDeseado);
  const m2 = Number(i.superficieM2);
  const suelo = String(i.tipoSuelo || 'franco');
  if (!phAct || !phDes) throw new Error(T.errPh);
  if (!m2 || m2 <= 0) throw new Error(T.errSup);
  if (phAct === phDes) throw new Error(T.errIgual);

  const buffer = BUFFER_SUELO[suelo] || 1;
  const diff = Math.abs(phDes - phAct);

  let producto = '';
  let gm2 = 0;
  let instruccion = '';

  if (phDes > phAct) {
    // Subir pH = agregar cal
    producto = T.productoCal;
    gm2 = diff * 200 * buffer; // ~200 g/m2 por punto de pH en suelo franco
    instruccion = T.instrCal;
  } else {
    // Bajar pH = agregar azufre
    producto = T.productoAzufre;
    gm2 = diff * 60 * buffer; // ~60 g/m2 por punto de pH
    instruccion = T.instrAzufre;
  }

  const kgTotal = (gm2 * m2) / 1000;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const kgFmt = Number(kgTotal.toFixed(2)).toLocaleString(locale);
  const gm2Fmt = Math.round(gm2).toLocaleString(locale);
  const m2Fmt = m2.toLocaleString(locale);
  const deFmt = phAct.toLocaleString(locale);
  const aFmt = phDes.toLocaleString(locale);
  const _insight = {
    title: T.insTitle,
    text: phDes > phAct
      ? T.insSubir(kgFmt, gm2Fmt, m2Fmt, deFmt, aFmt)
      : T.insBajar(kgFmt, gm2Fmt, m2Fmt, deFmt, aFmt),
    tone: 'neutral',
    icon: '🌱',
  };

  return {
    productoUsar: producto,
    kgTotal: Number(kgTotal.toFixed(2)),
    gramosM2: Math.round(gm2),
    instruccion,
    _insight,
  };
}
