export interface Inputs {
  aporte_mensual: number;
  ingresos_brutos_anuales: number;
  marginal_renta: number;
  plazo_anos: number;
  rentabilidad_anual: number;
  tipo_aportante: 'asalariado' | 'independiente' | 'pensionado';
}

export interface Outputs {
  aporte_anual: number;
  tope_deduccion_uvt: number;
  tope_deduccion_pesos: number;
  porcentaje_ingresos: number;
  deduccion_permitida: number;
  ahorro_irpf_anual: number;
  capital_acumulado: number;
  capital_sin_rentabilidad: number;
  ganancia_rendimientos: number;
  observacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026
  const UVT_2026 = 52630; // DIAN enero 2026
  const TOPE_DEDUCCION_UVT = 3800;
  const TOPE_DEDUCCION_PESOS = TOPE_DEDUCCION_UVT * UVT_2026; // ~199.994.000
  const LIMITE_PORCENTAJE_INGRESOS = 0.30; // 30% ingresos brutos
  const LIMITE_ASALARIADO = 0.25; // 25% para asalariados en pago
  const LIMITE_PENSIONADO = 0.50; // 50% pensión para pensionados

  // Cálculos previos
  const aporte_anual = i.aporte_mensual * 12;
  const porcentaje_ingresos = (aporte_anual / i.ingresos_brutos_anuales) * 100;

  // Determinación de límite según tipo aportante
  let limite_permitido = LIMITE_PORCENTAJE_INGRESOS * i.ingresos_brutos_anuales;

  if (i.tipo_aportante === 'asalariado') {
    limite_permitido = Math.min(
      LIMITE_ASALARIADO * i.ingresos_brutos_anuales,
      TOPE_DEDUCCION_PESOS
    );
  } else if (i.tipo_aportante === 'pensionado') {
    // Para pensionado, asumimos ingresos_brutos_anuales = pensión actual
    limite_permitido = Math.min(
      LIMITE_PENSIONADO * i.ingresos_brutos_anuales,
      TOPE_DEDUCCION_PESOS
    );
  } else if (i.tipo_aportante === 'independiente') {
    limite_permitido = Math.min(
      LIMITE_PORCENTAJE_INGRESOS * i.ingresos_brutos_anuales,
      TOPE_DEDUCCION_PESOS
    );
  }

  // Deducción permitida: mínimo entre aporte y límite
  const deduccion_permitida = Math.min(aporte_anual, limite_permitido);

  // Ahorro IRPF anual
  const ahorro_irpf_anual = deduccion_permitida * i.marginal_renta;

  // Capital acumulado con rentabilidad (valor futuro renta fija anticipada)
  // FV = PMT × ((1 + r)^n - 1) / r
  const r = i.rentabilidad_anual;
  const n = i.plazo_anos;
  const factor_vf = ((Math.pow(1 + r, n) - 1) / r);
  const capital_acumulado = aporte_anual * factor_vf;

  // Capital sin rentabilidad (solo aportes puros)
  const capital_sin_rentabilidad = aporte_anual * n;

  // Ganancia por rendimientos
  const ganancia_rendimientos = capital_acumulado - capital_sin_rentabilidad;

  // Observación normativa
  let observacion = '';

  if (porcentaje_ingresos > 30) {
    observacion = `⚠️ Aporte excede 30% ingresos brutos. Solo se deducen $${deduccion_permitida.toLocaleString('es-CO', {maximumFractionDigits: 0})}.`;
  } else if (deduccion_permitida < aporte_anual && i.tipo_aportante === 'asalariado') {
    observacion = `⚠️ Como asalariado, límite es 25% ingresos (no 30%). Deducción actual $${deduccion_permitida.toLocaleString('es-CO', {maximumFractionDigits: 0})}.`;
  } else if (deduccion_permitida === TOPE_DEDUCCION_PESOS) {
    observacion = `✓ Deducción alcanza tope máximo UVT 2026: $${TOPE_DEDUCCION_PESOS.toLocaleString('es-CO', {maximumFractionDigits: 0})}.`;
  } else {
    observacion = `✓ Deducción permitida dentro de límites normativos DIAN 2026.`;
  }

  if (i.tipo_aportante === 'pensionado') {
    observacion += ' (Pensionado: máx. 50% pensión actual, sin tope UVT especial).\n';
  }

  // Advertencia retiro anticipado
  observacion += '\n⚠️ Retiro antes de 62 años: sanción DIAN 5–10% + tributación ordinaria.';

  return {
    aporte_anual: Math.round(aporte_anual),
    tope_deduccion_uvt: TOPE_DEDUCCION_UVT,
    tope_deduccion_pesos: Math.round(TOPE_DEDUCCION_PESOS),
    porcentaje_ingresos: Math.round(porcentaje_ingresos * 100) / 100,
    deduccion_permitida: Math.round(deduccion_permitida),
    ahorro_irpf_anual: Math.round(ahorro_irpf_anual),
    capital_acumulado: Math.round(capital_acumulado),
    capital_sin_rentabilidad: Math.round(capital_sin_rentabilidad),
    ganancia_rendimientos: Math.round(ganancia_rendimientos),
    observacion: observacion
  };
}
