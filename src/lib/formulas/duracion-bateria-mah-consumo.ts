/** Estimación de duración de batería según capacidad mAh y consumo */
export interface Inputs { capacidadMah: number; consumoMa: number; eficiencia?: number; }
export interface Outputs { horasEstimadas: number; minutosEstimados: number; energiaWh: number; detalle: string; }

export function duracionBateriaMahConsumo(i: Inputs): Outputs {
  const capacidad = Number(i.capacidadMah);
  const consumo = Number(i.consumoMa);
  const eficiencia = Number(i.eficiencia || 85) / 100;

  if (!capacidad || capacidad <= 0) throw new Error('Ingresá la capacidad de la batería en mAh');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo del dispositivo en mA');
  if (eficiencia <= 0 || eficiencia > 1) throw new Error('La eficiencia debe estar entre 1 y 100');

  const capacidadReal = capacidad * eficiencia;
  const horas = capacidadReal / consumo;
  const minutos = horas * 60;
  const energiaWh = (capacidad * 3.7) / 1000; // voltaje típico Li-ion

  return {
    horasEstimadas: Number(horas.toFixed(2)),
    minutosEstimados: Math.round(minutos),
    energiaWh: Number(energiaWh.toFixed(2)),
    detalle: `Batería de ${capacidad} mAh (${(eficiencia * 100).toFixed(0)}% eficiencia) con consumo de ${consumo} mA: ~${horas.toFixed(1)} horas (${Math.round(minutos)} min). Energía: ${energiaWh.toFixed(1)} Wh a 3,7V.`,
  };
}
