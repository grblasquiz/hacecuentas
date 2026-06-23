/**
 * Trabalho suplementar (horas extraordinárias) — Portugal continente 2026.
 * Acréscimos do Código do Trabalho (art. 268.º): em dia útil a 1.ª hora +25 % e as
 * seguintes +37,5 %; em dia de descanso/feriado cada hora +50 %. A partir da 101.ª hora
 * suplementar no ano os acréscimos DOBRAM (50 %/75 %/100 %).
 * Não hardcodea percentagens: todas saem de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  modoValor?: string;     // 'hora' | 'mensal' — como se informa a retribuição
  valorHora?: number;     // valor da hora normal (se modoValor = 'hora')
  salarioMensal?: number; // salário base mensal (se modoValor = 'mensal')
  horasSemana?: number;   // horas de trabalho semanais (p/ converter mensal→hora)
  horas?: number;         // n.º de horas suplementares a calcular
  tipoDia?: string;       // 'util' | 'descanso' | 'feriado'
  acima100?: string;      // 'si' | 'no' — já ultrapassou 100 h suplementares no ano?
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraHorasExtraordinariasPortugal(i: Inputs): Outputs {
  const he = PORTUGAL_2026.horasExtra;
  const horas = Number(i.horas) || 0;
  if (horas <= 0) throw new Error('Indique o número de horas suplementares');

  // ── valor da hora normal ──
  const modo = String(i.modoValor || 'hora');
  const horasSemana = Number(i.horasSemana) || PORTUGAL_2026.rmmg.horasSemanaPadrao; // 40 por defeito
  let valorHora: number;
  if (modo === 'mensal') {
    const mensal = Number(i.salarioMensal) || 0;
    if (mensal <= 0) throw new Error('Indique o salário mensal');
    // art. 271.º CT: valor/hora = (retribuição mensal × 12) ÷ (52 × n.º horas/semana)
    valorHora = (mensal * 12) / (52 * horasSemana);
  } else {
    valorHora = Number(i.valorHora) || 0;
    if (valorHora <= 0) throw new Error('Indique o valor da hora normal');
  }

  const tipoDia = String(i.tipoDia || 'util');
  const acima100 = String(i.acima100 || 'no') === 'si';
  const tabela = acima100 ? he.apos100 : he.primeiras100;

  // ── cálculo do acréscimo total ──
  let acrescimoTotal = 0;
  let baseTotal = valorHora * horas; // pagamento "a seco" das horas, sem acréscimo
  let detalheTramos: Array<{ desc: string; horas: number; perc: number; valor: number }> = [];

  if (tipoDia === 'descanso' || tipoDia === 'feriado') {
    // descanso semanal/feriado: todas as horas ao mesmo acréscimo
    const perc = tabela.descansoOuFeriado;
    const valor = valorHora * horas * perc;
    acrescimoTotal = valor;
    detalheTramos.push({
      desc: tipoDia === 'feriado' ? 'Feriado' : 'Dia de descanso',
      horas, perc, valor,
    });
  } else {
    // dia útil: 1.ª hora a uma taxa, seguintes a outra
    const percPrimeira = tabela.diaUtilPrimeiraHora;
    const percSeguintes = tabela.diaUtilSeguintes;
    const valorPrimeira = valorHora * Math.min(horas, 1) * percPrimeira;
    const horasSeguintes = Math.max(0, horas - 1);
    const valorSeguintes = valorHora * horasSeguintes * percSeguintes;
    acrescimoTotal = valorPrimeira + valorSeguintes;
    detalheTramos.push({ desc: 'Dia útil — 1.ª hora', horas: Math.min(horas, 1), perc: percPrimeira, valor: valorPrimeira });
    if (horasSeguintes > 0) {
      detalheTramos.push({ desc: 'Dia útil — horas seguintes', horas: horasSeguintes, perc: percSeguintes, valor: valorSeguintes });
    }
  }

  const totalPagar = baseTotal + acrescimoTotal;
  const valorMedioHora = totalPagar / horas;

  const _table = {
    title: `Trabalho suplementar — ${horas} h ${tipoDia === 'feriado' ? 'em feriado' : tipoDia === 'descanso' ? 'em dia de descanso' : 'em dia útil'}${acima100 ? ' (acima de 100 h/ano)' : ''}`,
    headers: ['Componente', 'Horas', 'Acréscimo', 'Valor'],
    rows: [
      ['Hora normal (base)', String(horas), '—', fmtEUR(baseTotal)],
      ...detalheTramos.map((t) => [
        t.desc,
        t.horas.toLocaleString('de-DE', { maximumFractionDigits: 2 }),
        '+' + (t.perc * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %',
        fmtEUR(t.valor),
      ]),
      ['Total a pagar', String(horas), '—', fmtEUR(totalPagar)],
    ],
    note: `Valor da hora normal: ${fmtEUR(valorHora)}. Acréscimos do art. 268.º do Código do Trabalho.`,
  };

  const tipoDiaTxt = tipoDia === 'feriado' ? 'em feriado' : tipoDia === 'descanso' ? 'em dia de descanso semanal' : 'em dia útil';
  const _insight = {
    title: 'Quanto recebe pelas horas extra',
    text:
      `Por **${horas} ${horas === 1 ? 'hora suplementar' : 'horas suplementares'}** ${tipoDiaTxt} ` +
      `recebe **${fmtEUR(totalPagar)}** (hora normal ${fmtEUR(valorHora)} + acréscimo ${fmtEUR(acrescimoTotal)}). ` +
      `Cada hora suplementar vale, em média, **${fmtEUR(valorMedioHora)}**` +
      (acima100 ? ' — já com os acréscimos a dobrar por ter ultrapassado as 100 h/ano.' : '.'),
    tone: 'good',
    icon: '⏱️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Hora normal', value: Math.round(baseTotal * 100) / 100 },
      { label: 'Acréscimo', value: Math.round(acrescimoTotal * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(totalPagar),
    centerLabel: 'Total a pagar',
    ariaLabel: `${horas} horas suplementares ${tipoDiaTxt}: total ${fmtEUR(totalPagar)} (base ${fmtEUR(baseTotal)} + acréscimo ${fmtEUR(acrescimoTotal)}).`,
  };

  return {
    totalPagar: fmtEUR(totalPagar),
    valorHoraNormal: fmtEUR(valorHora),
    acrescimo: fmtEUR(acrescimoTotal),
    valorMedioHora: fmtEUR(valorMedioHora),
    base: fmtEUR(baseTotal),
    detalhe:
      `Hora normal ${fmtEUR(valorHora)} × ${horas} h = ${fmtEUR(baseTotal)}; ` +
      `acréscimo ${tipoDiaTxt} = ${fmtEUR(acrescimoTotal)}; total = ${fmtEUR(totalPagar)}.`,
    _table,
    _insight,
    _chart,
  };
}
