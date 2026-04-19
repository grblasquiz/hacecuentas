export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoAbogadoRelacionDependenciaEstudio(i: Inputs): Outputs {
  const emp=String(i.empleador||'estudio-m'); const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'estudio-s': [800000, 1500000],
    'estudio-m': [1200000, 2500000],
    'estudio-g': [2000000, 5000000],
    'empresa': [1500000, 3500000],
    'publico': [1400000, 2800000]
  };
  const [min,max]=bases[emp]||bases['estudio-m'];
  const factor=Math.min(1, 0.5+ant*0.06);
  const prom=min+(max-min)*factor;
  return { rango:`$${min.toLocaleString('es-AR')} - $${max.toLocaleString('es-AR')}`, promedio:'$'+prom.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${emp} con ${ant} años: ~$${prom.toFixed(0)}.` };
}
