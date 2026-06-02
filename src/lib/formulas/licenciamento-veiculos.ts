/**
 * Licenciamento Anual de Veículos 2026
 * Soma: Taxa CRLV + DPVAT (se aplicável) + IPVA
 * Taxa CRLV varia por estado (~R$ 150-170 em SP).
 */

export interface LicenciamentoInputs {
  taxaCrlv: number;
  valorDpvat: number;
  valorIpva: number;
  incluirMultas: number;
}

export interface LicenciamentoOutputs {
  totalLicenciamento: number;
  somaTaxas: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function licenciamentoVeiculos(inputs: LicenciamentoInputs): LicenciamentoOutputs {
  const taxaCrlv = Number(inputs.taxaCrlv) || 0;
  const valorDpvat = Number(inputs.valorDpvat) || 0;
  const valorIpva = Number(inputs.valorIpva) || 0;
  const multas = Number(inputs.incluirMultas) || 0;

  if (taxaCrlv <= 0) {
    throw new Error('Ingresá a taxa CRLV do seu estado');
  }

  const somaTaxas = taxaCrlv + valorDpvat;
  const totalLicenciamento = somaTaxas + valorIpva + multas;

  const formula = `Licenciamento = Taxa CRLV (R$ ${taxaCrlv.toFixed(2)}) + DPVAT (R$ ${valorDpvat.toFixed(2)}) + IPVA (R$ ${valorIpva.toFixed(2)}) + Multas (R$ ${multas.toFixed(2)}) = R$ ${totalLicenciamento.toFixed(2)}`;
  const explicacion = `Para regularizar seu veículo em 2026 você precisa pagar: Taxa CRLV R$ ${taxaCrlv.toFixed(2)}, DPVAT R$ ${valorDpvat.toFixed(2)} (se voltar), IPVA R$ ${valorIpva.toFixed(2)} e eventuais multas R$ ${multas.toFixed(2)}. Total: R$ ${totalLicenciamento.toFixed(2)}. O CRLV digital é exigido para circular.`;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const totalFmt = 'R$ ' + r2(totalLicenciamento).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Donut: total = soma dos itens (só entram os valores > 0)
  const slices: { label: string; value: number }[] = [];
  if (taxaCrlv > 0) slices.push({ label: 'Taxa CRLV', value: r2(taxaCrlv) });
  if (valorDpvat > 0) slices.push({ label: 'DPVAT', value: r2(valorDpvat) });
  if (valorIpva > 0) slices.push({ label: 'IPVA', value: r2(valorIpva) });
  if (multas > 0) slices.push({ label: 'Multas', value: r2(multas) });
  let chart: any = undefined;
  if (slices.length >= 2) {
    chart = {
      type: 'doughnut' as const,
      slices,
      prefix: 'R$ ',
      centerValue: totalFmt,
      centerLabel: 'Total a pagar',
      ariaLabel: 'Composição do custo do licenciamento: taxa CRLV, DPVAT, IPVA e multas',
    };
  }

  // Insight: dinâmico — avisa se há multas pesando no total
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (multas > 0) {
    const pctMultas = Math.round((multas / totalLicenciamento) * 100);
    insightText = `Para colocar o veículo em dia em 2026 você vai pagar **${totalFmt}**. As **multas** pesam **${pctMultas}%** desse total — quitá-las antes evita bloqueio e juros crescentes.`;
    insightTone = 'warn';
  } else {
    insightText = `O licenciamento 2026 fica em **${totalFmt}** somando CRLV, DPVAT e IPVA. Sem multas pendentes, é só pagar e emitir o **CRLV digital**, exigido para circular.`;
    insightTone = 'good';
  }

  return {
    totalLicenciamento: Math.round(totalLicenciamento * 100) / 100,
    somaTaxas: Math.round(somaTaxas * 100) / 100,
    formula,
    explicacion,
    _insight: {
      title: 'Seu licenciamento 2026',
      text: insightText,
      tone: insightTone,
      icon: '🚗',
    },
    ...(chart ? { _chart: chart } : {}),
  };
}
