export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fideicomisoConstruccionAporteCuotas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v=Number(i.valorDepto)||0; const n=Number(i.cuotasTotales)||0; const a=(Number(i.avanceObra)||0)/100;
  if (!(n > 0)) throw new Error(__lang === 'en' ? 'Enter the total number of installments (greater than 0).' : __lang === 'pt' ? 'Informe o número total de parcelas (maior que 0).' : 'Ingresá la cantidad total de cuotas (mayor que 0).');
  const cuota=v/n;
  const debido=cuota*(n*a);
  const fmt=(x:number)=>'$'+x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const cuotasPagadas=Math.round(n*a);
  const resumen = __lang === 'en'
    ? `$${v.toLocaleString('es-AR')} / ${n} installments: $${cuota.toFixed(0)}/mo. At ${(a*100).toFixed(0)}% completion you should have paid $${debido.toFixed(0)}.`
    : __lang === 'pt'
    ? `$${v.toLocaleString('es-AR')} / ${n} parcelas: $${cuota.toFixed(0)}/mês. Com ${(a*100).toFixed(0)}% de obra concluída, você deveria ter pago $${debido.toFixed(0)}.`
    : `$${v.toLocaleString('es-AR')} / ${n} cuotas: $${cuota.toFixed(0)}/mes. A ${(a*100).toFixed(0)}% obra debería haber pagado $${debido.toFixed(0)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Aligning payments with progress' : __lang === 'pt' ? 'Pagamentos x andamento da obra' : 'Aportes al ritmo de la obra',
    text: __lang === 'en'
      ? `Each installment is **${fmt(cuota)}**. With the work at **${(a*100).toFixed(0)}%** (~${cuotasPagadas} of ${n} installments), your accumulated contribution should be around **${fmt(debido)}**. If you've paid much less you may face a catch-up; much more and you're funding ahead of progress.`
      : __lang === 'pt'
      ? `Cada parcela é de **${fmt(cuota)}**. Com a obra em **${(a*100).toFixed(0)}%** (~${cuotasPagadas} de ${n} parcelas), seu aporte acumulado deveria girar em torno de **${fmt(debido)}**. Se pagou bem menos, pode haver acerto; bem mais, e está adiantando o caixa da obra.`
      : `Cada cuota es de **${fmt(cuota)}**. Con la obra al **${(a*100).toFixed(0)}%** (~${cuotasPagadas} de ${n} cuotas), tu aporte acumulado debería rondar **${fmt(debido)}**. Si pagaste bastante menos puede haber un ajuste; bastante más y estás financiando la obra por adelantado.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  return { cuota:fmt(cuota), debido:fmt(debido), resumen, _insight };
}
