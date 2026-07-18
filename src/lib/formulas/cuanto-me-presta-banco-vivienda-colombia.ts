/**
 * Cuánto me presta el banco para vivienda según mi sueldo — Colombia 2026.
 * Regla base: la primera cuota no puede superar el 30% de los ingresos familiares (Ley 546/1999, art. 17;
 * los bancos aplican el mismo tope como política general). Con la cuota máxima se despeja el capital por
 * valor presente de una anualidad con tasa efectiva anual convertida a mensual: i = (1+EA)^(1/12) − 1.
 * Default de tasa: promedio no VIS 15,18% EA (Superfinanciera, corte 19-jun-2026). Data país importada.
 */
import { CREDITO_VIVIENDA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  ingresos_familiares: number;
  otras_cuotas: number;
  tasa_ea?: number;
  plazo_anos?: number;
  cuota_inicial_pct?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const C = CREDITO_VIVIENDA_2026;
  const ingresos = Number(i.ingresos_familiares);
  if (!Number.isFinite(ingresos) || ingresos <= 0) throw new Error('Ingresa los ingresos familiares mensuales');
  const otras = Math.max(0, Number(i.otras_cuotas) || 0);

  const eaPct = Number(i.tasa_ea) > 0 ? Number(i.tasa_ea) : C.tasaPromedioNoVisEaPct;
  const plazo = Number(i.plazo_anos) > 0 ? Number(i.plazo_anos) : 20;
  const inicialPct = Number(i.cuota_inicial_pct) >= 0 && Number(i.cuota_inicial_pct) < 100 ? Number(i.cuota_inicial_pct) : 30;

  const cuotaMaxLey = ingresos * (C.cuotaMaxPctIngreso / 100);
  const cuotaMax = Math.max(0, cuotaMaxLey - otras);
  if (cuotaMax <= 0) throw new Error('Tus otras cuotas ya consumen el 30% del ingreso: no queda capacidad para la cuota hipotecaria');

  const im = Math.pow(1 + eaPct / 100, 1 / 12) - 1;
  const n = Math.round(plazo * 12);
  const montoMax = im > 0 ? cuotaMax * (1 - Math.pow(1 + im, -n)) / im : cuotaMax * n;

  const precioVivienda = montoMax / (1 - inicialPct / 100);
  const cuotaInicial = precioVivienda - montoMax;

  const _insight = {
    title: `Te prestarían hasta ${fmtCOP(montoMax)}`,
    text: `Con ingresos familiares de **${fmtCOP(ingresos)}**${otras ? ` y otras cuotas por ${fmtCOP(otras)}` : ''}, tu cuota hipotecaria máxima es **${fmtCOP(cuotaMax)}** (tope del ${C.cuotaMaxPctIngreso}% de la Ley 546/1999). A **${eaPct.toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EA** y **${plazo} años**, eso financia hasta **${fmtCOP(montoMax)}**. Sumando una cuota inicial del ${inicialPct.toLocaleString('es-CO')}% (**${fmtCOP(cuotaInicial)}**), alcanzas una vivienda de aprox. **${fmtCOP(precioVivienda)}**. Es una estimación: cada banco evalúa además historial, antigüedad y tipo de contrato.`,
    tone: 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Crédito del banco', value: Math.round(montoMax) },
      { label: `Cuota inicial (${inicialPct.toLocaleString('es-CO')}%)`, value: Math.round(cuotaInicial) },
    ],
    prefix: '$',
    centerValue: fmtCOP(precioVivienda),
    ariaLabel: `Vivienda alcanzable de ${fmtCOP(precioVivienda)}: crédito ${fmtCOP(montoMax)} más cuota inicial ${fmtCOP(cuotaInicial)}.`,
  };

  return {
    monto_maximo_prestamo: fmtCOP(montoMax),
    cuota_maxima_mensual: fmtCOP(cuotaMax),
    vivienda_alcanzable: fmtCOP(precioVivienda),
    cuota_inicial_necesaria: fmtCOP(cuotaInicial),
    detalle: `Cuota máx: ${C.cuotaMaxPctIngreso}% × ${fmtCOP(ingresos)}${otras ? ` − ${fmtCOP(otras)}` : ''} = ${fmtCOP(cuotaMax)}. Tasa mensual: (1+${eaPct.toLocaleString('es-CO', { maximumFractionDigits: 2 })}%)^(1/12)−1 = ${(im * 100).toLocaleString('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%. Capital a ${n} meses = ${fmtCOP(montoMax)}.`,
    _insight,
    _chart,
  };
}
