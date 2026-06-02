/** Calculadora de porcentaje de avance de carrera universitaria */

export interface Inputs {
  creditosAprobados: number;
  creditosTotales: number;
}

export interface Outputs {
  porcentajeAvance: number;
  creditosFaltantes: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function creditosUniversitariosAvance(i: Inputs): Outputs {
  const aprobados = Number(i.creditosAprobados);
  const totales = Number(i.creditosTotales);

  if (isNaN(aprobados) || aprobados < 0) {
    throw new Error('Ingresá una cantidad válida de créditos aprobados');
  }
  if (isNaN(totales) || totales <= 0) {
    throw new Error('El total de créditos debe ser mayor a 0');
  }
  if (aprobados > totales) {
    throw new Error('Los créditos aprobados no pueden superar el total del plan');
  }

  const porcentajeAvance = (aprobados / totales) * 100;
  const faltantes = totales - aprobados;
  const pctRedondeado = Math.round(porcentajeAvance * 100) / 100;

  let tono: 'good' | 'warn' | 'neutral';
  let etapa: string;
  if (porcentajeAvance >= 75) {
    tono = 'good';
    etapa = `estás en la recta final: con **${faltantes} créditos** restantes ya ves la meta`;
  } else if (porcentajeAvance >= 50) {
    tono = 'neutral';
    etapa = `pasaste la mitad de la carrera; te quedan **${faltantes} créditos** para recibirte`;
  } else {
    tono = 'warn';
    etapa = `vas por el tramo inicial: aún te faltan **${faltantes} de ${totales} créditos**`;
  }

  return {
    porcentajeAvance: pctRedondeado,
    creditosFaltantes: faltantes,
    detalle: `Completaste ${aprobados} de ${totales} (${porcentajeAvance.toFixed(1)}%). Te faltan ${faltantes} para recibirte.`,
    _insight: {
      title: 'Tu avance de carrera',
      text: `Llevás un **${pctRedondeado}%** del plan aprobado (${aprobados} de ${totales} créditos): ${etapa}.`,
      tone: tono,
      icon: '🎓',
    },
    _chart: {
      type: 'scale',
      marker: pctRedondeado,
      markerLabel: `${pctRedondeado}% avanzado`,
      min: 0,
      segments: [
        { nombre: 'Inicio', max: 25, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'En curso', max: 50, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Avanzado', max: 75, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Recta final', max: 100, color: '#22c55e', colorDark: '#4ade80' },
      ],
      ariaLabel: `Porcentaje de avance de carrera: ${pctRedondeado}% sobre 100%`,
    },
  };
}
