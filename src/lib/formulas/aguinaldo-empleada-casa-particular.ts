/**
 * Calculadora de Aguinaldo (SAC) — Empleada de Casas Particulares
 * Ley 26.844 Art. 39 — Régimen Especial de Personal de Casas Particulares.
 *
 * Régimen idéntico al LCT (Ley 23.041):
 *   SAC = (mejor sueldo del semestre / 2) × (meses trabajados / 6)
 *
 * Particularidades:
 *   - La base es el sueldo mensual según categoría UPACP del CCT 56/75.
 *   - Cuotas: 1ra cuota al 30/6 (semestre ene-jun), 2da cuota al 31/12
 *     (semestre jul-dic).
 *   - Plazo de pago: hasta el último día hábil de junio y diciembre.
 *   - Se devenga aun para trabajadoras por hora o jornada parcial.
 */

export interface AguinaldoEmpleadaInputs {
  sueldoMensual: number; // mejor remuneración mensual del semestre
  mesesTrabajados: number; // 1-6
  categoria:
    | '1-supervision'
    | '2-cuidado-personas'
    | '3-caseros'
    | '4-tareas-especificas'
    | '5-tareas-generales';
}

export interface AguinaldoEmpleadaOutputs {
  aguinaldoCuota: number;
  mejorSueldoBase: number;
  mensaje: string;
  _insight?: any;
}

const CATEGORIA_LABELS: Record<string, string> = {
  '1-supervision': 'Primera (supervisión / gobernanta / mayordomo)',
  '2-cuidado-personas': 'Segunda (cuidado de personas: niños, adultos mayores, enfermos)',
  '3-caseros': 'Tercera (caseros con vivienda en la propiedad)',
  '4-tareas-especificas': 'Cuarta (tareas específicas — cocineros/as)',
  '5-tareas-generales': 'Quinta (tareas generales: limpieza, lavado, planchado, cocina común)',
};

export function aguinaldoEmpleadaCasaParticular(
  inputs: AguinaldoEmpleadaInputs
): AguinaldoEmpleadaOutputs {
  const sueldo = Number(inputs.sueldoMensual);
  const meses = Math.max(1, Math.min(6, Number(inputs.mesesTrabajados) || 6));
  const cat = inputs.categoria || '5-tareas-generales';

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el mejor sueldo mensual del semestre.');
  }

  // Art. 39 Ley 26.844 — fórmula idéntica al SAC LCT (Ley 23.041)
  const aguinaldoCuota = (sueldo / 2) * (meses / 6);
  const mejorSueldoBase = sueldo;

  const label = CATEGORIA_LABELS[cat] || cat;
  const mensaje =
    `Aguinaldo (SAC) según Art. 39 Ley 26.844 para categoría ${label}. ` +
    `Base: mejor remuneración mensual del semestre = $${Math.round(sueldo).toLocaleString('es-AR')}. ` +
    `Si trabajó los 6 meses completos, corresponde medio sueldo (1ra cuota al 30/6 o 2da al 31/12).`;

  const cuotaR = Math.round(aguinaldoCuota);
  const completo = meses >= 6;
  const _insight = {
    title: completo ? 'Medio sueldo de aguinaldo' : 'Aguinaldo proporcional',
    text: completo
      ? `Le corresponde **$${cuotaR.toLocaleString('es-AR')}**, equivalente a **medio mejor sueldo** del semestre. Se paga hasta el último día hábil de junio (1ra cuota) o de diciembre (2da cuota); pagarlo fuera de plazo genera intereses y multas.`
      : `Por trabajar **${meses} de 6 meses** del semestre, el aguinaldo proporcional es **$${cuotaR.toLocaleString('es-AR')}** (no medio sueldo completo). Aun la jornada parcial o por horas devenga SAC proporcional según el Art. 39.`,
    tone: 'neutral',
    icon: '💵',
  };

  return {
    aguinaldoCuota: cuotaR,
    mejorSueldoBase: Math.round(mejorSueldoBase),
    mensaje,
    _insight,
  };
}
