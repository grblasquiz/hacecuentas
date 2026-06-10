import { salarioLiquidoDependentes } from './src/lib/formulas/salario-liquido-dependentes';
import { salarioLiquidoPensao } from './src/lib/formulas/salario-liquido-pensao';
import { decimoTerceiroSegundaParcela } from './src/lib/formulas/decimo-terceiro-segunda-parcela';
import { decimoTerceiroProporcional } from './src/lib/formulas/decimo-terceiro-proporcional';
import { salarioBrutoDoLiquido } from './src/lib/formulas/salario-bruto-do-liquido';
import { calcINSS, INSS_FAIXAS, INSS_TETO } from './src/lib/data/brasil-2026';

const j = (o: any) => {
  const { _insight, _chart, ...rest } = o;
  return JSON.stringify(rest);
};

console.log('=== A) dependentes (bruto 6000, deps 0..5) ===');
for (let d = 0; d <= 5; d++) console.log(d, j(salarioLiquidoDependentes({ salarioBruto: 6000, dependentes: d })));
console.log('A caso1 (1621, 1 dep):', j(salarioLiquidoDependentes({ salarioBruto: 1621, dependentes: 1 })));
console.log('A caso1b (1621, 0 dep):', j(salarioLiquidoDependentes({ salarioBruto: 1621, dependentes: 0 })));
console.log('A caso2 (3500, 2 dep):', j(salarioLiquidoDependentes({ salarioBruto: 3500, dependentes: 2 })));
console.log('A caso3 (8000, 3 dep):', j(salarioLiquidoDependentes({ salarioBruto: 8000, dependentes: 3 })));
console.log('A caso3b (8000, 0 dep):', j(salarioLiquidoDependentes({ salarioBruto: 8000, dependentes: 0 })));
console.log('A extra (7000, 2 dep):', j(salarioLiquidoDependentes({ salarioBruto: 7000, dependentes: 2 })));

console.log('=== B) pensao ===');
console.log('B main (7000, 1500 fixo):', j(salarioLiquidoPensao({ salarioBruto: 7000, pensaoValor: 1500, pensaoTipo: 'fixo' })));
console.log('B sem pensao (7000, 0):', j(salarioLiquidoPensao({ salarioBruto: 7000, pensaoValor: 0, pensaoTipo: 'fixo' })));
console.log('B caso1 (5500, 20%):', j(salarioLiquidoPensao({ salarioBruto: 5500, pensaoValor: 20, pensaoTipo: 'percentual' })));
console.log('B caso2 (3500, 800 fixo):', j(salarioLiquidoPensao({ salarioBruto: 3500, pensaoValor: 800, pensaoTipo: 'fixo' })));
const inss6000 = calcINSS(6000);
const pensaoC3 = Math.round((6000 - inss6000) * 0.3 * 100) / 100;
console.log('B caso3 pensao 30% de (6000-INSS):', inss6000, pensaoC3, j(salarioLiquidoPensao({ salarioBruto: 6000, pensaoValor: pensaoC3, pensaoTipo: 'fixo' })));

console.log('=== C) 13o segunda parcela ===');
console.log('C main (4500,12,0dep,1a 2250):', j(decimoTerceiroSegundaParcela({ salarioBruto: 4500, mesesTrabalhados: 12, dependentes: 0, primeiraParcelaPaga: 2250 })));
console.log('C caso2 (2500,8,1dep,1a 833.33):', j(decimoTerceiroSegundaParcela({ salarioBruto: 2500, mesesTrabalhados: 8, dependentes: 1, primeiraParcelaPaga: 833.33 })));
console.log('C caso3 (8000,12,0dep,1a 4000):', j(decimoTerceiroSegundaParcela({ salarioBruto: 8000, mesesTrabalhados: 12, dependentes: 0, primeiraParcelaPaga: 4000 })));

console.log('=== D) 13o proporcional ===');
console.log('D main (4000,8,0):', j(decimoTerceiroProporcional({ salarioBruto: 4000, mesesTrabalhados: 8, dependentes: 0 })));
console.log('D caso2 (8000,12,0):', j(decimoTerceiroProporcional({ salarioBruto: 8000, mesesTrabalhados: 12, dependentes: 0 })));
console.log('D caso3 (2500,9,0):', j(decimoTerceiroProporcional({ salarioBruto: 2500, mesesTrabalhados: 9, dependentes: 0 })));

console.log('=== E) bruto a partir do liquido ===');
for (const L of [4000, 3000, 7000, 10000, 5000]) console.log('E liq', L, ':', j(salarioBrutoDoLiquido({ salarioLiquido: L })));

console.log('=== INSS breakdowns ===');
const bk = (bruto: number) => {
  let prev = 0; const parts: string[] = []; let tot = 0;
  for (const f of INSS_FAIXAS) {
    const top = Math.min(bruto, f.ate);
    if (top > prev) { const v = (top - prev) * f.aliquota; parts.push(`${(top - prev).toFixed(2)}x${f.aliquota} = ${v.toFixed(2)}`); tot += v; }
    prev = f.ate;
    if (bruto <= f.ate) break;
  }
  return parts.join(' | ') + ` => TOTAL ${tot.toFixed(2)} (calcINSS=${calcINSS(Math.min(bruto, INSS_TETO))})`;
};
for (const b of [7000, 6000, 4500, 9000]) console.log('INSS', b, '->', bk(b));
console.log('faixa maximos:', bk(INSS_TETO));
console.log('teto desconto:', calcINSS(99999));
