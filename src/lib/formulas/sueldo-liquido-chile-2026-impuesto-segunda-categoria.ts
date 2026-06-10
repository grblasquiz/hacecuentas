// UF/UTM live desde mindicador.cl (cron diario fetch-chile.mjs), con fallback verificado.
import clLive from "../../data/live/chile.json";
// Tasas y topes 2026 — fuente única (DL 3.500, Ley 18.469, Ley 19.728, Art. 43 N°1 LIR).
import { CHILE_2026 } from "../data/chile-2026";

export interface Inputs {
  sueldo_bruto: number;
  tipo_afp: 'aporte_obligatorio' | 'voluntario_adicional';
  comision_afp: number;
  tipo_salud: 'fonasa' | 'isapre';
  porcentaje_isapre: number;
  num_hijos: number;
}

export interface Outputs {
  aporte_afp: number;
  comision_afp_monto: number;
  aporte_salud: number;
  seguro_cesantia: number;
  impuesto_segunda_categoria: number;
  total_descuentos: number;
  sueldo_liquido: number;
  tasa_descuento_efectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // ── Valores en vivo (mindicador.cl) con fallback al último verificado ──
  const UTM = (clLive as any)?.utm?.valor ?? 71506;   // Unidad Tributaria Mensual (se actualiza el 1.º de cada mes)
  const UF = (clLive as any)?.uf?.valor ?? 40627.62;  // Unidad de Fomento (para topes imponibles)

  // ── Tasas y topes 2026 desde la fuente única ──
  const TASA_AFP = CHILE_2026.afpObligatorio;             // 10% obligatorio (DL 3.500)
  const TASA_FONASA = CHILE_2026.saludFonasa;             // 7% (Ley 18.469)
  const TASA_CESANTIA = CHILE_2026.afcTrabajadorIndefinido; // 0,6% contrato indefinido (Ley 19.728)
  const EXENTO_UTM = CHILE_2026.segundaCategoriaExentoUtm; // 13,5 UTM exentas (Art. 43 N°1 LIR)
  const TOPE_AFP_SALUD = CHILE_2026.topeImponibleAfpUf * UF;     // 90 UF (AFP, comisión y salud)
  const TOPE_CESANTIA = CHILE_2026.topeImponibleCesantiaUf * UF; // 135,2 UF (seguro de cesantía)
  const CREDITO_POR_HIJO_2026 = 12996; // Crédito impuesto por descendiente (Art. 55 bis LIR)

  // Validar inputs
  const sueldoBruto = Math.max(0, i.sueldo_bruto || 0);
  const comisionAFP = Math.max(0.5, Math.min(2.5, i.comision_afp || 1.45)) / 100;
  const numHijos = Math.max(0, Math.floor(i.num_hijos || 0));

  // Bases imponibles topadas (la cotización no se calcula sobre el exceso del tope)
  const baseAfpSalud = Math.min(sueldoBruto, TOPE_AFP_SALUD);
  const baseCesantia = Math.min(sueldoBruto, TOPE_CESANTIA);

  // 1. Aporte AFP (10% obligatorio)
  const aporteAFP = baseAfpSalud * TASA_AFP;

  // 2. Comisión AFP (porcentaje de la remuneración imponible)
  const comisionAFPMonto = baseAfpSalud * comisionAFP;

  // 3. Aporte salud
  let aporteSalud = 0;
  if (i.tipo_salud === 'fonasa') {
    aporteSalud = baseAfpSalud * TASA_FONASA;
  } else if (i.tipo_salud === 'isapre') {
    const porcentajeIsapre = Math.max(6, Math.min(12, i.porcentaje_isapre || 8.5)) / 100;
    aporteSalud = baseAfpSalud * porcentajeIsapre;
  }

  // 4. Seguro cesantía (tope propio de 135,2 UF)
  const seguroCesantia = baseCesantia * TASA_CESANTIA;

  // 5. Base imponible para impuesto de segunda categoría (sin tope: grava la renta líquida completa)
  const baseImponible = sueldoBruto - aporteAFP - comisionAFPMonto - aporteSalud - seguroCesantia;

  // 6. Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR.
  // Tabla mensual progresiva en UTM (factor marginal y rebaja, ambos sobre el valor UTM vigente).
  // Tramos: 13,5 / 30 / 50 / 70 / 90 / 120 / 310 UTM. Tasa máxima 40%.
  // La rebaja en UTM garantiza continuidad entre tramos (impuesto = base·factor − rebaja·UTM).
  const TRAMOS: { hastaUtm: number; factor: number; rebajaUtm: number }[] = [
    { hastaUtm: EXENTO_UTM, factor: 0,     rebajaUtm: 0 },     // hasta 13,5 UTM → exento
    { hastaUtm: 30,         factor: 0.04,  rebajaUtm: 0.54 },
    { hastaUtm: 50,         factor: 0.08,  rebajaUtm: 1.74 },
    { hastaUtm: 70,         factor: 0.135, rebajaUtm: 4.49 },
    { hastaUtm: 90,         factor: 0.23,  rebajaUtm: 11.14 },
    { hastaUtm: 120,        factor: 0.304, rebajaUtm: 17.80 },
    { hastaUtm: 310,        factor: 0.35,  rebajaUtm: 23.32 },
    { hastaUtm: Infinity,   factor: 0.40,  rebajaUtm: 38.82 },
  ];

  const rentaEnUtm = baseImponible / UTM;
  let tasaImpuesto = 0;
  let rebajaUtm = 0;
  for (const tramo of TRAMOS) {
    if (rentaEnUtm <= tramo.hastaUtm) {
      tasaImpuesto = tramo.factor;
      rebajaUtm = tramo.rebajaUtm;
      break;
    }
  }
  const montoImpuestoBase = Math.max(0, baseImponible * tasaImpuesto - rebajaUtm * UTM);

  // Aplicar crédito por hijos
  const creditoHijos = CREDITO_POR_HIJO_2026 * numHijos;
  const impuestoSegundaCategoria = Math.max(0, montoImpuestoBase - creditoHijos);

  // 7. Totales
  const totalDescuentos = aporteAFP + comisionAFPMonto + aporteSalud + seguroCesantia + impuestoSegundaCategoria;
  const sueldoLiquido = sueldoBruto - totalDescuentos;
  const tasaDescuentoEfectiva = sueldoBruto > 0 ? (totalDescuentos / sueldoBruto) * 100 : 0;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const pagaImpuesto = impuestoSegundaCategoria > 0;
  const tone = tasaDescuentoEfectiva >= 25 ? 'warn' : 'neutral';

  const insight = {
    title: 'De tu bruto a tu líquido',
    text: `De un bruto de **${fmt(sueldoBruto)}** te llegan **${fmt(sueldoLiquido)}** a la mano: los descuentos se llevan **${fmt(totalDescuentos)}** (**${tasaDescuentoEfectiva.toFixed(1)}%**). ` +
      (pagaImpuesto
        ? `Pagás **${fmt(impuestoSegundaCategoria)}** de impuesto de 2ª categoría (tasa marginal **${(tasaImpuesto * 100).toLocaleString('es-CL')}%**).`
        : `Tu renta no supera el tramo exento de 13,5 UTM, así que **no pagás impuesto de 2ª categoría**.`),
    tone,
    icon: '🇨🇱',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(sueldoLiquido) },
      { label: 'AFP (10%)', value: Math.round(aporteAFP) },
      { label: 'Comisión AFP', value: Math.round(comisionAFPMonto) },
      { label: 'Salud', value: Math.round(aporteSalud) },
      { label: 'Cesantía (0,6%)', value: Math.round(seguroCesantia) },
      ...(impuestoSegundaCategoria > 0 ? [{ label: 'Impuesto 2ª cat.', value: Math.round(impuestoSegundaCategoria) }] : []),
    ],
    prefix: '$',
    centerValue: fmt(sueldoBruto),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: líquido más descuentos de AFP, comisión, salud, cesantía e impuesto.',
  };

  return {
    aporte_afp: Math.round(aporteAFP),
    comision_afp_monto: Math.round(comisionAFPMonto),
    aporte_salud: Math.round(aporteSalud),
    seguro_cesantia: Math.round(seguroCesantia),
    impuesto_segunda_categoria: Math.round(impuestoSegundaCategoria),
    total_descuentos: Math.round(totalDescuentos),
    sueldo_liquido: Math.round(sueldoLiquido),
    tasa_descuento_efectiva: Math.round(tasaDescuentoEfectiva * 100) / 100,
    _insight: insight,
    _chart: chart
  };
}
