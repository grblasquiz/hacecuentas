export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoAltaAfipTramiteZero(i: Inputs): Outputs {
  const c=String(i.categoria||'A');
  const cuotas: Record<string,number> = { A:43000, B:51400, C:63400, D:80800 };
  const cuota = cuotas[c]||43000;
  return {
    costoAlta:'Gratuito',
    primeraPaga:'$'+cuota.toLocaleString('es-AR'),
    documentos:'DNI + Clave Fiscal nivel 3 + CUIT',
    resumen:`Alta monotributo ${c}: gratis + primera cuota $${cuota.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'El alta no cuesta nada',
      text: `Darte de alta en el monotributo categoría **${c}** es **gratis**: lo único que pagás es la primera cuota mensual de **$${cuota.toLocaleString('es-AR')}**. Tené listos DNI, Clave Fiscal nivel 3 y CUIT antes de empezar el trámite online.`,
      tone: 'good',
      icon: '🧾',
    },
  };
}
