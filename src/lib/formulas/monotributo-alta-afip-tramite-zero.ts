import { cuota as cuotaMono, type Cat } from '../data/monotributo-2026';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoAltaAfipTramiteZero(i: Inputs): Outputs {
  const c=String(i.categoria||'A').toUpperCase() as Cat;
  const cuota = Math.round(cuotaMono(c, 'servicios')); // escala ARCA 2026 (fuente única)
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
