export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function becasJuanmarinPrimariasSecundarias(i: Inputs): Outputs {
  const c=String(i.ciclo||'sec');
  const m: Record<string,number> = { prim:20000, sec:30000 };
  const v=m[c]||20000;
  const cicloTxt = c === 'prim' ? 'primaria' : 'secundaria';
  return {
    monto:'$'+v.toLocaleString('es-AR'),
    total10m:'$'+(v*10).toLocaleString('es-AR'),
    resumen:`Beca ${c}: $${v.toLocaleString('es-AR')}/mes × 10 = $${(v*10).toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Cuánto suma en el año',
      text: `La beca Juana Marín para **${cicloTxt}** paga **$${v.toLocaleString('es-AR')}/mes** durante 10 meses (marzo a diciembre), lo que acumula **$${(v*10).toLocaleString('es-AR')}** en el ciclo lectivo.`,
      tone: 'good',
      icon: '🎒',
    },
  };
}
