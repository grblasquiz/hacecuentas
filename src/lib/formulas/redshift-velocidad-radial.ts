export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | Record<string, any> | undefined; _insight?: any; }
export function redshiftVelocidadRadial(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorZ: 'Ingresá z',
      classicDoppler: 'Doppler clásico',
      relativistic: 'relativista',
      insightTitle: 'Qué significa esta velocidad',
      moving: 'alejándose',
      approaching: 'acercándose',
    },
    en: {
      errorZ: 'Enter z',
      classicDoppler: 'classical Doppler',
      relativistic: 'relativistic',
      insightTitle: 'What this velocity means',
      moving: 'moving away',
      approaching: 'approaching',
    },
  } as const)[__lang];
  const z = Number(i.z);
  if (z === undefined) throw new Error(T.errorZ);
  const c = 299792;
  let v: number;
  if (Math.abs(z) < 0.1) v = z * c;
  else v = c * ((Math.pow(1+z, 2) - 1) / (Math.pow(1+z, 2) + 1));
  const metodo = z < 0.1 ? T.classicDoppler : T.relativistic;
  const fracC = Math.abs(v) / c; // fracción de la velocidad de la luz
  const fracCPct = (fracC * 100).toFixed(fracC < 0.1 ? 2 : 1);
  const dir = v >= 0 ? T.moving : T.approaching;
  const fmtV = new Intl.NumberFormat(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(v)));
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `With a redshift of z = ${z}, the object is **${dir}** at **${fmtV} km/s**, about **${fracCPct}% of the speed of light**, computed with the ${metodo} formula.`
      : `Con un corrimiento z = ${z}, el objeto se está **${dir}** a **${fmtV} km/s**, alrededor del **${fracCPct}% de la velocidad de la luz**, calculado con la fórmula ${metodo}.`,
    tone: 'neutral' as const,
    icon: '🔭',
  };
  return {
    vKms: v.toFixed(0) + ' km/s',
    resumen: `v = ${v.toFixed(0)} km/s (${metodo}).`,
    _insight: insight,
  };
}
