/**
 * Presupuesto de Navidad (Argentina): cena + regalos + extras, y cuánto ahorrar por mes
 * hasta diciembre. Sin datos oficiales: todo sale de los inputs del usuario.
 */
export interface Inputs {
  invitados?: number | string;
  costoPorPersona?: number | string;
  cantRegalos?: number | string;
  precioRegalo?: number | string;
  extras?: number | string;
  mesesAhorro?: number | string;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const fmt = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const invitados = Math.max(0, Math.min(200, Number(i.invitados) || 0));
  const costoPorPersona = Math.max(0, Number(i.costoPorPersona) || 0);
  const cantRegalos = Math.max(0, Math.min(100, Number(i.cantRegalos) || 0));
  const precioRegalo = Math.max(0, Number(i.precioRegalo) || 0);
  const extras = Math.max(0, Number(i.extras) || 0);
  const mesesAhorro = Math.max(1, Math.min(12, Math.floor(Number(i.mesesAhorro) || 1)));

  const cena = invitados * costoPorPersona;
  const regalos = cantRegalos * precioRegalo;
  const total = cena + regalos + extras;
  const ahorroMensual = total / mesesAhorro;

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cena', value: cena },
      { label: 'Regalos', value: regalos },
      { label: 'Decoración y extras', value: extras },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Total',
    ariaLabel: `Presupuesto navideño total de ${fmt(total)}: cena ${fmt(cena)}, regalos ${fmt(regalos)}, extras ${fmt(extras)}.`,
  };

  const _insight = {
    title: 'Tu plan de ahorro navideño',
    text: total > 0
      ? `La Navidad te va a costar **${fmt(total)}** (${fmt(cena)} de cena para ${invitados} personas, ${fmt(regalos)} en ${cantRegalos} regalos y ${fmt(extras)} de extras). Guardando **${fmt(ahorroMensual)} por mes** durante ${mesesAhorro} ${mesesAhorro === 1 ? 'mes' : 'meses'} llegás a diciembre sin manotear el aguinaldo entero.`
      : 'Cargá los invitados de la cena, los regalos que pensás hacer y los extras (decoración, pan dulce, brindis) para ver el total y cuánto ahorrar por mes.',
    tone: 'good',
    icon: '🎄',
  };

  return {
    total: fmt(total),
    cena: fmt(cena),
    regalos: fmt(regalos),
    ahorroMensual: `${fmt(ahorroMensual)} por mes durante ${mesesAhorro} ${mesesAhorro === 1 ? 'mes' : 'meses'}`,
    _insight,
    _chart,
  };
}
