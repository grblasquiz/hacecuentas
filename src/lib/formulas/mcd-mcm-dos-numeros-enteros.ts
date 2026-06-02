export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function mcdMcmDosNumerosEnteros(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      error: 'Números deben ser enteros no nulos.',
      coTitle: 'Son coprimos',
      coText: (A: number, B: number, m: number) => `El MCD de **${A}** y **${B}** es **1**: no comparten ningún factor primo, así que su MCM es directamente el producto, **${m.toLocaleString()}**.`,
      shTitle: 'Comparten factores',
      shText: (A: number, B: number, d: number, m: number) => `**${A}** y **${B}** comparten un factor común de **${d}**, por eso su MCM (**${m.toLocaleString()}**) es menor que el producto ${A}×${B}. Se cumple que MCD × MCM = ${A} × ${B}.`,
    },
    pt: {
      error: 'Os números devem ser inteiros não nulos.',
      coTitle: 'São coprimos',
      coText: (A: number, B: number, m: number) => `O MDC de **${A}** e **${B}** é **1**: não compartilham nenhum fator primo, então o MMC é diretamente o produto, **${m.toLocaleString()}**.`,
      shTitle: 'Compartilham fatores',
      shText: (A: number, B: number, d: number, m: number) => `**${A}** e **${B}** compartilham um fator comum de **${d}**, por isso o MMC (**${m.toLocaleString()}**) é menor que o produto ${A}×${B}. Vale que MDC × MMC = ${A} × ${B}.`,
    },
  } as const)[__lang];
  let a=Math.abs(Math.floor(Number(i.a)||0)); let b=Math.abs(Math.floor(Number(i.b)||0));
  if (a===0||b===0) return { mcd:'—', mcm:'—', resumen: T.error };
  const A=a, B=b; while (b) { [a,b]=[b,a%b]; }
  const mcm=(A*B)/a;
  const resumen = __lang === 'pt'
    ? `MDC(${A},${B})=${a}, MMC=${mcm}.`
    : `MCD(${A},${B})=${a}, MCM=${mcm}.`;
  const insight = a === 1
    ? { title: T.coTitle, text: T.coText(A, B, mcm), tone: 'neutral', icon: '🔢' }
    : { title: T.shTitle, text: T.shText(A, B, a, mcm), tone: 'neutral', icon: '🔢' };
  return { mcd:a.toString(), mcm:mcm.toLocaleString(), resumen, _insight: insight };
}
