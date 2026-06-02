export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadPanalesBebePorMesEdad(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let d=8; let t='3 (G)';
  if (m<1) { d=12; t='RN'; } else if (m<3) { d=10; t='1 (P)'; } else if (m<6) { d=9; t='2 (M)'; }
  else if (m<12) { d=7; t='3 (G)'; } else if (m<24) { d=6; t='4 (XG)'; } else { d=5; t='5 (XXG)'; }
  const mes = d*30;
  const etapa = m<1
    ? 'Recién nacido: el consumo está en su pico y baja mes a mes.'
    : m<6
    ? 'Etapa de mayor gasto; planificá comprar en oferta o por suscripción.'
    : m>=24
    ? 'Ya en control de esfínteres: el consumo cae fuerte de acá en más.'
    : 'El consumo va bajando a medida que crece.';
  const insight = { title: 'Consumo y compra', text: `A los **${m} meses** son **${d} pañales/día** (~**${mes}/mes**), talle **${t}**. ${etapa} No compres más de 1 mes anticipado del talle actual: puede quedar chico antes de usarlo.`, tone: 'neutral', icon: '🧷' };
  return { porDia:d+'/día', porMes:mes+'/mes', talle:t, resumen:`${m} meses: ${d}/día = ${mes}/mes, talle ${t}.`, _insight: insight };
}
