/**
 * Costo de vida mensual en Ecuador 2026 (DOLARIZADO, US$).
 *
 * Estima el presupuesto mensual de un hogar según ciudad, tamaño del hogar y rubros.
 * Ancla oficial: Canasta Familiar Básica del INEC (hogar tipo de 4 personas), marzo 2026.
 *   Nacional $829,38 · Cuenca $876,38 · Quito $853,64 · Guayaquil $838,26 · ...
 *   Fuente: INEC https://www.ecuadorencifras.gob.ec/canasta/ (datos en src/lib/data/ecuador-2026.ts).
 *
 * Método:
 *   1) Se parte de la canasta básica de la ciudad elegida (presupuesto de un hogar de 4).
 *   2) Se reparte en rubros con la estructura típica de gasto urbano ecuatoriano
 *      (alimentación, arriendo, servicios, transporte y otros) — pesos basados en la
 *      composición de la canasta INEC (alimentos ~40%, vivienda ~25-30%, etc.).
 *   3) Cada rubro se escala según el tamaño del hogar con multiplicadores de equivalencia
 *      (no lineales: economías de escala — la vivienda casi no cambia, la comida sí).
 *   4) El usuario puede sobrescribir cualquier rubro con su valor real.
 */
import { COSTO_VIDA_EC_2026, ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

type CiudadKey = keyof typeof COSTO_VIDA_EC_2026.ciudades;
type HogarKey = 'soltero' | 'pareja' | 'familia3' | 'familia4' | 'familia5';

export interface Inputs {
  ciudad?: string;          // clave de ciudad (default 'nacional')
  tipoHogar?: string;       // soltero | pareja | familia3 | familia4 | familia5 (default 'soltero')
  // Overrides opcionales por rubro (US$/mes). Si se deja vacío, se usa la estimación.
  arriendo?: number;
  alimentacion?: number;
  servicios?: number;       // luz, agua, gas, internet, teléfono
  transporte?: number;
  otros?: number;           // salud, educación, ropa, recreación, etc.
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Pesos del presupuesto sobre la canasta de un hogar de 4 personas (suman 1).
// Basados en la composición de la Canasta Familiar Básica del INEC (alimentos ~38-40%,
// vivienda/arriendo ~26%, servicios básicos ~9%, transporte ~8%, otros ~17%).
const PESOS_RUBRO = {
  alimentacion: 0.39,
  arriendo: 0.26,
  servicios: 0.10,
  transporte: 0.08,
  otros: 0.17,
} as const;

// Multiplicadores de equivalencia por rubro y tamaño de hogar, relativos al hogar de 4.
// Capturan economías de escala: la vivienda escala poco, la comida casi lineal.
// fuente: estimación propia con escala de equivalencia OCDE-modificada adaptada a rubros.
const ESCALA: Record<HogarKey, { personas: number; alimentacion: number; arriendo: number; servicios: number; transporte: number; otros: number }> = {
  soltero:  { personas: 1, alimentacion: 0.30, arriendo: 0.55, servicios: 0.55, transporte: 0.45, otros: 0.40 },
  pareja:   { personas: 2, alimentacion: 0.58, arriendo: 0.80, servicios: 0.75, transporte: 0.70, otros: 0.65 },
  familia3: { personas: 3, alimentacion: 0.80, arriendo: 0.92, servicios: 0.90, transporte: 0.88, otros: 0.85 },
  familia4: { personas: 4, alimentacion: 1.00, arriendo: 1.00, servicios: 1.00, transporte: 1.00, otros: 1.00 },
  familia5: { personas: 5, alimentacion: 1.18, arriendo: 1.08, servicios: 1.08, transporte: 1.12, otros: 1.15 },
};

const RUBRO_LABEL: Record<keyof typeof PESOS_RUBRO, string> = {
  alimentacion: 'Alimentación',
  arriendo: 'Arriendo / vivienda',
  servicios: 'Servicios (luz, agua, gas, internet)',
  transporte: 'Transporte',
  otros: 'Otros (salud, educación, ropa, ocio)',
};

/** '' / null / undefined → undefined (no override). Number('')=0 rompería el cálculo. */
function override(v: number | string | undefined | null): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function compute(i: Inputs): Outputs {
  const ciudadKey = (i.ciudad && i.ciudad in COSTO_VIDA_EC_2026.ciudades ? i.ciudad : 'nacional') as CiudadKey;
  const hogarKey = (i.tipoHogar && i.tipoHogar in ESCALA ? i.tipoHogar : 'soltero') as HogarKey;

  const ciudad = COSTO_VIDA_EC_2026.ciudades[ciudadKey];
  const esc = ESCALA[hogarKey];
  const canasta = ciudad.canasta; // presupuesto base hogar de 4 en esa ciudad

  // Estimación por rubro = canasta × peso × escala del hogar.
  const estimado = {
    alimentacion: canasta * PESOS_RUBRO.alimentacion * esc.alimentacion,
    arriendo:     canasta * PESOS_RUBRO.arriendo * esc.arriendo,
    servicios:    canasta * PESOS_RUBRO.servicios * esc.servicios,
    transporte:   canasta * PESOS_RUBRO.transporte * esc.transporte,
    otros:        canasta * PESOS_RUBRO.otros * esc.otros,
  };

  // Aplicar overrides del usuario donde existan.
  const rubros = {
    alimentacion: override(i.alimentacion) ?? estimado.alimentacion,
    arriendo:     override(i.arriendo) ?? estimado.arriendo,
    servicios:    override(i.servicios) ?? estimado.servicios,
    transporte:   override(i.transporte) ?? estimado.transporte,
    otros:        override(i.otros) ?? estimado.otros,
  };

  const total = rubros.alimentacion + rubros.arriendo + rubros.servicios + rubros.transporte + rubros.otros;
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('No se pudo estimar el presupuesto. Elegí una ciudad y un tipo de hogar.');
  }
  const totalAnual = total * 12;
  const porPersona = total / esc.personas;

  // Comparación con el SBU y con la canasta de referencia.
  const sbu = ECUADOR_2026.sbu; // SBU 2026 ($482) — fuente única, Ministerio del Trabajo
  const sueldosNecesarios = total / sbu;

  const _insight = {
    title: `Presupuesto mensual en ${ciudad.label}`,
    text: `Un hogar de **${esc.personas} ${esc.personas === 1 ? 'persona' : 'personas'}** en **${ciudad.label}** necesita alrededor de **${fmtUSDec(total)}** al mes (**${fmtUSDec(totalAnual)}** al año), unos **${fmtUSDec(porPersona)}** por persona. Eso equivale a **${sueldosNecesarios.toFixed(1)} salarios básicos** (${fmtUSDec(sbu)} c/u). La canasta familiar básica del INEC para esta ciudad es de ${fmtUSDec(canasta)} (hogar de 4).`,
    tone: total > sbu * 1.6 ? 'warning' : 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Arriendo / vivienda', value: Math.round(rubros.arriendo * 100) / 100 },
      { label: 'Alimentación', value: Math.round(rubros.alimentacion * 100) / 100 },
      { label: 'Servicios', value: Math.round(rubros.servicios * 100) / 100 },
      { label: 'Transporte', value: Math.round(rubros.transporte * 100) / 100 },
      { label: 'Otros', value: Math.round(rubros.otros * 100) / 100 },
    ],
    label: fmtUSDec(total),
    ariaLabel: `Presupuesto mensual de ${fmtUSDec(total)} repartido en arriendo ${fmtUSDec(rubros.arriendo)}, alimentación ${fmtUSDec(rubros.alimentacion)}, servicios ${fmtUSDec(rubros.servicios)}, transporte ${fmtUSDec(rubros.transporte)} y otros ${fmtUSDec(rubros.otros)}.`,
  };

  return {
    presupuestoTotal: fmtUSDec(total),
    presupuestoAnual: fmtUSDec(totalAnual),
    porPersona: fmtUSDec(porPersona),
    arriendo: fmtUSDec(rubros.arriendo),
    alimentacion: fmtUSDec(rubros.alimentacion),
    servicios: fmtUSDec(rubros.servicios),
    transporte: fmtUSDec(rubros.transporte),
    otros: fmtUSDec(rubros.otros),
    sueldosBasicos: sueldosNecesarios.toFixed(1) + ' SBU',
    detalle: `${ciudad.label} · hogar de ${esc.personas}: ${RUBRO_LABEL.arriendo} ${fmtUSDec(rubros.arriendo)} + ${RUBRO_LABEL.alimentacion} ${fmtUSDec(rubros.alimentacion)} + ${RUBRO_LABEL.servicios} ${fmtUSDec(rubros.servicios)} + ${RUBRO_LABEL.transporte} ${fmtUSDec(rubros.transporte)} + ${RUBRO_LABEL.otros} ${fmtUSDec(rubros.otros)} = ${fmtUSDec(total)}/mes.`,
    _insight,
    _chart,
  };
}
