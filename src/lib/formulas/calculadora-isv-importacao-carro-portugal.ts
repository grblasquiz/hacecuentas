/**
 * Simulador ISV — Imposto Sobre Veículos (Portugal 2026, continente).
 * ISV = componente de cilindrada + componente ambiental (CO2 WLTP),
 *       menos a redução por anos de uso (veículos usados importados).
 *
 * Tabelas 2026 (iguais às de 2025 — o OE 2026 não alterou taxas), ligeiros
 * de passageiros (Tabela A / geral). Fonte: Código do ISV (CISV) e Autoridade
 * Tributária. As tabelas €/cm³ e €/(g/km) NÃO estão no data file (são específicas
 * do ISV), pelo que ficam aqui com a fonte comentada. fmtEUR vem de portugal-2026.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  cilindrada: number;           // cm³
  co2: number;                  // g/km (WLTP)
  combustivel?: string;         // 'gasolina' | 'gasoleo' | 'hibrido-plugin' | 'eletrico'
  anosUso?: number;             // anos de uso (0 = novo); >0 aplica redução de usados
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

// Componente de cilindrada (Tabela A, art. 7.º CISV) — €/cm³ e parcela a abater.
const CILINDRADA = [
  { ate: 1000, taxa: 1.09, abater: 849.03 },
  { ate: 1250, taxa: 1.18, abater: 850.69 },
  { ate: Infinity, taxa: 5.61, abater: 6194.88 },
];

// Componente ambiental — CO2 (WLTP), gasolina.
const CO2_GASOLINA = [
  { ate: 110, taxa: 0.44, abater: 43.02 },
  { ate: 115, taxa: 1.10, abater: 115.80 },
  { ate: 120, taxa: 1.38, abater: 147.79 },
  { ate: 130, taxa: 5.27, abater: 619.17 },
  { ate: 145, taxa: 6.38, abater: 762.73 },
  { ate: 175, taxa: 41.54, abater: 5819.56 },
  { ate: 195, taxa: 51.38, abater: 7247.39 },
  { ate: 235, taxa: 193.01, abater: 34190.52 },
  { ate: Infinity, taxa: 233.81, abater: 41910.96 },
];

// Componente ambiental — CO2 (WLTP), gasóleo (tabela própria, mais gravosa).
const CO2_GASOLEO = [
  { ate: 110, taxa: 1.72, abater: 11.50 },
  { ate: 120, taxa: 18.96, abater: 1906.19 },
  { ate: 140, taxa: 65.04, abater: 7360.85 },
  { ate: 150, taxa: 127.40, abater: 16080.57 },
  { ate: 160, taxa: 160.81, abater: 21176.06 },
  { ate: 170, taxa: 221.69, abater: 29227.38 },
  { ate: 190, taxa: 274.08, abater: 36987.98 },
  { ate: Infinity, taxa: 282.35, abater: 38271.32 },
];

// Redução por anos de uso (art. 11.º CISV) — aplica-se ao ISV total do veículo usado.
function reducaoUsado(anos: number): number {
  if (anos <= 0) return 0;
  if (anos <= 1) return 0.10;
  if (anos <= 2) return 0.20;
  if (anos <= 3) return 0.28;
  if (anos <= 4) return 0.35;
  if (anos <= 5) return 0.43;
  if (anos <= 6) return 0.52;
  if (anos <= 7) return 0.60;
  if (anos <= 8) return 0.65;
  if (anos <= 9) return 0.70;
  if (anos <= 10) return 0.75;
  return 0.80;
}

function porEscaloes(valor: number, tabela: { ate: number; taxa: number; abater: number }[]): number {
  for (const e of tabela) {
    if (valor <= e.ate) return Math.max(0, valor * e.taxa - e.abater);
  }
  const u = tabela[tabela.length - 1];
  return Math.max(0, valor * u.taxa - u.abater);
}

export function compute(i: Inputs): Outputs {
  const cc = Math.max(0, Number(i.cilindrada) || 0);
  const co2 = Math.max(0, Number(i.co2) || 0);
  const combustivel = String(i.combustivel || 'gasolina');
  const anos = Math.max(0, Number(i.anosUso) || 0);

  const eletrico = combustivel === 'eletrico';
  const gasoleo = combustivel === 'gasoleo';
  const phev = combustivel === 'hibrido-plugin';

  // Elétricos puros estão isentos de ISV (avaliado antes de exigir cilindrada).
  if (eletrico) {
    return {
      isvTotal: fmtEUR(0),
      componenteCilindrada: fmtEUR(0),
      componenteAmbiental: fmtEUR(0),
      reducao: '0 %',
      detalhe: 'Veículo 100 % elétrico: isento de ISV (não paga componente de cilindrada nem ambiental).',
      _insight: { title: 'Elétrico: ISV = 0 €', text: 'Os automóveis ligeiros de passageiros **100 % elétricos** estão **isentos de ISV** em Portugal. Só paga o IUC anual (reduzido) e os custos de legalização/matrícula.', tone: 'good', icon: '🔌' },
    };
  }

  if (cc <= 0) throw new Error('Indique a cilindrada do veículo (cm³)');

  const cCilindrada = porEscaloes(cc, CILINDRADA);
  let cAmbiental = porEscaloes(co2, gasoleo ? CO2_GASOLEO : CO2_GASOLINA);
  // Híbrido plug-in elegível: 75 % de desconto na componente ambiental.
  if (phev) cAmbiental = cAmbiental * 0.25;
  // Agravamento gasóleo (partículas): adicional de 500 € (art. 7.º CISV).
  const adicionalGasoleo = gasoleo ? 500 : 0;

  const isvNovo = cCilindrada + cAmbiental + adicionalGasoleo;
  const perc = reducaoUsado(anos);
  const isvTotal = isvNovo * (1 - perc);

  const _table = {
    title: 'Como se chega ao ISV',
    headers: ['Componente', 'Valor'],
    rows: [
      ['Componente de cilindrada', fmtEUR(cCilindrada)],
      [`Componente ambiental (CO2 ${co2} g/km${phev ? ', −75 % PHEV' : ''})`, fmtEUR(cAmbiental)],
      ...(adicionalGasoleo ? [['Adicional gasóleo (partículas)', fmtEUR(adicionalGasoleo)]] : []),
      ['ISV do veículo novo', fmtEUR(isvNovo)],
      ['Redução por anos de uso', anos > 0 ? `−${Math.round(perc * 100)} % (${anos} ano${anos === 1 ? '' : 's'})` : '—'],
      ['ISV a pagar', fmtEUR(isvTotal)],
    ],
    note: 'Tabela A (ligeiros de passageiros), continente, 2026. Redução de usados: art. 11.º CISV. Cálculo orientativo.',
  };

  const _insight = {
    title: anos > 0 ? `Usado de ${anos} ano${anos === 1 ? '' : 's'}: paga ${Math.round((1 - perc) * 100)} % do ISV` : 'ISV do veículo novo',
    text: `Com **${cc.toLocaleString('de-DE')} cm³** e **${co2} g/km** de CO2 (${gasoleo ? 'gasóleo' : phev ? 'híbrido plug-in' : 'gasolina'}), o ISV é **${fmtEUR(isvTotal)}**. ` +
      (anos > 0
        ? `A redução por anos de uso (${Math.round(perc * 100)} %) baixou-o de ${fmtEUR(isvNovo)} (valor de novo) para ${fmtEUR(isvTotal)}.`
        : `A componente ambiental (CO2) pesa **${fmtEUR(cAmbiental)}** e a de cilindrada **${fmtEUR(cCilindrada)}**.`),
    tone: 'warn',
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cilindrada', value: Math.round(cCilindrada * (1 - perc)) },
      { label: 'Ambiental (CO2)', value: Math.round(cAmbiental * (1 - perc)) },
      ...(adicionalGasoleo ? [{ label: 'Adicional gasóleo', value: Math.round(adicionalGasoleo * (1 - perc)) }] : []),
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(isvTotal),
    centerLabel: 'ISV',
    ariaLabel: `ISV ${fmtEUR(isvTotal)}: cilindrada ${fmtEUR(cCilindrada)}, ambiental ${fmtEUR(cAmbiental)}.`,
  };

  return {
    isvTotal: fmtEUR(isvTotal),
    componenteCilindrada: fmtEUR(cCilindrada),
    componenteAmbiental: fmtEUR(cAmbiental),
    reducao: anos > 0 ? `−${Math.round(perc * 100)} %` : '0 %',
    detalhe: `Cilindrada ${fmtEUR(cCilindrada)} + ambiental ${fmtEUR(cAmbiental)}${adicionalGasoleo ? ' + 500 € gasóleo' : ''} = ${fmtEUR(isvNovo)} (novo)${anos > 0 ? `; −${Math.round(perc * 100)} % → ${fmtEUR(isvTotal)}` : ''}.`,
    _insight,
    _table,
    _chart,
  };
}
