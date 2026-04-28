export interface Inputs {
  dum: string;       // data no formato YYYY-MM-DD
  cycle_length: number;
}

export interface Outputs {
  ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
  peak_days: string;
  next_period: string;
  days_until_ovulation: number;
  explanation_text: string;
}

// Duração fixa da fase lútea em dias (fonte: OMS / FEBRASGO)
const LUTEAL_PHASE_DAYS = 14;

// Janela fértil: espermatozoides sobrevivem até 5 dias; óvulo ~24h
const FERTILE_BEFORE = 5;
const FERTILE_AFTER = 1;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  // Aceita YYYY-MM-DD (input type=date) e DD/MM/YYYY
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return isNaN(d.getTime()) ? null : d;
  }
  const brMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const d = new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function compute(i: Inputs): Outputs {
  const defaultOutput: Outputs = {
    ovulation_date: '—',
    fertile_window_start: '—',
    fertile_window_end: '—',
    peak_days: '—',
    next_period: '—',
    days_until_ovulation: 0,
    explanation_text: 'Informe a data da última menstruação e a duração do ciclo para calcular.'
  };

  const dumDate = parseDate(i.dum);
  if (!dumDate) return defaultOutput;

  const cycleLength = Math.round(Number(i.cycle_length) || 28);

  if (cycleLength < 21 || cycleLength > 45) {
    return {
      ...defaultOutput,
      explanation_text:
        'Duração do ciclo fora do intervalo usual (21–45 dias). Verifique os dados inseridos e consulte um ginecologista.'
    };
  }

  // Dia da ovulação: DUM + (ciclo − fase lútea)
  const ovulationDaysFromDum = cycleLength - LUTEAL_PHASE_DAYS;
  const ovulationDate = addDays(dumDate, ovulationDaysFromDum);

  // Janela fértil
  const fertileStart = addDays(ovulationDate, -FERTILE_BEFORE);
  const fertileEnd = addDays(ovulationDate, FERTILE_AFTER);

  // Dias de pico: ovulação − 2, ovulação − 1, ovulação
  const peak1 = addDays(ovulationDate, -2);
  const peak2 = addDays(ovulationDate, -1);
  const peak3 = ovulationDate;
  const peakStr = `${formatDate(peak1)}, ${formatDate(peak2)} e ${formatDate(peak3)}`;

  // Próxima menstruação
  const nextPeriod = addDays(dumDate, cycleLength);

  // Dias até a ovulação a partir de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilOvulation = Math.round(
    (ovulationDate.getTime() - today.getTime()) / msPerDay
  );

  // Texto explicativo dinâmico
  let explanationText = '';
  if (daysUntilOvulation < 0) {
    explanationText = `A ovulação estimada já ocorreu há ${Math.abs(daysUntilOvulation)} dia(s). Aguarde o próximo ciclo para uma nova janela fértil.`;
  } else if (daysUntilOvulation === 0) {
    explanationText = 'Hoje é o dia estimado da ovulação — pico máximo de fertilidade!';
  } else if (daysUntilOvulation <= FERTILE_BEFORE) {
    explanationText = `Você está dentro da janela fértil. A ovulação é estimada para daqui a ${daysUntilOvulation} dia(s).`;
  } else {
    explanationText = `A próxima ovulação está estimada para daqui a ${daysUntilOvulation} dia(s). A janela fértil começa em ${formatDate(fertileStart)}.`;
  }

  // Aviso para ciclos irregulares
  if (cycleLength < 24 || cycleLength > 35) {
    explanationText +=
      ' Ciclo fora do intervalo mais comum (24–35 dias): considere confirmar a ovulação com teste de LH ou ultrassom.';
  }

  return {
    ovulation_date: formatDate(ovulationDate),
    fertile_window_start: formatDate(fertileStart),
    fertile_window_end: formatDate(fertileEnd),
    peak_days: peakStr,
    next_period: formatDate(nextPeriod),
    days_until_ovulation: daysUntilOvulation,
    explanation_text: explanationText
  };
}
