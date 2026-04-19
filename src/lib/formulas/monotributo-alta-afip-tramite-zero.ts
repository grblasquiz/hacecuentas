export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoAltaAfipTramiteZero(i: Inputs): Outputs {
  const c=String(i.categoria||'A');
  const cuotas: Record<string,number> = { A:43000, B:51400, C:63400, D:80800 };
  return { costoAlta:'Gratuito', primeraPaga:'$'+(cuotas[c]||43000).toLocaleString('es-AR'), documentos:'DNI + Clave Fiscal nivel 3 + CUIT', resumen:`Alta monotributo ${c}: gratis + primera cuota $${(cuotas[c]||43000).toLocaleString('es-AR')}.` };
}
