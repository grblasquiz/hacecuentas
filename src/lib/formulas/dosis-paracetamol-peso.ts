/** Dosis de paracetamol por peso */
export interface Inputs { peso: number; edad: number; }
export interface Outputs { dosisPorToma: string; maximoDiario: string; intervalo: string; comprimidos: string; alerta: string; }

export function dosisParacetamolPeso(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const edad = Number(i.edad);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  const esNino = edad < 12;
  const esAdultoMayor = edad >= 65;

  // 10-15 mg/kg per dose
  const dosisMin = Math.round(peso * 10);
  const dosisMax = Math.round(peso * 15);

  // Max daily
  let maxDiarioMg: number;
  if (esNino) {
    maxDiarioMg = Math.min(Math.round(peso * 75), 2000);
  } else if (esAdultoMayor) {
    maxDiarioMg = Math.min(3000, Math.round(peso * 60));
  } else {
    maxDiarioMg = Math.min(4000, Math.round(peso * 60));
  }

  // Cap single dose for adults
  const dosisMaxCap = esNino ? dosisMax : Math.min(dosisMax, 1000);
  const dosisMinCap = esNino ? dosisMin : Math.min(dosisMin, 500);

  const compPorToma500 = (dosisMaxCap / 500).toFixed(1);
  const maxCompDia = Math.floor(maxDiarioMg / 500);

  let alerta = '';
  if (esAdultoMayor) alerta = '⚠️ Adulto mayor: máximo reducido a 3 g/día. Consultar médico si hay hepatopatía o uso crónico.';
  if (esNino && peso < 10) alerta = '⚠️ En lactantes <10 kg, usar gotero/jeringa medidora. Verificar concentración del jarabe.';

  return {
    dosisPorToma: `${dosisMinCap}-${dosisMaxCap} mg`,
    maximoDiario: `${maxDiarioMg} mg/día (${maxCompDia} comprimidos de 500 mg)`,
    intervalo: 'Cada 4-6 horas (máximo 4 tomas/día)',
    comprimidos: esNino ? `Usar jarabe/gotas pediátricas (dosis: ${dosisMinCap}-${dosisMaxCap} mg)` : `${compPorToma500} comprimidos de 500 mg por toma`,
    alerta: alerta || '✅ Respetá el intervalo mínimo de 4 horas y el máximo diario.'
  };
}