/** Dosis ibuprofeno pediátrico */
export interface Inputs { peso: number; edad: number; }
export interface Outputs { dosisMg: string; jarabe2: string; jarabe4: string; maximoDiario: string; intervalo: string; alerta: string; }

export function dosisIbuprofenoPediatrico(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const edadMeses = Number(i.edad);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso del niño');
  if (edadMeses < 6) throw new Error('Ibuprofeno contraindicado en menores de 6 meses');

  // 5-10 mg/kg per dose
  const dosisMin = Math.round(peso * 5);
  const dosisMax = Math.round(peso * 10);
  const dosisTipica = Math.round(peso * 7.5);

  // Max daily: 40 mg/kg
  const maxDiarioMg = Math.round(peso * 40);
  const maxTomasDia = 3;

  // Jarabe 2% = 20 mg/ml
  const mlMin2 = (dosisMin / 20).toFixed(1);
  const mlMax2 = (dosisMax / 20).toFixed(1);
  // Jarabe 4% = 40 mg/ml
  const mlMin4 = (dosisMin / 40).toFixed(1);
  const mlMax4 = (dosisMax / 40).toFixed(1);

  let alerta = '';
  if (peso < 7) alerta = '⚠️ Peso muy bajo. Verificar dosis con pediatra.';
  if (edadMeses < 12) alerta = '⚠️ Menor de 1 año: usar con precaución y solo si el pediatra lo indicó.';

  return {
    dosisMg: `${dosisMin}-${dosisMax} mg (típica: ${dosisTipica} mg)`,
    jarabe2: `${mlMin2}-${mlMax2} ml (jarabe 20 mg/ml)`,
    jarabe4: `${mlMin4}-${mlMax4} ml (jarabe 40 mg/ml)`,
    maximoDiario: `${maxDiarioMg} mg/día (máx ${maxTomasDia}-4 tomas)`,
    intervalo: 'Cada 6-8 horas',
    alerta: alerta || '✅ Verificá siempre la concentración del jarabe antes de dar la dosis.'
  };
}