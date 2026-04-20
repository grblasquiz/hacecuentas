export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function crecimientoPercentilEdadAlturaPesoOms(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0; const p=Number(i.peso)||0; const t=Number(i.talla)||0; const s=String(i.sexo||'varon');
  // Approx P50 varón: 12 kg a 24m, 87 cm. Mujer ligeramente menor.
  const p50Peso=s==='varon'?(m<12?8+m*0.5:12+((m-24)/12*2)):(m<12?7.5+m*0.5:11.5+((m-24)/12*1.8));
  const p50Talla=s==='varon'?(m<12?60+m*2:87+((m-24)/12*6)):(m<12?59+m*1.9:86+((m-24)/12*5.8));
  const pctPeso=p>p50Peso*1.1?'P85-97':p<p50Peso*0.9?'P3-15':'P25-75 (normal)';
  const pctTalla=t>p50Talla*1.05?'P85-97':t<p50Talla*0.95?'P3-15':'P25-75 (normal)';
  return { percentilPeso:pctPeso, percentilTalla:pctTalla, interpretacion:'Aproximación. Control pediátrico oficial siempre.' };
}
