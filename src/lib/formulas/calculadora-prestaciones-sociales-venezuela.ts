/**
 * Prestaciones sociales Venezuela — LOTTT Art. 142 (sistema DUAL: se paga el MAYOR).
 *
 * (a+b) GARANTÍA de prestaciones:
 *        15 días de salario integral por trimestre (depósito trimestral)
 *        + 2 días adicionales por año a partir del 2º año, acumulativos, tope 30 días.
 * (c)   RETROACTIVO:
 *        30 días de salario integral por año (o fracción > 6 meses) calculados al
 *        ÚLTIMO salario integral.
 *
 * Resultado (literal d): el TRABAJADOR recibe el MAYOR entre garantía y retroactivo.
 *
 * El salario integral = salario diario normal + alícuota de utilidades + alícuota de
 * bono vacacional, prorrateadas sobre 360 días.
 *
 * Fuente: LOTTT Art. 142, Art. 104, Art. 131, Art. 192.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual: number;        // salario normal mensual (Bs.)
  aniosAntiguedad: number;       // años completos de antigüedad
  mesesAntiguedad?: number;      // meses adicionales (0-11)
  diasUtilidades?: number;       // días de utilidades que paga la empresa (min legal 30)
  diasBonoVacacional?: number;   // días de bono vacacional (min legal 15)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraPrestacionesSocialesVenezuela(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const p = l.prestaciones;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const aniosEnteros = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.mesesAntiguedad) || 0)));
  const diasUtilidades = Math.max(0, Number(i.diasUtilidades ?? l.utilidadesDiasMin) || l.utilidadesDiasMin);
  const diasBonoVac = Math.max(0, Number(i.diasBonoVacacional ?? l.bonoVacacionalDiasBase) || l.bonoVacacionalDiasBase);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const DIAS_ANIO = l.diasAnioComercial; // 360

  // ── Salario integral diario (base de las prestaciones) ──
  const salarioDiarioNormal = salarioMensual / 30;
  const alicuotaUtilidades = (diasUtilidades * salarioDiarioNormal) / DIAS_ANIO;
  const alicuotaBonoVac = (diasBonoVac * salarioDiarioNormal) / DIAS_ANIO;
  const salarioDiarioIntegral = salarioDiarioNormal + alicuotaUtilidades + alicuotaBonoVac;

  // Antigüedad total en meses y fracción de año
  const mesesTotales = aniosEnteros * 12 + mesesExtra;
  const aniosDecimal = mesesTotales / 12;

  // ── (a+b) GARANTÍA: 15 días/trimestre + 2 días/año adicionales (desde 2º año, tope 30) ──
  const trimestresCompletos = Math.floor(mesesTotales / 3);
  const diasGarantiaBase = p.garantiaDiasPorTrimestre * trimestresCompletos; // 15 × trimestres

  // Días adicionales: 2 por año a partir del 2º año, acumulativos, tope 30.
  // Año 1: 0; año 2: 2; año 3: 4 … (suma 2·(n-1) hasta el año en curso), tope 30.
  let diasAdicionales = 0;
  for (let anio = 2; anio <= aniosEnteros; anio++) {
    diasAdicionales += p.diasAdicionalesPorAnio;
  }
  diasAdicionales = Math.min(diasAdicionales, p.diasAdicionalesMax);

  const diasGarantiaTotal = diasGarantiaBase + diasAdicionales;
  const montoGarantia = diasGarantiaTotal * salarioDiarioIntegral;

  // ── (c) RETROACTIVO: 30 días/año, fracción > 6 meses = año completo, al último integral ──
  let aniosRetroactivo = aniosEnteros;
  if (mesesExtra > p.fraccionSuperiorMeses) aniosRetroactivo += 1; // fracción > 6 meses → año completo
  const diasRetroactivo = p.retroactivoDiasPorAnio * aniosRetroactivo; // 30 × años
  const montoRetroactivo = diasRetroactivo * salarioDiarioIntegral;

  // ── Resultado: el MAYOR (LOTTT Art. 142, literal d) ──
  const prestaciones = Math.max(montoGarantia, montoRetroactivo);
  const sistemaAplicado = montoRetroactivo >= montoGarantia ? 'retroactivo' : 'garantía';

  const _insight = {
    type: 'highlight',
    icon: '💰',
    text: `Con **${aniosEnteros} año(s) y ${mesesExtra} mes(es)** de antigüedad y un salario integral diario de **${fmtVES(salarioDiarioIntegral)}**, ` +
      `tus prestaciones sociales son **${fmtVES(prestaciones)}**. La ley (Art. 142 LOTTT) compara dos cálculos y te paga el mayor: ` +
      `la garantía trimestral (${diasGarantiaTotal} días → ${fmtVES(montoGarantia)}) y el retroactivo (${diasRetroactivo} días → ${fmtVES(montoRetroactivo)}). ` +
      `En tu caso gana el **${sistemaAplicado}**.`,
  };

  const _table = {
    title: 'Garantía vs. retroactivo — se paga el mayor (Art. 142 LOTTT)',
    headers: ['Sistema', 'Días de salario integral', 'Monto', '¿Aplica?'],
    rows: [
      [
        'Garantía (15 días/trim. + 2/año)',
        `${diasGarantiaTotal} días (${diasGarantiaBase} + ${diasAdicionales} adic.)`,
        fmtVES(montoGarantia),
        sistemaAplicado === 'garantía' ? '✅ Sí (es el mayor)' : 'No',
      ],
      [
        'Retroactivo (30 días/año)',
        `${diasRetroactivo} días (${aniosRetroactivo} año/s × 30)`,
        fmtVES(montoRetroactivo),
        sistemaAplicado === 'retroactivo' ? '✅ Sí (es el mayor)' : 'No',
      ],
      ['Prestaciones a pagar', '—', fmtVES(prestaciones), 'Total'],
    ],
    note: 'El salario integral diario incluye la alícuota de utilidades y la de bono vacacional. La fracción superior a 6 meses cuenta como año completo en el retroactivo.',
  };

  return {
    prestaciones: Number(prestaciones.toFixed(2)),
    montoGarantia: Number(montoGarantia.toFixed(2)),
    montoRetroactivo: Number(montoRetroactivo.toFixed(2)),
    sistemaAplicado,
    salarioDiarioIntegral: Number(salarioDiarioIntegral.toFixed(2)),
    diasGarantia: diasGarantiaTotal,
    diasRetroactivo,
    aniosDecimal: Number(aniosDecimal.toFixed(2)),
    detalle: `Mayor entre garantía (${fmtVES(montoGarantia)}) y retroactivo (${fmtVES(montoRetroactivo)}) = ${fmtVES(prestaciones)}`,
    _insight,
    _table,
  };
}
