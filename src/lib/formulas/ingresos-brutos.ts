/** Ingresos Brutos — estimación por jurisdicción y actividad */
export interface Inputs { facturacion: number; provincia: string; actividad: string; }
export interface Outputs {
  alicuota: number;
  impuesto: number;
  total: number;
  jurisdiccion: string;
  actividadAplicada: string;
}

// Alícuotas típicas 2026 (valores aproximados — consultar código fiscal vigente)
// clave: `${provincia}:${actividad}`
const ALICUOTAS: Record<string, number> = {
  'caba:comercio': 3.0,
  'caba:servicios': 3.0,
  'caba:industria': 1.5,
  'caba:construccion': 2.5,
  'caba:profesional': 3.5,
  'buenos-aires:comercio': 3.5,
  'buenos-aires:servicios': 3.5,
  'buenos-aires:industria': 1.75,
  'buenos-aires:construccion': 4.0,
  'buenos-aires:profesional': 4.0,
  'cordoba:comercio': 4.0,
  'cordoba:servicios': 4.0,
  'cordoba:industria': 1.5,
  'cordoba:construccion': 3.5,
  'cordoba:profesional': 4.75,
  'santa-fe:comercio': 3.5,
  'santa-fe:servicios': 3.5,
  'santa-fe:industria': 1.0,
  'santa-fe:construccion': 3.5,
  'santa-fe:profesional': 4.5,
  'mendoza:comercio': 4.0,
  'mendoza:servicios': 4.0,
  'mendoza:industria': 1.5,
  'mendoza:construccion': 3.0,
  'mendoza:profesional': 4.5,
};

const PROV_LABEL: Record<string, string> = {
  caba: 'CABA',
  'buenos-aires': 'Buenos Aires',
  cordoba: 'Córdoba',
  'santa-fe': 'Santa Fe',
  mendoza: 'Mendoza',
};

const ACT_LABEL: Record<string, string> = {
  comercio: 'Comercio al por menor/mayor',
  servicios: 'Servicios',
  industria: 'Industria manufacturera',
  construccion: 'Construcción',
  profesional: 'Profesional / honorarios',
};

export function ingresosBrutos(i: Inputs): Outputs {
  const fact = Number(i.facturacion);
  const prov = String(i.provincia || 'caba');
  const act = String(i.actividad || 'servicios');
  if (!fact || fact <= 0) throw new Error('Ingresá la facturación');
  const key = `${prov}:${act}`;
  const alicuota = ALICUOTAS[key] ?? 3.5;
  const impuesto = fact * alicuota / 100;
  return {
    alicuota,
    impuesto: Math.round(impuesto),
    total: Math.round(fact + impuesto),
    jurisdiccion: PROV_LABEL[prov] ?? prov,
    actividadAplicada: ACT_LABEL[act] ?? act,
  };
}
