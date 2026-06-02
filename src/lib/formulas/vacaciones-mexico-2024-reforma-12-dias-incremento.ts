export interface Inputs {
  antiguedad_anos: number;
}

export interface Outputs {
  dias_vacaciones_actual: number;
  dias_vacaciones_anterior: number;
  diferencia_dias: number;
  tramo_actual: string;
  proximo_incremento: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const antigüedad = Math.max(0, i.antiguedad_anos);

  // Cálculo ley anterior (pre-reforma 2024)
  let diasAnterior = 6;
  if (antigüedad >= 10) {
    diasAnterior = 20;
  } else if (antigüedad >= 4) {
    diasAnterior = 12;
  }

  // Cálculo reforma 2024 (vigencia publicada DOF 09/12/2022)
  let diasActual: number;
  let tramoActual: string;
  let proximoIncremento: string;

  if (antigüedad < 1) {
    diasActual = 12;
    tramoActual = "Menos de 1 año";
    proximoIncremento = "En " + (1 - antigüedad).toFixed(1) + " años (al cumplir 1 año)";
  } else if (antigüedad < 2) {
    diasActual = 12;
    tramoActual = "1 a menos de 2 años";
    proximoIncremento = "En " + (2 - antigüedad).toFixed(1) + " años (al cumplir 2 años)";
  } else if (antigüedad < 3) {
    diasActual = 14;
    tramoActual = "2 a menos de 3 años";
    proximoIncremento = "En " + (3 - antigüedad).toFixed(1) + " años (al cumplir 3 años)";
  } else if (antigüedad < 4) {
    diasActual = 16;
    tramoActual = "3 a menos de 4 años";
    proximoIncremento = "En " + (4 - antigüedad).toFixed(1) + " años (al cumplir 4 años)";
  } else if (antigüedad < 5) {
    diasActual = 18;
    tramoActual = "4 a menos de 5 años";
    proximoIncremento = "En " + (5 - antigüedad).toFixed(1) + " años (al cumplir 5 años)";
  } else {
    // 5 años o más: 20 + (2 cada 5 años adicionales)
    const añosExtras = antigüedad - 5;
    const incrementosPorCinco = Math.floor(añosExtras / 5);
    diasActual = 20 + incrementosPorCinco * 2;
    tramoActual = "5 años o más";
    const proximoTramo = 5 + (incrementosPorCinco + 1) * 5;
    const faltanAnos = proximoTramo - antigüedad;
    proximoIncremento = "En " + faltanAnos.toFixed(1) + " años (al cumplir " + proximoTramo + " años)";
  }

  const diferenciaDias = diasActual - diasAnterior;

  const pctMas = diasAnterior > 0 ? Math.round((diferenciaDias / diasAnterior) * 100) : 0;
  const insight = {
    title: 'Lo que ganaste con la reforma',
    text: diferenciaDias > 0
      ? `Con la **Reforma de Vacaciones Dignas** te corresponden **${diasActual} días** (tramo ${tramoActual}), contra los **${diasAnterior} días** de la ley anterior: son **${diferenciaDias} días más** por año (**+${pctMas}%**). Próximo incremento: ${proximoIncremento.toLowerCase()}.`
      : `En tu tramo (${tramoActual}) la reforma mantiene los **${diasActual} días**, sin diferencia frente a la ley previa. Próximo incremento: ${proximoIncremento.toLowerCase()}.`,
    tone: (diferenciaDias > 0 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🌴',
  };

  return {
    dias_vacaciones_actual: diasActual,
    dias_vacaciones_anterior: diasAnterior,
    diferencia_dias: diferenciaDias,
    tramo_actual: tramoActual,
    proximo_incremento: proximoIncremento,
    _insight: insight
  };
}
