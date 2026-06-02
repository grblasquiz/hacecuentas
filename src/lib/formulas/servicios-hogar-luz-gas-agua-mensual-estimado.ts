export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function serviciosHogarLuzGasAguaMensualEstimado(i: Inputs): Outputs {
  const k=Number(i.kwhMes)||0; const g=Number(i.m3GasMes)||0; const a=Number(i.m3AguaMes)||0;
  const tk=Number(i.tarifaKwh)||0; const tg=Number(i.tarifaGas)||0; const ta=Number(i.tarifaAgua)||0;
  const luz=k*tk*1.21; const gas=g*tg*1.21; const agua=a*ta*1.21;
  const tot=luz+gas+agua;
  const totFmt = `$${Math.round(tot).toLocaleString('es-AR')}`;
  const partes = [{ label: 'Luz', value: Math.round(luz) }, { label: 'Gas', value: Math.round(gas) }, { label: 'Agua', value: Math.round(agua) }];
  const mayor = partes.reduce((m, p) => p.value > m.value ? p : m, partes[0]);
  const pctMayor = tot > 0 ? Math.round((mayor.value / tot) * 100) : 0;
  const _insight = tot > 0 ? {
    title: 'Tu gasto mensual en servicios',
    text: `Entre luz, gas y agua pagás **${totFmt}** por mes (IVA 21% incluido). El servicio que más pesa es **${mayor.label}** con **${pctMayor}%** del total — ahí está la mayor oportunidad de ahorro.`,
    tone: 'neutral',
    icon: '🏠',
  } : undefined;
  const _chart = tot > 0 ? {
    type: 'doughnut',
    slices: partes,
    prefix: '$',
    centerValue: totFmt,
    centerLabel: 'Total/mes',
    ariaLabel: `Composición del gasto en servicios: luz ${partes[0].value}, gas ${partes[1].value}, agua ${partes[2].value}`,
  } : undefined;
  return { totalServicios:totFmt, luz:`$${Math.round(luz).toLocaleString('es-AR')}`, gas:`$${Math.round(gas).toLocaleString('es-AR')}`, agua:`$${Math.round(agua).toLocaleString('es-AR')}`, _insight, _chart };
}
