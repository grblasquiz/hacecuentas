/**
 * Multas de tránsito Colombia 2026 — valor del comparendo (indexado por UVB, art. 313 Ley 2294/2023)
 * y descuento por pronto pago del art. 136 CNT (50% / 25% con curso).
 * Constantes: COLOMBIA_2026.multasTransito (Circular MinTransporte 20264000000037).
 * Las multas tipo E (alcoholemia) NO tienen descuento por pronto pago (Ley 1696/2013).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  tipoInfraccion?: string;   // 'A' | 'B' | 'C' | 'D' | 'E'
  tipoNotificacion?: string; // 'agente' (comparendo en vía) | 'electronico' (fotodetección)
  diasHabiles?: number;      // días hábiles transcurridos desde la orden de comparendo / notificación
  haceCurso?: string;        // 'si' habilita el descuento | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const M = COLOMBIA_2026.multasTransito;
  const tipo = (['A', 'B', 'C', 'D', 'E'].includes(String(i.tipoInfraccion || 'C').toUpperCase())
    ? String(i.tipoInfraccion || 'C').toUpperCase() : 'C') as 'A' | 'B' | 'C' | 'D' | 'E';
  const electronico = String(i.tipoNotificacion || 'agente') === 'electronico';
  const conCurso = String(i.haceCurso || 'si') !== 'no';
  // Guard: '' / null / undefined → 0 (te acaban de notificar hoy). Number('') = 0 pisaría el caso "vacío" igual, pero explícito.
  const dias = i.diasHabiles === undefined || i.diasHabiles === null || (i.diasHabiles as any) === ''
    ? 0 : Number(i.diasHabiles);
  if (!Number.isFinite(dias) || dias < 0) throw new Error('Ingresa los días hábiles transcurridos (0 si fue hoy)');

  const valor = M[tipo];
  const plazo50 = electronico ? M.descuentoProntoPago50.plazoDiasHabilesElectronico : M.descuentoProntoPago50.plazoDiasHabiles;
  const plazo25 = electronico ? M.descuentoProntoPago25.plazoDiasHabilesElectronico : M.descuentoProntoPago25.plazoDiasHabiles;

  let descuento = 0;
  let motivo = '';
  if (tipo === 'E') {
    motivo = 'Las multas tipo E (conducir embriagado) no tienen descuento por pronto pago (Ley 1696/2013).';
  } else if (!conCurso) {
    motivo = 'Sin curso sobre normas de tránsito no hay descuento: pagas el 100% de la multa.';
  } else if (dias <= plazo50) {
    descuento = M.descuentoProntoPago50.porcentaje; // 50%
    motivo = `Pagas dentro de los ${plazo50} días hábiles con curso → descuento del 50%.`;
  } else if (dias <= plazo25) {
    descuento = M.descuentoProntoPago25.porcentaje; // 25%
    motivo = `Pagas dentro de los ${plazo25} días hábiles con curso → descuento del 25%.`;
  } else {
    motivo = `Ya pasaron más de ${plazo25} días hábiles: se venció el plazo del descuento y pagas el 100%.`;
  }

  const aPagar = valor * (1 - descuento);
  const ahorro = valor - aPagar;
  const diasRestantes50 = Math.max(0, plazo50 - dias);
  const diasRestantes25 = Math.max(0, plazo25 - dias);

  const _insight = {
    title: descuento > 0 ? `Descuento del ${Math.round(descuento * 100)}% aplicado` : 'Sin descuento',
    text: descuento > 0
      ? `Tu comparendo tipo ${tipo} vale **${fmtCOP(valor)}** en 2026, pero pagando hoy (con curso) pagas **${fmtCOP(aPagar)}** y te ahorras **${fmtCOP(ahorro)}**.${descuento === 0.5 && diasRestantes50 > 0 ? ` Te quedan ${diasRestantes50} día(s) hábil(es) para conservar el 50%.` : ''}${descuento === 0.25 ? ` El plazo del 50% ya venció; aún alcanzas el 25% por ${diasRestantes25} día(s) hábil(es) más.` : ''}`
      : `Tu comparendo tipo ${tipo} vale **${fmtCOP(valor)}** en 2026 y lo pagas completo. ${motivo}`,
    tone: descuento > 0 ? 'good' : 'warn',
    icon: '🚦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pagas hoy', value: Math.round(aPagar) },
      { label: 'Te ahorras', value: Math.round(ahorro) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(aPagar),
    centerLabel: 'A pagar',
    ariaLabel: `Comparendo tipo ${tipo} de ${fmtCOP(valor)}: pagas ${fmtCOP(aPagar)} y ahorras ${fmtCOP(ahorro)} con el descuento por pronto pago.`,
  };

  return {
    valorMulta: `${fmtCOP(valor)} (tipo ${tipo}, vigencia 2026)`,
    aPagar: fmtCOP(aPagar),
    ahorro: descuento > 0 ? `${fmtCOP(ahorro)} (descuento ${Math.round(descuento * 100)}%)` : '$0 (sin descuento)',
    detalle: `${motivo} Plazos ${electronico ? 'fotodetección' : 'comparendo en vía'}: 50% hasta ${plazo50} días hábiles, 25% hasta ${plazo25} días hábiles (ambos requieren curso).`,
    _insight,
    _chart,
  };
}
