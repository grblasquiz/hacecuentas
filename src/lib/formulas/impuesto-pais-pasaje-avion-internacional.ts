export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function impuestoPaisPasajeAvionInternacional(i: Inputs): Outputs {
  const p=Number(i.pasajeUsd)||0;
  const paisRaw=i.impuestoPais; const perRaw=i.percepcion;
  const pais=(paisRaw===''||paisRaw==null||isNaN(Number(paisRaw)))?0:Number(paisRaw); // PAÍS derogado dic-2024: default 0
  const per=(perRaw===''||perRaw==null||isNaN(Number(perRaw)))?30:Number(perRaw);     // Pasaje pagado en pesos: 30% percepción vigente
  const impPais=p*pais/100; const impPer=p*per/100; const total=impPais+impPer; const fin=p+total;
  const recargoPct=pais+per;
  const _insight={
    title:'Cuánto pagás de más sobre el pasaje',
    text:`Sobre un pasaje de **USD ${p.toFixed(2)}** se suman **USD ${total.toFixed(2)}** de impuestos (**${recargoPct}%**), llevando el costo final a **USD ${fin.toFixed(2)}**. De ese total, **USD ${impPer.toFixed(2)}** corresponden a la percepción de Ganancias/Bienes Personales, que podés recuperar en tu DDJJ.`,
    tone:'warn',
    icon:'✈️'
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Pasaje', value:Math.round(p*100)/100},
      {label:`Impuesto PAÍS (${pais}%)`, value:Math.round(impPais*100)/100},
      {label:`Percepción (${per}%)`, value:Math.round(impPer*100)/100}
    ],
    prefix:'USD ',
    centerValue:`USD ${fin.toFixed(2)}`,
    centerLabel:'Costo final',
    ariaLabel:`Composición del costo final del pasaje: tarifa USD ${p.toFixed(2)}, impuesto PAÍS USD ${impPais.toFixed(2)} y percepción USD ${impPer.toFixed(2)}`
  };
  return { impuestoTotal:`USD ${total.toFixed(2)} (${(pais+per)}%)`, costoFinal:`USD ${fin.toFixed(2)}`, recuperoPosible:`USD ${impPer.toFixed(2)} (percepción recuperable en DDJJ)`, _insight, _chart };
}
