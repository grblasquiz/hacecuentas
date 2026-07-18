/**
 * Calculadora del SAN (ahorro rotativo) — República Dominicana. El "san" es un
 * ahorro colectivo informal: un grupo aporta un monto fijo cada periodo y, por
 * turnos, cada integrante se lleva la bolsa completa. Cálculo puro:
 *   bolsa = aporte × participantes ; el ciclo dura tantos periodos como personas.
 * Los turnos tempranos funcionan como préstamo sin interés; los tardíos, como
 * ahorro forzoso (sin rendimiento). No hay respaldo legal: depende de la
 * confianza en el/la "sanera/o". Moneda: peso dominicano (RD$).
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  participantes: number;
  aporte: number;         // aporte por periodo (el "número" del san)
  frecuencia?: string;    // 'semanal' | 'quincenal' | 'mensual'
  tuTurno?: number;       // turno asignado (1 = primero)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const PERIODOS: Record<string, { nombre: string; plural: string; porMes: number }> = {
  semanal: { nombre: 'semana', plural: 'semanas', porMes: 4.33 },
  quincenal: { nombre: 'quincena', plural: 'quincenas', porMes: 2 },
  mensual: { nombre: 'mes', plural: 'meses', porMes: 1 },
};

export function compute(i: Inputs): Outputs {
  const n = Math.max(2, Math.round(num(i.participantes, 10)));
  const aporte = num(i.aporte, 0);
  if (!(aporte > 0)) throw new Error('Ingresá el aporte por periodo (el "número" del san)');
  const frecuencia = String(i.frecuencia || 'mensual');
  const periodo = PERIODOS[frecuencia] || PERIODOS.mensual;
  const turno = Math.min(n, Math.max(1, Math.round(num(i.tuTurno, 1))));

  const bolsa = aporte * n;
  const totalAportado = aporte * n;
  const mesesCiclo = Math.round((n / periodo.porMes) * 10) / 10;
  const mesesHastaCobrar = Math.round((turno / periodo.porMes) * 10) / 10;
  const aportadoAntes = aporte * (turno - 1);
  const adelanto = bolsa - aportadoAntes;
  const mitad = (n + 1) / 2;
  const rol = turno < mitad ? 'credito' : turno > mitad ? 'ahorro' : 'neutro';

  const cuandoTxt = `${turno} ${turno === 1 ? periodo.nombre : periodo.plural} (~${mesesHastaCobrar} ${mesesHastaCobrar === 1 ? 'mes' : 'meses'})`;

  const detalle =
    `${n} participantes × ${fmtDOP(aporte)} ${frecuencia === 'mensual' ? 'al mes' : frecuencia === 'quincenal' ? 'por quincena' : 'por semana'}: ` +
    `te tocan ${fmtDOP(bolsa)} en el turno ${turno} (a las ${cuandoTxt}). ` +
    `El ciclo dura ${n} ${periodo.plural} (~${mesesCiclo} meses) y aportás ${fmtDOP(totalAportado)} en total.`;

  const rolTexto = rol === 'credito'
    ? `Con el turno **${turno}** cobrás temprano: al recibir la bolsa sólo llevás aportados **${fmtDOP(aportadoAntes)}**, así que el san te funciona como un **préstamo sin interés de ${fmtDOP(adelanto)}** que devolvés el resto del ciclo.`
    : rol === 'ahorro'
      ? `Con el turno **${turno}** cobrás tarde: el san te funciona como **ahorro forzoso** — cuando recibas los ${fmtDOP(bolsa)} ya habrás aportado casi todo. Tu dinero no genera rendimiento y la inflación lo erosiona; compará contra un certificado financiero.`
      : `Con el turno **${turno}** quedás a mitad del ciclo: ni crédito ni ahorro puro.`;

  const _insight = {
    title: `Te tocan ${fmtDOP(bolsa)} en tu turno`,
    text: `La bolsa de cada ${periodo.nombre} es de **${fmtDOP(bolsa)}** (${n} × ${fmtDOP(aporte)}). ${rolTexto} Ojo: el san es **informal y sin respaldo legal** — entrá sólo con gente de toda confianza y no metas dinero que no puedas perder.`,
    tone: rol === 'ahorro' ? 'warn' as const : 'neutral' as const,
    icon: '🤝',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Bolsa que cobrás', 'Aportado antes de tu turno', 'Aporte total del ciclo'],
    values: [Math.round(bolsa), Math.round(aportadoAntes), Math.round(totalAportado)],
    prefix: 'RD$ ',
    ariaLabel: `Cobrás ${fmtDOP(bolsa)}; antes de tu turno aportás ${fmtDOP(aportadoAntes)}; en el ciclo aportás ${fmtDOP(totalAportado)}.`,
  };

  return {
    teToca: `${fmtDOP(bolsa)} en el turno ${turno}`,
    cuandoCobras: `A las ${cuandoTxt}`,
    aporteTotal: `${fmtDOP(totalAportado)} en ${n} ${periodo.plural} (~${mesesCiclo} meses)`,
    tuRol: rol === 'credito' ? `Crédito sin interés: te adelantan ${fmtDOP(adelanto)}` : rol === 'ahorro' ? 'Ahorro forzoso (sin rendimiento)' : 'Posición neutra (mitad del ciclo)',
    detalle,
    _insight,
    _chart,
  };
}
