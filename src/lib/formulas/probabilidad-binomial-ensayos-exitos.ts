export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function probabilidadBinomialEnsayosExitos(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      outOfRange: 'Parámetros fuera de rango.',
      insTitle: 'Probabilidad puntual',
      insText: (k: number, prob: string, n: number, mu: string) =>
        `La probabilidad de obtener exactamente **${k} éxito(s)** en **${n} ensayo(s)** es del **${prob}%**. En promedio esperarías **${mu}** éxitos (la media de la distribución).`,
    },
    pt: {
      outOfRange: 'Parâmetros fora do intervalo válido.',
      insTitle: 'Probabilidade pontual',
      insText: (k: number, prob: string, n: number, mu: string) =>
        `A probabilidade de obter exatamente **${k} sucesso(s)** em **${n} ensaio(s)** é de **${prob}%**. Em média você esperaria **${mu}** sucessos (a média da distribuição).`,
    },
  } as const)[__lang];
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0); const p=Number(i.p)||0;
  if (k<0||k>n||p<0||p>1) return { prob:'—', media:'—', var:'—', resumen: T.outOfRange };
  let c=1; for (let j=0;j<Math.min(k,n-k);j++) c=c*(n-j)/(j+1);
  const prob=c*Math.pow(p,k)*Math.pow(1-p,n-k);
  const _insight = {
    title: T.insTitle,
    text: T.insText(k, (prob*100).toFixed(2), n, (n*p).toFixed(2)),
    tone: 'neutral',
    icon: '🎲',
  };
  return { prob:prob.toFixed(5), media:(n*p).toFixed(2), var:(n*p*(1-p)).toFixed(2), resumen:`P(X=${k})=${prob.toFixed(4)}, μ=${(n*p).toFixed(1)}.`, _insight };
}
