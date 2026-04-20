export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function combustibleGncInstalacionAmortizacionAuto(i: Inputs): Outputs {
  const ci=Number(i.costoInstalacion)||0; const km=Number(i.kmMensuales)||0; const c=Number(i.consumo100km)||0;
  const pn=Number(i.precioNafta)||0; const pg=Number(i.precioGnc)||0;
  const costoNaftaMes=km/100*c*pn;
  const consumoGncMes=km/100*c*0.75;
  const costoGncMes=consumoGncMes*pg;
  const ahorro=costoNaftaMes-costoGncMes;
  const meses=ahorro>0?ci/ahorro:0;
  return { ahorroMensual:`$${Math.round(ahorro).toLocaleString('es-AR')}`, mesesAmortizar:`${Math.ceil(meses)} meses`, conviene:meses<12?'Sí, menos de 1 año':meses<24?'Sí, moderado':'Evaluar: >2 años para recuperar' };
}
