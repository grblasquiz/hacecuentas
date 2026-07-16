/** Valor de la hora extra y recargo (España).
 *  El Estatuto de los Trabajadores (art. 35) fija que la hora extraordinaria NUNCA puede
 *  pagarse menos que la hora ordinaria. El recargo concreto lo fija el convenio o el
 *  contrato (frecuente +25%, +50% o +75%; nocturnas y festivas suelen ser mayores).
 *    - Valor hora ordinaria = retribución bruta anual / jornada anual en horas.
 *    - Valor hora extra = valor hora ordinaria × (1 + recargo%).
 *    - Límite legal: 80 horas extraordinarias al año (salvo fuerza mayor y compensadas
 *      con descanso). Cotizan a la Seguridad Social y tributan como rendimiento del trabajo.
 *  Fuente: Real Decreto Legislativo 2/2015 (Estatuto de los Trabajadores), art. 35. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

const JORNADA_ANUAL_DEFECTO = 1800;  // horas/año habituales de convenio (referencial)
const LIMITE_HORAS_ANUAL = 80;        // máximo legal de horas extra ordinarias/año

export interface Inputs {
  salarioBrutoAnual: number;   // retribución bruta anual (€)
  jornadaAnualHoras?: number;  // horas de la jornada anual (default 1800)
  recargoPorcentaje?: number;  // % de recargo sobre la hora ordinaria (default 0)
  numeroHoras?: number;        // nº de horas extra a valorar (default 1)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const brutoAnual = Number(i.salarioBrutoAnual) || 0;
  const jornada = Number(i.jornadaAnualHoras) > 0 ? Number(i.jornadaAnualHoras) : JORNADA_ANUAL_DEFECTO;
  const recargo = Math.max(0, Number(i.recargoPorcentaje) || 0);
  const numHoras = Number(i.numeroHoras) > 0 ? Number(i.numeroHoras) : 1;
  if (brutoAnual <= 0) throw new Error('Introduce tu salario bruto anual');

  const valorHoraOrdinaria = brutoAnual / jornada;
  const valorHoraExtra = valorHoraOrdinaria * (1 + recargo / 100);
  const totalHorasExtra = valorHoraExtra * numHoras;
  const superaLimite = numHoras > LIMITE_HORAS_ANUAL;

  const _insight = {
    title: 'Cuánto vale tu hora extra',
    text: `Tu hora ordinaria vale **${fmtEur(valorHoraOrdinaria)}** (bruto ${fmtEur(brutoAnual)} entre ${jornada} h/año). Con un recargo del **${recargo}%**, cada hora extra vale **${fmtEur(valorHoraExtra)}**. Por **${numHoras}** ${numHoras === 1 ? 'hora' : 'horas'} cobrarías **${fmtEur(totalHorasExtra)}** brutos.${superaLimite ? ' ⚠️ Superas el máximo legal de 80 horas extra al año.' : ''}`,
    tone: superaLimite ? 'warning' : 'good',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    labels: ['Hora ordinaria', 'Hora extra'],
    values: [Math.round(valorHoraOrdinaria * 100) / 100, Math.round(valorHoraExtra * 100) / 100],
    prefix: '€ ',
    ariaLabel: `Hora ordinaria ${fmtEur(valorHoraOrdinaria)} frente a hora extra ${fmtEur(valorHoraExtra)}.`,
  };

  return {
    valorHoraExtra: fmtEur(valorHoraExtra),
    valorHoraOrdinaria: fmtEur(valorHoraOrdinaria),
    totalHorasExtra: fmtEur(totalHorasExtra),
    recargoAplicado: `${recargo} %`,
    detalle: `Hora ordinaria ${fmtEur(valorHoraOrdinaria)} · recargo ${recargo}% → hora extra ${fmtEur(valorHoraExtra)}. ${numHoras} h = ${fmtEur(totalHorasExtra)} brutos.${superaLimite ? ' Supera el límite legal de 80 h/año.' : ''}`,
    _insight,
    _chart,
  };
}
