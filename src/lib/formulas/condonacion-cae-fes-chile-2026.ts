/** Condonación inicial de deudas educativas (CAE) según el plan de reorganización FES 2026.
 *  Fórmula oficial Mineduc (fes.mineduc.cl): condonación inicial en UF =
 *  monto base por perfil (20/30/40/60 UF) × (cuotas pagadas ÷ cuotas totales + 1).
 *  El proyecto de ley FES sigue en tramitación: esto es una ESTIMACIÓN orientativa. */
import clLive from '../../data/live/chile.json';
import { fmtCLP, FES_CONDONACION_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  titulado: string;       // 'si' | 'no'
  situacionPago: string;  // 'al_dia' | 'moroso'
  cuotasPagadas: number;
  cuotasTotales: number;
  deudaTotal: number;     // saldo actual de la deuda CAE en CLP
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const uf = (clLive as any)?.uf?.valor ?? 40844.79;
  const titulado = i.titulado === 'si';
  const moroso = i.situacionPago === 'moroso';
  const pagadas = Math.max(0, Math.round(Number(i.cuotasPagadas) || 0));
  const totales = Math.round(Number(i.cuotasTotales) || 0);
  const deuda = Number(i.deudaTotal) || 0;

  if (totales <= 0) throw new Error('Ingresá el total de cuotas pactadas de tu crédito');
  if (pagadas > totales) throw new Error('Las cuotas pagadas no pueden superar las pactadas');
  if (deuda <= 0) throw new Error('Ingresá el saldo actual de tu deuda CAE');

  const { baseUf } = FES_CONDONACION_2026;
  const base = titulado
    ? (moroso ? baseUf.tituladoMoroso : baseUf.tituladoAlDia)
    : (moroso ? baseUf.noTituladoMoroso : baseUf.noTituladoAlDia);

  const factor = pagadas / totales + 1;
  const condonacionUf = base * factor;
  const condonacionClp = Math.min(condonacionUf * uf, deuda);
  const deudaRestante = Math.max(0, deuda - condonacionUf * uf);
  const deudaExtinguida = deudaRestante === 0;

  // Opción de pago anticipado sobre el saldo restante: 25% adicional condonado
  // si se paga el 75% en hasta 12 cuotas.
  const pa = FES_CONDONACION_2026.pagoAnticipado;
  const condonacionAnticipada = deudaRestante * pa.condonacionPct;
  const pagoRequerido = deudaRestante * pa.pagoRequeridoPct;

  const perfil = `${titulado ? 'titulado/a' : 'sin título'} y ${moroso ? 'en mora' : 'al día'}`;
  const pctCondonado = deuda > 0 ? (condonacionClp / deuda) * 100 : 0;

  const _insight = {
    title: deudaExtinguida ? 'Tu deuda CAE se extinguiría' : 'Tu condonación inicial estimada',
    text: deudaExtinguida
      ? `Con perfil **${perfil}** y **${pagadas} de ${totales}** cuotas pagadas, la condonación inicial estimada (**${condonacionUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF ≈ ${fmtCLP(condonacionUf * uf)}**) supera tu saldo de **${fmtCLP(deuda)}**: la deuda quedaría en cero.`
      : `Con perfil **${perfil}** (base ${base} UF) y **${pagadas} de ${totales}** cuotas pagadas, la condonación inicial estimada es de **${condonacionUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF ≈ ${fmtCLP(condonacionClp)}** (${pctCondonado.toLocaleString('es-CL', { maximumFractionDigits: 1 })}% de tu saldo). Restarían **${fmtCLP(deudaRestante)}**; pagando **${fmtCLP(pagoRequerido)}** en hasta ${pa.cuotasMax} cuotas se condonaría el 25% restante (**${fmtCLP(condonacionAnticipada)}**).`,
    tone: deudaExtinguida ? 'positive' : 'neutral',
    icon: '🎓',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Condonación inicial', value: Math.round(condonacionClp) },
      { label: 'Saldo restante', value: Math.round(deudaRestante) },
    ],
    ariaLabel: `Condonación inicial ${fmtCLP(condonacionClp)} y saldo restante ${fmtCLP(deudaRestante)} sobre una deuda de ${fmtCLP(deuda)}.`,
  };

  return {
    condonacionInicialUf: condonacionUf.toLocaleString('es-CL', { maximumFractionDigits: 1 }) + ' UF',
    condonacionInicialClp: fmtCLP(condonacionClp),
    deudaRestante: deudaExtinguida ? '$0 — deuda extinguida' : fmtCLP(deudaRestante),
    perfilAplicado: `${perfil} → base ${base} UF`,
    opcionPagoAnticipado: deudaExtinguida
      ? 'No aplica: la condonación inicial cubre todo el saldo'
      : `Pagando ${fmtCLP(pagoRequerido)} (75%) en hasta ${pa.cuotasMax} cuotas, se condonan ${fmtCLP(condonacionAnticipada)} (25%)`,
    detalle: `Base ${base} UF × (${pagadas} ÷ ${totales} + 1) = ${base} × ${factor.toLocaleString('es-CL', { maximumFractionDigits: 3 })} = ${condonacionUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF. Con UF = ${fmtCLP(uf)}: ${fmtCLP(condonacionUf * uf)}. Deuda ${fmtCLP(deuda)} − condonación = ${fmtCLP(deudaRestante)}. Estimación según la fórmula publicada por Mineduc; el proyecto de ley FES sigue en tramitación y los montos definitivos dependen del texto aprobado.`,
    _insight,
    _chart,
  };
}
