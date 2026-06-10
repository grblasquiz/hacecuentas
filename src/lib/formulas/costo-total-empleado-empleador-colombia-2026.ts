/**
 * Costo total de un empleado para el empleador — Colombia 2026.
 * Suma al salario: auxilio de transporte, seguridad social patronal (salud 8,5% si no hay
 * exoneración art. 114-1 ET, pensión 12%, ARL por clase de riesgo), parafiscales
 * (CCF 4% + ICBF 3% + SENA 2%, con exoneración art. 114-1) y prestaciones sociales
 * (cesantías 8,33% + intereses 1% + prima 8,33% + vacaciones 4,17%).
 * Todas las constantes salen de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  claseArl?: string;       // 'I' | 'II' | 'III' | 'IV' | 'V'
  tipoEmpleador?: string;  // 'pj' (persona jurídica) | 'pn' (persona natural)
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

  const claseRaw = String(i.claseArl ?? 'I').toUpperCase();
  const clase = (['I', 'II', 'III', 'IV', 'V'] as const).includes(claseRaw as any)
    ? (claseRaw as keyof typeof C.aportes.arl)
    : 'I';
  const tipo = String(i.tipoEmpleador ?? 'pj') === 'pn' ? 'pn' : 'pj';

  // Auxilio de transporte: para quien gana hasta 2 SMLMV
  const topeAuxilio = C.topeAuxilioSmlmv * C.smlmv;
  const auxilio = salario <= topeAuxilio ? C.auxilioTransporte : 0;

  // IBC para seguridad social: tope 25 SMLMV (Ley 797/2003)
  const ibc = Math.min(salario, C.aportes.ibcTopeSmlmv * C.smlmv);

  // Exoneración art. 114-1 ET: PJ no paga salud 8,5%, SENA ni ICBF por trabajadores < 10 SMLMV
  const topeExoneracion = C.aportes.exoneracionArt114_1SmlmvTope * C.smlmv;
  const exonerado = tipo === 'pj' && salario < topeExoneracion;

  // Seguridad social a cargo del empleador
  const salud = exonerado ? 0 : ibc * C.aportes.saludEmpleador;
  const pension = ibc * C.aportes.pensionEmpleador;
  const tasaArl = C.aportes.arl[clase];
  const arl = ibc * tasaArl;
  const segSocial = salud + pension + arl;

  // Parafiscales (la CCF nunca se exonera)
  const ccf = salario * C.aportes.parafiscales.cajaCompensacion;
  const icbf = exonerado ? 0 : salario * C.aportes.parafiscales.icbf;
  const sena = exonerado ? 0 : salario * C.aportes.parafiscales.sena;
  const parafiscales = ccf + icbf + sena;

  // Prestaciones sociales: cesantías, intereses y prima sobre salario + auxilio;
  // vacaciones sobre el salario (el auxilio no entra porque no hay desplazamiento).
  const basePrestacional = salario + auxilio;
  const cesantias = basePrestacional * C.prestaciones.cesantiasPorcentaje;
  const interesesCesantias = cesantias * C.prestaciones.interesesCesantias;
  const prima = basePrestacional * C.prestaciones.primaPorcentaje;
  const vacaciones = salario * C.prestaciones.vacacionesPorcentaje;
  const prestaciones = cesantias + interesesCesantias + prima + vacaciones;

  const costoMensual = salario + auxilio + segSocial + parafiscales + prestaciones;
  const costoAnual = costoMensual * 12;
  const factor = costoMensual / salario;
  const sobrecosto = costoMensual - salario;

  const fmtFactor = (factor).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pctArl = (tasaArl * 100).toLocaleString('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const _insight = {
    title: 'Lo que de verdad cuesta ese sueldo',
    text: `Un salario de **${fmtCOP(salario)}** le cuesta a la empresa **${fmtCOP(costoMensual)}** al mes (**${fmtFactor}×**): ${auxilio > 0 ? `auxilio de transporte ${fmtCOP(auxilio)}, ` : ''}seguridad social ${fmtCOP(segSocial)}, parafiscales ${fmtCOP(parafiscales)} y prestaciones ${fmtCOP(prestaciones)}. ${exonerado ? `Aplicaste la exoneración del art. 114-1 ET (no pagás salud 8,5%, SENA ni ICBF porque el salario es menor a 10 SMLMV).` : `Sin exoneración del art. 114-1 ET: pagás salud 8,5%, SENA 2% e ICBF 3% completos.`} Al año son **${fmtCOP(costoAnual)}**.`,
    tone: 'warn' as const,
    icon: '🏢',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salario', value: Math.round(salario) },
      ...(auxilio > 0 ? [{ label: 'Auxilio de transporte', value: Math.round(auxilio) }] : []),
      { label: 'Seguridad social', value: Math.round(segSocial) },
      { label: 'Parafiscales', value: Math.round(parafiscales) },
      { label: 'Prestaciones', value: Math.round(prestaciones) },
    ],
    prefix: '$',
    centerValue: fmtCOP(costoMensual),
    centerLabel: 'costo mensual',
    ariaLabel: `Costo total mensual de ${fmtCOP(costoMensual)}: salario ${fmtCOP(salario)} más ${fmtCOP(sobrecosto)} de cargas laborales.`,
  };

  return {
    costoMensual: fmtCOP(costoMensual),
    costoAnual: fmtCOP(costoAnual),
    factor: `${fmtFactor}× el salario`,
    segSocial: `${fmtCOP(segSocial)} (pensión 12%${exonerado ? '' : ' + salud 8,5%'} + ARL ${pctArl}%)`,
    parafiscales: `${fmtCOP(parafiscales)} (CCF 4%${exonerado ? '' : ' + ICBF 3% + SENA 2%'})`,
    prestaciones: `${fmtCOP(prestaciones)} (cesantías + intereses + prima + vacaciones)`,
    auxilioTransporte: auxilio > 0 ? fmtCOP(auxilio) : 'No aplica (salario mayor a 2 SMLMV)',
    detalle: `Salario ${fmtCOP(salario)}${auxilio > 0 ? ` + auxilio ${fmtCOP(auxilio)}` : ''} + seguridad social ${fmtCOP(segSocial)} + parafiscales ${fmtCOP(parafiscales)} + prestaciones ${fmtCOP(prestaciones)} = ${fmtCOP(costoMensual)}/mes (${fmtFactor}×).`,
    _insight,
    _chart,
  };
}
