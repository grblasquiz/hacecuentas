/**
 * Simulador da Isenção IMT Jovem + Imposto do Selo — Portugal 2026.
 *
 * Jovens até 35 anos que compram a 1.ª habitação própria e permanente têm:
 *   - isenção TOTAL de IMT e Imposto do Selo até 330.539 €;
 *   - isenção PARCIAL entre 330.539 € e 660.982 € (pagam só sobre o excedente, ao escalão dos 8 %);
 *   - acima de 660.982 € não há benefício (IMT + Selo normais).
 *
 * Compara o imposto COM benefício com o imposto normal (HPP) e mostra a poupança.
 * Toda a matemática (tabela IMT, limites, taxas) vem de portugal-2026.ts.
 */
import { fmtEUR, imt, imtJovem, IMT_JOVEM_2026 } from '../data/portugal-2026';

export interface Inputs {
  /** Valor de compra do imóvel (ou VPT, o maior dos dois) em €. */
  valor: number;
  /** Idade do comprador. O benefício exige ter até 35 anos. */
  idade?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valor) || 0);
  if (valor <= 0) throw new Error('Indique o valor de compra do imóvel');
  const idade = Math.max(0, Math.floor(Number(i.idade) || 0));

  const imtNormal = imt(valor, true); // habitação própria e permanente
  const seloNormal = valor * IMT_JOVEM_2026.seloAquisicao;
  const totalNormal = imtNormal + seloNormal;

  const elegivel = idade <= IMT_JOVEM_2026.idadeMaxima;

  let imtPagar: number, seloPagar: number, tipo: 'total' | 'parcial' | 'nenhuma';
  if (!elegivel) {
    imtPagar = imtNormal; seloPagar = seloNormal; tipo = 'nenhuma';
  } else {
    const r = imtJovem(valor);
    imtPagar = r.imt; seloPagar = r.selo; tipo = r.tipoIsencao;
  }
  const totalPagar = imtPagar + seloPagar;
  const poupanca = totalNormal - totalPagar;

  const tipoLabel =
    !elegivel ? 'sem benefício (idade acima de 35 anos)'
      : tipo === 'total' ? 'isenção total'
      : tipo === 'parcial' ? 'isenção parcial'
      : 'sem benefício (valor acima de 660.982 €)';

  const _insight = {
    type: 'highlight',
    icon: !elegivel ? '⚠️' : poupanca > 0 ? '🏠' : 'ℹ️',
    text: !elegivel
      ? `Com **${idade} anos**, não cumpre o requisito de idade (até 35 anos) do IMT Jovem. Numa compra de **${fmtEUR(valor)}** pagaria o IMT e o Selo normais: **${fmtEUR(totalNormal)}**.`
      : tipo === 'total'
        ? `Boa notícia: uma compra de **${fmtEUR(valor)}** está **isenta de IMT e de Imposto do Selo** (valor até 330.539 €). Poupa **${fmtEUR(poupanca)}** face a um comprador sem o benefício.`
        : tipo === 'parcial'
          ? `A compra de **${fmtEUR(valor)}** tem **isenção parcial**: só paga imposto sobre a parte acima de 330.539 €. Paga **${fmtEUR(totalPagar)}** (IMT + Selo) em vez de **${fmtEUR(totalNormal)}** — uma poupança de **${fmtEUR(poupanca)}**.`
          : `Uma compra de **${fmtEUR(valor)}** está acima do limite de 660.982 €, pelo que **não há isenção jovem**: paga o IMT e o Selo normais, **${fmtEUR(totalNormal)}**.`,
  };

  // Tabela: imposto com benefício jovem vs normal, por valor de compra.
  const _table = {
    title: 'IMT + Selo: jovem (≤35 anos, 1.ª HPP) vs comprador normal (2026)',
    headers: ['Valor de compra', 'IMT + Selo (jovem)', 'IMT + Selo (normal)', 'Poupança'],
    rows: [200000, 300000, 330539, 400000, 500000, 660982, 700000].map((v) => {
      const rj = imtJovem(v);
      const normal = imt(v, true) + v * IMT_JOVEM_2026.seloAquisicao;
      const jov = rj.imt + rj.selo;
      return [fmtEUR(v), fmtEUR(jov), fmtEUR(normal), fmtEUR(normal - jov)];
    }),
    note:
      'IMT Jovem: isenção total até 330.539 €; parcial (8 % sobre o excedente) entre 330.539 e 660.982 €; ' +
      'sem benefício acima de 660.982 €. Exige 1.ª habitação própria e permanente e idade até 35 anos. ' +
      'O Imposto do Selo (0,8 %) é isento na mesma medida que o IMT.',
  };

  return {
    totalPagar: fmtEUR(totalPagar),
    imt: fmtEUR(imtPagar),
    selo: fmtEUR(seloPagar),
    poupanca: fmtEUR(poupanca),
    imtNormalTotal: fmtEUR(totalNormal),
    tipoIsencao: tipoLabel,
    detalhe:
      `IMT ${fmtEUR(imtPagar)} + Selo ${fmtEUR(seloPagar)} = ${fmtEUR(totalPagar)} a pagar. ` +
      `Sem o benefício seriam ${fmtEUR(totalNormal)} → poupança de ${fmtEUR(poupanca)} (${tipoLabel}).`,
    _insight,
    _table,
  };
}
