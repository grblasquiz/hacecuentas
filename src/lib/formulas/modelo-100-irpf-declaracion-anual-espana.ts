export interface Inputs {
  salario_bruto: number;
  retenciones_irpf: number;
  dividendos_acciones: number;
  intereses_capital: number;
  alquiler_renta: number;
  deduccion_vivienda: number;
  deduccion_donativo: number;
  deduccion_plan_pensiones: number;
  deduccion_maternidad: number;
  ccaa_diferenciada: string;
}

export interface Outputs {
  base_imponible_general: number;
  base_imponible_ahorro: number;
  cuota_estatal_general: number;
  cuota_estatal_ahorro: number;
  cuota_autonomo_general: number;
  cuota_autonomo_ahorro: number;
  cuota_liquida_antes_retenciones: number;
  retenciones_total: number;
  resultado_declaracion: number;
  tipo_efectivo: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España — AEAT
  const COTIZACION_SS = 0.0635; // 6,35% cotización empleado
  const INTEGRACION_DIVIDENDOS = 0.40; // Sociedades españolas
  const TIPO_AHORRO_ESTATAL = 0.19; // 19% ahorro estatal
  const DEDUCCION_VIVIENDA_MAX = 1500; // €
  const DEDUCCION_PLAN_PENSIONES_MAX = 8000; // €
  const DEDUCCION_MATERNIDAD_MAX = 1200; // €

  // Cotización SS sobre salario (empleado cuenta ajena)
  const cotizacion_ss = i.salario_bruto * COTIZACION_SS;

  // Deducciones limitadas
  const ded_vivienda = Math.min(i.deduccion_vivienda, DEDUCCION_VIVIENDA_MAX);
  const ded_plan = Math.min(i.deduccion_plan_pensiones, DEDUCCION_PLAN_PENSIONES_MAX);
  const ded_maternidad = Math.min(i.deduccion_maternidad, DEDUCCION_MATERNIDAD_MAX);

  // Base imponible general
  // Salario - SS + Rendimientos netos (alquiler) - Deducciones
  const base_general =
    i.salario_bruto -
    cotizacion_ss +
    i.alquiler_renta -
    ded_vivienda -
    ded_plan -
    i.deduccion_donativo;

  // Base imponible ahorro (dividendos integración 40% + intereses)
  const dividendos_integrados = i.dividendos_acciones * INTEGRACION_DIVIDENDOS;
  const base_ahorro = dividendos_integrados + i.intereses_capital;

  // Función auxiliar: tramos IRPF estatales 2026
  function cuotaEscalonada(base: number): number {
    const tramos = [
      { limite: 21000, tasa: 0.19 },
      { limite: 45000, tasa: 0.21 },
      { limite: 100000, tasa: 0.25 },
      { limite: 200000, tasa: 0.30 },
      { limite: Infinity, tasa: 0.45 },
    ];
    let cuota = 0;
    let base_anterior = 0;
    for (const tramo of tramos) {
      if (base > base_anterior) {
        const base_tramo = Math.min(base, tramo.limite) - base_anterior;
        cuota += base_tramo * tramo.tasa;
        base_anterior = tramo.limite;
      }
      if (base <= tramo.limite) break;
    }
    return cuota;
  }

  // Cuota estatal general (tramos escalonados)
  const cuota_estatal_general = base_general > 0 ? cuotaEscalonada(base_general) : 0;

  // Cuota estatal ahorro (19% fijo)
  const cuota_estatal_ahorro = base_ahorro > 0 ? base_ahorro * TIPO_AHORRO_ESTATAL : 0;

  // Cuota autonómica (según CCAA)
  let cuota_autonomo_general = 0;
  let cuota_autonomo_ahorro = 0;

  const TASA_AUTONOMO_GENERAL = { madrid: 0.01, baleares: 0.01, asturias: 0.01, otras: 0 };
  const TASA_AUTONOMO_AHORRO = { madrid: 0, baleares: 0, asturias: 0, otras: 0 };

  const ccaa_key = i.ccaa_diferenciada === "madrid" ? "madrid" :
                    i.ccaa_diferenciada === "baleares" ? "baleares" :
                    i.ccaa_diferenciada === "asturias" ? "asturias" :
                    i.ccaa_diferenciada === "estatal" ? "estatal" : "otras";

  if (ccaa_key !== "estatal" && ccaa_key !== "euskadi" && ccaa_key !== "navarra") {
    const tasa_general = TASA_AUTONOMO_GENERAL[ccaa_key as keyof typeof TASA_AUTONOMO_GENERAL] || 0;
    const tasa_ahorro = TASA_AUTONOMO_AHORRO[ccaa_key as keyof typeof TASA_AUTONOMO_AHORRO] || 0;
    cuota_autonomo_general = base_general > 0 ? base_general * tasa_general : 0;
    cuota_autonomo_ahorro = base_ahorro > 0 ? base_ahorro * tasa_ahorro : 0;
  }
  // Euskadi y Navarra: sistema diferente, no aplicar aquí

  // Cuota líquida antes de retenciones
  const cuota_liquida_antes = cuota_estatal_general + cuota_autonomo_general + cuota_estatal_ahorro + cuota_autonomo_ahorro - ded_maternidad;

  // Retenciones totales
  // Retenciones nómina (input) + estimación retención dividendos/intereses 19%
  const retenciones_capital = (dividendos_integrados + i.intereses_capital) * TIPO_AHORRO_ESTATAL;
  const retenciones_total = i.retenciones_irpf + retenciones_capital;

  // Resultado: positivo = a devolver (AEAT), negativo = a pagar
  const resultado = cuota_liquida_antes - retenciones_total;

  // Tipo efectivo
  const base_total = base_general + base_ahorro;
  const tipo_efectivo = base_total > 0 ? (cuota_liquida_antes / base_total) * 100 : 0;

  return {
    base_imponible_general: Math.max(0, base_general),
    base_imponible_ahorro: Math.max(0, base_ahorro),
    cuota_estatal_general,
    cuota_estatal_ahorro,
    cuota_autonomo_general,
    cuota_autonomo_ahorro,
    cuota_liquida_antes_retenciones: Math.max(0, cuota_liquida_antes),
    retenciones_total,
    resultado_declaracion: resultado,
    tipo_efectivo,
  };
}
