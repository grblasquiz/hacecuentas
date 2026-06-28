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
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).incluir_bono = (i as any).incluir_bono === true || (i as any).incluir_bono === 'true';
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

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const brechaMonto = Math.round(monto_equivalente_ocde - monto_total_cobrar);

  const _insight = {
    title: 'Tu permiso vs. el promedio OCDE',
    text: `Cobrás **${fmtCLP(monto_total_cobrar)}** por los **5 días** de permiso. Con el promedio OCDE (**${PROMEDIO_OCDE_DIAS} días**) recibirías **${fmtCLP(Math.round(monto_equivalente_ocde))}**: una brecha de **${fmtCLP(brechaMonto)}** por los ${dias_diferencia_ocde} días que Chile no contempla.`,
    tone: 'warn',
    icon: '👶',
  };

  return {
    dias_permiso: DIAS_PERMISO_PATERNIDAD,
    monto_total_cobrar: Math.round(monto_total_cobrar),
    salario_diario_efectivo: Math.round(salario_diario_efectivo),
    comparativa_ocde,
    dias_diferencia_ocde,
    monto_equivalente_ocde: Math.round(monto_equivalente_ocde),
    _insight
  };
}
