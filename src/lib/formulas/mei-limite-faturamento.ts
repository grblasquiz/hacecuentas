/** MEI — Monitor de limite de faturamento R$ 81.000/ano (2026)
 *  Alerta aos 70% (R$ 56.700). Se ultrapassa em até 20% (R$97.200) paga DAS complementar.
 *  Se > 20% desenquadramento retroativo ao ano.
 *  Limites: fonte única src/lib/data/brasil-2026.ts.
 */
import { MEI_LIMITE_FATURAMENTO, MEI_LIMITE_FATURAMENTO_20 } from '../data/brasil-2026';

export interface Inputs {
  faturamentoAcumulado: number;
  mesesDecorridos: number;
}

export interface Outputs {
  limiteAnual: number;
  percentualUsado: number;
  disponivel: number;
  projecaoAnual: number;
  alerta: string;
  status: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function meiLimiteFaturamento(i: Inputs): Outputs {
  const fat = Math.max(0, Number(i.faturamentoAcumulado) || 0);
  const meses = Math.min(12, Math.max(1, Number(i.mesesDecorridos) || 1));

  const LIMITE = MEI_LIMITE_FATURAMENTO;
  const LIMITE_20 = MEI_LIMITE_FATURAMENTO_20;
  const percentualUsado = (fat / LIMITE) * 100;
  const disponivel = Math.max(0, LIMITE - fat);
  const projecaoAnual = (fat / meses) * 12;

  let status = 'ok';
  let alerta = '';

  if (fat > LIMITE_20) {
    status = 'desenquadramento';
    alerta = `⚠️ Ultrapassou R$ 97.200 (20% acima do limite). Desenquadramento RETROATIVO a janeiro. Você deverá virar ME do Simples Nacional com efeito retroativo e pagar diferenças.`;
  } else if (fat > LIMITE) {
    status = 'excesso';
    alerta = `⚠️ Ultrapassou R$ 81.000. Pagará DAS complementar sobre o excedente (até R$ 16.200 tolerado). A partir de janeiro do próximo ano vira ME obrigatoriamente.`;
  } else if (percentualUsado >= 70) {
    status = 'atencao';
    alerta = `⚠️ Já usou ${percentualUsado.toFixed(1)}% do limite. Projeção: R$ ${projecaoAnual.toFixed(2)}. Considere migrar para ME antes de estourar.`;
  } else {
    status = 'ok';
    alerta = `✓ Dentro do limite (${percentualUsado.toFixed(1)}% usado). Disponível: R$ ${disponivel.toFixed(2)}.`;
  }

  const formula = `% usado = R$ ${fat.toFixed(2)} / R$ ${LIMITE} × 100 = ${percentualUsado.toFixed(1)}%`;
  const explicacion = `Faturamento MEI em ${meses} mes(es): R$ ${fat.toFixed(2)} (${percentualUsado.toFixed(1)}% do teto anual de R$ 81.000). Projeção linear anual: R$ ${projecaoAnual.toFixed(2)}. Disponível: R$ ${disponivel.toFixed(2)}. ${alerta}`;

  const insightMap: Record<string, { title: string; text: string; tone: string; icon: string }> = {
    ok: {
      title: 'Dentro do limite, com folga',
      text: `Você usou **${percentualUsado.toFixed(1)}%** do teto e ainda tem **R$ ${disponivel.toFixed(2)}** disponíveis. Sua projeção anual de **R$ ${projecaoAnual.toFixed(2)}** fica abaixo dos R$ 81.000 — sem risco de desenquadramento por ora.`,
      tone: 'good',
      icon: '✅',
    },
    atencao: {
      title: 'Zona de atenção: pé no freio',
      text: `Já consumiu **${percentualUsado.toFixed(1)}%** do teto em ${meses} mes(es) e sua projeção é de **R$ ${projecaoAnual.toFixed(2)}/ano**. Nesse ritmo você estoura os R$ 81.000 — vá planejando a migração para ME.`,
      tone: 'warn',
      icon: '⚠️',
    },
    excesso: {
      title: 'Limite ultrapassado',
      text: `Faturou **R$ ${fat.toFixed(2)}** (${percentualUsado.toFixed(1)}% do teto), acima dos R$ 81.000. Como ficou dentro da margem de 20%, paga DAS complementar sobre o excedente e vira **ME a partir de janeiro**.`,
      tone: 'warn',
      icon: '🚨',
    },
    desenquadramento: {
      title: 'Desenquadramento retroativo',
      text: `Com **R$ ${fat.toFixed(2)}** (${percentualUsado.toFixed(1)}% do teto) você passou dos R$ 97.200. O desenquadramento é **retroativo a janeiro**: vira ME do Simples Nacional com efeito retroativo e paga as diferenças.`,
      tone: 'warn',
      icon: '🚨',
    },
  };
  const _insight = insightMap[status] || insightMap.ok;

  const markerPct = Number(percentualUsado.toFixed(1));
  const _chart = {
    type: 'scale',
    marker: markerPct,
    markerLabel: `${markerPct}% do teto`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Tranquilo', max: 70, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Atenção', max: 100, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Excesso (até +20%)', max: 120, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Desenquadra', max: Math.max(140, Math.ceil(markerPct) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Percentual do teto anual de R$ 81.000 usado: ${markerPct}%. Zonas: tranquilo até 70%, atenção até 100%, excesso até 120% e desenquadramento acima.`,
  };

  return {
    limiteAnual: LIMITE,
    percentualUsado: Number(percentualUsado.toFixed(2)),
    disponivel: Number(disponivel.toFixed(2)),
    projecaoAnual: Number(projecaoAnual.toFixed(2)),
    alerta,
    status,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
