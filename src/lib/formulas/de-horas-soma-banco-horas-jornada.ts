// Calculadora de horas — soma o tempo trabalhado no dia (entrada, saída e
// intervalo) e compara com a jornada prevista para dar o saldo de banco de
// horas (positivo = crédito/hora extra; negativo = a compensar).
// Suporta virada de dia (turno que termina depois da meia-noite).
// Referência de jornada: CLT art. 58 (8h/dia, 44h/semana) — o padrão é editável.

export interface Inputs {
  horaEntrada: string;      // "HH:MM"
  horaSaida: string;        // "HH:MM"
  intervaloMinutos?: number; // minutos de almoço/descanso (padrão 60)
  jornadaHoras?: number;     // jornada prevista no dia em horas (padrão 8)
}
export interface Outputs {
  horasTrabalhadas: string;   // "HH:MM"
  horasDecimais: string;
  saldoBanco: string;         // "+HH:MM" / "-HH:MM"
  saldoTipo: string;
  jornadaPrevista: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

/** "HH:MM" → minutos desde 00:00, ou null se inválido. */
function parseHora(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** minutos → "HH:MM" (com sinal opcional). */
function fmtHM(min: number, comSinal = false): string {
  const sinal = min < 0 ? '-' : (comSinal ? '+' : '');
  const abs = Math.abs(Math.round(min));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sinal}${h}:${String(m).padStart(2, '0')}`;
}

export function compute(i: Inputs): Outputs {
  const entrada = parseHora(i.horaEntrada);
  const saida = parseHora(i.horaSaida);
  const intervalo = Math.max(0, Number(i.intervaloMinutos) || 0);
  const jornadaH = Number(i.jornadaHoras);
  const jornadaMin = (isFinite(jornadaH) && jornadaH > 0 ? jornadaH : 8) * 60;

  if (entrada === null || saida === null) {
    return {
      horasTrabalhadas: '—', horasDecimais: '—', saldoBanco: '—', saldoTipo: '—', jornadaPrevista: fmtHM(jornadaMin),
      detalhe: 'Informe a hora de entrada e de saída no formato HH:MM (ex.: 08:00 e 17:30).',
      _insight: { title: 'Horários inválidos', text: 'Use o formato **HH:MM** (ex.: 08:00 e 17:30) para entrada e saída.', tone: 'warn', icon: '⚠️' },
    };
  }

  // Turno que vira o dia: saída menor que entrada ⇒ soma 24h.
  let brutoMin = saida - entrada;
  if (brutoMin < 0) brutoMin += 24 * 60;
  const trabalhadoMin = Math.max(0, brutoMin - intervalo);

  const saldoMin = trabalhadoMin - jornadaMin;
  const horasDecimais = (trabalhadoMin / 60).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const saldoTipo = saldoMin > 0 ? 'crédito (hora extra)' : saldoMin < 0 ? 'a compensar (débito)' : 'jornada exata';

  const detalhe = `Das ${i.horaEntrada} às ${i.horaSaida}, menos ${intervalo} min de intervalo, dá ${fmtHM(trabalhadoMin)} (${horasDecimais}h) trabalhadas. Jornada prevista ${fmtHM(jornadaMin)} → saldo ${fmtHM(saldoMin, true)} (${saldoTipo}).`;

  return {
    horasTrabalhadas: fmtHM(trabalhadoMin),
    horasDecimais: `${horasDecimais} h`,
    saldoBanco: fmtHM(saldoMin, true),
    saldoTipo,
    jornadaPrevista: fmtHM(jornadaMin),
    detalhe,
    _insight: {
      title: `${fmtHM(trabalhadoMin)} trabalhadas`,
      text: `Você trabalhou **${fmtHM(trabalhadoMin)}** (${horasDecimais} horas). Comparado à jornada de ${fmtHM(jornadaMin)}, o saldo do dia é **${fmtHM(saldoMin, true)}** — ${saldoTipo}.`,
      tone: saldoMin >= 0 ? 'good' : 'neutral',
      icon: '⏱️',
    },
    _chart: {
      type: 'bar',
      labels: ['Trabalhado (h)', 'Jornada (h)'],
      values: [Math.round((trabalhadoMin / 60) * 100) / 100, Math.round((jornadaMin / 60) * 100) / 100],
      ariaLabel: `Trabalhado ${horasDecimais} horas contra jornada de ${jornadaMin / 60} horas.`,
    },
  };
}
