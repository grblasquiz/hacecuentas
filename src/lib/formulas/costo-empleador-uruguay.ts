/**
 * Calculadora del costo real de un empleado para el empleador — Uruguay 2026.
 *
 * Costo total mensual ≈ sueldo nominal
 *   + aportes patronales (jubilatorio 7,5% + FONASA 5% + FRL 0,1%)
 *   + provisión de aguinaldo (1/12 del nominal)
 *   + provisión de licencia + salario vacacional (1/12 aproximado del nominal).
 *
 * Los aportes patronales son REFERENCIALES (Industria y Comercio): varían por
 * sector, convenio colectivo y régimen (rural, construcción, etc.). No incluye
 * el seguro de accidentes (BSE), que depende de la tarifa de riesgo del rubro.
 *
 * Data: src/lib/data/uruguay-2026.ts (URUGUAY_2026.bps.patronal).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface CostoEmpleadorInputs {
  /** Sueldo mensual nominal, en pesos. */
  sueldo?: number | string;
}

export interface CostoEmpleadorOutputs {
  costoTotal: string;
  costoTotalMonto: number;
  costoAnual: string;
  sobrecostoPct: string;
  aportesPatronales: string;
  provisionAguinaldo: string;
  provisionLicencia: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function costoEmpleadorUruguay(i: CostoEmpleadorInputs): CostoEmpleadorOutputs {
  const sueldo = Math.max(0, Number(i.sueldo) || 0);
  const p = URUGUAY_2026.bps.patronal;

  // ── Aportes patronales sobre el nominal ──
  const jubilatorio = sueldo * p.jubilatorio;
  const fonasa = sueldo * p.fonasa;
  const frl = sueldo * p.frl;
  const aportesPatronales = jubilatorio + fonasa + frl;

  // ── Provisión de aguinaldo: 1/12 del nominal ──
  const provisionAguinaldo = sueldo / 12;

  // ── Provisión de licencia + salario vacacional ──
  // Licencia: ~20 días/año ≈ 20/30 sueldo/año ≈ 0,667 sueldo/año → /12 mensual.
  // Salario vacacional: ~igual partida líquida. Aproximación conjunta ≈ 1/12 del nominal.
  const provisionLicencia = sueldo / 12;

  const costoTotal = sueldo + aportesPatronales + provisionAguinaldo + provisionLicencia;
  const sobrecosto = sueldo > 0 ? ((costoTotal - sueldo) / sueldo) * 100 : 0;

  return {
    costoTotal: fmtUYU(costoTotal),
    costoTotalMonto: Math.round(costoTotal),
    costoAnual: fmtUYU(costoTotal * 12),
    sobrecostoPct: `+${sobrecosto.toFixed(1)}%`,
    aportesPatronales: fmtUYU(aportesPatronales),
    provisionAguinaldo: fmtUYU(provisionAguinaldo),
    provisionLicencia: fmtUYU(provisionLicencia),
    detalle:
      `Nominal ${fmtUYU(sueldo)} + aportes patronales ${fmtUYU(aportesPatronales)} ` +
      `(7,5% + 5% + 0,1%) + aguinaldo ${fmtUYU(provisionAguinaldo)} + licencia/vacacional ` +
      `${fmtUYU(provisionLicencia)} = ${fmtUYU(costoTotal)} por mes.`,
    _insight: {
      title: 'Cuánto te cuesta realmente el empleado',
      text:
        `Un sueldo nominal de **${fmtUYU(sueldo)}** te cuesta en realidad **${fmtUYU(costoTotal)} por mes** (**+${sobrecosto.toFixed(1)}%**), ` +
        `o **${fmtUYU(costoTotal * 12)} al año**. La diferencia son los **aportes patronales** (${fmtUYU(aportesPatronales)}) más las **provisiones** de aguinaldo y licencia. ` +
        `Los aportes son referenciales: varían según el sector y el convenio.`,
      tone: 'warn' as const,
      icon: '🏢',
    },
    _table: {
      title: 'Costo mensual del empleado (sueldo nominal ' + fmtUYU(sueldo) + ')',
      headers: ['Concepto', 'Tasa / base', 'Monto'],
      rows: [
        ['Sueldo nominal', '100%', fmtUYU(sueldo)],
        ['Jubilatorio patronal', '7,5%', fmtUYU(jubilatorio)],
        ['FONASA patronal', '5%', fmtUYU(fonasa)],
        ['FRL patronal', '0,1%', fmtUYU(frl)],
        ['Provisión aguinaldo', '1/12', fmtUYU(provisionAguinaldo)],
        ['Provisión licencia + vacacional', '≈ 1/12', fmtUYU(provisionLicencia)],
        ['Costo total mensual', `+${sobrecosto.toFixed(1)}%`, fmtUYU(costoTotal)],
      ],
      note: 'Aportes patronales referenciales de Industria y Comercio (BPS). Varían por sector y convenio. No incluye el seguro de accidentes de trabajo (BSE), cuya prima depende de la tarifa de riesgo del rubro.',
    },
  };
}
