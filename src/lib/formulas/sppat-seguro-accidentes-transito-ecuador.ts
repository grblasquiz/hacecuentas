/**
 * SPPAT (ex-SOAT) — Ecuador. Estima el valor anual de la tasa SPPAT por tipo de
 * vehículo y muestra las coberturas/protecciones de ley para víctimas de accidentes.
 *
 * El SPPAT (Servicio Público para Pago de Accidentes de Tránsito) reemplazó al SOAT.
 * Es una TASA pública obligatoria que se cobra dentro de la matriculación vehicular (ANT/SRI);
 * NO es un seguro privado. El valor exacto lo fija el SRI por placa.
 *
 * Coberturas (montos máximos por víctima y por evento, fijados por ley — iguales para todo vehículo):
 *  - Gastos médicos:      hasta $3.000
 *  - Fallecimiento:       $5.000
 *  - Gastos funerarios:   hasta $400
 *  - Discapacidad:        hasta $5.000
 *  - Traslado de heridos: hasta $200
 * fuente: SPPAT (protecciontransito.gob.ec), "Preguntas frecuentes sobre las protecciones",
 *   https://www.protecciontransito.gob.ec/servicios/preguntas-frecuentes-sobre-las-protecciones-que-brinda-el-sppat/ , 2026
 *
 * Tasa SPPAT 2026 (estimada): base liviano ~$47,50/año (2025 fue $49,26).
 * fuente: ANT/SRI matriculación 2026, valores referenciados en EcuadorLegalOnline / matriculacion-vehicular.com, 2026.
 * El valor por categoría varía: motos pagan menos, transporte público/pesado paga más.
 * Los factores por categoría son una ESTIMACIÓN orientativa; el valor exacto se consulta por placa en el SRI.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tasa base anual del SPPAT para vehículo liviano particular (USD). fuente: ANT/SRI 2026.
const SPPAT_BASE_LIVIANO = 47.5;

// Coberturas de ley (USD) — fijas para todo tipo de vehículo. fuente: SPPAT/protecciontransito.gob.ec 2026.
export const COBERTURAS_SPPAT = {
  gastosMedicos: 3000,
  fallecimiento: 5000,
  gastosFunerarios: 400,
  discapacidad: 5000,
  trasladoHeridos: 200,
} as const;

// Tipos de vehículo y su tarifa estimada de la tasa SPPAT (USD/año). fuente: estructura ANT 2026 (estimación).
type TipoVehiculo = 'motocicleta' | 'liviano' | 'camioneta' | 'taxi' | 'bus' | 'pesado';

const TARIFA_POR_TIPO: Record<TipoVehiculo, { valor: number; etiqueta: string }> = {
  motocicleta: { valor: 25.0, etiqueta: 'Motocicleta' },
  liviano: { valor: SPPAT_BASE_LIVIANO, etiqueta: 'Auto / vehículo liviano particular' },
  camioneta: { valor: 52.5, etiqueta: 'Camioneta / SUV' },
  taxi: { valor: 60.0, etiqueta: 'Taxi / transporte comercial liviano' },
  bus: { valor: 95.0, etiqueta: 'Bus / transporte público de pasajeros' },
  pesado: { valor: 80.0, etiqueta: 'Camión / vehículo pesado' },
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
    )}** al año (se paga dentro de la matrícula). A cambio, ante un accidente de tránsito tenés cobertura de hasta **${fmtUSDec(
      COBERTURAS_SPPAT.gastosMedicos,
    )}** en gastos médicos y **${fmtUSDec(
      COBERTURAS_SPPAT.fallecimiento,
    )}** por fallecimiento por víctima. Con esa tasa cubrís hasta ${apalancamientoMedico}× su valor solo en atención médica.`,
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
    )}/año · Médicos ${fmtUSDec(COBERTURAS_SPPAT.gastosMedicos)} · Muerte ${fmtUSDec(
      COBERTURAS_SPPAT.fallecimiento,
    )} · Discapacidad ${fmtUSDec(COBERTURAS_SPPAT.discapacidad)} · Funeral ${fmtUSDec(
      COBERTURAS_SPPAT.gastosFunerarios,
    )} · Traslado ${fmtUSDec(COBERTURAS_SPPAT.trasladoHeridos)}.`,
    _insight,
    _chart,
  };
}
