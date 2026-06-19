/**
 * Calculadora de Prestaciones Superiores a la Ley — México 2026
 *
 * Valúa el paquete de compensación TOTAL anual (sueldo + prestaciones ofrecidas) y lo
 * compara contra el MÍNIMO que exige la Ley Federal del Trabajo (LFT) para ver cuánto
 * "vale de más" la oferta sobre el piso legal.
 *
 * Prestaciones consideradas:
 *  - Aguinaldo: días de salario (mínimo LFT Art. 87 = 15 días).
 *  - Prima vacacional: % sobre los días de vacaciones (mínimo LFT Art. 80 = 25%).
 *  - Días de vacaciones: reforma 2023 (LFT Art. 76) = 12 días el 1er año, +2/año hasta 20.
 *  - Vales de despensa (en monedero electrónico): exentos de ISR hasta 1 UMA mensual (LISR Art. 93-VIII).
 *  - Fondo de ahorro (aportación patronal): exento hasta min(13% del salario, 1.3 UMA anual) (LISR Art. 27-XI / 93).
 *  - SGMM y otros (vida, vales de gasolina, bonos fijos…): monto anual informado por el usuario.
 *
 * Datos 2026 desde la fuente única src/lib/data/mexico-2026.ts (UMA, mínimos LFT).
 */

import { MEXICO_2026, fmtMXN, factorIntegracion } from '../data/mexico-2026.ts';

export interface Inputs {
  // Sueldo
  salarioMensual: number;          // sueldo bruto mensual
  antiguedad?: number;             // años de servicio (para días de vacaciones de ley)
  // Paquete ofrecido
  diasAguinaldo?: number;          // días de aguinaldo que ofrece la empresa
  primaVacacionalPorc?: number;    // % de prima vacacional ofrecido
  diasVacaciones?: number;         // días de vacaciones ofrecidos (0 = usar los de ley)
  valesDespensaMensual?: number;   // vales de despensa mensuales (monto)
  fondoAhorroPorc?: number;        // aportación patronal al fondo de ahorro (% del salario)
  sgmmOtrosAnual?: number;         // SGMM, seguro de vida, otros beneficios (monto anual)
}

export interface Outputs {
  valorPaqueteAnual: number;       // compensación total anual del paquete (sueldo + prestaciones)
  valorMinimoLeyAnual: number;     // compensación total anual con prestaciones MÍNIMAS de ley
  valorExtraAnual: number;         // cuánto "vale de más" el paquete sobre el mínimo
  pctSobreMinimo: number;          // % del paquete por encima del mínimo de ley
  prestacionesAnual: number;       // valor de las prestaciones del paquete (sin el sueldo base)
  ingresoMensualEquivalente: number; // paquete anual / 12 (sueldo "mochila")
  exentoIsrAnual: number;          // porción de prestaciones exenta de ISR (vales + fondo)
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.\-]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Días de vacaciones de ley según antigüedad (reforma 2023, LFT Art. 76). */
function diasVacacionesLey(anios: number): number {
  const { lft } = MEXICO_2026;
  const a = Math.max(1, Math.floor(anios));
  if (a <= lft.vacacionesPorAnio.length) return lft.vacacionesPorAnio[a - 1]; // años 1-5 → 12,14,16,18,20
  return 20 + lft.vacacionesIncrementoQuinquenal * Math.ceil((a - 5) / 5);    // 6-10:22, 11-15:24…
}

export function compute(i: Inputs): Outputs {
  const { uma, lft } = MEXICO_2026;

  const salarioMensual = num(i.salarioMensual);
  if (!salarioMensual || salarioMensual <= 0) throw new Error('Ingresá tu sueldo mensual bruto');

  const antiguedad = Math.max(1, num(i.antiguedad) || 1);
  const salarioDiario = salarioMensual / 30; // salario diario (mes comercial de 30 días)
  const salarioAnual = salarioMensual * 12;

  // ── Mínimos de ley (pisos LFT) ──
  const diasVacLey = diasVacacionesLey(antiguedad);
  const aguinaldoLeyDias = lft.aguinaldoDiasMinimo;       // 15 días
  const primaVacLeyPorc = lft.primaVacacional * 100;      // 25%

  const aguinaldoLey = salarioDiario * aguinaldoLeyDias;
  const primaVacLey = salarioDiario * diasVacLey * (primaVacLeyPorc / 100);
  // El descanso pagado de las vacaciones ya está dentro del sueldo anual; el "extra" económico
  // de las vacaciones es la prima vacacional, así que no se duplica el salario de esos días.

  const prestacionesLeyAnual = aguinaldoLey + primaVacLey;
  const valorMinimoLeyAnual = salarioAnual + prestacionesLeyAnual;

  // ── Paquete ofrecido ──
  const diasAguinaldo = Math.max(aguinaldoLeyDias, num(i.diasAguinaldo) || aguinaldoLeyDias);
  const primaVacPorc = Math.max(primaVacLeyPorc, num(i.primaVacacionalPorc) || primaVacLeyPorc);
  const diasVac = Math.max(diasVacLey, num(i.diasVacaciones) || diasVacLey);
  const valesMensual = Math.max(0, num(i.valesDespensaMensual));
  const fondoPorc = Math.max(0, num(i.fondoAhorroPorc));
  const sgmmOtros = Math.max(0, num(i.sgmmOtrosAnual));

  const aguinaldoPaq = salarioDiario * diasAguinaldo;
  const primaVacPaq = salarioDiario * diasVac * (primaVacPorc / 100);
  const valesAnual = valesMensual * 12;
  // Fondo de ahorro: la empresa aporta fondoPorc% del salario (iguala al trabajador). Ese aporte
  // patronal es el beneficio económico para el empleado.
  const fondoAnual = salarioAnual * (fondoPorc / 100);

  const prestacionesAnual = aguinaldoPaq + primaVacPaq + valesAnual + fondoAnual + sgmmOtros;
  const valorPaqueteAnual = salarioAnual + prestacionesAnual;

  const valorExtraAnual = valorPaqueteAnual - valorMinimoLeyAnual;
  const pctSobreMinimo = valorMinimoLeyAnual > 0 ? (valorExtraAnual / valorMinimoLeyAnual) * 100 : 0;
  const ingresoMensualEquivalente = valorPaqueteAnual / 12;

  // ── Porción exenta de ISR de las prestaciones (vales + fondo) ──
  // Vales de despensa: exentos hasta 1 UMA mensual (Art. 93-VIII LISR).
  const valesExentoAnual = Math.min(valesAnual, uma.mensual * 12);
  // Fondo de ahorro (aporte patronal): exento hasta min(13% del salario, 1.3 UMA anual).
  const fondoTopeLegal = Math.min(salarioAnual * 0.13, uma.anual * 1.3);
  const fondoExentoAnual = Math.min(fondoAnual, fondoTopeLegal);
  const exentoIsrAnual = valesExentoAnual + fondoExentoAnual;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r0 = (n: number) => Math.round(n);

  // ── Narrativa ──
  const veredicto =
    pctSobreMinimo <= 0
      ? 'apenas el mínimo de ley'
      : pctSobreMinimo < 10
      ? 'ligeramente arriba de la ley'
      : pctSobreMinimo < 25
      ? 'un buen paquete'
      : 'un paquete muy competitivo';

  const _insight = {
    title:
      pctSobreMinimo <= 0
        ? 'Paquete al mínimo de ley'
        : `Tu paquete vale ${pctSobreMinimo.toFixed(1)}% más que la ley`,
    text:
      pctSobreMinimo <= 0
        ? `Con sueldo de **${fmtMXN(salarioMensual)}** al mes y solo prestaciones de ley, tu compensación anual total es **${fmtMXN(valorPaqueteAnual)}** (incluye aguinaldo de ${diasAguinaldo} días y prima vacacional del ${primaVacPorc}%). No hay prestaciones superiores: es el piso que marca la LFT.`
        : `Sumando vales, fondo de ahorro, SGMM y un aguinaldo/prima por arriba del mínimo, tu compensación anual total llega a **${fmtMXN(valorPaqueteAnual)}** — **${fmtMXN(valorExtraAnual)}** más que el mínimo de ley (**${fmtMXN(valorMinimoLeyAnual)}**). Eso equivale a **${fmtMXN(ingresoMensualEquivalente)}** mensuales de sueldo "mochila": ${veredicto}. Además, **${fmtMXN(exentoIsrAnual)}** de tus prestaciones (vales + fondo) llegan **libres de ISR**.`,
    tone: pctSobreMinimo <= 0 ? 'neutral' : pctSobreMinimo >= 20 ? 'good' : 'warn',
    icon: '🎁',
  };

  // Barras: composición del paquete anual (sueldo base + cada bloque de prestación).
  const slices: Array<{ label: string; value: number }> = [
    { label: 'Sueldo base', value: r0(salarioAnual) },
    { label: 'Aguinaldo', value: r0(aguinaldoPaq) },
    { label: 'Prima vacacional', value: r0(primaVacPaq) },
  ];
  if (valesAnual > 0) slices.push({ label: 'Vales de despensa', value: r0(valesAnual) });
  if (fondoAnual > 0) slices.push({ label: 'Fondo de ahorro', value: r0(fondoAnual) });
  if (sgmmOtros > 0) slices.push({ label: 'SGMM / otros', value: r0(sgmmOtros) });

  const _chart = {
    type: 'bar',
    slices,
    prefix: '$',
    ariaLabel: `Composición del paquete anual de ${fmtMXN(valorPaqueteAnual)}: sueldo base más cada prestación`,
  };

  const detalle =
    `Paquete anual ${fmtMXN(valorPaqueteAnual)} = sueldo ${fmtMXN(salarioAnual)} + prestaciones ${fmtMXN(prestacionesAnual)} ` +
    `(aguinaldo ${diasAguinaldo}d ${fmtMXN(aguinaldoPaq)} · prima vac. ${primaVacPorc}% ${fmtMXN(primaVacPaq)} · ` +
    `vales ${fmtMXN(valesAnual)} · fondo ahorro ${fondoPorc}% ${fmtMXN(fondoAnual)} · SGMM/otros ${fmtMXN(sgmmOtros)}). ` +
    `Mínimo de ley: ${fmtMXN(valorMinimoLeyAnual)}. Diferencia: ${fmtMXN(valorExtraAnual)} (${pctSobreMinimo.toFixed(1)}% sobre el mínimo).`;

  return {
    valorPaqueteAnual: r2(valorPaqueteAnual),
    valorMinimoLeyAnual: r2(valorMinimoLeyAnual),
    valorExtraAnual: r2(valorExtraAnual),
    pctSobreMinimo: r2(pctSobreMinimo),
    prestacionesAnual: r2(prestacionesAnual),
    ingresoMensualEquivalente: r2(ingresoMensualEquivalente),
    exentoIsrAnual: r2(exentoIsrAnual),
    detalle,
    _insight,
    _chart,
  };
}
