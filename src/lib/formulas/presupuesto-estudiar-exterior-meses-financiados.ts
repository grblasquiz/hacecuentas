/**
 * Meses de estudio en el exterior financiables con un presupuesto dado.
 *
 * Modelo (runway):
 *   meses_financiados = presupuesto_total_USD ÷ costo_mensual_USD
 *
 * Si el usuario ingresa la duración del programa (opcional), se calcula
 * además la cobertura (%) y la brecha en meses y USD a cubrir con beca,
 * trabajo o financiamiento. Referencias de costos de vida por destino:
 * DAAD (Alemania) y Campus France (Francia), 2025.
 */
export interface Inputs { [k: string]: number | string | undefined; __lang?: string; }
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function presupuestoEstudiarExteriorMesesFinanciados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const presupuesto = Math.max(0, Number(i.presupuestoTotal) || 0);
  const costoMensual = Number(i.costoMensual) || 0;

  // Campo OPCIONAL: ''/null/undefined => no provisto (0 también se trata como
  // "sin programa": una duración de 0 meses no tiene sentido como dato real).
  const rawMeses = i.mesesPrograma;
  const mesesPrograma = (rawMeses === '' || rawMeses === null || rawMeses === undefined)
    ? 0
    : Math.max(0, Math.floor(Number(rawMeses) || 0));

  if (costoMensual <= 0) {
    throw new Error(__lang === 'en'
      ? 'Enter a monthly cost of living greater than 0'
      : 'Ingresá un costo de vida mensual mayor a 0');
  }

  const meses = presupuesto / costoMensual;
  const mesesR = Math.round(meses * 10) / 10;

  const fmtUSD = (n: number) =>
    '$' + Math.round(n).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  const fmtMeses = (n: number) => {
    const v = Math.round(n * 10) / 10;
    const s = Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', __lang === 'en' ? '.' : ',');
    return s;
  };

  const mesesStr = __lang === 'en'
    ? `${fmtMeses(mesesR)} months`
    : `${fmtMeses(mesesR)} meses`;

  let cobertura: string;
  let brecha: string;
  let resumen: string;
  let insightText: string;
  let tone: string = 'neutral';

  if (mesesPrograma > 0) {
    const pct = Math.round((meses / mesesPrograma) * 100);
    const mesesFaltantes = mesesPrograma - meses;
    cobertura = __lang === 'en'
      ? `${Math.min(pct, 999)}% of the ${mesesPrograma}-month program`
      : `${Math.min(pct, 999)}% del programa de ${mesesPrograma} meses`;

    if (mesesFaltantes <= 0) {
      const colchon = Math.abs(mesesFaltantes);
      brecha = __lang === 'en'
        ? `Covered — ${fmtMeses(colchon)} months of buffer (${fmtUSD(colchon * costoMensual)})`
        : `Cubierto — ${fmtMeses(colchon)} meses de colchón (${fmtUSD(colchon * costoMensual)})`;
      resumen = __lang === 'en'
        ? `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/month = ${mesesStr}. Your budget covers the full ${mesesPrograma}-month program with ${fmtMeses(colchon)} months to spare.`
        : `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/mes = ${mesesStr}. Tu presupuesto cubre el programa completo de ${mesesPrograma} meses con ${fmtMeses(colchon)} meses de margen.`;
      insightText = __lang === 'en'
        ? `Your budget funds **${mesesStr}** at ${fmtUSD(costoMensual)}/month — the full program plus a buffer. Keep the buffer untouched: arrival/setup costs typically run 2.5–3.5× a normal month (deposit, flight, paperwork).`
        : `Tu presupuesto financia **${mesesStr}** a ${fmtUSD(costoMensual)}/mes — el programa completo más un colchón. No te comas el colchón: el primer mes de instalación suele costar 2,5–3,5 veces un mes normal (depósito, vuelo, trámites).`;
      tone = 'positive';
    } else {
      const usdFaltantes = mesesFaltantes * costoMensual;
      brecha = __lang === 'en'
        ? `${fmtMeses(mesesFaltantes)} months short ≈ ${fmtUSD(usdFaltantes)} to cover`
        : `Faltan ${fmtMeses(mesesFaltantes)} meses ≈ ${fmtUSD(usdFaltantes)} a cubrir`;
      resumen = __lang === 'en'
        ? `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/month = ${mesesStr}. The program lasts ${mesesPrograma} months, so you need ${fmtUSD(usdFaltantes)} more (scholarship, part-time work or financing).`
        : `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/mes = ${mesesStr}. El programa dura ${mesesPrograma} meses, así que necesitás ${fmtUSD(usdFaltantes)} más (beca, trabajo parcial o financiamiento).`;
      insightText = __lang === 'en'
        ? `Your budget funds **${mesesStr}** of a ${mesesPrograma}-month program (${Math.min(pct, 999)}%). The gap is **${fmtUSD(usdFaltantes)}**. Close it before booking: scholarships (Fulbright, DAAD, Chevening, Eiffel) or legal part-time work at the destination (20–30 h/week in most countries).`
        : `Tu presupuesto financia **${mesesStr}** de un programa de ${mesesPrograma} meses (${Math.min(pct, 999)}%). La brecha es de **${fmtUSD(usdFaltantes)}**. Cerrala antes de reservar el vuelo: becas (Fulbright, DAAD, Chevening, Eiffel) o trabajo parcial legal en destino (20–30 hs/semana en la mayoría de los países).`;
      tone = 'warn';
    }
  } else {
    cobertura = __lang === 'en'
      ? 'Enter the program length to see coverage'
      : 'Ingresá la duración del programa para ver la cobertura';
    brecha = __lang === 'en'
      ? 'Enter the program length to size the gap'
      : 'Ingresá la duración del programa para dimensionar la brecha';
    resumen = __lang === 'en'
      ? `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/month = ${mesesStr} of stay you can fund without extra income.`
      : `${fmtUSD(presupuesto)} ÷ ${fmtUSD(costoMensual)}/mes = ${mesesStr} de estadía que podés financiar sin ingresos extra.`;
    insightText = __lang === 'en'
      ? `With ${fmtUSD(presupuesto)} and a cost of living of ${fmtUSD(costoMensual)}/month, you can fund **${mesesStr}** abroad. Compare that number against your program length — and remember the first month typically costs 2.5–3.5× more (deposit, flight, paperwork).`
      : `Con ${fmtUSD(presupuesto)} y un costo de vida de ${fmtUSD(costoMensual)}/mes, podés financiar **${mesesStr}** en el exterior. Compará ese número contra la duración de tu programa — y acordate de que el primer mes cuesta 2,5–3,5 veces más (depósito, vuelo, trámites).`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Your runway abroad' : 'Tu colchón de meses en el exterior',
    text: insightText,
    tone,
    icon: '🌍',
  };

  const out: Outputs = {
    meses: mesesStr,
    cobertura,
    brecha,
    resumen,
    _insight,
  };

  if (mesesPrograma > 0) {
    out._chart = {
      type: 'gauge',
      value: Math.min(mesesR, mesesPrograma),
      min: 0,
      max: mesesPrograma,
      label: __lang === 'en'
        ? `${fmtMeses(Math.min(mesesR, mesesPrograma))} of ${mesesPrograma} months`
        : `${fmtMeses(Math.min(mesesR, mesesPrograma))} de ${mesesPrograma} meses`,
      zones: [
        { from: 0, to: mesesPrograma * 0.5, color: '#ef4444' },
        { from: mesesPrograma * 0.5, to: mesesPrograma * 0.85, color: '#f59e0b' },
        { from: mesesPrograma * 0.85, to: mesesPrograma, color: '#22c55e' },
      ],
      ariaLabel: __lang === 'en'
        ? `Your budget funds ${mesesStr} of a ${mesesPrograma}-month program.`
        : `Tu presupuesto financia ${mesesStr} de un programa de ${mesesPrograma} meses.`,
    };
  }

  return out;
}
