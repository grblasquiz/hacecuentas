/** Calculadora de índice de asistencia y faltas disponibles */

export interface Inputs {
  clasesTotales: number;
  clasesAsistidas: number;
  porcentajeMinimo: number;
}

export interface Outputs {
  porcentajeAsistencia: number;
  faltasUsadas: number;
  faltasDisponibles: number;
  estado: string;
  detalle: string;
}

export function indiceAsistenciaFaltas(i: Inputs): Outputs {
  const totales = Number(i.clasesTotales);
  const asistidas = Number(i.clasesAsistidas);
  const minimo = Number(i.porcentajeMinimo);

  if (isNaN(totales) || totales < 1) {
    throw new Error('Ingresá la cantidad total de clases (mínimo 1)');
  }
  if (isNaN(asistidas) || asistidas < 0) {
    throw new Error('Las clases asistidas no pueden ser negativas');
  }
  if (asistidas > totales) {
    throw new Error('Las clases asistidas no pueden superar el total de clases');
  }
  if (isNaN(minimo) || minimo < 50 || minimo > 100) {
    throw new Error('El porcentaje mínimo debe estar entre 50% y 100%');
  }

  const faltasUsadas = totales - asistidas;
  const clasesMinimas = Math.ceil(totales * (minimo / 100));
  const faltasMaximas = totales - clasesMinimas;
  const faltasDisponibles = Math.max(0, faltasMaximas - faltasUsadas);
  const porcentaje = (asistidas / totales) * 100;

  let estado: string;
  if (porcentaje >= minimo) {
    if (faltasDisponibles === 0) {
      estado = '⚠️ Estás justo en el límite. No podés faltar más.';
    } else {
      estado = `✅ Dentro del mínimo. Podés faltar ${faltasDisponibles} vez/veces más.`;
    }
  } else {
    estado = '❌ Quedaste libre. Tu asistencia está por debajo del mínimo requerido.';
  }

  return {
    porcentajeAsistencia: Math.round(porcentaje * 100) / 100,
    faltasUsadas,
    faltasDisponibles,
    estado,
    detalle: `Asististe a ${asistidas} de ${totales} clases (${porcentaje.toFixed(1)}%). Faltas usadas: ${faltasUsadas}/${faltasMaximas} permitidas.`,
  };
}
