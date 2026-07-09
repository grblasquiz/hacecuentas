// Feriados / festivos oficiales LATAM 2026 — fuente única verificada.
// Fechas y días de la semana verificados contra calendario real 2026 y fuentes
// oficiales por país (ver `fuentes` de cada país). Alimenta las landings
// /feriados-<pais>-2026 (mismo patrón que feriados-ar-2026.ts).
//
// Pascua 2026 = domingo 5 de abril (computus verificado) → Jueves Santo 2-abr,
// Viernes Santo 3-abr, Sábado Santo 4-abr.

export interface Feriado {
  fecha: string;   // 'YYYY-MM-DD' (fecha observada, ya con traslado aplicado)
  dia: string;     // día de la semana en español, p. ej. 'Lunes'
  nombre: string;
  tipo: string;    // etiqueta corta por país (Obligatorio / Fijo / Trasladable / Irrenunciable / Nacional…)
  nota?: string;   // detalle opcional (traslado, ley, etc.)
}

export interface FeriadosPais {
  pais: string;            // 'Colombia'
  gentilicio: string;      // 'los colombianos'
  audience: string;        // código de audiencia del Layout: CO / CL / MX / PE / EC
  slug: string;            // 'feriados-colombia-2026'
  totalLabel: string;      // '19 festivos nacionales'
  dataAsOf: string;        // 'YYYY-MM-DD'
  marco: string;           // marco legal en una línea
  notaTipo?: string;       // nota al pie sobre la columna "Tipo"
  fuentes: { nombre: string; url: string }[];
  feriados: Feriado[];
}

// ─────────────────────────────────────────── MÉXICO ───────────────────────────
// Días de descanso obligatorio · Ley Federal del Trabajo Art. 74.
export const FERIADOS_MX_2026: Feriado[] = [
  { fecha: '2026-01-01', dia: 'Jueves', nombre: 'Año Nuevo', tipo: 'Obligatorio' },
  { fecha: '2026-02-02', dia: 'Lunes', nombre: 'Día de la Constitución', tipo: 'Obligatorio', nota: 'Primer lunes de febrero (la conmemoración es el 5)' },
  { fecha: '2026-03-16', dia: 'Lunes', nombre: 'Natalicio de Benito Juárez', tipo: 'Obligatorio', nota: 'Tercer lunes de marzo (la conmemoración es el 21)' },
  { fecha: '2026-05-01', dia: 'Viernes', nombre: 'Día del Trabajo', tipo: 'Obligatorio' },
  { fecha: '2026-09-16', dia: 'Miércoles', nombre: 'Día de la Independencia', tipo: 'Obligatorio' },
  { fecha: '2026-11-16', dia: 'Lunes', nombre: 'Día de la Revolución Mexicana', tipo: 'Obligatorio', nota: 'Tercer lunes de noviembre (la conmemoración es el 20)' },
  { fecha: '2026-12-25', dia: 'Viernes', nombre: 'Navidad', tipo: 'Obligatorio' },
];

// ─────────────────────────────────────────── COLOMBIA ─────────────────────────
// 19 festivos en 2026 (Ley 2578/2026 sumó la Virgen de Chiquinquirá).
// Trasladable = Ley Emiliani (Ley 51/1983): se corre al lunes siguiente.
export const FERIADOS_CO_2026: Feriado[] = [
  { fecha: '2026-01-01', dia: 'Jueves', nombre: 'Año Nuevo', tipo: 'Fijo' },
  { fecha: '2026-01-12', dia: 'Lunes', nombre: 'Reyes Magos', tipo: 'Trasladable' },
  { fecha: '2026-03-23', dia: 'Lunes', nombre: 'San José', tipo: 'Trasladable' },
  { fecha: '2026-04-02', dia: 'Jueves', nombre: 'Jueves Santo', tipo: 'Religioso' },
  { fecha: '2026-04-03', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Religioso' },
  { fecha: '2026-05-01', dia: 'Viernes', nombre: 'Día del Trabajo', tipo: 'Fijo' },
  { fecha: '2026-05-18', dia: 'Lunes', nombre: 'Ascensión del Señor', tipo: 'Trasladable' },
  { fecha: '2026-06-08', dia: 'Lunes', nombre: 'Corpus Christi', tipo: 'Trasladable' },
  { fecha: '2026-06-15', dia: 'Lunes', nombre: 'Sagrado Corazón', tipo: 'Trasladable' },
  { fecha: '2026-06-29', dia: 'Lunes', nombre: 'San Pedro y San Pablo', tipo: 'Trasladable' },
  { fecha: '2026-07-13', dia: 'Lunes', nombre: 'Virgen de Chiquinquirá', tipo: 'Trasladable', nota: 'Nuevo en 2026 (Ley 2578/2026); se conmemora el 9 de julio' },
  { fecha: '2026-07-20', dia: 'Lunes', nombre: 'Día de la Independencia', tipo: 'Fijo' },
  { fecha: '2026-08-07', dia: 'Viernes', nombre: 'Batalla de Boyacá', tipo: 'Fijo' },
  { fecha: '2026-08-17', dia: 'Lunes', nombre: 'Asunción de la Virgen', tipo: 'Trasladable' },
  { fecha: '2026-10-12', dia: 'Lunes', nombre: 'Día de la Raza', tipo: 'Trasladable' },
  { fecha: '2026-11-02', dia: 'Lunes', nombre: 'Todos los Santos', tipo: 'Trasladable' },
  { fecha: '2026-11-16', dia: 'Lunes', nombre: 'Independencia de Cartagena', tipo: 'Trasladable' },
  { fecha: '2026-12-08', dia: 'Martes', nombre: 'Inmaculada Concepción', tipo: 'Fijo' },
  { fecha: '2026-12-25', dia: 'Viernes', nombre: 'Navidad', tipo: 'Fijo' },
];

// ─────────────────────────────────────────── CHILE ────────────────────────────
// 16 feriados nacionales. Irrenunciable = el comercio cierra obligatoriamente.
export const FERIADOS_CL_2026: Feriado[] = [
  { fecha: '2026-01-01', dia: 'Jueves', nombre: 'Año Nuevo', tipo: 'Irrenunciable' },
  { fecha: '2026-04-03', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Religioso' },
  { fecha: '2026-04-04', dia: 'Sábado', nombre: 'Sábado Santo', tipo: 'Religioso' },
  { fecha: '2026-05-01', dia: 'Viernes', nombre: 'Día Nacional del Trabajo', tipo: 'Irrenunciable' },
  { fecha: '2026-05-21', dia: 'Jueves', nombre: 'Día de las Glorias Navales', tipo: 'Civil' },
  { fecha: '2026-06-21', dia: 'Domingo', nombre: 'Día Nacional de los Pueblos Indígenas', tipo: 'Civil', nota: 'Sigue el solsticio de invierno' },
  { fecha: '2026-06-29', dia: 'Lunes', nombre: 'San Pedro y San Pablo', tipo: 'Religioso' },
  { fecha: '2026-07-16', dia: 'Jueves', nombre: 'Día de la Virgen del Carmen', tipo: 'Religioso' },
  { fecha: '2026-08-15', dia: 'Sábado', nombre: 'Asunción de la Virgen', tipo: 'Religioso' },
  { fecha: '2026-09-18', dia: 'Viernes', nombre: 'Independencia Nacional', tipo: 'Irrenunciable' },
  { fecha: '2026-09-19', dia: 'Sábado', nombre: 'Día de las Glorias del Ejército', tipo: 'Irrenunciable' },
  { fecha: '2026-10-12', dia: 'Lunes', nombre: 'Encuentro de Dos Mundos', tipo: 'Civil' },
  { fecha: '2026-10-31', dia: 'Sábado', nombre: 'Día de las Iglesias Evangélicas y Protestantes', tipo: 'Religioso' },
  { fecha: '2026-11-01', dia: 'Domingo', nombre: 'Día de Todos los Santos', tipo: 'Religioso' },
  { fecha: '2026-12-08', dia: 'Martes', nombre: 'Inmaculada Concepción', tipo: 'Religioso' },
  { fecha: '2026-12-25', dia: 'Viernes', nombre: 'Navidad', tipo: 'Irrenunciable' },
];

// ─────────────────────────────────────────── PERÚ ─────────────────────────────
// 16 feriados nacionales (descanso obligatorio remunerado).
export const FERIADOS_PE_2026: Feriado[] = [
  { fecha: '2026-01-01', dia: 'Jueves', nombre: 'Año Nuevo', tipo: 'Feriado nacional' },
  { fecha: '2026-04-02', dia: 'Jueves', nombre: 'Jueves Santo', tipo: 'Feriado nacional' },
  { fecha: '2026-04-03', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Feriado nacional' },
  { fecha: '2026-05-01', dia: 'Viernes', nombre: 'Día del Trabajo', tipo: 'Feriado nacional' },
  { fecha: '2026-06-07', dia: 'Domingo', nombre: 'Batalla de Arica y Día de la Bandera', tipo: 'Feriado nacional' },
  { fecha: '2026-06-29', dia: 'Lunes', nombre: 'San Pedro y San Pablo', tipo: 'Feriado nacional' },
  { fecha: '2026-07-23', dia: 'Jueves', nombre: 'Día de la Fuerza Aérea del Perú', tipo: 'Feriado nacional', nota: 'Nuevo (Ley 31822)' },
  { fecha: '2026-07-28', dia: 'Martes', nombre: 'Fiestas Patrias', tipo: 'Feriado nacional' },
  { fecha: '2026-07-29', dia: 'Miércoles', nombre: 'Fiestas Patrias', tipo: 'Feriado nacional' },
  { fecha: '2026-08-06', dia: 'Jueves', nombre: 'Batalla de Junín', tipo: 'Feriado nacional' },
  { fecha: '2026-08-30', dia: 'Domingo', nombre: 'Santa Rosa de Lima', tipo: 'Feriado nacional' },
  { fecha: '2026-10-08', dia: 'Jueves', nombre: 'Combate de Angamos', tipo: 'Feriado nacional' },
  { fecha: '2026-11-01', dia: 'Domingo', nombre: 'Día de Todos los Santos', tipo: 'Feriado nacional' },
  { fecha: '2026-12-08', dia: 'Martes', nombre: 'Inmaculada Concepción', tipo: 'Feriado nacional' },
  { fecha: '2026-12-09', dia: 'Miércoles', nombre: 'Batalla de Ayacucho', tipo: 'Feriado nacional' },
  { fecha: '2026-12-25', dia: 'Viernes', nombre: 'Navidad', tipo: 'Feriado nacional' },
];

// ─────────────────────────────────────────── ECUADOR ──────────────────────────
// 11 feriados nacionales + día adicional 2-ene (disposición del Ejecutivo).
// Fechas observadas ya con traslado aplicado (Ley de feriados).
export const FERIADOS_EC_2026: Feriado[] = [
  { fecha: '2026-01-01', dia: 'Jueves', nombre: 'Año Nuevo', tipo: 'Nacional' },
  { fecha: '2026-01-02', dia: 'Viernes', nombre: 'Día adicional de Año Nuevo', tipo: 'Adicional', nota: 'Disposición del Ejecutivo (puente)' },
  { fecha: '2026-02-16', dia: 'Lunes', nombre: 'Carnaval', tipo: 'Nacional' },
  { fecha: '2026-02-17', dia: 'Martes', nombre: 'Carnaval', tipo: 'Nacional' },
  { fecha: '2026-04-03', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Nacional' },
  { fecha: '2026-05-01', dia: 'Viernes', nombre: 'Día del Trabajo', tipo: 'Nacional' },
  { fecha: '2026-05-25', dia: 'Lunes', nombre: 'Batalla de Pichincha', tipo: 'Nacional', nota: 'Trasladado del domingo 24 de mayo' },
  { fecha: '2026-08-10', dia: 'Lunes', nombre: 'Primer Grito de Independencia', tipo: 'Nacional' },
  { fecha: '2026-10-09', dia: 'Viernes', nombre: 'Independencia de Guayaquil', tipo: 'Nacional' },
  { fecha: '2026-11-02', dia: 'Lunes', nombre: 'Día de los Difuntos', tipo: 'Nacional' },
  { fecha: '2026-11-03', dia: 'Martes', nombre: 'Independencia de Cuenca', tipo: 'Nacional' },
  { fecha: '2026-12-25', dia: 'Viernes', nombre: 'Navidad', tipo: 'Nacional' },
];

export const FERIADOS_LATAM_2026: Record<string, FeriadosPais> = {
  mexico: {
    pais: 'México', gentilicio: 'los mexicanos', audience: 'MX', slug: 'feriados-mexico-2026',
    totalLabel: '7 días de descanso obligatorio', dataAsOf: '2026-07-09',
    marco: 'Ley Federal del Trabajo (Art. 74)',
    notaTipo: 'Todos son días de descanso obligatorio: si trabajás, te corresponde el pago triple (salario del día + doble) conforme al Art. 75 de la LFT.',
    fuentes: [
      { nombre: 'Ley Federal del Trabajo (Art. 74) — Cámara de Diputados', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' },
      { nombre: 'Gobierno de México (gob.mx)', url: 'https://www.gob.mx/' },
    ],
    feriados: FERIADOS_MX_2026,
  },
  colombia: {
    pais: 'Colombia', gentilicio: 'los colombianos', audience: 'CO', slug: 'feriados-colombia-2026',
    totalLabel: '19 festivos nacionales', dataAsOf: '2026-07-09',
    marco: 'Ley 51 de 1983 (Ley Emiliani) y Ley 2578 de 2026',
    notaTipo: 'Trasladable = festivo que por la Ley Emiliani se corre al lunes siguiente. Fijo = se celebra en su fecha exacta.',
    fuentes: [
      { nombre: 'Ministerio del Interior — Ley 2578/2026 (nuevo festivo)', url: 'https://www.mininterior.gov.co/' },
      { nombre: 'Office Holidays — Colombia 2026', url: 'https://www.officeholidays.com/countries/colombia/2026' },
    ],
    feriados: FERIADOS_CO_2026,
  },
  chile: {
    pais: 'Chile', gentilicio: 'los chilenos', audience: 'CL', slug: 'feriados-chile-2026',
    totalLabel: '16 feriados nacionales', dataAsOf: '2026-07-09',
    marco: 'feriados legales fijados por ley (Dirección del Trabajo)',
    notaTipo: 'Irrenunciable = el comercio cierra obligatoriamente y no se puede pactar trabajo (Año Nuevo, 1 de mayo, 18 y 19 de septiembre, y Navidad).',
    fuentes: [
      { nombre: 'Feriados.cl — calendario oficial 2026', url: 'https://www.feriados.cl/' },
      { nombre: 'Dirección del Trabajo (dt.gob.cl) — Ley 19.668', url: 'https://www.dt.gob.cl/portal/1628/w3-article-60252.html' },
    ],
    feriados: FERIADOS_CL_2026,
  },
  peru: {
    pais: 'Perú', gentilicio: 'los peruanos', audience: 'PE', slug: 'feriados-peru-2026',
    totalLabel: '16 feriados nacionales', dataAsOf: '2026-07-09',
    marco: 'Decreto Legislativo 713 y leyes complementarias',
    notaTipo: 'Todos son feriados nacionales: descanso obligatorio remunerado en el sector público y privado. Si trabajás, corresponde el pago con sobretasa.',
    fuentes: [
      { nombre: 'gob.pe — Feriados (Plataforma del Estado Peruano)', url: 'https://www.gob.pe/feriados' },
      { nombre: 'El Peruano — Ley 31788 (feriado 7 de junio)', url: 'https://www.elperuano.pe/' },
    ],
    feriados: FERIADOS_PE_2026,
  },
  ecuador: {
    pais: 'Ecuador', gentilicio: 'los ecuatorianos', audience: 'EC', slug: 'feriados-ecuador-2026',
    totalLabel: '11 feriados nacionales (+ día adicional)', dataAsOf: '2026-07-09',
    marco: 'Código del Trabajo y Ley de feriados',
    notaTipo: 'Las fechas que ves son las observadas (con traslado ya aplicado). El único traslado real de 2026 es la Batalla de Pichincha, que cae domingo 24 y se descansa el lunes 25.',
    fuentes: [
      { nombre: 'El Universo — calendario oficial de feriados 2026', url: 'https://www.eluniverso.com/noticias/ecuador/este-es-calendario-oficial-de-feriados-para-ecuador-en-el-2026-nota/' },
      { nombre: 'Ministerio del Trabajo (trabajo.gob.ec)', url: 'https://www.trabajo.gob.ec/' },
    ],
    feriados: FERIADOS_EC_2026,
  },
};
