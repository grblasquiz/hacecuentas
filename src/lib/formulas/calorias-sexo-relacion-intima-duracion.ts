export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function caloriasSexoRelacionIntimaDuracion(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const rFmt = r.toFixed(2);
  const _insight = {
    title: 'Tu resultado',
    text: `Con ${v1} y ${v2} el cálculo da **${rFmt}**. Cambiá la duración para estimar otra sesión.`,
    tone: 'neutral',
    icon: '🔥',
  };
  return { resultado:rFmt, resumen:`Cálculo con ${v1} y ${v2}: ${rFmt}.`, _insight };
}
