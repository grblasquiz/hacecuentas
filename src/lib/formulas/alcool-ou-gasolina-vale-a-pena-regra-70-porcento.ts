// Álcool ou gasolina? Regra dos 70% + modo preciso por consumo (km/l).
// O etanol rende cerca de 70% do que rende a gasolina no mesmo motor flex.
// Regra prática: se o preço do álcool for MENOR que 70% do da gasolina,
// vale a pena abastecer com álcool. O modo preciso compara o custo por km
// real quando o motorista informa o consumo (km/l) de cada combustível.

export interface Inputs {
  precoAlcool: number;      // R$/litro
  precoGasolina: number;    // R$/litro
  rendimentoAlcool?: number;   // km/l (opcional, modo preciso)
  rendimentoGasolina?: number; // km/l (opcional, modo preciso)
}
export interface Outputs {
  recomendacao: string;
  percentual: string;
  custoKmAlcool: string;
  custoKmGasolina: string;
  economiaPorcento: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const LIMITE = 0.70; // etanol vale a pena até 70% do preço da gasolina

export function compute(i: Inputs): Outputs {
  const pAlcool = Number(i.precoAlcool) || 0;
  const pGasolina = Number(i.precoGasolina) || 0;
  const rAlcool = Number(i.rendimentoAlcool) || 0;
  const rGasolina = Number(i.rendimentoGasolina) || 0;

  if (pAlcool <= 0 || pGasolina <= 0) {
    return {
      recomendacao: '—', percentual: '—', custoKmAlcool: '—', custoKmGasolina: '—', economiaPorcento: '—',
      detalhe: 'Informe o preço do litro do álcool e da gasolina.',
      _insight: { title: 'Faltam os preços', text: 'Informe o **preço do litro** do álcool e da gasolina para comparar.', tone: 'warn', icon: '⚠️' },
    };
  }

  const razao = pAlcool / pGasolina;         // proporção do preço álcool/gasolina
  const razaoPct = razao * 100;
  const usoPreciso = rAlcool > 0 && rGasolina > 0;

  let melhor: 'Álcool' | 'Gasolina';
  let economiaPorcentoNum = 0;
  let custoKmA = 0, custoKmG = 0;

  if (usoPreciso) {
    // Custo por km = preço do litro ÷ km rodados por litro.
    custoKmA = pAlcool / rAlcool;
    custoKmG = pGasolina / rGasolina;
    melhor = custoKmA <= custoKmG ? 'Álcool' : 'Gasolina';
    const maior = Math.max(custoKmA, custoKmG);
    const menor = Math.min(custoKmA, custoKmG);
    economiaPorcentoNum = maior > 0 ? ((maior - menor) / maior) * 100 : 0;
  } else {
    melhor = razao < LIMITE ? 'Álcool' : 'Gasolina';
    // Economia estimada pela regra dos 70% (referência de rendimento 70%).
    // Custo relativo por km: álcool = razao/0.70 ; gasolina = 1.
    const custoRelAlcool = razao / LIMITE;
    economiaPorcentoNum = melhor === 'Álcool'
      ? (1 - custoRelAlcool) * 100
      : (custoRelAlcool - 1) * 100;
  }

  const percentual = `${razaoPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do preço da gasolina`;
  const economiaPorcento = `${Math.abs(economiaPorcentoNum).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

  const recomendacao = melhor === 'Álcool'
    ? 'Compensa abastecer com ÁLCOOL'
    : 'Compensa abastecer com GASOLINA';

  const detalhe = usoPreciso
    ? `Custo por km: álcool ${fmtBRL(custoKmA)} vs gasolina ${fmtBRL(custoKmG)}. ${recomendacao} — economia de ~${economiaPorcento} por km.`
    : `O álcool está a ${percentual} (limite dos 70%). Como ${razao < LIMITE ? 'está abaixo' : 'passou'} de 70%, ${recomendacao}.`;

  return {
    recomendacao,
    percentual,
    custoKmAlcool: usoPreciso ? fmtBRL(custoKmA) : '—',
    custoKmGasolina: usoPreciso ? fmtBRL(custoKmG) : '—',
    economiaPorcento,
    detalhe,
    _insight: {
      title: recomendacao,
      text: usoPreciso
        ? `Com o consumo informado, cada km custa **${fmtBRL(custoKmA)}** no álcool e **${fmtBRL(custoKmG)}** na gasolina. ${melhor === 'Álcool' ? 'O álcool' : 'A gasolina'} economiza cerca de **${economiaPorcento}** por km.`
        : `O álcool está a **${percentual}**. A regra dos 70% diz: abaixo de 70%, álcool; acima, gasolina. Neste caso, ${razao < LIMITE ? '**álcool**' : '**gasolina**'}.`,
      tone: 'good',
      icon: '⛽',
    },
    _chart: usoPreciso
      ? { type: 'bar', labels: ['Custo/km álcool', 'Custo/km gasolina'], values: [Math.round(custoKmA * 1000) / 1000, Math.round(custoKmG * 1000) / 1000], prefix: 'R$ ', ariaLabel: `Custo por km: álcool ${fmtBRL(custoKmA)}, gasolina ${fmtBRL(custoKmG)}.` }
      : { type: 'bar', labels: ['Preço álcool', '70% da gasolina', 'Preço gasolina'], values: [Math.round(pAlcool * 100) / 100, Math.round(pGasolina * LIMITE * 100) / 100, Math.round(pGasolina * 100) / 100], prefix: 'R$ ', ariaLabel: `Preço álcool ${fmtBRL(pAlcool)}, limite 70% ${fmtBRL(pGasolina * LIMITE)}, gasolina ${fmtBRL(pGasolina)}.` },
  };
}
