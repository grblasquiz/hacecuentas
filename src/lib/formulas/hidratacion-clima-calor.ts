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
  _insight?: any;
  _chart?: any;
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
  const totalL = Number((total / 1000).toFixed(2));

  const litrosExtra = Number(((extraCalor + extraEjercicio) / 1000).toFixed(2));
  const needElecBool = minEj >= 60 && temp >= 25;
  const _insight = {
    title: 'Tu hidratación de hoy',
    text: litrosExtra > 0
      ? `Hoy necesitás **${totalL} L**: el calor (${temp}°C) y el ejercicio te suman **${litrosExtra} L** sobre tu base de ${(base/1000).toFixed(2)} L.${needElecBool ? ' Como sudás más de 1 h con calor, sumá **electrolitos** (sodio/potasio), no solo agua.' : ''}`
      : `Hoy necesitás **${totalL} L**, prácticamente tu base por peso (${(base/1000).toFixed(2)} L): ni el clima ni el ejercicio agregan demanda extra.`,
    tone: needElecBool ? 'warn' : 'neutral',
    icon: '💧',
  };

  const slices = [{ label: 'Base por peso', value: Math.round(base) }];
  if (extraCalor > 0) slices.push({ label: `Calor (${temp}°C)`, value: Math.round(extraCalor) });
  if (extraEjercicio > 0) slices.push({ label: 'Ejercicio', value: Math.round(extraEjercicio) });
  const _chart = {
    type: 'doughnut',
    slices,
    centerValue: `${totalL} L`,
    centerLabel: 'Total diario',
    ariaLabel: `Total ${totalL} litros: base ${Math.round(base)} ml${extraCalor > 0 ? `, calor ${Math.round(extraCalor)} ml` : ''}${extraEjercicio > 0 ? `, ejercicio ${Math.round(extraEjercicio)} ml` : ''}`,
  };

  return {
    litrosDia: totalL,
    mlPorHoraEjercicio: rate,
    necesitaElectrolitos: needElec,
    resumen: `Necesitás ${(total/1000).toFixed(2)} L/día (base ${base} + calor ${extraCalor} + ejercicio ${extraEjercicio.toFixed(0)} ml).`,
    _insight,
    _chart,
  };
}
