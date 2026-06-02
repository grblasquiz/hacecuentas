export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoGastarRegaloNoviaAniversario(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;

  const monto=`$${r.toLocaleString('es-AR',{maximumFractionDigits:2})}`;
  let _insight;
  if (r<=0) {
    _insight = { title:'Faltan datos', text:'Cargá los valores para estimar **cuánto gastar** en el regalo de aniversario.', tone:'neutral', icon:'🎁' };
  } else {
    _insight = { title:'Presupuesto sugerido', text:`Como referencia, un regalo de aniversario rondaría **${monto}**. Tomalo como orientación: lo que importa es que entre en tu presupuesto y tenga un detalle personal, no el número exacto.`, tone:'neutral', icon:'💝' };
  }

  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
