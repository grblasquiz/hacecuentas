/** Interpretación de saturación de oxígeno (SpO2) por oxímetro de pulso */
export interface Inputs {
  spo2: number;
  frecuenciaCardiaca?: number;
  altitud?: number; // metros sobre el nivel del mar
}
export interface Outputs {
  spo2: number;
  categoria: string;
  nivelAlerta: string;
  requiereAtencion: boolean;
  rangoEsperado: string;
  recomendacion: string;
  resumen: string;
}

export function saturacionOxigenoEvaluacion(i: Inputs): Outputs {
  const spo2 = Number(i.spo2);
  const fc = Number(i.frecuenciaCardiaca) || 0;
  const altitud = Number(i.altitud) || 0;

  if (!spo2 || spo2 < 50 || spo2 > 100) {
    throw new Error('Ingresá un valor de SpO2 válido (50-100%)');
  }

  // Ajustar rango esperado por altitud
  let spo2MinEsperado = 95;
  let rangoEsperado = '95-100%';
  if (altitud >= 2500) {
    spo2MinEsperado = 90;
    rangoEsperado = '90-95% (ajustado por altitud)';
  } else if (altitud >= 1500) {
    spo2MinEsperado = 93;
    rangoEsperado = '93-97% (ajustado por altitud)';
  }

  let categoria = '';
  let nivelAlerta = '';
  let recomendacion = '';
  let requiereAtencion = false;

  if (spo2 >= spo2MinEsperado) {
    categoria = 'Normal ✅';
    nivelAlerta = 'Sin alerta';
    recomendacion = 'Saturación adecuada. Continuá con tu actividad normal.';
  } else if (spo2 >= 90) {
    categoria = 'Hipoxemia leve';
    nivelAlerta = 'Precaución';
    recomendacion = 'Descansá, hidratate y volvé a medir en 15 minutos. Si persiste o tenés síntomas, consultá.';
    requiereAtencion = true;
  } else if (spo2 >= 85) {
    categoria = 'Hipoxemia moderada';
    nivelAlerta = 'Atención médica pronta';
    recomendacion = 'Comunicate con un profesional de salud. Se suele indicar oxígeno suplementario.';
    requiereAtencion = true;
  } else if (spo2 >= 80) {
    categoria = 'Hipoxemia severa';
    nivelAlerta = 'Urgencia';
    recomendacion = 'Llamá al servicio de emergencias (107/911). Requiere oxigenoterapia inmediata.';
    requiereAtencion = true;
  } else {
    categoria = 'Hipoxemia crítica';
    nivelAlerta = 'Emergencia vital';
    recomendacion = 'Traslado urgente a guardia. Riesgo de daño neurológico y cardiovascular.';
    requiereAtencion = true;
  }

  let obsFC = '';
  if (fc > 0) {
    if (fc < 60) obsFC = ' Bradicardia asociada.';
    else if (fc > 100) obsFC = ' Taquicardia asociada (compensación por baja SpO2).';
  }

  return {
    spo2,
    categoria,
    nivelAlerta,
    requiereAtencion,
    rangoEsperado,
    recomendacion,
    resumen: `SpO2 ${spo2}% → ${categoria}. ${recomendacion}${obsFC}`,
  };
}
