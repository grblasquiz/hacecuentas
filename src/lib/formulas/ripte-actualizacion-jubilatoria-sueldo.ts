export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ripteActualizacionJubilatoriaSueldo(i: Inputs): Outputs {
  const s=Number(i.sueldoViejo)||0; const rv=Number(i.ripteViejo)||1; const ra=Number(i.ripteActual)||0;
  const factor=ra/rv; const act=s*factor;
  const fmt=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const ajuste=act-s;
  const pctAumento=s>0?((factor-1)*100):0;
  const _insight={
    title:'Tu sueldo a valor actual',
    text:`Por el RIPTE, ese sueldo de **${fmt(s)}** equivale hoy a **${fmt(act)}** (multiplicador **${factor.toFixed(2)}x**, +**${pctAumento.toFixed(0)}%**). La actualización suma **${fmt(ajuste)}** que es lo que perdió por la inflación salarial.`,
    tone:'neutral',
    icon:'👵',
  };
  const _chart=(s>0 && ajuste>0)?{
    type:'doughnut',
    slices:[
      {label:'Sueldo histórico',value:Math.round(s)},
      {label:'Ajuste por RIPTE',value:Math.round(ajuste)},
    ],
    prefix:'$',
    centerValue:fmt(act),
    centerLabel:'A valor hoy',
    ariaLabel:`El sueldo actualizado de ${fmt(act)} se compone de ${fmt(s)} histórico más ${fmt(ajuste)} de ajuste por RIPTE`,
  }:undefined;
  return { sueldoActualizado:fmt(act), factorMultiplicador:`${factor.toFixed(2)}x`, interpretacion:`Multiplicá el sueldo histórico por ${factor.toFixed(2)} para tenerlo a valor actual.`, _insight, _chart };
}
