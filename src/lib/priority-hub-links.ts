/**
 * Hubs con demanda comprobada o poco descubrimiento orgánico.
 *
 * Se usan sólo para reforzar enlaces desde páginas semánticamente cercanas.
 * Mantener la lista corta: no es un bloque sitewide ni un sustituto de GSC.
 */
export const PRIORITY_HUB_LINKS = [
  { path: '/nutricion/calorias-diarias', categories: ['nutricion', 'salud'] },
  { path: '/nutricion/nutricion-deportiva', categories: ['nutricion', 'salud', 'deportes'] },
  { path: '/mascotas/edad-del-gato', categories: ['mascotas'] },
  { path: '/conversores/temperatura', categories: ['conversores', 'cocina', 'ciencia'] },
  { path: '/embarazo/dias-fertiles', categories: ['embarazo', 'familia', 'salud'] },
  { path: '/matematica/potencias-y-raices', categories: ['matematica', 'educacion'] },
  { path: '/salud/grasa-corporal', categories: ['salud', 'nutricion'] },
  { path: '/tecnologia/resistencias', categories: ['tecnologia', 'ciencia'] },
  { path: '/bebes/crecimiento', categories: ['bebes', 'embarazo', 'familia'] },
  { path: '/familia/asignaciones-anses', categories: ['familia', 'trabajo'] },
  { path: '/familia/costo-de-un-bebe', categories: ['familia', 'bebes', 'embarazo'] },
  { path: '/py/finanzas/guaranies', categories: ['finanzas'], locale: 'es-PY', localeWide: true },
  { path: '/ocio/numeros-de-videojuegos', categories: ['ocio', 'tecnologia'] },
  { path: '/jardin/cuantas-plantas', categories: ['jardin', 'construccion'] },

  // Índices país/categoría que tenían sólo 3–4 enlaces entrantes al 01/08.
  { path: '/py/automotor', categories: ['automotor'], locale: 'es-PY', localeWide: true },
  { path: '/pe/auto', categories: ['auto'], locale: 'es-PE', localeWide: true },
  { path: '/ec/auto', categories: ['auto'], locale: 'es-EC', localeWide: true },
  { path: '/pe/tramites', categories: ['tramites'], locale: 'es-PE', localeWide: true },
  { path: '/mx/tramites', categories: ['tramites'], locale: 'es-MX', localeWide: true },
  { path: '/pt/veiculos', categories: ['veiculos'], locale: 'pt-BR', localeWide: true },
  { path: '/pt-pt/familia', categories: ['familia'], locale: 'pt-PT', localeWide: true },
  { path: '/ve/vida', categories: ['vida'], locale: 'es-VE', localeWide: true },
] as const;
