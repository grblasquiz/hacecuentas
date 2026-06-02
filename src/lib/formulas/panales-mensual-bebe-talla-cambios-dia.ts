export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function panalesMensualBebeTallaCambiosDia(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let d,t;
  if(m<1){d=11;t='NB o Talla 0'}
  else if(m<3){d=9;t='Talla 1-2'}
  else if(m<6){d=7;t='Talla 3'}
  else if(m<12){d=6;t='Talla 4'}
  else if(m<24){d=5;t='Talla 5'}
  else {d=4;t='Talla 6 o pants'}
  const porMes = d*30;
  return {
    porDia:`${d} pañales`,
    porMes:`~${porMes} pañales`,
    talla:t,
    _insight: {
      title: 'Cuántos pañales comprar',
      text: m<3
        ? `A esta edad el recambio es alto: **${d} pañales por día** (~**${porMes} al mes**). Conviene stockear en **${t}** sin pasarte, porque crecen rápido y cambian de talla en semanas.`
        : `Calculá **${d} pañales por día**, unos **${porMes} al mes** en **${t}**. Comprar de a paquetes grandes baja el costo por unidad sin riesgo de que le queden chicos pronto.`,
      tone: 'neutral',
      icon: '👶',
    },
  };
}
