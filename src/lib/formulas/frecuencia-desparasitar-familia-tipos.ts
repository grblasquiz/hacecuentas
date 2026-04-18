export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function frecuenciaDesparasitarFamiliaTipos(i: Inputs): Outputs {
  const z=String(i.zona||'urbano'); const e=Number(i.edad)||10;
  const f:Record<string,string>={urbano:'Anual',rural:'Cada 6 meses',tropical:'Cada 3-4 meses'};
  return { frecuencia:f[z]||'Anual', medicamento:'Albendazol/Mebendazol (ver médico)', resumen:`Zona ${z}: ${f[z]}. Consultar médico.` };
}
