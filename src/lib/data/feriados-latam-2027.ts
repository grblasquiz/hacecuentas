// Feriados / festivos oficiales LATAM 2027 — fuente única verificada.
// Mismo patrón que feriados-latam-2026.ts. Fechas y días de la semana verificados
// por cómputo de calendario (1-ene-2027 = viernes) y cruzados con fuentes oficiales
// por país (ver `fuentes` de cada país).
//
// Pascua 2027 = domingo 28 de marzo (computus verificado) → Jueves Santo 25-mar,
// Viernes Santo 26-mar, Sábado Santo 27-mar. Carnaval AR/EC: lun 8-feb y mar 9-feb.
//
// ⚠️ AR: los traslados (Güemes, San Martín, Diversidad Cultural) surgen de aplicar
// mecánicamente el art. 6 de la Ley 27.399; el decreto anual del PEN con los
// feriados turísticos 2027 aún no salió (se espera hacia fines de 2026).
// Re-verificar cuando se publique.

import type { Feriado, FeriadosPais } from './feriados-latam-2026';

// ─────────────────────────────────────────── ARGENTINA ────────────────────────
// Ley 27.399: inamovibles + trasladables (mar/mié → lunes anterior; jue/vie →
// lunes siguiente). Soberanía Nacional 20-nov cae sábado → no se traslada.
export const FERIADOS_AR_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Inamovible' },
  { fecha: '2027-02-08', dia: 'Lunes', nombre: 'Carnaval', tipo: 'Inamovible' },
  { fecha: '2027-02-09', dia: 'Martes', nombre: 'Carnaval', tipo: 'Inamovible' },
  { fecha: '2027-03-24', dia: 'Miércoles', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'Inamovible' },
  { fecha: '2027-03-26', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Inamovible' },
  { fecha: '2027-04-02', dia: 'Viernes', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'Inamovible' },
  { fecha: '2027-05-01', dia: 'Sábado', nombre: 'Día del Trabajador', tipo: 'Inamovible' },
  { fecha: '2027-05-25', dia: 'Martes', nombre: 'Día de la Revolución de Mayo', tipo: 'Inamovible' },
  { fecha: '2027-06-20', dia: 'Domingo', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano', tipo: 'Inamovible' },
  { fecha: '2027-06-21', dia: 'Lunes', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes', tipo: 'Trasladable', nota: 'El 17-jun cae jueves: se traslada al lunes siguiente (art. 6 Ley 27.399)' },
  { fecha: '2027-07-09', dia: 'Viernes', nombre: 'Día de la Independencia', tipo: 'Inamovible' },
  { fecha: '2027-08-16', dia: 'Lunes', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'Trasladable', nota: 'El 17-ago cae martes: se traslada al lunes anterior' },
  { fecha: '2027-10-11', dia: 'Lunes', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'Trasladable', nota: 'El 12-oct cae martes: se traslada al lunes anterior' },
  { fecha: '2027-11-20', dia: 'Sábado', nombre: 'Día de la Soberanía Nacional', tipo: 'Trasladable', nota: 'Cae sábado: la regla de traslado no aplica, se mantiene el 20-nov' },
  { fecha: '2027-12-08', dia: 'Miércoles', nombre: 'Inmaculada Concepción de María', tipo: 'Inamovible' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Inamovible' },
];

// ─────────────────────────────────────────── MÉXICO ───────────────────────────
// Días de descanso obligatorio · Ley Federal del Trabajo Art. 74.
// El 1-oct (transmisión del Poder Ejecutivo) NO aplica en 2027 (próxima: 2030).
export const FERIADOS_MX_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Obligatorio' },
  { fecha: '2027-02-01', dia: 'Lunes', nombre: 'Día de la Constitución', tipo: 'Obligatorio', nota: 'Primer lunes de febrero (la conmemoración es el 5)' },
  { fecha: '2027-03-15', dia: 'Lunes', nombre: 'Natalicio de Benito Juárez', tipo: 'Obligatorio', nota: 'Tercer lunes de marzo (la conmemoración es el 21)' },
  { fecha: '2027-05-01', dia: 'Sábado', nombre: 'Día del Trabajo', tipo: 'Obligatorio' },
  { fecha: '2027-09-16', dia: 'Jueves', nombre: 'Día de la Independencia', tipo: 'Obligatorio' },
  { fecha: '2027-11-15', dia: 'Lunes', nombre: 'Día de la Revolución Mexicana', tipo: 'Obligatorio', nota: 'Tercer lunes de noviembre (la conmemoración es el 20)' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Obligatorio' },
];

// ─────────────────────────────────────────── COLOMBIA ─────────────────────────
// 19 festivos en 2027 (incluye Virgen de Chiquinquirá, Ley 2578/2026).
// Trasladable = Ley Emiliani (Ley 51/1983): se corre al lunes siguiente.
export const FERIADOS_CO_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Fijo' },
  { fecha: '2027-01-11', dia: 'Lunes', nombre: 'Reyes Magos', tipo: 'Trasladable', nota: 'El 6-ene cae miércoles: se traslada al lunes siguiente' },
  { fecha: '2027-03-22', dia: 'Lunes', nombre: 'San José', tipo: 'Trasladable', nota: 'El 19-mar cae viernes: se traslada al lunes siguiente' },
  { fecha: '2027-03-25', dia: 'Jueves', nombre: 'Jueves Santo', tipo: 'Religioso' },
  { fecha: '2027-03-26', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Religioso' },
  { fecha: '2027-05-01', dia: 'Sábado', nombre: 'Día del Trabajo', tipo: 'Fijo' },
  { fecha: '2027-05-10', dia: 'Lunes', nombre: 'Ascensión del Señor', tipo: 'Trasladable' },
  { fecha: '2027-05-31', dia: 'Lunes', nombre: 'Corpus Christi', tipo: 'Trasladable' },
  { fecha: '2027-06-07', dia: 'Lunes', nombre: 'Sagrado Corazón', tipo: 'Trasladable' },
  { fecha: '2027-07-05', dia: 'Lunes', nombre: 'San Pedro y San Pablo', tipo: 'Trasladable', nota: 'El 29-jun cae martes: se traslada al lunes siguiente' },
  { fecha: '2027-07-12', dia: 'Lunes', nombre: 'Virgen de Chiquinquirá', tipo: 'Trasladable', nota: 'Ley 2578/2026; se conmemora el 9 de julio (viernes): se traslada al lunes siguiente' },
  { fecha: '2027-07-20', dia: 'Martes', nombre: 'Día de la Independencia', tipo: 'Fijo' },
  { fecha: '2027-08-07', dia: 'Sábado', nombre: 'Batalla de Boyacá', tipo: 'Fijo' },
  { fecha: '2027-08-16', dia: 'Lunes', nombre: 'Asunción de la Virgen', tipo: 'Trasladable', nota: 'El 15-ago cae domingo: se traslada al lunes siguiente' },
  { fecha: '2027-10-18', dia: 'Lunes', nombre: 'Día de la Raza', tipo: 'Trasladable', nota: 'El 12-oct cae martes: se traslada al lunes siguiente' },
  { fecha: '2027-11-01', dia: 'Lunes', nombre: 'Todos los Santos', tipo: 'Trasladable', nota: 'Cae lunes: no requiere traslado' },
  { fecha: '2027-11-15', dia: 'Lunes', nombre: 'Independencia de Cartagena', tipo: 'Trasladable', nota: 'El 11-nov cae jueves: se traslada al lunes siguiente' },
  { fecha: '2027-12-08', dia: 'Miércoles', nombre: 'Inmaculada Concepción', tipo: 'Fijo' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Fijo' },
];

// ─────────────────────────────────────────── CHILE ────────────────────────────
// 17 feriados nacionales en 2027 (incluye viernes 17-sep por Ley 20.983: aplica
// cuando el 18 cae sábado). Ley 19.668 traslada San Pedro y San Pablo y
// Encuentro de Dos Mundos al lunes más cercano.
export const FERIADOS_CL_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Irrenunciable' },
  { fecha: '2027-03-26', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Religioso' },
  { fecha: '2027-03-27', dia: 'Sábado', nombre: 'Sábado Santo', tipo: 'Religioso' },
  { fecha: '2027-05-01', dia: 'Sábado', nombre: 'Día Nacional del Trabajo', tipo: 'Irrenunciable' },
  { fecha: '2027-05-21', dia: 'Viernes', nombre: 'Día de las Glorias Navales', tipo: 'Civil' },
  { fecha: '2027-06-21', dia: 'Lunes', nombre: 'Día Nacional de los Pueblos Indígenas', tipo: 'Civil', nota: 'Sigue el solsticio de invierno (Ley 21.357)' },
  { fecha: '2027-06-28', dia: 'Lunes', nombre: 'San Pedro y San Pablo', tipo: 'Religioso', nota: 'El 29-jun cae martes: se traslada al lunes anterior (Ley 19.668)' },
  { fecha: '2027-07-16', dia: 'Viernes', nombre: 'Día de la Virgen del Carmen', tipo: 'Religioso' },
  { fecha: '2027-08-15', dia: 'Domingo', nombre: 'Asunción de la Virgen', tipo: 'Religioso' },
  { fecha: '2027-09-17', dia: 'Viernes', nombre: 'Feriado adicional Fiestas Patrias', tipo: 'Civil', nota: 'Ley 20.983: el viernes 17 es feriado cuando el 18 cae sábado' },
  { fecha: '2027-09-18', dia: 'Sábado', nombre: 'Independencia Nacional', tipo: 'Irrenunciable' },
  { fecha: '2027-09-19', dia: 'Domingo', nombre: 'Día de las Glorias del Ejército', tipo: 'Irrenunciable' },
  { fecha: '2027-10-11', dia: 'Lunes', nombre: 'Encuentro de Dos Mundos', tipo: 'Civil', nota: 'El 12-oct cae martes: se traslada al lunes anterior (Ley 19.668)' },
  { fecha: '2027-10-31', dia: 'Domingo', nombre: 'Día de las Iglesias Evangélicas y Protestantes', tipo: 'Religioso' },
  { fecha: '2027-11-01', dia: 'Lunes', nombre: 'Día de Todos los Santos', tipo: 'Religioso' },
  { fecha: '2027-12-08', dia: 'Miércoles', nombre: 'Inmaculada Concepción', tipo: 'Religioso' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Irrenunciable' },
];

// ─────────────────────────────────────────── PERÚ ─────────────────────────────
// DL 713 + leyes 31381 (9-dic), 31788 (7-jun y 6-ago) y 31822 (23-jul).
// Los feriados en Perú NO se trasladan. Los "días no laborables" (decreto PCM
// anual, sector público) son otra cosa y no se listan acá.
export const FERIADOS_PE_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Nacional' },
  { fecha: '2027-03-25', dia: 'Jueves', nombre: 'Jueves Santo', tipo: 'Nacional' },
  { fecha: '2027-03-26', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Nacional' },
  { fecha: '2027-05-01', dia: 'Sábado', nombre: 'Día del Trabajo', tipo: 'Nacional' },
  { fecha: '2027-06-07', dia: 'Lunes', nombre: 'Batalla de Arica y Día de la Bandera', tipo: 'Nacional', nota: 'Feriado desde 2023 (Ley 31788)' },
  { fecha: '2027-06-29', dia: 'Martes', nombre: 'San Pedro y San Pablo', tipo: 'Nacional' },
  { fecha: '2027-07-23', dia: 'Viernes', nombre: 'Día de la Fuerza Aérea del Perú', tipo: 'Nacional', nota: 'Feriado desde 2023 (Ley 31822)' },
  { fecha: '2027-07-28', dia: 'Miércoles', nombre: 'Fiestas Patrias — Independencia del Perú', tipo: 'Nacional' },
  { fecha: '2027-07-29', dia: 'Jueves', nombre: 'Fiestas Patrias — Gran Parada Militar', tipo: 'Nacional' },
  { fecha: '2027-08-06', dia: 'Viernes', nombre: 'Batalla de Junín', tipo: 'Nacional', nota: 'Feriado desde 2023 (Ley 31788)' },
  { fecha: '2027-08-30', dia: 'Lunes', nombre: 'Santa Rosa de Lima', tipo: 'Nacional' },
  { fecha: '2027-10-08', dia: 'Viernes', nombre: 'Combate de Angamos', tipo: 'Nacional' },
  { fecha: '2027-11-01', dia: 'Lunes', nombre: 'Día de Todos los Santos', tipo: 'Nacional' },
  { fecha: '2027-12-08', dia: 'Miércoles', nombre: 'Inmaculada Concepción', tipo: 'Nacional' },
  { fecha: '2027-12-09', dia: 'Jueves', nombre: 'Batalla de Ayacucho', tipo: 'Nacional', nota: 'Feriado desde 2022 (Ley 31381)' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Nacional' },
];

// ─────────────────────────────────────────── ECUADOR ──────────────────────────
// Reglas de traslado (Ley Orgánica reformatoria, R.O. Supl. 906/2016): martes →
// lunes anterior · miércoles/jueves → viernes de esa semana · sábado → viernes
// anterior · domingo → lunes siguiente. Exentos: 1-ene, 25-dic y martes de Carnaval.
export const FERIADOS_EC_2027: Feriado[] = [
  { fecha: '2027-01-01', dia: 'Viernes', nombre: 'Año Nuevo', tipo: 'Nacional', nota: 'Excluido de traslado por ley' },
  { fecha: '2027-02-08', dia: 'Lunes', nombre: 'Lunes de Carnaval', tipo: 'Nacional' },
  { fecha: '2027-02-09', dia: 'Martes', nombre: 'Martes de Carnaval', tipo: 'Nacional', nota: 'Excluido de traslado por ley pese a caer martes' },
  { fecha: '2027-03-26', dia: 'Viernes', nombre: 'Viernes Santo', tipo: 'Nacional' },
  { fecha: '2027-04-30', dia: 'Viernes', nombre: 'Día del Trabajo', tipo: 'Nacional', nota: 'El 1-may cae sábado: se observa el viernes anterior' },
  { fecha: '2027-05-24', dia: 'Lunes', nombre: 'Batalla de Pichincha', tipo: 'Nacional' },
  { fecha: '2027-08-09', dia: 'Lunes', nombre: 'Primer Grito de Independencia', tipo: 'Nacional', nota: 'El 10-ago cae martes: se observa el lunes anterior' },
  { fecha: '2027-10-08', dia: 'Viernes', nombre: 'Independencia de Guayaquil', tipo: 'Nacional', nota: 'El 9-oct cae sábado: se observa el viernes anterior' },
  { fecha: '2027-11-01', dia: 'Lunes', nombre: 'Día de los Difuntos', tipo: 'Nacional', nota: 'El 2-nov cae martes: se observa el lunes anterior' },
  { fecha: '2027-11-05', dia: 'Viernes', nombre: 'Independencia de Cuenca', tipo: 'Nacional', nota: 'El 3-nov cae miércoles: la regla legal lo lleva al viernes; puede ajustarse por decreto' },
  { fecha: '2027-12-25', dia: 'Sábado', nombre: 'Navidad', tipo: 'Nacional', nota: 'Excluido de traslado por ley' },
];

export const FERIADOS_LATAM_2027: Record<string, FeriadosPais> = {
  argentina: {
    pais: 'Argentina', gentilicio: 'los argentinos', audience: 'AR',
    slug: 'feriados-argentina-2027', totalLabel: '16 feriados nacionales',
    dataAsOf: '2026-08-18',
    marco: 'Ley 27.399 de feriados nacionales; traslados según su art. 6',
    notaTipo: 'Los trasladables de 2027 surgen de aplicar la regla del art. 6 de la Ley 27.399. Los feriados con fines turísticos (puentes) se fijan por decreto del Poder Ejecutivo hacia fines de 2026 y se sumarán cuando se publiquen.',
    fuentes: [
      { nombre: 'Ley 27.399 — texto oficial (InfoLeg / argentina.gob.ar)', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27399-281835/texto' },
      { nombre: 'Boletín Oficial — Ley 27.399', url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/172415/20171018' },
    ],
    feriados: FERIADOS_AR_2027,
  },
  mexico: {
    pais: 'México', gentilicio: 'los mexicanos', audience: 'MX',
    slug: 'feriados-mexico-2027', totalLabel: '7 días de descanso obligatorio',
    dataAsOf: '2026-08-18',
    marco: 'Ley Federal del Trabajo, Art. 74',
    notaTipo: 'Si trabajás un día de descanso obligatorio corresponde salario doble adicional (Art. 75 LFT). En 2027 no aplica el descanso por transmisión del Poder Ejecutivo (próxima: 2030).',
    fuentes: [
      { nombre: 'Ley Federal del Trabajo (Cámara de Diputados)', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' },
      { nombre: 'PROFEDET — Días de descanso obligatorio', url: 'https://www.profedet.gob.mx/micrositio/index.php/dias-de-descanso' },
    ],
    feriados: FERIADOS_MX_2027,
  },
  colombia: {
    pais: 'Colombia', gentilicio: 'los colombianos', audience: 'CO',
    slug: 'feriados-colombia-2027', totalLabel: '19 festivos nacionales',
    dataAsOf: '2026-08-18',
    marco: 'Ley 51 de 1983 (Ley Emiliani) y Ley 2578 de 2026',
    notaTipo: 'Trasladable = se corre al lunes siguiente por la Ley Emiliani; la tabla ya muestra la fecha observada. Si trabajás un festivo corresponde recargo del 75% (CST).',
    fuentes: [
      { nombre: 'Ley 51 de 1983 (Secretaría del Senado)', url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0051_1983.html' },
      { nombre: 'Ley 2578 de 2026 — festivo Virgen de Chiquinquirá (Presidencia)', url: 'https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202578%20DEL%2001%20DE%20JUNIO%20DE%202026.pdf' },
    ],
    feriados: FERIADOS_CO_2027,
  },
  chile: {
    pais: 'Chile', gentilicio: 'los chilenos', audience: 'CL',
    slug: 'feriados-chile-2027', totalLabel: '17 feriados nacionales',
    dataAsOf: '2026-08-18',
    marco: 'Leyes 2.977, 19.668 (traslados), 19.973 (irrenunciables), 20.983 y 21.357',
    notaTipo: 'Irrenunciable = el comercio debe cerrar (Ley 19.973, con excepciones). En 2027 son 5: 1-ene, 1-may, 18-sep, 19-sep y 25-dic. No incluye feriados regionales (Arica 7-jun, Chillán 20-ago).',
    fuentes: [
      { nombre: 'Feriados.cl — feriados legales 2027 (BCN)', url: 'https://www.feriados.cl/2027.php' },
      { nombre: 'Ley 21.357 — Día Nacional de los Pueblos Indígenas (Senado)', url: 'https://www.senado.cl/noticias/pueblos-originarios/confirman-feriado-para-el-21-de-junio-como-dia-de-los-pueblos-indigenas' },
    ],
    feriados: FERIADOS_CL_2027,
  },
  peru: {
    pais: 'Perú', gentilicio: 'los peruanos', audience: 'PE',
    slug: 'feriados-peru-2027', totalLabel: '16 feriados nacionales',
    dataAsOf: '2026-08-18',
    marco: 'Decreto Legislativo 713 y leyes 31381, 31788 y 31822',
    notaTipo: 'Los feriados en Perú no se trasladan: se gozan en su fecha exacta. Los "días no laborables" del sector público se declaran por decreto PCM cada año y no están incluidos.',
    fuentes: [
      { nombre: 'Gob.pe — Feriados nacionales', url: 'https://www.gob.pe/feriados' },
      { nombre: 'Ley 31822 — feriado 23 de julio (LP Derecho)', url: 'https://lpderecho.pe/ley-31822-feriado-nacional-23-julio-dia-fuerza-aerea-peru/' },
    ],
    feriados: FERIADOS_PE_2027,
  },
  ecuador: {
    pais: 'Ecuador', gentilicio: 'los ecuatorianos', audience: 'EC',
    slug: 'feriados-ecuador-2027', totalLabel: '11 feriados nacionales',
    dataAsOf: '2026-08-18',
    marco: 'LOSEP y Código del Trabajo, reforma de feriados (R.O. Supl. 906/2016)',
    notaTipo: 'La tabla muestra la fecha observada con los traslados de ley ya aplicados (martes → lunes anterior; miércoles/jueves → viernes; sábado → viernes anterior; domingo → lunes siguiente). El calendario definitivo puede ajustarse por decreto.',
    fuentes: [
      { nombre: 'Asamblea Nacional — Ley Orgánica reformatoria de feriados (2016)', url: 'https://www.asambleanacional.gob.ec/es/noticia/47354-pleno-aprobo-ley-de-feriados-este-25-de-diciembre-y-1-de' },
      { nombre: 'Ecuador Legal Online — Feriados en Ecuador y reglas de traslado', url: 'https://www.ecuadorlegalonline.com/laboral/feriados-en-ecuador/' },
    ],
    feriados: FERIADOS_EC_2027,
  },
};
