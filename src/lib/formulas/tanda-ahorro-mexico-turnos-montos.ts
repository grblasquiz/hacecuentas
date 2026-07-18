/**
 * Calculadora de tandas México — cuánto te toca, cuándo cobras y cuánto aportas.
 * Fórmula pura (sin constantes fiscales): bolsa = aporte × participantes;
 * el ciclo dura tantos periodos como participantes. Los turnos tempranos
 * funcionan como crédito sin intereses; los tardíos, como ahorro forzoso
 * (así lo describe la Condusef al alertar sobre tandas informales).
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  participantes: number;
  aportePorPeriodo: number;
  frecuencia?: string;   // 'semanal' | 'quincenal' | 'mensual'
  tuTurno?: number;      // número de turno asignado (1 = primero)
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
  const aporte = num(i.aportePorPeriodo, 0);
  if (!(aporte > 0)) throw new Error('Ingresa el aporte por periodo (el "número" de la tanda)');
  const frecuencia = String(i.frecuencia || 'semanal');
  const periodo = PERIODOS[frecuencia] || PERIODOS.semanal;
  const turno = Math.min(n, Math.max(1, Math.round(num(i.tuTurno, 1))));

  const bolsa = aporte * n;                    // lo que cobra quien tiene el turno
  const totalAportado = aporte * n;            // lo que aportas en todo el ciclo
  const duracionCiclo = n;                     // periodos
  const mesesCiclo = Math.round((n / periodo.porMes) * 10) / 10;
  const periodosHastaCobrar = turno;
  const mesesHastaCobrar = Math.round((turno / periodo.porMes) * 10) / 10;

  // Posición financiera: antes de tu turno aportaste (turno-1) × aporte y recibes la bolsa completa.
  const aportadoAntesDeCobrar = aporte * (turno - 1);
  const adelanto = bolsa - aportadoAntesDeCobrar; // cuánto "te adelantan" al cobrar
  const mitad = (n + 1) / 2;
  const rol = turno < mitad ? 'credito' : turno > mitad ? 'ahorro' : 'neutro';

  const detalle = `${n} participantes × ${fmtMXN(aporte)} ${frecuencia === 'mensual' ? 'al mes' : frecuencia === 'quincenal' ? 'por quincena' : 'por semana'}: te tocan ${fmtMXN(bolsa)} en el turno ${turno} (${periodosHastaCobrar} ${periodosHastaCobrar === 1 ? periodo.nombre : periodo.plural}, ~${mesesHastaCobrar} ${mesesHastaCobrar === 1 ? 'mes' : 'meses'}). El ciclo completo dura ${duracionCiclo} ${periodo.plural} (~${mesesCiclo} meses) y en total aportas ${fmtMXN(totalAportado)}.`;

  const rolTexto = rol === 'credito'
    ? `Con el turno **${turno}** cobras temprano: al recibir la bolsa solo llevas aportados **${fmtMXN(aportadoAntesDeCobrar)}**, así que la tanda te funciona como un **préstamo sin intereses de ${fmtMXN(adelanto)}** que devuelves el resto del ciclo.`
    : rol === 'ahorro'
      ? `Con el turno **${turno}** cobras tarde: la tanda te funciona como **ahorro forzoso** — cuando recibas los ${fmtMXN(bolsa)} ya habrás aportado casi todo. Ojo: tu dinero no genera rendimiento y la inflación lo erosiona; compara contra un CETES o pagaré.`
      : `Con el turno **${turno}** quedas a mitad del ciclo: ni crédito ni ahorro puro.`;

  const _insight = {
    title: `Te tocan ${fmtMXN(bolsa)} en tu turno`,
    text: `La bolsa de cada ${periodo.nombre} es de **${fmtMXN(bolsa)}** (${n} × ${fmtMXN(aporte)}). ${rolTexto} Recuerda la advertencia de la **Condusef**: las tandas son informales, sin respaldo legal ni rendimiento — solo entra en tandas de gente de TODA confianza y nunca metas dinero que no puedas perder.`,
    tone: rol === 'ahorro' ? 'warn' : 'neutral',
    icon: '🤝',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Lo que cobras (bolsa)', 'Aportado antes de tu turno', 'Aporte total del ciclo'],
    values: [Math.round(bolsa), Math.round(aportadoAntesDeCobrar), Math.round(totalAportado)],
    prefix: '$',
    ariaLabel: `Cobras ${fmtMXN(bolsa)}; antes de tu turno aportas ${fmtMXN(aportadoAntesDeCobrar)}; en el ciclo completo aportas ${fmtMXN(totalAportado)}.`,
  };

  return {
    teToca: `${fmtMXN(bolsa)} en el turno ${turno}`,
    cuandoCobras: `En ${periodosHastaCobrar} ${periodosHastaCobrar === 1 ? periodo.nombre : periodo.plural} (~${mesesHastaCobrar} ${mesesHastaCobrar === 1 ? 'mes' : 'meses'})`,
    aporteTotalCiclo: `${fmtMXN(totalAportado)} en ${duracionCiclo} ${periodo.plural} (~${mesesCiclo} meses)`,
    tuRolFinanciero: rol === 'credito' ? `Crédito sin intereses: te adelantan ${fmtMXN(adelanto)}` : rol === 'ahorro' ? 'Ahorro forzoso (sin rendimiento)' : 'Posición neutra (mitad del ciclo)',
    detalle,
    _insight,
    _chart,
  };
}
