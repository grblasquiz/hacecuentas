export interface Inputs {
  tipo_empleado: string;
  quincena_1: number;
  quincena_2: number;
  quincena_3: number;
  quincena_4: number;
  quincena_5: number;
  quincena_6: number;
}

export interface Outputs {
  aguinaldo_quincenal: number;
  aguinaldo_mensual: number;
  diferencia: number;
  remuneracion_normalizada: number;
  mejor_mes: number;
}

export function compute(i: Inputs): Outputs {
  const q1 = Number(i.quincena_1) || 0;
  const q2 = Number(i.quincena_2) || 0;
  const q3 = Number(i.quincena_3) || 0;
  const q4 = Number(i.quincena_4) || 0;
  const q5 = Number(i.quincena_5) || 0;
  const q6 = Number(i.quincena_6) || 0;

  // Validación básica
  if (q1 < 0 || q2 < 0 || q3 < 0 || q4 < 0 || q5 < 0 || q6 < 0) {
    return {
      aguinaldo_quincenal: 0,
      aguinaldo_mensual: 0,
      diferencia: 0,
      remuneracion_normalizada: 0,
      mejor_mes: 0
    };
  }

  // Cálculo para empleado quincenal
  // 6 quincenas = 3 meses nominales
  const suma_quincenas = q1 + q2 + q3 + q4 + q5 + q6;
  const remuneracion_normalizada = suma_quincenas / 3;
  const aguinaldo_quincenal = remuneracion_normalizada * 0.50;

  // Cálculo para empleado mensual
  // Meses equivalentes: (q1+q2)/2, (q3+q4)/2, (q5+q6)/2 o directamente los 6 montos como meses
  // Interpretación: q1=mes1, q2=mes2, q3=mes3, q4=mes4, q5=mes5, q6=mes6
  const mes_1 = q1;
  const mes_2 = q2;
  const mes_3 = q3;
  const mes_4 = q4;
  const mes_5 = q5;
  const mes_6 = q6;

  const mejor_mes = Math.max(mes_1, mes_2, mes_3, mes_4, mes_5, mes_6);
  const aguinaldo_mensual = mejor_mes * 0.50;

  // Diferencia
  const diferencia = aguinaldo_quincenal - aguinaldo_mensual;

  return {
    aguinaldo_quincenal: Math.round(aguinaldo_quincenal * 100) / 100,
    aguinaldo_mensual: Math.round(aguinaldo_mensual * 100) / 100,
    diferencia: Math.round(diferencia * 100) / 100,
    remuneracion_normalizada: Math.round(remuneracion_normalizada * 100) / 100,
    mejor_mes: Math.round(mejor_mes * 100) / 100
  };
}
