export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function impuestoPaisPercepcionDolarTarjeta(i: Inputs): Outputs {
  const u=Number(i.consumoUsd)||0; const pais=Number(i.impuestoPais)||0; const per=Number(i.percepcionGanancias)||0; const cot=Number(i.cotizacionOficial)||0;
  const subtotal=u*cot; const total=subtotal*(1+pais/100+per/100);
  const def_=total/u; const brecha=cot>0?((def_/cot-1)*100):0;
  const impPais=subtotal*pais/100; const impPer=subtotal*per/100; const impuestos=impPais+impPer;
  const _insight={
    title:'Tu dólar tarjeta vs el oficial',
    text:`Consumir **USD ${u.toLocaleString('es-AR')}** te cuesta **$${Math.round(total).toLocaleString('es-AR')}**: cada dólar te sale **$${Math.round(def_).toLocaleString('es-AR')}**, un **+${brecha.toFixed(0)}%** sobre el oficial de $${Math.round(cot).toLocaleString('es-AR')}. De eso, **$${Math.round(impuestos).toLocaleString('es-AR')}** son impuestos (PAÍS + percepción de Ganancias).`,
    tone:'warn',
    icon:'💳'
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Dólar oficial', value:Math.round(subtotal)},
      {label:`Impuesto PAÍS (${pais}%)`, value:Math.round(impPais)},
      {label:`Percepción Ganancias (${per}%)`, value:Math.round(impPer)}
    ],
    prefix:'$',
    centerValue:`$${Math.round(total).toLocaleString('es-AR')}`,
    centerLabel:'Costo total',
    ariaLabel:`Composición del costo en pesos: dólar oficial $${Math.round(subtotal).toLocaleString('es-AR')}, impuesto PAÍS $${Math.round(impPais).toLocaleString('es-AR')} y percepción de Ganancias $${Math.round(impPer).toLocaleString('es-AR')}`
  };
  return { costoTotalPesos:`$${Math.round(total).toLocaleString('es-AR')}`, dolarEfectivo:`$${Math.round(def_).toLocaleString('es-AR')}`, brecha:`+${brecha.toFixed(0)}% sobre oficial`, _insight, _chart };
}
