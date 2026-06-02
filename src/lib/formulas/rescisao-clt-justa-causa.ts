/**
 * Cálculo de Rescisão CLT — Demissão por Justa Causa 2026
 * Parcelas: apenas saldo de salário + férias vencidas + 1/3 (se houver).
 * NÃO tem aviso, 13º proporcional, férias proporcionais, multa 40% FGTS nem saque FGTS.
 * (CLT art. 482, 482, 483).
 */

export interface Inputs {
  salario: number | string;
  diasTrabalhadosMes: number | string;
  temFeriasVencidas?: string;
}

export interface Outputs {
  saldoSalario: string;
  feriasVencidas: string;
  tercoFeriasVencidas: string;
  totalRescisao: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltJustaCausa(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const temVencidas = String(i.temFeriasVencidas || 'nao').toLowerCase() === 'sim';

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  const ferias = temVencidas ? sal : 0;
  const terco = temVencidas ? sal / 3 : 0;
  const total = saldoSalario + ferias + terco;

  const chart = temVencidas ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Saldo de salário', value: Math.round(saldoSalario * 100) / 100 },
      { label: 'Férias vencidas', value: Math.round(ferias * 100) / 100 },
      { label: '1/3 das férias', value: Math.round(terco * 100) / 100 },
    ],
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total a receber',
    ariaLabel: 'Composição da rescisão por justa causa: saldo de salário, férias vencidas e 1/3',
  } : undefined;

  const insight = {
    title: 'Justa causa: o mínimo legal',
    text: `Por justa causa você recebe apenas **${brl(total)}**: ${temVencidas ? 'saldo de salário mais as férias vencidas + 1/3' : 'somente o saldo de salário dos dias trabalhados'}. Sem aviso prévio, 13º proporcional, férias proporcionais nem multa de 40% — e o FGTS **não pode ser sacado**.`,
    tone: 'warn' as const,
    icon: '⚠️',
  };

  return {
    saldoSalario: brl(saldoSalario),
    feriasVencidas: brl(ferias),
    tercoFeriasVencidas: brl(terco),
    totalRescisao: brl(total),
    resumen: `Justa causa: total ≈ ${brl(total)}. Apenas saldo de salário${temVencidas ? ' + férias vencidas + 1/3' : ''}. Sem 13º proporcional, aviso prévio, multa 40% FGTS ou saque do FGTS.`,
    _chart: chart,
    _insight: insight,
  };
}
