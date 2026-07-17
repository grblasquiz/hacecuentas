export interface Inputs { pesoKg: number; alturaCm: number; edad: number; sexo: string; actividad: string }
export interface Outputs { metabolismoBasal: number; caloriasMantenimiento: number; rangoOrientativo: string; detalle: string; _insight?: any }

const FACTORES: Record<string, number> = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, intenso: 1.725 };
export function compute(i: Inputs): Outputs {
  const peso = Math.max(1, Number(i.pesoKg) || 0), altura = Math.max(1, Number(i.alturaCm) || 0), edad = Math.max(1, Number(i.edad) || 0);
  const basal = 10 * peso + 6.25 * altura - 5 * edad + (i.sexo === 'femenino' ? -161 : 5);
  const mantenimiento = Math.round(basal * (FACTORES[i.actividad] ?? FACTORES.moderado));
  const basalRedondeado = Math.round(basal);
  return {
    metabolismoBasal: basalRedondeado,
    caloriasMantenimiento: mantenimiento,
    rangoOrientativo: `${Math.max(i.sexo === 'femenino' ? 1200 : 1500, mantenimiento - 500)} a ${mantenimiento + 500} kcal/día`,
    detalle: `Metabolismo basal estimado: ${basalRedondeado} kcal/día. Gasto diario estimado: ${mantenimiento} kcal/día.`,
    _insight: { title: `Estimación: ${mantenimiento.toLocaleString('es-CL')} kcal/día`, text: `Es una referencia de gasto energético diario según peso, altura, edad y actividad. No reemplaza una evaluación nutricional individual.`, tone: 'neutral', icon: '🥗' },
  };
}
