/**
 * Cálculo do Aviso Prévio Proporcional (Lei 12.506/2011) 2026
 * 30 dias + 3 dias por ano trabalhado no mesmo empregador, limitado a 90 dias no total.
 * Aplica-se apenas em favor do empregado (demissão sem justa causa).
 */

export interface Inputs {
  salario: number | string;
  anosServico: number | string;
}

export interface Outputs {
  diasAviso: string;
  valorAviso: string;
  diasAdicionais: string;
  atingiuMaximo: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function avisoPrevioProporcional(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const anos = Math.max(0, Number(i.anosServico) || 0);

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const adicionaisSemLimite = anos * 3;
  const diasBrutos = 30 + adicionaisSemLimite;
  const dias = Math.min(90, diasBrutos);
  const adicionais = dias - 30;
  const valor = (sal / 30) * dias;
  const atingiu = diasBrutos >= 90;

  const insightText = atingiu
    ? `Com **${anos} anos** de casa você bate o **teto legal de 90 dias** de aviso (${brl(valor)}). Anos a mais não aumentam o prazo: o adicional de 3 dias/ano para de contar aqui.`
    : `Com **${anos} anos** de casa seu aviso é de **${dias} dias** (30 fixos + ${adicionais} proporcionais) = **${brl(valor)}**. Cada ano completo a mais soma 3 dias até o limite de 90.`;

  return {
    diasAviso: `${dias} dias`,
    valorAviso: brl(valor),
    diasAdicionais: `${adicionais} dias`,
    atingiuMaximo: atingiu ? 'Sim (teto 90 dias)' : 'Não',
    resumen: `Aviso prévio proporcional (Lei 12.506/2011): ${dias} dias (30 + ${adicionais} adicionais) = ${brl(valor)}. ${atingiu ? 'Atingiu teto legal de 90 dias.' : ''}`.trim(),
    _insight: {
      title: 'Seu prazo de aviso',
      text: insightText,
      tone: atingiu ? 'good' : 'neutral',
      icon: '📅',
    },
    _chart: {
      type: 'scale',
      marker: dias,
      markerLabel: `${dias} dias`,
      min: 30,
      segments: [
        { nombre: 'Mínimo (30d)', max: 45, color: '#94a3b8', colorDark: '#64748b' },
        { nombre: 'Proporcional', max: 75, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Teto (90d)', max: 90, color: '#34d399', colorDark: '#10b981' },
      ],
      ariaLabel: `Escala de dias de aviso prévio de 30 a 90. Seu prazo: ${dias} dias.`,
    },
  };
}
