export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function costoTokensApiOpenaiClaudeMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const ti=Number(i.in_tok)||0; const to=Number(i.out_tok)||0; const n=Number(i.calls)||0; const pI=Number(i.pIn)||3; const pO=Number(i.pOut)||15;
  const perCall=(ti*pI+to*pO)/1000/1000;
  const dia=perCall*n;
  const mes=dia*30;
  const costInDia=(ti*pI)/1000/1000*n;
  const costOutDia=(to*pO)/1000/1000*n;
  const outShare = dia>0 ? Math.round((costOutDia/dia)*100) : 0;
  const resumen = __lang === 'en'
    ? `${n} calls/day: $${dia.toFixed(2)}/day, $${mes.toFixed(0)}/month.`
    : `${n} llamadas/día: $${dia.toFixed(2)}/día, $${mes.toFixed(0)}/mes.`;
  const tone: 'good' | 'warn' | 'neutral' = mes >= 500 ? 'warn' : 'neutral';
  const _insight = __lang === 'en'
    ? {
        title: tone === 'warn' ? 'Heavy API bill' : 'Your API cost',
        text: `At **${n} calls/day** this runs **$${mes.toFixed(0)}/month** (**$${(dia*365).toFixed(0)}/year**). Output tokens drive **${outShare}%** of the cost — trimming verbose responses is where the savings are.`,
        tone,
        icon: '🤖',
      }
    : {
        title: tone === 'warn' ? 'Factura de API alta' : 'Tu costo de API',
        text: `Con **${n} llamadas/día** gastás **$${mes.toFixed(0)}/mes** (**$${(dia*365).toFixed(0)}/año**). Los tokens de salida explican el **${outShare}%** del costo — acortar respuestas largas es donde está el ahorro.`,
        tone,
        icon: '🤖',
      };
  const out: Outputs = { diario:`$${dia.toFixed(2)}`, mensual:`$${mes.toFixed(2)}`, anual:`$${(dia*365).toFixed(2)}`, resumen, _insight };
  if (costInDia > 0 && costOutDia > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: __lang === 'en' ? 'Input tokens' : 'Tokens de entrada', value: Number((costInDia*30).toFixed(2)) },
        { label: __lang === 'en' ? 'Output tokens' : 'Tokens de salida', value: Number((costOutDia*30).toFixed(2)) },
      ],
      prefix: '$',
      centerValue: `$${mes.toFixed(0)}`,
      centerLabel: __lang === 'en' ? 'Per month' : 'Por mes',
      ariaLabel: __lang === 'en'
        ? `Doughnut chart of monthly API cost split, total $${mes.toFixed(0)}`
        : `Gráfico de torta del costo mensual de API, total $${mes.toFixed(0)}`,
    };
  }
  return out;
}
