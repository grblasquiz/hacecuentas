/**
 * Costo por hora REAL de un empleado para la empresa — Colombia 2026.
 *
 * Convierte el costo total cargado del empleado (lo que la empresa desembolsa de verdad)
 * en un $/hora útil para COTIZAR / PRICING, dividiéndolo entre las horas PRODUCTIVAS del mes
 * (no entre el divisor legal de 220/210, que sólo sirve para liquidar el salario).
 *
 * Costo total mensual cargado =
 *   salario
 * + factor prestacional  (cesantías 8,33% + intereses 1% + prima 8,33% + vacaciones 4,17%)
 * + seguridad social patronal (salud 8,5% salvo exoneración art.114-1 ET, pensión 12%, ARL por clase)
 * + parafiscales (caja 4% + SENA 2% + ICBF 3%, SENA/ICBF exonerables art.114-1)
 * + auxilio de transporte (si gana ≤ 2 SMLMV)
 *
 * Costo por hora real = costo total mensual ÷ horas productivas del mes (≈ 190 h).
 * Constantes y formato de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  claseRiesgoArl?: string;        // 'I' | 'II' | 'III' | 'IV' | 'V'
  horasProductivasMes?: number | string; // default 190
  exoneradoArt114?: string;       // 'si' | 'no' (PJ con trabajadores < 10 SMLMV)
  auxilioTransporte?: string;     // 'auto' | 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá el salario mensual del empleado');

  // ── Auxilio de transporte: aplica si gana ≤ 2 SMLMV (a menos que se fuerce) ──
  const aux = String(i.auxilioTransporte ?? 'auto');
  const aplicaAuxAuto = salario <= C.smlmv * C.topeAuxilioSmlmv;
  const incluyeAuxilio = aux === 'si' || (aux === 'auto' && aplicaAuxAuto);
  const auxilio = aux === 'no' ? 0 : (incluyeAuxilio ? C.auxilioTransporte : 0);

  // ── Factor prestacional (sobre el salario; el auxilio entra sólo en cesantías y prima como base) ──
  // Base de cesantías y prima incluye el auxilio de transporte (art. 7 Ley 1ª/1963 + jurisprudencia).
  const baseConAuxilio = salario + auxilio;
  const cesantias = baseConAuxilio * C.prestaciones.cesantiasPorcentaje;          // 8,33%
  const interesesCesantias = cesantias * C.prestaciones.interesesCesantias;        // 12% de las cesantías (≈1% del salario)
  const prima = baseConAuxilio * C.prestaciones.primaPorcentaje;                   // 8,33%
  const vacaciones = salario * C.prestaciones.vacacionesPorcentaje;               // 4,17% (sólo sobre salario, sin auxilio)
  const factorPrestacional = cesantias + interesesCesantias + prima + vacaciones;

  // ── Seguridad social patronal (sobre el salario; el auxilio NO es base de aportes) ──
  const exonerado = String(i.exoneradoArt114 ?? 'si') === 'si' &&
    salario < C.smlmv * C.aportes.exoneracionArt114_1SmlmvTope;
  const salud = exonerado ? 0 : salario * C.aportes.saludEmpleador;               // 8,5% salvo exoneración
  const pension = salario * C.aportes.pensionEmpleador;                            // 12%
  const claseRiesgo = (['I', 'II', 'III', 'IV', 'V'].includes(String(i.claseRiesgoArl))
    ? String(i.claseRiesgoArl)
    : 'I') as keyof typeof C.aportes.arl;
  const tasaArl = C.aportes.arl[claseRiesgo];
  const arl = salario * tasaArl;                                                   // 100% a cargo de la empresa
  const seguridadSocial = salud + pension + arl;

  // ── Parafiscales (sobre el salario) ──
  const caja = salario * C.aportes.parafiscales.cajaCompensacion;                 // 4% — nunca exonerada
  const sena = exonerado ? 0 : salario * C.aportes.parafiscales.sena;             // 2%
  const icbf = exonerado ? 0 : salario * C.aportes.parafiscales.icbf;             // 3%
  const parafiscales = caja + sena + icbf;

  // ── Costo total mensual cargado ──
  const costoTotalMensual = salario + auxilio + factorPrestacional + seguridadSocial + parafiscales;
  const costoTotalAnual = costoTotalMensual * 12;
  const sobrecostoPct = (costoTotalMensual / salario - 1) * 100;

  // ── Horas productivas del mes (divisor de pricing, ≈ 190 h) ──
  const horasProd = Math.max(1, num(i.horasProductivasMes, 190));
  const costoHoraReal = costoTotalMensual / horasProd;

  // Comparación: $/hora si se usara el divisor legal de nómina (engaña al que cotiza)
  const divisorLegalHoy = new Date() >= new Date('2026-07-15')
    ? C.jornada.divisorMensualDesde15Jul2026
    : C.jornada.divisorMensualHasta14Jul2026;
  const costoHoraLegal = costoTotalMensual / divisorLegalHoy;     // sub-estima el costo real
  const salarioHoraNomina = salario / divisorLegalHoy;            // lo que cree el empleado que vale su hora

  const fmtPct = (x: number) =>
    x.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const _insight = {
    title: 'Cuánto cobrar por hora de este empleado',
    text: `Un empleado con salario de **${fmtCOP(salario)}** te cuesta de verdad **${fmtCOP(costoTotalMensual)}/mes** (un **${fmtPct(sobrecostoPct)}% más** que el sueldo nominal, sumando prestaciones, seguridad social y parafiscales${exonerado ? ' — ya con la exoneración del art. 114-1 ET aplicada' : ''}). Repartido entre **${horasProd} horas productivas reales** del mes, cada hora de trabajo te cuesta **${fmtCOP(costoHoraReal)}**: ese es el piso para cotizar sin perder plata. Ojo: si calculás tu hora dividiendo sólo el salario entre ${divisorLegalHoy} (${fmtCOP(salarioHoraNomina)}) estás dejando por fuera ${fmtCOP(costoHoraReal - salarioHoraNomina)} de costo real por hora.`,
    tone: 'good' as const,
    icon: '🧮',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salario', value: Math.round(salario) },
      ...(auxilio > 0 ? [{ label: 'Auxilio de transporte', value: Math.round(auxilio) }] : []),
      { label: 'Prestaciones (cesantías, prima, vac.)', value: Math.round(factorPrestacional) },
      { label: 'Seguridad social patronal', value: Math.round(seguridadSocial) },
      { label: 'Parafiscales', value: Math.round(parafiscales) },
    ],
    prefix: '$',
    centerValue: fmtCOP(costoHoraReal),
    centerLabel: 'por hora real',
    ariaLabel: `Costo total mensual ${fmtCOP(costoTotalMensual)}, equivalente a ${fmtCOP(costoHoraReal)} por hora productiva.`,
  };

  return {
    costoHoraReal: `${fmtCOP(costoHoraReal)} por hora`,
    costoTotalMensual: `${fmtCOP(costoTotalMensual)} (${fmtPct(sobrecostoPct)}% sobre el salario)`,
    costoTotalAnual: fmtCOP(costoTotalAnual),
    factorPrestacional: `${fmtCOP(factorPrestacional)} (cesantías + intereses + prima + vacaciones)`,
    seguridadSocial: `${fmtCOP(seguridadSocial)} (salud ${exonerado ? '0% exonerado' : '8,5%'} + pensión 12% + ARL clase ${claseRiesgo})`,
    parafiscales: `${fmtCOP(parafiscales)} (caja 4%${exonerado ? '; SENA/ICBF exonerados' : ' + SENA 2% + ICBF 3%'})`,
    auxilioTransporte: auxilio > 0 ? `${fmtCOP(auxilio)} (gana ≤ 2 SMLMV)` : 'No aplica (gana > 2 SMLMV)',
    comparacionHoraNomina: `Hora "de nómina" (salario ÷ ${divisorLegalHoy}) = ${fmtCOP(salarioHoraNomina)}; tu costo real por hora es ${fmtCOP(costoHoraReal)}.`,
    detalle: `Costo mensual ${fmtCOP(costoTotalMensual)} ÷ ${horasProd} h productivas = ${fmtCOP(costoHoraReal)}/h. (Si dividieras por el divisor legal ${divisorLegalHoy}: ${fmtCOP(costoHoraLegal)}/h, que subestima paros, descansos y festivos.)`,
    _insight,
    _chart,
  };
}
