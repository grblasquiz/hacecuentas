// Vacaciones de invierno 2026 — receso escolar por jurisdicción (Argentina).
// Fuente primaria: Calendario Escolar 2026, Ministerio de Capital Humano (Anexo Res. N° 508),
// que consolida las 24 jurisdicciones. Las top reforzadas contra el portal oficial de cada
// provincia (ABC PBA, DGE Mendoza, Gobierno de Córdoba, Educación Tucumán) — todas coinciden.
// Verificado 2026-06-29. Todas las fechas son lunes (inicio) a viernes (fin), receso de 2 semanas.

export interface Receso {
  /** Nombre de la jurisdicción */
  prov: string;
  /** Fecha de inicio del receso (ISO, hora local AR) */
  inicio: string;
  /** Fecha de fin del receso (ISO) */
  fin: string;
  /** Fuente: 'provincial' = portal oficial de la provincia; 'nacional' = Calendario nacional Res. 508 */
  fuente: 'provincial' | 'nacional';
  /** URL de la fuente más fuerte para esta jurisdicción */
  url: string;
}

const NACIONAL = 'https://www.argentina.gob.ar/capital-humano/educacion/calendario-escolar-2026';

export const RECESOS_INVIERNO_2026: Receso[] = [
  { prov: 'Ciudad de Buenos Aires', inicio: '2026-07-20', fin: '2026-07-31', fuente: 'nacional', url: NACIONAL },
  { prov: 'Buenos Aires', inicio: '2026-07-20', fin: '2026-07-31', fuente: 'provincial', url: 'https://abc.gob.ar/noticias/la-provincia-oficializo-el-calendario-escolar-2026' },
  { prov: 'Catamarca', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Chaco', inicio: '2026-07-20', fin: '2026-07-31', fuente: 'nacional', url: NACIONAL },
  { prov: 'Chubut', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Córdoba', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'provincial', url: 'https://prensa.cba.gov.ar/educacion-3/ciclo-lectivo-2026-en-cordoba-las-clases-comenzaran-el-2-de-marzo-y-se-garantizan-los-190-dias-efectivos/' },
  { prov: 'Corrientes', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Entre Ríos', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'nacional', url: NACIONAL },
  { prov: 'Formosa', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Jujuy', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'La Pampa', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'La Rioja', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Mendoza', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'provincial', url: 'https://boe.mendoza.gov.ar/publico/verpdf/a5eb431d5c6c60d3914f61707f10d4ab8f411e3892/anexo' },
  { prov: 'Misiones', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Neuquén', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Río Negro', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Salta', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'San Juan', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'nacional', url: NACIONAL },
  { prov: 'San Luis', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'nacional', url: NACIONAL },
  { prov: 'Santa Cruz', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Santa Fe', inicio: '2026-07-06', fin: '2026-07-17', fuente: 'provincial', url: NACIONAL },
  { prov: 'Santiago del Estero', inicio: '2026-07-20', fin: '2026-07-31', fuente: 'nacional', url: NACIONAL },
  { prov: 'Tierra del Fuego', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'nacional', url: NACIONAL },
  { prov: 'Tucumán', inicio: '2026-07-13', fin: '2026-07-24', fuente: 'provincial', url: 'https://www.educaciontuc.gov.ar/2026/01/22/conoce-el-calendario-escolar-2026-de-tucuman/' },
];

/** Fecha de última verificación de los datos (para citación y lastmod). */
export const RECESOS_DATA_AS_OF = '2026-06-29';

/** Bloques de fechas (para resúmenes e intro). */
export const RECESOS_BLOQUES = [
  { label: '6 al 17 de julio', inicio: '2026-07-06', fin: '2026-07-17' },
  { label: '13 al 24 de julio', inicio: '2026-07-13', fin: '2026-07-24' },
  { label: '20 al 31 de julio', inicio: '2026-07-20', fin: '2026-07-31' },
];
