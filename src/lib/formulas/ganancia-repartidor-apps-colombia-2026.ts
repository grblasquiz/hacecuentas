/**
 * Ganancia real de repartidor/conductor de apps en Colombia 2026 (Rappi, Uber, Didi, inDriver…).
 * Ganancia neta real = ingreso bruto de la app − gastos operativos − seguridad social como independiente.
 *
 * Gastos: gasolina (km / rendimiento × precio galón ÷ 3,785 L o monto directo) + mantenimiento/desgaste
 *         + plan de datos + depreciación del vehículo.
 * Seguridad social (PILA): el repartidor/conductor de apps es independiente POR CUENTA PROPIA. Desde el
 *   Decreto 0379/2026 (vigente 9-may-2026) cotiza sobre el 40% del INGRESO NETO = 40% × (ingreso bruto −
 *   presunción de costos por CIIU). La presunción para transporte y almacenamiento (Sección H CIIU,
 *   donde caen domicilios/mensajería) es ≈63,79% del ingreso bruto (UGPP Resolución 532/2024, vigente
 *   desde jun-2025). Antes del Decreto 0379 el 40% era sobre el ingreso bruto (regla que sigue vigente
 *   sólo para contratos de prestación de servicios personales, art. 89 Ley 2277/2022). El IBC nunca baja
 *   del piso de 1 SMLMV ni sube del tope de 25 SMLMV. Sobre el IBC: 12,5% salud + 16% pensión = 28,5%.
 *   ARL clase IV (mensajería en moto, CIIU 5320 ≈ 4,350%) opcional para riesgo I-III / recomendada en moto.
 * Constantes y helpers de src/lib/data/colombia-2026.ts (NO hardcodear valores).
 */
import { COLOMBIA_2026, fmtCOP, valorHoraOrdinaria } from '../data/colombia-2026.ts';

/**
 * Presunción de costos UGPP (Resolución 532/2024) para "transporte y almacenamiento" — Sección H del
 * CIIU rev. 4, que cubre la actividad de domicilios/mensajería/transporte de los repartidores de apps.
 * Es el % del ingreso bruto que la ley presume que se va en costos: el IBC se calcula sobre el 40% del
 * ingreso NETO = ingreso bruto − este % (Decreto 0379/2026). Verificado WebSearch 2026-06-19 (actualicese).
 */
const PRESUNCION_COSTOS_TRANSPORTE = 0.6379;

export interface Inputs {
  ingresoBrutoMensual: number | string;
  horasMensuales: number | string;
  // Gastos: o un monto directo, o estimados por km recorridos + rendimiento del vehículo.
  modoGastos?: string; // 'directo' | 'km'
  gastosDirectos?: number | string;        // si modoGastos = 'directo': gasolina+mantenimiento+datos+otros del mes
  kmMensuales?: number | string;           // si modoGastos = 'km'
  rendimientoKmGalon?: number | string;    // km por galón (moto ~120, carro ~40)
  precioGalon?: number | string;           // precio del galón de gasolina (COP)
  mantenimientoPorKm?: number | string;    // desgaste: llantas, frenos, aceite, cadena ($/km)
  planDatos?: number | string;             // plan de datos del celular ($/mes)
  depreciacionMensual?: number | string;   // depreciación del vehículo ($/mes)
  cotizaSeguridadSocial?: string;          // 'si' | 'no' (si ya cotiza por otro lado / no cotiza)
  baseIbc?: string;                        // 'neto' (Decreto 0379/2026, presunción de costos) | 'bruto' (cota superior, sin presunción)
  incluirArl?: string;                     // 'si' | 'no' — ARL clase IV (mensajería en moto)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const LITROS_POR_GALON = 3.785; // galón US, referencia oficial del precio de la gasolina en Colombia

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const IND = C.independientes;

  const ingreso = num(i.ingresoBrutoMensual);
  if (ingreso <= 0) throw new Error('Ingresá lo que facturás en la app al mes (ingreso bruto)');

  const horas = Math.max(0, num(i.horasMensuales));

  // ───────────────────────── Gastos operativos ─────────────────────────
  const modo = String(i.modoGastos ?? 'directo');
  let gasolina = 0;
  if (modo === 'km') {
    const km = Math.max(0, num(i.kmMensuales));
    const rend = Math.max(1, num(i.rendimientoKmGalon, 120)); // evita división por cero
    const precioGalon = Math.max(0, num(i.precioGalon, 16000));
    const galones = km / rend;
    gasolina = galones * precioGalon;
    // (km/galón ya es una medida por galón; LITROS_POR_GALON queda documentado para conversiones de rendimiento por litro)
  } else {
    gasolina = Math.max(0, num(i.gastosDirectos));
  }

  const mantenimiento = modo === 'km'
    ? Math.max(0, num(i.kmMensuales)) * Math.max(0, num(i.mantenimientoPorKm, 0))
    : 0; // en modo directo, el desgaste ya va incluido en gastosDirectos
  const datos = Math.max(0, num(i.planDatos, 0));
  const depreciacion = Math.max(0, num(i.depreciacionMensual, 0));

  const gastosTotales = gasolina + mantenimiento + datos + depreciacion;

  // ───────────────────────── Seguridad social (PILA independiente por cuenta propia) ─────────────────────────
  const cotiza = String(i.cotizaSeguridadSocial ?? 'si') !== 'no';
  const incluirArl = String(i.incluirArl ?? 'no') === 'si';

  // Decreto 0379/2026 (vigente 9-may-2026): el independiente POR CUENTA PROPIA cotiza sobre el 40% del
  // ingreso NETO = 40% × (ingreso bruto − presunción de costos). 'bruto' = cota superior (sin presunción),
  // que era la regla previa y la que sigue rigiendo para prestación de servicios personales.
  const aplicaPresuncion = String(i.baseIbc ?? 'neto') !== 'bruto';
  const costoPresunto = aplicaPresuncion ? ingreso * PRESUNCION_COSTOS_TRANSPORTE : 0;
  const ingresoNetoIbc = Math.max(0, ingreso - costoPresunto);   // ingreso bruto − presunción de costos (CIIU H)
  const base40 = ingresoNetoIbc * IND.ibcPorcentajeIngresos;     // IBC = 40% del ingreso neto (Decreto 0379/2026)
  const piso = C.smlmv * C.aportes.ibcMinimoSmlmv;               // IBC mínimo = 1 SMLMV
  const tope = C.smlmv * C.aportes.ibcTopeSmlmv;                 // IBC máximo = 25 SMLMV
  const ibc = Math.min(Math.max(base40, piso), tope);
  const ibcEnPiso = base40 < piso;

  const salud = ibc * IND.salud;                               // 12,5%
  const pension = ibc * IND.pension;                           // 16%
  const tasaArl = C.aportes.arl.IV;                            // clase IV (mensajería en moto, CIIU 5320 ≈ 4,350%)
  const arl = incluirArl ? ibc * tasaArl : 0;
  const seguridadSocial = cotiza ? salud + pension + arl : 0;
  const tasaSeguridadSocial = IND.salud + IND.pension;         // 28,5% del IBC

  // ───────────────────────── Ganancia neta real ─────────────────────────
  const gananciaNeta = ingreso - gastosTotales - seguridadSocial;
  const gananciaPorHora = horas > 0 ? gananciaNeta / horas : 0;
  const ingresoBrutoPorHora = horas > 0 ? ingreso / horas : 0;
  const margenNeto = ingreso > 0 ? (gananciaNeta / ingreso) * 100 : 0;

  const fmtPct = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });

  // ───────────────────────── Insight ─────────────────────────
  // Valor de la hora del mínimo: date-aware (jornada 44 h hasta 14-jul-2026, 42 h después — Ley 2101/2021).
  const valorHoraMinimo = valorHoraOrdinaria(C.smlmv);
  const bajoMinimo = gananciaNeta < C.smlmv;
  const noRentable = gananciaNeta <= 0;
  const horaBajoMinimoHora = horas > 0 && gananciaPorHora < valorHoraMinimo;

  const piezas: string[] = [];
  if (gastosTotales > 0) piezas.push(`gastos **${fmtCOP(gastosTotales)}**`);
  if (seguridadSocial > 0) piezas.push(`seguridad social **${fmtCOP(seguridadSocial)}**`);

  let insightText: string;
  if (noRentable) {
    insightText = `Con **${fmtCOP(ingreso)}** de ingreso bruto, después de ${piezas.join(' y ')} tu ganancia neta es **${fmtCOP(gananciaNeta)}**: estás trabajando a pérdida o sin margen. Revisá gastos (gasolina y desgaste se comen la moto) o subí tus ingresos por hora.`;
  } else {
    insightText = `De **${fmtCOP(ingreso)}** que facturás en la app, te quedan **${fmtCOP(gananciaNeta)}** reales (el **${fmtPct(margenNeto)}%**) después de ${piezas.length ? piezas.join(' y ') : 'gastos y aportes'}.` +
      (horas > 0 ? ` Eso es **${fmtCOP(gananciaPorHora)} por hora** trabajada (facturás ${fmtCOP(ingresoBrutoPorHora)}/h brutos).` : '');
    if (horaBajoMinimoHora) {
      insightText += ` ⚠️ Tu ganancia por hora (${fmtCOP(gananciaPorHora)}) está por debajo del valor de la hora del salario mínimo (${fmtCOP(valorHoraMinimo)}).`;
    } else if (bajoMinimo) {
      insightText += ` Ojo: tu ganancia mensual no alcanza un salario mínimo (${fmtCOP(C.smlmv)}).`;
    }
  }
  if (cotiza && ibcEnPiso) {
    insightText += aplicaPresuncion
      ? ` Tu IBC quedó en el piso de 1 SMLMV (${fmtCOP(piso)}): el 40% de tu ingreso neto (tras descontar la presunción de costos) dio menos, pero la ley no deja cotizar por debajo del mínimo.`
      : ` Tu IBC quedó en el piso de 1 SMLMV (${fmtCOP(piso)}): el 40% de tu ingreso bruto fue menor, pero la ley no deja cotizar por debajo del mínimo.`;
  } else if (cotiza && aplicaPresuncion) {
    insightText += ` La PILA usa la presunción de costos (Decreto 0379/2026): el IBC es el 40% de tu ingreso neto, no del bruto.`;
  }

  const _insight = {
    title: noRentable ? 'No te está dejando' : 'Tu ganancia real con las apps',
    text: insightText,
    tone: (noRentable || horaBajoMinimoHora ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🛵',
  };

  // ───────────────────────── Chart: a dónde va cada peso ─────────────────────────
  const slices = [
    { label: 'Ganancia neta', value: Math.max(0, Math.round(gananciaNeta)) },
    ...(gastosTotales > 0 ? [{ label: 'Gastos (gasolina, desgaste, datos)', value: Math.round(gastosTotales) }] : []),
    ...(seguridadSocial > 0 ? [{ label: 'Seguridad social (PILA)', value: Math.round(seguridadSocial) }] : []),
  ];
  const _chart = ingreso > 0
    ? {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtCOP(Math.max(0, gananciaNeta)),
        centerLabel: 'ganancia neta',
        ariaLabel: `De ${fmtCOP(ingreso)} brutos: ganancia neta ${fmtCOP(gananciaNeta)}, gastos ${fmtCOP(gastosTotales)}, seguridad social ${fmtCOP(seguridadSocial)}.`,
      }
    : undefined;

  return {
    gananciaNeta: fmtCOP(gananciaNeta),
    gananciaPorHora: horas > 0 ? `${fmtCOP(gananciaPorHora)} por hora trabajada` : 'Ingresá las horas para verla',
    margenNeto: `${fmtPct(margenNeto)}% de lo que facturás`,
    gastosTotales: gastosTotales > 0 ? `${fmtCOP(gastosTotales)} (gasolina, desgaste, datos, depreciación)` : 'Sin gastos cargados',
    seguridadSocial: cotiza
      ? `${fmtCOP(seguridadSocial)} (IBC ${fmtCOP(ibc)}${aplicaPresuncion && !ibcEnPiso ? ' = 40% del ingreso neto' : ''} × ${(tasaSeguridadSocial * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%${arl > 0 ? ' + ARL clase IV' : ''})`
      : 'No cotizás (no descontado)',
    ingresoBrutoHora: horas > 0 ? `${fmtCOP(ingresoBrutoPorHora)} por hora` : '—',
    detalle: `${fmtCOP(ingreso)} bruto − ${fmtCOP(gastosTotales)} gastos − ${fmtCOP(seguridadSocial)} seguridad social = ${fmtCOP(gananciaNeta)} neto${horas > 0 ? ` (${fmtCOP(gananciaPorHora)}/hora)` : ''}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
