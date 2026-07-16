// Calculadora de Idade — anos, meses e dias a partir da data de nascimento.
// Utilidade pura de datas (sem dados fiscais). Cálculo por calendário civil:
// diferença exata com "empréstimo" de dias/meses, igual à contagem legal de
// idade no Brasil (a pessoa completa mais um ano no dia do aniversário).

export interface Inputs {
  dataNascimento: string;   // "YYYY-MM-DD"
  dataReferencia?: string;  // "YYYY-MM-DD" — se vazio, usa a data de hoje
}
export interface Outputs {
  idade: string;
  totalAnos: number;
  totalMeses: number;
  totalDias: number;
  totalSemanas: number;
  diaSemanaNascimento: string;
  proximoAniversario: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Parseia "YYYY-MM-DD" para {y,m,d} sem depender do fuso horário. */
function parseISO(s: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!match) return null;
  const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** Dias no mês (1-12), considerando ano bissexto. */
function diasNoMes(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Nº de dias entre duas datas (UTC, meia-noite). */
function difDias(a: { y: number; m: number; d: number }, b: { y: number; m: number; d: number }): number {
  const ta = Date.UTC(a.y, a.m - 1, a.d);
  const tb = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((tb - ta) / 86400000);
}

function hojeISO(): { y: number; m: number; d: number } {
  const n = new Date();
  return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate() };
}

export function compute(i: Inputs): Outputs {
  const nasc = parseISO(i.dataNascimento);
  const ref = parseISO(i.dataReferencia || '') || hojeISO();

  if (!nasc) {
    return {
      idade: '—', totalAnos: 0, totalMeses: 0, totalDias: 0, totalSemanas: 0,
      diaSemanaNascimento: '—', proximoAniversario: '—',
      detalhe: 'Informe uma data de nascimento válida no formato AAAA-MM-DD.',
      _insight: { title: 'Data inválida', text: 'Informe a **data de nascimento** para calcular a idade em anos, meses e dias.', tone: 'warn', icon: '⚠️' },
    };
  }

  const totalDiasCorridos = difDias(nasc, ref);
  if (totalDiasCorridos < 0) {
    return {
      idade: '—', totalAnos: 0, totalMeses: 0, totalDias: 0, totalSemanas: 0,
      diaSemanaNascimento: '—', proximoAniversario: '—',
      detalhe: 'A data de nascimento é posterior à data de referência.',
      _insight: { title: 'Datas invertidas', text: 'A **data de nascimento** não pode ser depois da **data de referência**.', tone: 'warn', icon: '⚠️' },
    };
  }

  // Diferença por calendário com empréstimo.
  let anos = ref.y - nasc.y;
  let meses = ref.m - nasc.m;
  let dias = ref.d - nasc.d;
  if (dias < 0) {
    meses -= 1;
    // dias no mês anterior à data de referência
    const mesAnterior = ref.m - 1 < 1 ? 12 : ref.m - 1;
    const anoMesAnterior = ref.m - 1 < 1 ? ref.y - 1 : ref.y;
    dias += diasNoMes(anoMesAnterior, mesAnterior);
  }
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  const totalMeses = anos * 12 + meses;
  const totalSemanas = Math.floor(totalDiasCorridos / 7);

  // Dia da semana do nascimento.
  const diaSemana = DIAS_SEMANA[new Date(Date.UTC(nasc.y, nasc.m - 1, nasc.d)).getUTCDay()];

  // Próximo aniversário a partir da data de referência.
  let anoAniv = ref.y;
  if (ref.m > nasc.m || (ref.m === nasc.m && ref.d >= nasc.d)) anoAniv = ref.y + 1;
  // 29/02 em ano não bissexto cai para 28/02.
  const diaAniv = nasc.m === 2 && nasc.d === 29 && diasNoMes(anoAniv, 2) < 29 ? 28 : nasc.d;
  const diasAteAniv = difDias(ref, { y: anoAniv, m: nasc.m, d: diaAniv });
  const idadeQueFaz = anoAniv - nasc.y;
  const proximoAniversario = `${diaAniv} de ${MESES[nasc.m - 1]} de ${anoAniv} (faltam ${diasAteAniv} dias, faz ${idadeQueFaz} anos)`;

  const idade = `${anos} ${anos === 1 ? 'ano' : 'anos'}, ${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  const detalhe = `Nascimento em ${nasc.d}/${nasc.m}/${nasc.y} (${diaSemana}). Idade: ${idade}. Equivale a ${totalMeses} meses, ${totalSemanas.toLocaleString('pt-BR')} semanas ou ${totalDiasCorridos.toLocaleString('pt-BR')} dias vividos.`;

  return {
    idade,
    totalAnos: anos,
    totalMeses,
    totalDias: totalDiasCorridos,
    totalSemanas,
    diaSemanaNascimento: diaSemana,
    proximoAniversario,
    detalhe,
    _insight: {
      title: `Você tem ${idade}`,
      text: `Nasceu em uma **${diaSemana}** e já viveu **${totalDiasCorridos.toLocaleString('pt-BR')} dias** (${totalMeses} meses / ${totalSemanas.toLocaleString('pt-BR')} semanas). O próximo aniversário é em **${diaAniv} de ${MESES[nasc.m - 1]}**, daqui a ${diasAteAniv} dias.`,
      tone: 'good',
      icon: '🎂',
    },
    _chart: {
      type: 'bar',
      labels: ['Anos', 'Meses (total)', 'Semanas (total)'],
      values: [anos, totalMeses, totalSemanas],
      ariaLabel: `Idade: ${anos} anos, ${totalMeses} meses no total, ${totalSemanas} semanas no total.`,
    },
  };
}
