export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function arbaSellosInmobiliariosPbaCompraventa(i: Inputs): Outputs {
  const v=Number(i.valorPropiedad)||0; const u=String(i.unicaVivienda||'no');
  const aliq=u==='si'&&v<50000000?0.018:0.036;
  const total=v*aliq; const porParte=total/2;
  const reducida = aliq===0.018;
  const _insight = {
    title: 'Impuesto de sellos (PBA)',
    text: `Sobre una operación de **$${Math.round(v).toLocaleString('es-AR')}** el sello es del **${(aliq*100).toFixed(1)}%** = **$${Math.round(total).toLocaleString('es-AR')}**, y cada parte aporta $${Math.round(porParte).toLocaleString('es-AR')}.${reducida?' Estás con la alícuota reducida por única vivienda.':' Si fuera única vivienda y menor a $50.000.000 pagarías la mitad de alícuota (1,8%).'}`,
    tone: 'warn',
    icon: '🏛️',
  };
  return { sellos:`$${Math.round(total).toLocaleString('es-AR')}`, porParte:`$${Math.round(porParte).toLocaleString('es-AR')}`, interpretacion:`Sellos ${(aliq*100).toFixed(1)}% = $${Math.round(total).toLocaleString('es-AR')}. Paga mitad cada parte.`, _insight };
}
