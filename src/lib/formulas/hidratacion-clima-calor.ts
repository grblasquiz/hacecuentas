/**
 * Hidratación clima y ejercicio.
 */

export interface HidratacionClimaCalorInputs {
  peso: number;
  temperatura: number;
  ejercicioMinutos: number;
  intensidad: string;
}

export interface HidratacionClimaCalorOutputs {
  litrosDia: number;
  mlPorHoraEjercicio: number;
  necesitaElectrolitos: string;
  resumen: string;
}

export function hidratacionClimaCalor(inputs: HidratacionClimaCalorInputs): HidratacionClimaCalorOutputs {
  const peso = Number(inputs.peso);
  const temp = Number(inputs.temperatura);
  const minEj = Number(inputs.ejercicioMinutos);
  const inten = inputs.intensidad || 'moderada';
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const base = peso * 35;
  let extraCalor = 0;
  if (temp >= 35) extraCalor = 800;
  else if (temp >= 30) extraCalor = 500;
  else if (temp >= 25) extraCalor = 250;
  const mlPorHora: Record<string, number> = { baja: 500, moderada: 800, alta: 1200 };
  const rate = mlPorHora[inten] ?? 800;
  const extraEjercicio = (minEj / 60) * rate;
  const total = base + extraCalor + extraEjercicio;
  const needElec = minEj >= 60 && temp >= 25 ? 'Sí - sudás >1h en calor' : 'No es crítico para ejercicio corto';
  return {
    litrosDia: Number((total / 1000).toFixed(2)),
    mlPorHoraEjercicio: rate,
    necesitaElectrolitos: needElec,
    resumen: `Necesitás ${(total/1000).toFixed(2)} L/día (base ${base} + calor ${extraCalor} + ejercicio ${extraEjercicio.toFixed(0)} ml).`,
  };
}
