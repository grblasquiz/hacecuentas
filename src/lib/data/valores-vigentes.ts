// ────────────────────────────────────────────────────────────────────────────
// VALORES VIGENTES EN ARGENTINA — registro central para /valores-vigentes
// ────────────────────────────────────────────────────────────────────────────
// NO duplica números: importa todo de las fuentes únicas del repo
// (smvm-ar-2026.ts, _ganancias-escala.ts, monotributo-2026.ts), así el hub
// se actualiza solo cuando los fetchers patchean esas fuentes.
//
// Lo único propio de este archivo es el HISTORIAL de cambios (qué cambió,
// desde cuándo, valor anterior/nuevo, fuente) y los PRÓXIMOS cambios esperados.
// Cada entrada del historial exige norma + fuenteUrl: acá no entra ningún
// número sin respaldo oficial (regla YMYL del repo).
// ────────────────────────────────────────────────────────────────────────────

import {
  SMVM_MENSUAL,
  SMVM_HORA,
  SMVM_FECHA,
  SMVM_RESOLUCION,
  DESEMPLEO_PISO,
  DESEMPLEO_TECHO,
} from './smvm-ar-2026';
import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  ESCALA,
} from '../formulas/_ganancias-escala';
import {
  TOPES,
  CUOTA_SERVICIOS,
  CUOTA_BIENES,
  META as MONO_META,
} from './monotributo-2026';

export interface ValorVigente {
  id: string;
  seccion: 'Trabajo y sueldos' | 'Impuesto a las Ganancias' | 'Monotributo' | 'Seguridad social';
  nombre: string;
  /** Valor numérico en ARS (o null si el valor se expresa en `valorTexto`). */
  valor: number | null;
  valorTexto?: string;
  detalle: string;
  vigenciaDesde: string; // legible: 'junio 2026', 'desde el 1/2/2026'
  norma: string;
  fuente: string;
  fuenteUrl: string;
  /** Link interno a la calculadora que usa este valor. */
  calcHref?: string;
  /** Link interno a la página de datos con la tabla completa. */
  datosHref?: string;
}

export interface CambioHistorial {
  fecha: string; // YYYY-MM-DD (entrada en vigencia)
  titulo: string;
  queCambio: string;
  anterior?: string;
  nuevo?: string;
  impacto: string; // en un ejemplo real
  norma: string;
  fuenteUrl: string;
}

export interface ProximoCambio {
  cuando: string;
  titulo: string;
  detalle: string;
}

const fmtARS = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export const VALORES: ValorVigente[] = [
  {
    id: 'smvm-mensual',
    seccion: 'Trabajo y sueldos',
    nombre: 'Salario Mínimo, Vital y Móvil (mensual)',
    valor: SMVM_MENSUAL,
    detalle: 'Jornada completa (48 h semanales). Piso legal de remuneración para trabajadores registrados.',
    vigenciaDesde: SMVM_FECHA,
    norma: SMVM_RESOLUCION,
    fuente: 'Consejo Nacional del Empleo (CNEPySMVyM)',
    fuenteUrl: 'https://www.argentina.gob.ar/trabajo/consejodelsalario',
    calcHref: '/salario-minimo-vital-movil-argentina',
  },
  {
    id: 'smvm-hora',
    seccion: 'Trabajo y sueldos',
    nombre: 'Salario mínimo por hora (jornalizados)',
    valor: SMVM_HORA,
    detalle: 'Valor hora del SMVM (mensual ÷ 200: 8 h × 25 días).',
    vigenciaDesde: SMVM_FECHA,
    norma: SMVM_RESOLUCION,
    fuente: 'Consejo Nacional del Empleo (CNEPySMVyM)',
    fuenteUrl: 'https://www.argentina.gob.ar/trabajo/consejodelsalario',
  },
  {
    id: 'mni-ganancias',
    seccion: 'Impuesto a las Ganancias',
    nombre: 'Mínimo efectivo mensual (empleado soltero)',
    valor: MNI_MENSUAL_BASE,
    detalle: 'Ganancia no imponible + deducción especial (art. 30 LIG) prorrateadas por mes. Por debajo de esa ganancia neta no se retiene impuesto.',
    vigenciaDesde: 'segundo semestre 2026 (julio a diciembre)',
    norma: 'RG 4003 · Ley 27.743',
    fuente: 'ARCA',
    fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf',
    calcHref: '/calculadora-impuesto-ganancias-sueldo',
    datosHref: '/datos-ganancias-2026',
  },
  {
    id: 'ganancias-deduccion-conyuge',
    seccion: 'Impuesto a las Ganancias',
    nombre: 'Deducción mensual por cónyuge a cargo',
    valor: INCREMENTO_CONYUGE_MENSUAL,
    detalle: 'Art. 30 inc. b.1 LIG. El cónyuge deduce aproximadamente el doble que un hijo.',
    vigenciaDesde: 'segundo semestre 2026 (julio a diciembre)',
    norma: 'RG 4003 · Ley 27.743',
    fuente: 'ARCA',
    fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf',
    calcHref: '/calculadora-deduccion-familia-conyuge-hijo-ganancias',
    datosHref: '/datos-ganancias-2026',
  },
  {
    id: 'ganancias-deduccion-hijo',
    seccion: 'Impuesto a las Ganancias',
    nombre: 'Deducción mensual por hijo a cargo',
    valor: INCREMENTO_HIJO_MENSUAL,
    detalle: 'Art. 30 inc. b.2 LIG, por cada hijo menor de 18 años (o incapacitado para el trabajo, sin límite de edad y monto doble).',
    vigenciaDesde: 'segundo semestre 2026 (julio a diciembre)',
    norma: 'RG 4003 · Ley 27.743',
    fuente: 'ARCA',
    fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf',
    datosHref: '/datos-ganancias-2026',
  },
  {
    id: 'ganancias-escala',
    seccion: 'Impuesto a las Ganancias',
    nombre: 'Escala del impuesto (art. 94 LIG)',
    valor: null,
    valorTexto: `${ESCALA.length} tramos, 5% a 35%`,
    detalle: `Alícuotas marginales progresivas sobre la ganancia neta imponible mensual. El tramo más alto (35%) arranca en ${fmtARS(ESCALA[ESCALA.length - 2].hasta)} de ganancia imponible mensual.`,
    vigenciaDesde: 'segundo semestre 2026 (julio a diciembre)',
    norma: 'Art. 94 LIG · RG 4003',
    fuente: 'ARCA',
    fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-jul-a-dic-2026.pdf',
    calcHref: '/sueldo-en-mano-argentina',
    datosHref: '/datos-ganancias-2026',
  },
  {
    id: 'monotributo-tope-k',
    seccion: 'Monotributo',
    nombre: 'Tope de facturación anual (categoría K)',
    valor: TOPES.K,
    detalle: 'Facturación bruta anual máxima para permanecer en el monotributo. Superado ese monto, corresponde el régimen general.',
    vigenciaDesde: `desde el 1/8/2026 (recategorización ${MONO_META.recategorizacion})`,
    norma: 'Régimen Simplificado (Ley 24.977 y modif.)',
    fuente: MONO_META.fuente,
    fuenteUrl: MONO_META.fuenteUrl,
    calcHref: '/calculadora-monotributo-2026',
    datosHref: '/datos-monotributo-2026',
  },
  {
    id: 'monotributo-cuota-a',
    seccion: 'Monotributo',
    nombre: 'Cuota mensual mínima (categoría A)',
    valor: CUOTA_SERVICIOS.A,
    detalle: 'Cuota total (impuesto integrado + SIPA + obra social) de la categoría más baja. Igual para servicios y venta de bienes.',
    vigenciaDesde: 'desde el 1/8/2026',
    norma: 'Régimen Simplificado (Ley 24.977 y modif.)',
    fuente: MONO_META.fuente,
    fuenteUrl: MONO_META.fuenteUrl,
    calcHref: '/calculadora-monotributo-cuota-2026-todas-categorias',
    datosHref: '/datos-monotributo-2026',
  },
  {
    id: 'monotributo-cuota-k',
    seccion: 'Monotributo',
    nombre: 'Cuota mensual máxima (categoría K)',
    valor: null,
    valorTexto: `${fmtARS(CUOTA_BIENES.K)} (bienes) · ${fmtARS(CUOTA_SERVICIOS.K)} (servicios)`,
    detalle: 'Desde la reforma 2026, servicios llega hasta la categoría K con cuota diferenciada (paga más que venta de bienes en las categorías altas).',
    vigenciaDesde: 'desde el 1/8/2026',
    norma: 'Régimen Simplificado (Ley 24.977 y modif.)',
    fuente: MONO_META.fuente,
    fuenteUrl: MONO_META.fuenteUrl,
    datosHref: '/datos-monotributo-2026',
  },
  {
    id: 'desempleo-techo',
    seccion: 'Seguridad social',
    nombre: 'Prestación por desempleo: piso y techo',
    valor: null,
    valorTexto: `${fmtARS(DESEMPLEO_PISO)} a ${fmtARS(DESEMPLEO_TECHO)}`,
    detalle: 'La prestación inicial es el 75% de la mejor remuneración neta habitual de los últimos 6 meses, acotada entre 50% y 100% del SMVM vigente.',
    vigenciaDesde: 'agosto 2026',
    norma: 'Ley 24.013 · Decreto 267/2006',
    fuente: 'ANSES',
    fuenteUrl: 'https://www.anses.gob.ar/prestacion-por-desempleo',
    calcHref: '/calculadora-asignacion-desempleo-seguro-prestacion-anses',
  },
];

/**
 * Historial de cambios — sólo entradas con respaldo documental.
 * Ordenado del más reciente al más viejo. Al registrar un cambio nuevo:
 * completar anterior/nuevo/impacto/norma/fuenteUrl (todos verificables).
 */
export const HISTORIAL: CambioHistorial[] = [
  {
    fecha: '2026-07-01',
    titulo: 'Nueva escala y deducciones de Ganancias (segundo semestre 2026)',
    queCambio: 'ARCA actualizó por IPC la escala del art. 94 y las deducciones personales del art. 30 para julio-diciembre.',
    nuevo: `Mínimo efectivo mensual para empleado soltero: ${fmtARS(MNI_MENSUAL_BASE)} · deducción por hijo: ${fmtARS(INCREMENTO_HIJO_MENSUAL)}/mes · por cónyuge: ${fmtARS(INCREMENTO_CONYUGE_MENSUAL)}/mes`,
    impacto: `Un empleado soltero empieza a tributar desde un bruto aproximado de ${fmtARS(MNI_MENSUAL_BASE / 0.83)}, antes de otras deducciones.`,
    norma: 'Ley 27.743 · RG 4003 · tablas ARCA julio-diciembre 2026',
    fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf',
  },
  {
    fecha: '2026-08-01',
    titulo: 'Aumentó el Salario Mínimo, Vital y Móvil',
    queCambio: 'SMVM mensual, último tramo del cronograma de la Res 9/2025.',
    anterior: '$372.400 (julio 2026)',
    nuevo: `${fmtARS(SMVM_MENSUAL)} (agosto 2026)`,
    impacto: `Un trabajador jornalizado pasó a cobrar ${fmtARS(SMVM_HORA)} por hora. La prestación por desempleo quedó acotada entre ${fmtARS(DESEMPLEO_PISO)} y ${fmtARS(DESEMPLEO_TECHO)}.`,
    norma: 'Resolución 9/2025 CNEPySMVyM (cronograma nov-2025 a ago-2026, BO 03-12-2025)',
    fuenteUrl: 'https://www.argentina.gob.ar/trabajo/consejodelsalario',
  },
  {
    fecha: '2026-08-01',
    titulo: 'Nuevas categorías del monotributo (recategorización de agosto)',
    queCambio:
      'Se actualizaron topes de facturación y cuotas de las 11 categorías (A a K) para el semestre agosto 2026-enero 2027.',
    anterior: 'Escala vigente entre febrero y julio de 2026',
    nuevo: `Servicios alcanza la categoría K (tope anual ${fmtARS(TOPES.K)})`,
    impacto: `Un profesional de servicios que facturaba por encima del viejo tope de H ya no queda excluido del régimen: puede recategorizarse en I, J o K. La cuota de servicios en K es ${fmtARS(CUOTA_SERVICIOS.K)}/mes contra ${fmtARS(CUOTA_BIENES.K)}/mes de venta de bienes.`,
    norma: 'Régimen Simplificado (Ley 24.977 y modif.) — escala vigente desde el 1/8/2026',
    fuenteUrl: 'https://www.arca.gob.ar/monotributo/categorias.asp',
  },
  {
    fecha: '2026-01-01',
    titulo: 'Nueva escala y deducciones de Ganancias (primer semestre 2026)',
    queCambio:
      'ARCA actualizó por IPC la escala del art. 94 y las deducciones personales del art. 30, como cada semestre desde la Ley 27.743.',
    nuevo: 'Mínimo efectivo mensual para empleado soltero: $2.490.038 · deducción por hijo: $203.905/mes · por cónyuge: $404.330/mes',
    impacto: 'Un empleado soltero sin hijos empezaba a pagar Ganancias desde un bruto aproximado de $3.000.046 mensuales, antes de otras deducciones.',
    norma: 'Ley 27.743 · RG 4003 · tablas ARCA enero-junio 2026',
    fuenteUrl: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf',
  },
];

export const PROXIMOS: ProximoCambio[] = [
  {
    cuando: 'enero 2027',
    titulo: 'Nueva escala de Ganancias (primer semestre 2027)',
    detalle:
      'ARCA publicará la actualización semestral por IPC de la escala del art. 94 y las deducciones del art. 30 (Ley 27.743).',
  },
  {
    cuando: 'desde septiembre 2026',
    titulo: 'Próximo cronograma del SMVM',
    detalle:
      'La Resolución 9/2025 terminó en agosto. El Consejo del Salario fue convocado el 28 de agosto; falta incorporar la nueva resolución cuando se publique.',
  },
];

/** Fecha de última revisión editorial de esta página (bump al registrar cambios). */
export const ULTIMA_REVISION = '2026-08-31';
