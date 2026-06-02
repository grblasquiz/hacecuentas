/** ¿Cuándo hacerse el test de embarazo? */
export interface Inputs { fumTest: string; duracionCicloTest: number; __lang?: string; }
export interface Outputs { testSangre: string; testOrina: string; ovulacionEstimada: string; nota: string; _insight?: any; }

export function testEmbarazoCuando(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      fechaInvalida: 'Ingresá una fecha válida',
      nota: 'Para mayor confiabilidad, hacé el test con la primera orina de la mañana. Si da negativo pero no viene la menstruación, repetí en 3-5 días.',
      insightTitle: 'Cuándo testear',
    },
    en: {
      fechaInvalida: 'Please enter a valid date',
      nota: 'For best accuracy, take the test with your first morning urine. If it comes back negative but your period still hasn\'t arrived, repeat in 3–5 days.',
      insightTitle: 'When to test',
    },
  } as const)[__lang];

  const parts = String(i.fumTest || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(T.fechaInvalida);
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error(T.fechaInvalida);
  const ciclo = Number(i.duracionCicloTest) || 28;

  const diaOvulacion = ciclo - 14;
  const ovulacion = new Date(fum.getTime());
  ovulacion.setDate(ovulacion.getDate() + diaOvulacion);

  // Test sangre: 8-10 DPO
  const sangre = new Date(ovulacion.getTime());
  sangre.setDate(sangre.getDate() + 9);

  // Test orina: 14 DPO = día de falta
  const orina = new Date(fum.getTime());
  orina.setDate(orina.getDate() + ciclo);

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const fmtCorto = (d: Date) => __lang === 'en'
    ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

  const _insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `A blood test (beta-hCG) can already detect pregnancy around **${fmtCorto(sangre)}**. The urine test is reliable from **${fmtCorto(orina)}**, the day your period would be due with a ${ciclo}-day cycle.`
      : `Un análisis de sangre (beta-hCG) ya puede detectar el embarazo cerca del **${fmtCorto(sangre)}**. El test de orina es confiable desde el **${fmtCorto(orina)}**, el día en que te vendría la menstruación con un ciclo de ${ciclo} días.`,
    tone: 'neutral' as const,
    icon: '🤰',
  };

  return {
    testSangre: fmt(sangre),
    testOrina: fmt(orina),
    ovulacionEstimada: fmt(ovulacion),
    nota: T.nota,
    _insight,
  };
}
