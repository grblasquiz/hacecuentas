/** Sumar y restar horas y minutos: h:mm, horas decimales y minutos totales */
export interface Inputs {
  operacion?: string;
  horas1?: number;
  minutos1?: number;
  horas2?: number;
  minutos2?: number;
  __lang?: string;
}
export interface Outputs {
  resultadoHM: string;
  horasDecimales: number;
  minutosTotales: number;
  conversion: string;
  _insight?: any;
}

export function sumarRestarHorasMinutos(i: Inputs): Outputs {
  const operacion = String(i.operacion || 'sumar');
  const h1 = Number(i.horas1) || 0;
  const m1 = Number(i.minutos1) || 0;
  const h2 = Number(i.horas2) || 0;
  const m2 = Number(i.minutos2) || 0;

  for (const [v, nombre] of [
    [h1, 'horas del primer tiempo'],
    [m1, 'minutos del primer tiempo'],
    [h2, 'horas del segundo tiempo'],
    [m2, 'minutos del segundo tiempo'],
  ] as [number, string][]) {
    if (v < 0) throw new Error(`Ingresá un valor positivo en ${nombre} (el signo lo maneja la resta)`);
    if (!Number.isInteger(v)) throw new Error(`Ingresá ${nombre} como número entero (los minutos van en su propio campo)`);
  }
  if (m1 > 59 || m2 > 59) {
    throw new Error('Los minutos van de 0 a 59: si tenés 90 minutos, cargalos como 1 hora y 30 minutos');
  }

  const t1 = h1 * 60 + m1;
  const t2 = h2 * 60 + m2;
  const totalMin = operacion === 'restar' ? t1 - t2 : t1 + t2;

  const negativo = totalMin < 0;
  const absMin = Math.abs(totalMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const signo = negativo ? '−' : '';
  const resultadoHM = `${signo}${h}:${String(m).padStart(2, '0')}`;

  const horasDecimales = Number((totalMin / 60).toFixed(4));

  const conversion = `${resultadoHM} h:mm = ${signo}(${h} + ${m}/60) = ${signo}(${h} + ${Number((m / 60).toFixed(4))}) = ${horasDecimales} horas decimales = ${totalMin} minutos`;

  const opTexto = operacion === 'restar' ? `${h1}:${String(m1).padStart(2, '0')} − ${h2}:${String(m2).padStart(2, '0')}` : `${h1}:${String(m1).padStart(2, '0')} + ${h2}:${String(m2).padStart(2, '0')}`;

  return {
    resultadoHM,
    horasDecimales,
    minutosTotales: totalMin,
    conversion,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `**${opTexto} = ${resultadoHM}**, que en horas decimales es **${horasDecimales.toLocaleString('es-AR')}** (${totalMin} minutos). ${negativo ? 'El resultado es negativo: el segundo tiempo es mayor que el primero.' : 'Para liquidar sueldos por hora, multiplicá las horas decimales (no el h:mm) por la tarifa.'}`,
      tone: 'neutral',
      icon: '⏰',
    },
  };
}
