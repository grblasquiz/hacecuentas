/**
 * Estimador de precio del SOAT (Seguro Obligatorio de Accidentes de Tránsito) — Perú 2026.
 *
 * El SOAT NO tiene tarifa fija por ley: cada aseguradora fija su prima según tipo de
 * vehículo, uso, antigüedad y zona de circulación. Lo que SÍ está regulado por ley son
 * las COBERTURAS (indemnizaciones en UIT), iguales para todas las pólizas.
 *
 * Esta calc estima un RANGO de prima de mercado por categoría vehicular + región
 * (Lima/aseguradora vs AFOCAT-CAT en provincias para transporte público) y muestra las
 * coberturas legales 2026 (con la UIT vigente).
 *
 * Marco legal:
 *  - Ley 27181 (Ley General de Transporte y Tránsito): obliga el SOAT a todo vehículo.
 *  - DS 024-2002-MTC (TUO del Reglamento Nacional del SOAT): coberturas y reglas.
 *  - Ley 28839: crea el CAT (Certificado contra Accidentes de Tránsito) emitido por las
 *    AFOCAT para transporte público regional/provincial (alternativa al SOAT en provincias).
 *  - Supervisión: SBS (aseguradoras y AFOCAT). Fiscalización: PNP, SUTRAN, municipalidades.
 *
 * Coberturas SOAT 2026 (DS 024-2002-MTC, montos = UIT 2026 S/ 5.500):
 *  - Muerte: 4 UIT  · Invalidez permanente: hasta 4 UIT  · Gastos médicos: hasta 5 UIT
 *  - Incapacidad temporal: hasta 1 UIT  · Gastos de sepelio: hasta 1 UIT
 *
 * Rangos de prima de mercado 2026 (referenciales, S/ por año):
 *  fuente: NeoAuto / Comparabien / TrámitesPerú, dic-2025–jun-2026.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

type Categoria = 'auto' | 'moto' | 'taxi' | 'transporte' | 'carga';
type Region = 'lima' | 'provincia';

export interface Inputs {
  categoria: Categoria; // tipo/uso del vehículo
  region?: Region;      // 'lima' (aseguradora SOAT) o 'provincia' (puede usar AFOCAT/CAT)
  antiguedad?: number;  // años de antigüedad del vehículo (afecta la prima)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Rangos de prima ANUAL de mercado por categoría (S/), 2026.
// fuente: NeoAuto "SOAT en Perú 2026" + Comparabien "cuánto vale el SOAT" + TrámitesPerú, dic-2025/jun-2026.
const RANGOS: Record<Categoria, { min: number; max: number; etiqueta: string }> = {
  // Auto particular: virtuales desde ~S/34–50; hasta ~S/200 por antigüedad/zona.
  auto:       { min: 34,  max: 200, etiqueta: 'Auto particular' },
  // Moto lineal/scooter: desde ~S/33 hasta +S/336 (uso delivery/comercial encarece).
  moto:       { min: 33,  max: 336, etiqueta: 'Moto / mototaxi particular' },
  // Taxi y auto de servicio (uso comercial de pasajeros): prima más alta.
  taxi:       { min: 80,  max: 250, etiqueta: 'Taxi / auto de servicio' },
  // Transporte público de pasajeros (combi, bus, colectivo).
  transporte: { min: 200, max: 500, etiqueta: 'Transporte público de pasajeros' },
  // Vehículos de carga.
  carga:      { min: 100, max: 350, etiqueta: 'Vehículo de carga' },
};

// Categorías de transporte público/menor que en provincias suelen usar AFOCAT (CAT), más barato.
const ELEGIBLE_AFOCAT: Categoria[] = ['moto', 'taxi', 'transporte'];

export function compute(i: Inputs): Outputs {
  const categoria = String(i.categoria || '') as Categoria;
  const region: Region = String(i.region || 'lima') === 'provincia' ? 'provincia' : 'lima';
  const antiguedadRaw = i.antiguedad;
  const antiguedad =
    antiguedadRaw === undefined || antiguedadRaw === null || (antiguedadRaw as any) === ''
      ? 0
      : Number(antiguedadRaw);

  if (!RANGOS[categoria]) throw new Error('Elegí el tipo de vehículo');
  if (!Number.isFinite(antiguedad) || antiguedad < 0) throw new Error('La antigüedad debe ser 0 o más años');

  const base = RANGOS[categoria];

  // Posicionamiento dentro del rango según antigüedad: 0 años → más cerca del mínimo,
  // a más antigüedad la prima sube hacia el máximo (tope a 20 años de exposición).
  const factorAntiguedad = Math.min(antiguedad, 20) / 20; // 0..1
  // Estimación puntual: interpola entre min y un punto intermedio-alto del rango.
  const piso = base.min;
  const techoEstimado = base.min + (base.max - base.min) * 0.6; // estimación puntual no llega al tope absoluto
  let estimado = piso + (techoEstimado - piso) * factorAntiguedad;

  // En provincias el mercado suele ser algo más barato (menor siniestralidad/competencia AFOCAT).
  const ajusteRegion = region === 'provincia' ? 0.9 : 1.0;
  estimado = estimado * ajusteRegion;
  const minRegion = base.min * ajusteRegion;
  const maxRegion = base.max * ajusteRegion;

  const usaAfocat = region === 'provincia' && ELEGIBLE_AFOCAT.includes(categoria);

  // Coberturas legales (reguladas, iguales para toda póliza) — UIT 2026.
  const uit = PERU_2026.uit; // S/ 5.500
  const cobMuerte = 4 * uit;        // 4 UIT
  const cobInvalidez = 4 * uit;     // hasta 4 UIT
  const cobMedicos = 5 * uit;       // hasta 5 UIT
  const cobTemporal = 1 * uit;      // hasta 1 UIT
  const cobSepelio = 1 * uit;       // hasta 1 UIT

  const tipoSeguro = usaAfocat ? 'SOAT o AFOCAT (CAT)' : 'SOAT';

  const _insight = {
    title: `Precio estimado del ${tipoSeguro}`,
    text: usaAfocat
      ? `Para un **${base.etiqueta.toLowerCase()}** en provincia, el SOAT ronda **${fmtPEN(estimado)}** al año (rango de mercado ${fmtPEN(minRegion)}–${fmtPEN(maxRegion)}). Al ser transporte público de ámbito regional, también podés sacar un **CAT de una AFOCAT**, que suele ser **más barato** pero solo cubre dentro de tu región. El SOAT cubre en **todo el Perú**.`
      : `Para un **${base.etiqueta.toLowerCase()}**${region === 'provincia' ? ' en provincia' : ''}, el SOAT ronda **${fmtPEN(estimado)}** al año, dentro de un rango de mercado de **${fmtPEN(minRegion)} a ${fmtPEN(maxRegion)}**. No hay tarifa fija: conviene **comparar entre aseguradoras** (Rímac, La Positiva, Pacífico, Mapfre, Interseguro) porque el mismo vehículo puede variar bastante.`,
    tone: 'info',
    icon: '🚗',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Mínimo', value: Math.round(minRegion) },
      { label: 'Estimado', value: Math.round(estimado) },
      { label: 'Máximo', value: Math.round(maxRegion) },
    ],
    prefix: 'S/ ',
    ariaLabel: `Precio del SOAT para ${base.etiqueta}: mínimo ${fmtPEN(minRegion)}, estimado ${fmtPEN(estimado)}, máximo ${fmtPEN(maxRegion)} al año.`,
  };

  return {
    precioEstimado: fmtPEN(estimado),
    rango: `${fmtPEN(minRegion)} – ${fmtPEN(maxRegion)} al año`,
    tipoVehiculo: base.etiqueta,
    tipoSeguro,
    coberturaMuerte: fmtPEN(cobMuerte),
    coberturaMedicos: fmtPEN(cobMedicos),
    detalle:
      `${base.etiqueta} · ${region === 'lima' ? 'Lima/ciudad' : 'provincia'} · ${antiguedad} año(s) de antigüedad. ` +
      `Estimado ${fmtPEN(estimado)}/año (rango ${fmtPEN(minRegion)}–${fmtPEN(maxRegion)}). ` +
      `Coberturas legales 2026 (UIT S/ 5.500): muerte ${fmtPEN(cobMuerte)} · invalidez hasta ${fmtPEN(cobInvalidez)} · gastos médicos hasta ${fmtPEN(cobMedicos)} · incapacidad/sepelio hasta ${fmtPEN(cobTemporal)} c/u.` +
      (usaAfocat ? ' En provincia, transporte público puede optar por el CAT de una AFOCAT (más barato, cobertura regional).' : ''),
    _insight,
    _chart,
  };
}
