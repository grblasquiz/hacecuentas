/** Impuestos de la lotería en España (Hacienda) — gravamen especial sobre premios.
 *  Premios de loterías (Lotería Nacional, El Gordo de Navidad, Primitiva, Euromillones,
 *  ONCE, etc.): exentos hasta 40.000 € por décimo/boleto; el exceso tributa al 20%.
 *  Fuente: Disposición adicional 33.ª Ley 35/2006 del IRPF (gravamen especial premios).
 *  El tramo exento (40.000 €) y el tipo (20%) están vigentes desde 2020. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

// Constantes del gravamen especial sobre premios de loterías (España, vigente 2026).
const MINIMO_EXENTO = 40000;   // € exentos por premio (por décimo/boleto premiado)
const TIPO_GRAVAMEN = 0.20;    // 20% sobre el exceso del mínimo exento

export interface Inputs {
  premio: number;          // importe íntegro del premio (€)
  participantes?: number;  // nº de personas que comparten el décimo/boleto (default 1)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const premio = Number(i.premio) || 0;
  const participantes = Math.max(1, Math.floor(Number(i.participantes) || 1));
  if (premio <= 0) throw new Error('Introduce el importe del premio en euros');

  // La exención de 40.000 € se reparte entre los partícipes en proporción a su parte,
  // por lo que el impuesto TOTAL del premio no cambia por compartirlo.
  const parteExenta = Math.min(premio, MINIMO_EXENTO);
  const baseGravable = Math.max(0, premio - MINIMO_EXENTO);
  const impuesto = baseGravable * TIPO_GRAVAMEN;   // retención de Hacienda
  const neto = premio - impuesto;
  const tipoEfectivo = premio > 0 ? (impuesto / premio) * 100 : 0;

  // Reparto por persona (la retención total es la misma; se prorratea).
  const netoPorPersona = neto / participantes;
  const impuestoPorPersona = impuesto / participantes;

  const _insight = {
    title: impuesto > 0 ? 'Lo que se lleva Hacienda' : 'Premio exento de impuestos',
    text: impuesto > 0
      ? `De un premio de **${fmtEur(premio)}**, los primeros **${fmtEur(MINIMO_EXENTO)}** están exentos y sobre los **${fmtEur(baseGravable)}** restantes Hacienda retiene el **20%**: **${fmtEur(impuesto)}**. Cobras **${fmtEur(neto)}** limpios${participantes > 1 ? ` (**${fmtEur(netoPorPersona)}** por persona entre ${participantes})` : ''}. El tipo efectivo sobre el total es del **${tipoEfectivo.toFixed(2)}%**.`
      : `Un premio de **${fmtEur(premio)}** no supera el mínimo exento de **${fmtEur(MINIMO_EXENTO)}**, así que está **exento**: cobras el importe íntegro y no tributa por el gravamen especial de loterías.`,
    tone: impuesto > 0 ? 'neutral' : 'good',
    icon: '🎫',
  };
  const _chart = {
    type: 'bar',
    labels: ['Cobras (neto)', 'Retiene Hacienda'],
    values: [Math.round(neto), Math.round(impuesto)],
    prefix: '€ ',
    ariaLabel: `De ${fmtEur(premio)} cobras ${fmtEur(neto)} y Hacienda retiene ${fmtEur(impuesto)}.`,
  };

  return {
    neto: fmtEur(neto),
    impuesto: fmtEur(impuesto),
    baseGravable: fmtEur(baseGravable),
    parteExenta: fmtEur(parteExenta),
    tipoEfectivo: `${tipoEfectivo.toFixed(2)} %`,
    netoPorPersona: fmtEur(netoPorPersona),
    detalle: participantes > 1
      ? `Premio ${fmtEur(premio)} entre ${participantes}: cada uno cobra ${fmtEur(netoPorPersona)} y aporta ${fmtEur(impuestoPorPersona)} de impuesto.`
      : `Premio ${fmtEur(premio)}: exento ${fmtEur(parteExenta)}, gravado ${fmtEur(baseGravable)} al 20% (${fmtEur(impuesto)}). Neto ${fmtEur(neto)}.`,
    _insight,
    _chart,
  };
}
