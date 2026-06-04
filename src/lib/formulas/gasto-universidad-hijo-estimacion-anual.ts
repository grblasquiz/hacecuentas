export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Estimación del gasto anual en educación universitaria de un hijo/a en Argentina.
 *
 * Metodología:
 * 1. Cuota mensual de universidad (0 si es pública) × meses cursados (10)
 * 2. Matrícula o derecho de inscripción (una vez por año)
 * 3. Libros, apuntes y materiales (monto anual estimado)
 * 4. Transporte (mensual × 10 meses de cursado)
 * 5. Comida fuera de casa o en el campus (mensual × 10)
 * 6. Tecnología/equipamiento (prorrateo anual de notebook, software, etc.)
 * 7. Vivienda (solo si el estudiante se muda; mensual × 12)
 * 8. Varios / vida estudiantil (fotocopias, eventos, salidas, cuotas centros estudiantiles)
 *
 * Total bruto = suma de todos los rubros.
 * Total neto  = max(0, Total bruto − beca_mensual × 12)
 *
 * Referencias:
 * - Ley 27.204 — gratuidad e ingreso irrestricto en universidades nacionales.
 * - iProfesional / El Cronista: ranking cuotas privadas 2026 (UdeSA $1.754.800, UTDT $1.5M, UADE $392.643).
 * - ANSES: Beca Progresar 2026 hasta $105.000/mes.
 * - INDEC CBT mayo 2026: familia tipo $1.469.768/mes.
 */
export function gastoUniversidadHijoEstimacionAnual(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');

  // --- Inputs ---
  const cuota       = Number(i.cuota_mensual)      || 0;   // ARS/mes (0 = pública)
  const matricula   = Number(i.matricula_anual)    || 0;   // ARS/año
  const materiales  = Number(i.materiales_anuales) || 0;   // ARS/año (libros, apuntes, insumos)
  const transporte  = Number(i.transporte_mensual) || 0;   // ARS/mes
  const comida      = Number(i.comida_mensual)     || 0;   // ARS/mes
  const tecnologia  = Number(i.tecnologia_anual)   || 0;   // ARS/año (notebook, software)
  const vivienda    = Number(i.vivienda_mensual)   || 0;   // ARS/mes (0 si vive en casa)
  const varios      = Number(i.varios_mensual)     || 0;   // ARS/mes (fotocopias, eventos, etc.)
  const beca        = Number(i.beca_mensual)        || 0;   // ARS/mes (Progresar u otra)

  // Meses de cursado (10 para semestres típicos argentinos, vivienda se paga 12)
  const MESES_CURSADO  = 10;
  const MESES_VIVIENDA = 12;

  // --- Cálculo por rubro ---
  const totalCuotas      = cuota     * MESES_CURSADO;
  const totalTransporte  = transporte * MESES_CURSADO;
  const totalComida      = comida     * MESES_CURSADO;
  const totalVarios      = varios     * MESES_CURSADO;
  const totalVivienda    = vivienda   * MESES_VIVIENDA;

  const totalBruto = totalCuotas + matricula + materiales + totalTransporte +
                     totalComida + tecnologia + totalVivienda + totalVarios;

  // Becas: se descuentan del total (hasta 0)
  const totalBeca  = beca * 12;
  const totalNeto  = Math.max(0, totalBruto - totalBeca);

  // --- Costo mensual efectivo ---
  const costoMensualEfectivo = totalNeto / 12;

  // --- Porcentaje por rubro (sobre bruto) ---
  const pctCuotas     = totalBruto > 0 ? (totalCuotas    / totalBruto) * 100 : 0;
  const pctVivienda   = totalBruto > 0 ? (totalVivienda  / totalBruto) * 100 : 0;
  const pctComida     = totalBruto > 0 ? (totalComida    / totalBruto) * 100 : 0;
  const pctTransporte = totalBruto > 0 ? (totalTransporte / totalBruto) * 100 : 0;

  // Formato con separador de miles
  function fmt(n: number): string {
    return Math.round(n).toLocaleString('es-AR');
  }

  // --- Insight adaptativo ---
  let insightText: string;
  let insightTone: string;

  if (__lang === 'en') {
    if (totalBruto === 0) {
      insightText = 'Enter your estimated expenses to get the annual total.';
      insightTone = 'neutral';
    } else if (cuota === 0) {
      insightText = `At a **public university** the biggest costs are ${pctVivienda > pctComida ? 'housing' : 'food'} and transportation. Annual gross: **ARS ${fmt(totalBruto)}**${totalBeca > 0 ? ` — after scholarship: **ARS ${fmt(totalNeto)}**` : ''}.`;
      insightTone = 'positive';
    } else {
      const bigger = pctCuotas > 50 ? 'tuition' : pctVivienda > 30 ? 'housing' : 'daily expenses';
      insightText = `The main cost driver is **${bigger}** (${pctCuotas.toFixed(0)}% of total). Annual gross: **ARS ${fmt(totalBruto)}**${totalBeca > 0 ? ` — after scholarship: **ARS ${fmt(totalNeto)}**` : ''}.`;
      insightTone = 'warning';
    }
  } else {
    if (totalBruto === 0) {
      insightText = 'Ingresá los montos para obtener la estimación anual.';
      insightTone = 'neutral';
    } else if (cuota === 0) {
      insightText = `En **universidad pública** el mayor gasto es ${pctVivienda > pctComida ? 'la vivienda' : 'la comida'} y el transporte. Total anual bruto: **$${fmt(totalBruto)}**${totalBeca > 0 ? ` — neto tras beca: **$${fmt(totalNeto)}**` : ''}.`;
      insightTone = 'positive';
    } else {
      const mayorRubro = pctCuotas > 50 ? 'la cuota universitaria' : pctVivienda > 30 ? 'la vivienda' : 'los gastos cotidianos';
      insightText = `El mayor rubro es **${mayorRubro}** (${pctCuotas.toFixed(0)}% del total). Total anual bruto: **$${fmt(totalBruto)}**${totalBeca > 0 ? ` — neto tras beca: **$${fmt(totalNeto)}**` : ''}.`;
      insightTone = 'warning';
    }
  }

  const _insight = {
    title: __lang === 'en' ? 'Annual university cost' : 'Costo universitario anual',
    text: insightText,
    tone: insightTone,
    icon: '🎓',
  };

  if (__lang === 'en') {
    return {
      total_bruto:          `ARS ${fmt(totalBruto)}`,
      total_neto:           `ARS ${fmt(totalNeto)}`,
      costo_mensual:        `ARS ${fmt(costoMensualEfectivo)}/month`,
      desglose_cuotas:      `ARS ${fmt(totalCuotas)}`,
      desglose_vivienda:    `ARS ${fmt(totalVivienda)}`,
      desglose_cotidianos:  `ARS ${fmt(totalComida + totalTransporte + totalVarios)}`,
      _insight,
    };
  }

  return {
    total_bruto:          `$ ${fmt(totalBruto)}`,
    total_neto:           `$ ${fmt(totalNeto)}`,
    costo_mensual:        `$ ${fmt(costoMensualEfectivo)}/mes`,
    desglose_cuotas:      `$ ${fmt(totalCuotas)}`,
    desglose_vivienda:    `$ ${fmt(totalVivienda)}`,
    desglose_cotidianos:  `$ ${fmt(totalComida + totalTransporte + totalVarios)}`,
    _insight,
  };
}
