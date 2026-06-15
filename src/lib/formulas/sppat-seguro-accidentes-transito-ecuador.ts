/**
 * SPPAT (ex-SOAT) — Ecuador. Estima el valor anual de la tasa SPPAT por tipo de
 * vehículo y muestra las coberturas/protecciones de ley para víctimas de accidentes.
 *
 * El SPPAT (Servicio Público para Pago de Accidentes de Tránsito) reemplazó al SOAT.
 * Es una TASA pública obligatoria que se cobra dentro de la matriculación vehicular (ANT/SRI);
 * NO es un seguro privado. El valor exacto lo fija el SRI por placa.
 *
 * Coberturas (montos máximos por víctima y por evento, fijados por ley — iguales para todo vehículo):
 *  - Gastos médicos:      hasta $3.000  (Art. 70)
 *  - Fallecimiento:       $5.000        (Art. 59)
 *  - Gastos funerarios:   hasta $400    (Art. 63)
 *  - Discapacidad:        hasta $5.000  (Art. 66; graduada 5%→100%: $1.050 / $2.350 / $3.650 / $4.750 / $5.000)
 *  - Traslado/movilización: hasta $200  (Art. 77)
 *
 * Tasa SPPAT por clase y cilindraje (Art. 83, vehículos que NO prestan servicio público):
 *  - Motocicletas:                         $19,71 (<100cc) / $24,63 (100–249) / $30,26 (≥250)
 *  - Automóviles 0–9 años:                 $21,11 (<1500) / $26,74 (1500–2499) / $31,67 (≥2500)
 *  - Automóviles más de 9 años:            $28,85 / $33,78 / $38,00
 *  - Todo terreno y camionetas 0–9 años:   $38,71 / $46,45 / $54,19
 *  - Todo terreno y camionetas >9 años:    $47,86 / $55,59 / $62,64
 *  - Carga o mixto (por tn):               $42,93 (<5) / $61,23 (5–14,99) / $80,93 (≥15)
 *  - Bus 24+ pax: $61,19 · Buseta 17–23: $55,08 · Furgoneta 7–16: $48,96
 *  Servicio público de alquiler (taxis 0–9 años): $32,56 / $41,13 / $51,41.
 *
 * El representativo de un AUTO PARTICULAR es $26,74 (1500–2499 cc, 0–9 años); el de una
 * MOTO es $24,63 (100–249 cc). Los valores por categoría son una estimación orientativa
 * dentro del rango oficial; el valor exacto se consulta por placa en el SRI.
 *
 * fuente: Norma Técnica del SPPAT — Resolución de Directorio Nro. 001-D-SPPAT-2025
 *   (14-ago-2025, Registro Oficial 110 de 26-ago-2025), Arts. 59, 63, 66, 70, 77 y 83.
 *   https://www.sppat.gob.ec/ — PDF "Norma Técnica del Servicio Público para Pago de Accidentes de Tránsito 2025".
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tasa anual representativa del SPPAT para automóvil particular (USD): 1500–2499 cc, 0–9 años.
// fuente: Norma Técnica SPPAT 2025, Art. 83 (automóviles 0–9 años).
const SPPAT_BASE_LIVIANO = 26.74;

// Coberturas de ley (USD) — fijas para todo tipo de vehículo. fuente: Norma Técnica SPPAT 2025, Arts. 59/63/66/70/77.
export const COBERTURAS_SPPAT = {
  gastosMedicos: 3000,
  fallecimiento: 5000,
  gastosFunerarios: 400,
  discapacidad: 5000,
  trasladoHeridos: 200,
} as const;

// Tipos de vehículo y su tarifa estimada de la tasa SPPAT (USD/año). fuente: Norma Técnica SPPAT 2025, Art. 83.
// `valor` = representativo del tramo más común; `rango` = abanico oficial completo de la clase.
type TipoVehiculo = 'motocicleta' | 'liviano' | 'camioneta' | 'taxi' | 'bus' | 'pesado';

const TARIFA_POR_TIPO: Record<TipoVehiculo, { valor: number; etiqueta: string; rango: string }> = {
  motocicleta: { valor: 24.63, etiqueta: 'Motocicleta', rango: '$19,71 a $30,26 según cilindraje' },
  liviano: { valor: SPPAT_BASE_LIVIANO, etiqueta: 'Auto / vehículo liviano particular', rango: '$21,11 a $31,67 según cilindraje (0–9 años)' },
  camioneta: { valor: 46.45, etiqueta: 'Camioneta / SUV (todo terreno)', rango: '$38,71 a $54,19 según cilindraje (0–9 años)' },
  taxi: { valor: 41.13, etiqueta: 'Taxi / transporte comercial de alquiler', rango: '$32,56 a $51,41 según cilindraje (0–9 años)' },
  bus: { valor: 61.19, etiqueta: 'Bus / transporte de pasajeros', rango: 'desde $61,19 (bus 24+ pasajeros); urbano/interprovincial $77,14 a $111,37' },
  pesado: { valor: 80.93, etiqueta: 'Camión / vehículo pesado', rango: '$42,93 a $106,96 según capacidad de carga' },
};

export interface Inputs {
  tipoVehiculo: string; // 'motocicleta' | 'liviano' | 'camioneta' | 'taxi' | 'bus' | 'pesado'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const tipoRaw = (i.tipoVehiculo || '').toString().trim().toLowerCase();
  if (!tipoRaw) throw new Error('Elegí el tipo de vehículo');

  const tipo = (Object.keys(TARIFA_POR_TIPO) as TipoVehiculo[]).includes(tipoRaw as TipoVehiculo)
    ? (tipoRaw as TipoVehiculo)
    : null;
  if (!tipo) throw new Error('Tipo de vehículo no válido');

  const tarifa = TARIFA_POR_TIPO[tipo];
  const valorSPPAT = tarifa.valor;
  if (!(valorSPPAT > 0)) throw new Error('No se pudo determinar la tarifa del SPPAT');

  const coberturaMaximaTotal =
    COBERTURAS_SPPAT.gastosMedicos +
    COBERTURAS_SPPAT.fallecimiento +
    COBERTURAS_SPPAT.gastosFunerarios +
    COBERTURAS_SPPAT.discapacidad +
    COBERTURAS_SPPAT.trasladoHeridos;

  // Cuánto "protección" comprás por cada dólar de tasa (techo de gastos médicos / tasa).
  const apalancamientoMedico = Math.round((COBERTURAS_SPPAT.gastosMedicos / valorSPPAT) * 10) / 10;

  const _insight = {
    title: 'Tu SPPAT por un año',
    text: `Para un **${tarifa.etiqueta.toLowerCase()}**, la tasa SPPAT estimada es **${fmtUSDec(
      valorSPPAT,
    )}** al año (${tarifa.rango}); se paga dentro de la matrícula. A cambio, ante un accidente de tránsito cada víctima tiene cobertura de hasta **${fmtUSDec(
      COBERTURAS_SPPAT.gastosMedicos,
    )}** en gastos médicos y **${fmtUSDec(
      COBERTURAS_SPPAT.fallecimiento,
    )}** por fallecimiento. Con esa tasa cubrís hasta ${apalancamientoMedico}× su valor solo en atención médica.`,
    tone: 'positive',
    icon: '🛡️',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Gastos médicos', value: COBERTURAS_SPPAT.gastosMedicos },
      { label: 'Fallecimiento', value: COBERTURAS_SPPAT.fallecimiento },
      { label: 'Discapacidad', value: COBERTURAS_SPPAT.discapacidad },
      { label: 'Funerarios', value: COBERTURAS_SPPAT.gastosFunerarios },
      { label: 'Traslado', value: COBERTURAS_SPPAT.trasladoHeridos },
    ],
    ariaLabel: `Coberturas del SPPAT por víctima: médicos ${fmtUSDec(
      COBERTURAS_SPPAT.gastosMedicos,
    )}, fallecimiento ${fmtUSDec(COBERTURAS_SPPAT.fallecimiento)}, discapacidad ${fmtUSDec(
      COBERTURAS_SPPAT.discapacidad,
    )}, funerarios ${fmtUSDec(COBERTURAS_SPPAT.gastosFunerarios)}, traslado ${fmtUSDec(
      COBERTURAS_SPPAT.trasladoHeridos,
    )}.`,
  };

  return {
    valorSPPAT: fmtUSDec(valorSPPAT),
    tipoVehiculo: tarifa.etiqueta,
    coberturaGastosMedicos: fmtUSDec(COBERTURAS_SPPAT.gastosMedicos),
    coberturaFallecimiento: fmtUSDec(COBERTURAS_SPPAT.fallecimiento),
    coberturaDiscapacidad: fmtUSDec(COBERTURAS_SPPAT.discapacidad),
    coberturaGastosFunerarios: fmtUSDec(COBERTURAS_SPPAT.gastosFunerarios),
    coberturaTrasladoHeridos: fmtUSDec(COBERTURAS_SPPAT.trasladoHeridos),
    coberturaMaximaTotal: fmtUSDec(coberturaMaximaTotal),
    detalle: `SPPAT ${tarifa.etiqueta} ≈ ${fmtUSDec(
      valorSPPAT,
    )}/año (${tarifa.rango}) · Médicos ${fmtUSDec(COBERTURAS_SPPAT.gastosMedicos)} · Muerte ${fmtUSDec(
      COBERTURAS_SPPAT.fallecimiento,
    )} · Discapacidad ${fmtUSDec(COBERTURAS_SPPAT.discapacidad)} · Funeral ${fmtUSDec(
      COBERTURAS_SPPAT.gastosFunerarios,
    )} · Traslado ${fmtUSDec(COBERTURAS_SPPAT.trasladoHeridos)}.`,
    _insight,
    _chart,
  };
}
