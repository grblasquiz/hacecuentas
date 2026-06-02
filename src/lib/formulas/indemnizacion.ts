/**
 * Calculadora de Indemnización por despido sin causa (Argentina)
 *
 * Componentes según LCT (Ley 20.744):
 *   - Art. 245: Indemnización por antigüedad = mejor remuneración mensual,
 *     normal y habitual del último año × (años + fracción > 3 meses)
 *     Tope: 3 × promedio convencional (post fallo Vizzoti 2004: si el tope
 *     reduce más del 33%, se aplica 67% de la base sin tope)
 *   - Art. 231-232: Preaviso + SAC sobre preaviso
 *       15 días <3 meses (prueba)
 *       1 mes entre 3 meses y 5 años
 *       2 meses más de 5 años
 *   - Art. 233: Integración mes de despido (días que faltan hasta fin de mes) + SAC
 *   - Art. 123: SAC proporcional al semestre en curso
 *   - Art. 156: Vacaciones no gozadas proporcionales + SAC sobre vacaciones
 */

export interface IndemnizacionInputs {
  sueldoBruto: number; // mejor remuneración mensual normal y habitual del último año
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11, meses extra más allá de los años completos
  topeConvenio: number; // 3 × promedio convencional; 0 = sin tope
  diaDespido: number; // 1-31, día del mes del despido
  __lang?: string;
}

export interface IndemnizacionOutputs {
  antiguedad: number; // Art. 245
  preaviso: number;
  sacPreaviso: number;
  integracionMes: number;
  sacIntegracion: number;
  sacProporcional: number;
  vacacionesProporcionales: number;
  sacVacaciones: number;
  total: number;
  aniosComputables: string;
  baseArt245: number;
  vizzotiAplicado: boolean;
  _chart?: any;
  _insight?: any;
}

export function indemnizacion(inputs: IndemnizacionInputs): IndemnizacionOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errSueldo: 'Ingresá el sueldo bruto mensual',
      errAntiguedad: 'Ingresá la antigüedad laboral',
      sliceAntiguedad: 'Antigüedad (Art. 245)',
      slicePreaviso: 'Preaviso + SAC',
      sliceIntegracion: 'Integración mes + SAC',
      sliceSac: 'SAC proporcional',
      sliceVacaciones: 'Vacaciones + SAC',
      centerLabel: 'Total',
      ariaLabel: 'Composición de la indemnización por despido: antigüedad, preaviso, integración del mes, SAC proporcional y vacaciones.',
      anioSingular: 'año',
      anioPlural: 'años',
      aniosComputables: (n: number) => `${n} ${n === 1 ? 'año' : 'años'} computables`,
      insTitle: 'Liquidación final',
      insTitleVizzoti: 'Tope aplicado (Vizzoti)',
      insText: (totalFmt: string, antFmt: string, n: number, sueldosTotal: string) =>
        `Tu liquidación por despido suma **${totalFmt}** (≈ **${sueldosTotal} sueldos**), donde la antigüedad (**${antFmt}**) es el componente principal. Se computan **${n}** ${n === 1 ? 'año' : 'años'}: la fracción mayor a 3 meses suma un año entero.`,
      insTextVizzoti: (totalFmt: string, baseFmt: string) =>
        `El tope de convenio reducía la base más del 33%, así que por el fallo **Vizzoti** se tomó el **67% de tu sueldo** (**${baseFmt}**) para el Art. 245. Total estimado: **${totalFmt}**.`,
    },
    en: {
      errSueldo: 'Enter the gross monthly salary',
      errAntiguedad: 'Enter the length of employment',
      sliceAntiguedad: 'Severance (Art. 245)',
      slicePreaviso: 'Notice pay + vacation bonus',
      sliceIntegracion: 'Month integration + vacation bonus',
      sliceSac: 'Proportional vacation bonus',
      sliceVacaciones: 'Unused vacation + vacation bonus',
      centerLabel: 'Total',
      ariaLabel: 'Breakdown of dismissal severance: seniority pay, notice pay, month integration, proportional vacation bonus, and unused vacation.',
      anioSingular: 'year',
      anioPlural: 'years',
      aniosComputables: (n: number) => `${n} ${n === 1 ? 'year' : 'years'} computed`,
      insTitle: 'Final settlement',
      insTitleVizzoti: 'Cap applied (Vizzoti)',
      insText: (totalFmt: string, antFmt: string, n: number, sueldosTotal: string) =>
        `Your dismissal severance totals **${totalFmt}** (≈ **${sueldosTotal} salaries**), with seniority pay (**${antFmt}**) as the main component. **${n}** ${n === 1 ? 'year' : 'years'} are counted: any fraction over 3 months adds a full year.`,
      insTextVizzoti: (totalFmt: string, baseFmt: string) =>
        `The collective-agreement cap cut the base by more than 33%, so under the **Vizzoti** ruling **67% of your salary** (**${baseFmt}**) was used for Art. 245. Estimated total: **${totalFmt}**.`,
    },
  } as const)[__lang];

  const sueldo = Number(inputs.sueldoBruto);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const tope = Math.max(0, Number(inputs.topeConvenio) || 0);
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));

  if (!sueldo || sueldo <= 0) {
    throw new Error(T.errSueldo);
  }
  if (anios === 0 && meses === 0) {
    throw new Error(T.errAntiguedad);
  }

  const antiguedadTotalMeses = anios * 12 + meses;

  // Art. 245: años trabajados + fracción > 3 meses = +1 año
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Base para Art. 245 (mejor remuneración), con posible tope de convenio
  // Fallo Vizzoti: si tope < 67% de la base, tomar 67% de la base
  let baseArt245 = sueldo;
  let vizzotiAplicado = false;
  if (tope > 0) {
    const minConVizzoti = sueldo * 0.67;
    if (tope < minConVizzoti) {
      baseArt245 = minConVizzoti;
      vizzotiAplicado = true;
    } else {
      baseArt245 = tope;
    }
  }

  const antiguedad = baseArt245 * aniosComputables;

  // Preaviso LCT Art. 231: 15 días (<3 meses) / 1 mes (3m a 5a inclusive) / 2 meses (>5a)
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 3) mesesPreaviso = 0.5; // 15 días = medio mes
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;

  const preaviso = sueldo * mesesPreaviso;
  const sacPreaviso = preaviso / 12; // SAC = 1/12 de lo que se paga

  // Integración mes de despido: días que faltan hasta fin de mes
  const diasMes = 30; // promedio
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracionMes = (sueldo / diasMes) * diasFaltantes;
  const sacIntegracion = integracionMes / 12;

  // SAC proporcional al semestre en curso (días trabajados del semestre / 181)
  // Simplificación: mes del despido en el semestre (1-6), proporcional
  // Asumimos media histórica: 3 meses del semestre × 0.5 = 1.5 meses de sueldo medio
  // Fórmula real: (sueldo / 2) × (meses trabajados en semestre / 6)
  // Aquí usamos aproximación 3 meses promedio para simplicidad
  const sacProporcional = (sueldo / 2) * (3 / 6); // ~ medio SAC

  // Vacaciones no gozadas proporcionales: días según antigüedad × (meses trabajados / 12)
  // Simplificación: asumimos que tiene derecho a las vacaciones del año en curso
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;

  // Proporcional al año: suponemos ~6 meses trabajados del año en curso promedio
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25; // Art. 155: jornal vacacional = sueldo / 25
  const vacacionesProporcionales = valorDia * diasVacProp;
  const sacVacaciones = vacacionesProporcionales / 12;

  const total =
    antiguedad +
    preaviso +
    sacPreaviso +
    integracionMes +
    sacIntegracion +
    sacProporcional +
    vacacionesProporcionales +
    sacVacaciones;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const totalFmt = '$' + Math.round(total).toLocaleString(locale);
  const antFmt = '$' + Math.round(antiguedad).toLocaleString(locale);
  const sueldosTotal = (total / sueldo).toFixed(1);
  const insight = vizzotiAplicado
    ? {
        title: T.insTitleVizzoti,
        text: T.insTextVizzoti(totalFmt, '$' + Math.round(baseArt245).toLocaleString(locale)),
        tone: 'warn',
        icon: '⚖️',
      }
    : {
        title: T.insTitle,
        text: T.insText(totalFmt, antFmt, aniosComputables, sueldosTotal),
        tone: 'neutral',
        icon: '💼',
      };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.sliceAntiguedad, value: Math.round(antiguedad) },
      { label: T.slicePreaviso, value: Math.round(preaviso + sacPreaviso) },
      { label: T.sliceIntegracion, value: Math.round(integracionMes + sacIntegracion) },
      { label: T.sliceSac, value: Math.round(sacProporcional) },
      { label: T.sliceVacaciones, value: Math.round(vacacionesProporcionales + sacVacaciones) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };

  return {
    antiguedad: Math.round(antiguedad),
    preaviso: Math.round(preaviso),
    sacPreaviso: Math.round(sacPreaviso),
    integracionMes: Math.round(integracionMes),
    sacIntegracion: Math.round(sacIntegracion),
    sacProporcional: Math.round(sacProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    sacVacaciones: Math.round(sacVacaciones),
    total: Math.round(total),
    aniosComputables: T.aniosComputables(aniosComputables),
    baseArt245: Math.round(baseArt245),
    vizzotiAplicado,
    _chart: chart,
    _insight: insight,
  };
}
