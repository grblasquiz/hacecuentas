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

  // Receptores de los 301 más valiosos de la poda 7-27 (~5.900 clicks Bing/90d
  // absorbidos). Refuerzo de inlinks para acelerar el re-rank post-caída;
  // ver memoria diagnostico-caida-bing-post-poda-2026-08-07. localeWide sólo
  // en el receptor top de cada mercado.
  { path: '/impuestos/ganancias-cuarta-categoria', categories: ['impuestos', 'trabajo'] },
  { path: '/impuestos/retenciones', categories: ['impuestos'] },
  { path: '/trabajo/liquidacion-final', categories: ['trabajo'] },
  { path: '/trabajo/costo-de-un-empleado', categories: ['trabajo', 'impuestos'] },
  { path: '/construccion/costo-por-m2', categories: ['construccion', 'hogar'] },
  { path: '/construccion/ladrillos', categories: ['construccion', 'hogar'] },
  { path: '/auto/nafta-y-peajes', categories: ['auto', 'viajes'] },
  { path: '/ciencia/presion-y-gases', categories: ['ciencia', 'educacion'] },
  { path: '/conversores/numeros-a-letras', categories: ['conversores', 'matematica', 'finanzas'] },
  { path: '/viajes/millas', categories: ['viajes'] },
  { path: '/fechas/generaciones', categories: ['fechas', 'ocio'] },
  { path: '/co/trabajo/horas-extras-y-recargos', categories: ['trabajo'], locale: 'es-CO', localeWide: true },
  { path: '/co/trabajo/costo-de-contratar', categories: ['trabajo'], locale: 'es-CO' },
  { path: '/co/trabajo/liquidacion-laboral', categories: ['trabajo'], locale: 'es-CO' },
  { path: '/co/impuestos/renta-personas', categories: ['impuestos'], locale: 'es-CO' },
  { path: '/co/impuestos/impuestos-de-mi-negocio', categories: ['impuestos'], locale: 'es-CO' },
  { path: '/co/impuestos/sanciones-dian', categories: ['impuestos'], locale: 'es-CO' },
  { path: '/co/finanzas/comprar-vivienda', categories: ['finanzas'], locale: 'es-CO' },
  { path: '/co/vida/recibos-de-servicios', categories: ['vida'], locale: 'es-CO' },
  { path: '/mx/trabajo/sueldo-neto', categories: ['trabajo'], locale: 'es-MX', localeWide: true },
  { path: '/mx/trabajo/finiquito-y-liquidacion', categories: ['trabajo'], locale: 'es-MX' },
  { path: '/mx/finanzas/credito-de-vivienda', categories: ['finanzas'], locale: 'es-MX' },
  { path: '/pe/auto/costos-del-auto', categories: ['auto'], locale: 'es-PE', localeWide: true },
  { path: '/py/trabajo/sueldo-neto', categories: ['trabajo'], locale: 'es-PY', localeWide: true },
  { path: '/es/trabajo/mi-nomina', categories: ['trabajo'], locale: 'es-ES', localeWide: true },
] as const;
