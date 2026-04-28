export interface Inputs {
  salario_diario: number;
  fecha_nacimiento: string;
  incluir_bono: boolean;
  monto_bono_mensual?: number;
}

export interface Outputs {
  dias_permiso: number;
  monto_total_cobrar: number;
  salario_diario_efectivo: number;
  comparativa_ocde: string;
  dias_diferencia_ocde: number;
  monto_equivalente_ocde: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile — Art. 195 Código del Trabajo
  const DIAS_PERMISO_PATERNIDAD = 5; // Fijo, irrenunciable
  const PROMEDIO_OCDE_DIAS = 12; // Referencia comparativa OCDE 2025

  // Validación de entrada
  const salario_diario = Math.max(0, i.salario_diario || 0);
  const monto_bono = i.incluir_bono && i.monto_bono_mensual ? Math.max(0, i.monto_bono_mensual) : 0;

  // Cálculo salario diario efectivo
  // Si hay bono, se prorratea a diario (÷30 días estándar)
  const salario_diario_bono = monto_bono / 30;
  const salario_diario_efectivo = salario_diario + salario_diario_bono;

  // Monto total a cobrar bruto (empresa paga completo)
  const monto_total_cobrar = salario_diario_efectivo * DIAS_PERMISO_PATERNIDAD;

  // Comparativa OCDE
  const dias_diferencia_ocde = Math.max(0, PROMEDIO_OCDE_DIAS - DIAS_PERMISO_PATERNIDAD);
  const monto_equivalente_ocde = salario_diario_efectivo * PROMEDIO_OCDE_DIAS;

  // Texto comparativo
  let comparativa_ocde = "Chile: 5 días (bajo en OCDE)";
  if (dias_diferencia_ocde > 0) {
    comparativa_ocde = `Chile 5 días, ${dias_diferencia_ocde} días por debajo de promedio OCDE (${PROMEDIO_OCDE_DIAS} días)`;
  }

  return {
    dias_permiso: DIAS_PERMISO_PATERNIDAD,
    monto_total_cobrar: Math.round(monto_total_cobrar),
    salario_diario_efectivo: Math.round(salario_diario_efectivo),
    comparativa_ocde,
    dias_diferencia_ocde,
    monto_equivalente_ocde: Math.round(monto_equivalente_ocde)
  };
}
