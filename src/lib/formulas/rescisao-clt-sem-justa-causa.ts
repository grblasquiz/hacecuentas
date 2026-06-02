/**
 * Cálculo de Rescisão CLT — Demissão sem Justa Causa 2026
 * Parcelas: saldo de salário + aviso prévio + 13º proporcional + férias proporcionais + 1/3
 *           + multa de 40% sobre FGTS (CLT art. 477, 487, Lei 8.036/90 art. 18).
 * Salário mínimo 2026: R$ 1.518/mês.
 */

export interface Inputs {
  salario: number | string;
  diasTrabalhadosMes: number | string;
  mesesTrabalhadosAno: number | string;
  saldoFgts: number | string;
  anosServico?: number | string;
}

export interface Outputs {
  saldoSalario: string;
  avisoPrevio: string;
  decimoTerceiro: string;
  feriasProporcionais: string;
  tercoConstitucional: string;
  multaFgts40: string;
  totalRescisao: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltSemJustaCausa(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const meses = Math.min(12, Math.max(0, Number(i.mesesTrabalhadosAno) || 0));
  const fgts = Number(i.saldoFgts) || 0;
  const anos = Number(i.anosServico) || 0;

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  // aviso prévio indenizado: 30 dias + proporcional 3 dias por ano (Lei 12.506/2011), máx 90 dias
  const diasAviso = Math.min(90, 30 + anos * 3);
  const avisoPrevio = (sal / 30) * diasAviso;
  const decimoTerceiro = (sal / 12) * meses;
  const feriasProp = (sal / 12) * meses;
  const terco = feriasProp / 3;
  const multa = fgts * 0.40;
  const total = saldoSalario + avisoPrevio + decimoTerceiro + feriasProp + terco + multa;

  const slicesDef: { label: string; value: number }[] = [
    { label: 'Saldo de salário', value: saldoSalario },
    { label: 'Aviso prévio', value: avisoPrevio },
    { label: '13º proporcional', value: decimoTerceiro },
    { label: 'Férias prop. + 1/3', value: feriasProp + terco },
    { label: 'Multa FGTS 40%', value: multa },
  ];
  const slices = slicesDef
    .filter((s) => s.value > 0)
    .map((s) => ({ label: s.label, value: Math.round(s.value * 100) / 100 }));
  const chart = slices.length >= 2 ? {
    type: 'doughnut' as const,
    slices,
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total bruto',
    ariaLabel: 'Composição da rescisão sem justa causa: saldo, aviso prévio, 13º, férias + 1/3 e multa do FGTS',
  } : undefined;

  const insight = {
    title: 'Rescisão completa a seu favor',
    text: `Demitido sem justa causa, você soma cerca de **${brl(total)}** bruto, incluindo aviso prévio de **${diasAviso} dias** e a multa de **40%** sobre o FGTS (**${brl(multa)}**). Ainda pode sacar o FGTS e solicitar o seguro-desemprego. Valor bruto — INSS e IR não incluídos.`,
    tone: 'good' as const,
    icon: '💰',
  };

  return {
    saldoSalario: brl(saldoSalario),
    avisoPrevio: brl(avisoPrevio),
    decimoTerceiro: brl(decimoTerceiro),
    feriasProporcionais: brl(feriasProp),
    tercoConstitucional: brl(terco),
    multaFgts40: brl(multa),
    totalRescisao: brl(total),
    resumen: `Demissão sem justa causa: total bruto ≈ ${brl(total)}. Inclui aviso prévio de ${diasAviso} dias, 13º e férias proporcionais + 1/3 + multa 40% do FGTS.`,
    _chart: chart,
    _insight: insight,
  };
}
