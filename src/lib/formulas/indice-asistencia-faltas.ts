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
  _chart?: any;
  _insight?: any;
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

  const porcentajeRedondo = Math.round(porcentaje * 100) / 100;

  let insight: any;
  if (porcentaje < minimo) {
    insight = {
      title: 'Por debajo del mínimo',
      text: `Estás en **${porcentaje.toFixed(1)}%**, por debajo del **${minimo}%** requerido. Ya usaste **${faltasUsadas}** de **${faltasMaximas}** faltas permitidas: necesitás asistir a todas las clases que queden para revertirlo.`,
      tone: 'warn',
      icon: '❌',
    };
  } else if (faltasDisponibles === 0) {
    insight = {
      title: 'Al límite',
      text: `Vas **${porcentaje.toFixed(1)}%** y agotaste tus **${faltasMaximas}** faltas: **no podés faltar ni una vez más** sin caer debajo del **${minimo}%**.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Asistencia en regla',
      text: `Vas **${porcentaje.toFixed(1)}%**, sobre el mínimo del **${minimo}%**. Todavía te quedan **${faltasDisponibles}** falta${faltasDisponibles === 1 ? '' : 's'} disponible${faltasDisponibles === 1 ? '' : 's'} antes de quedar en riesgo.`,
      tone: 'good',
      icon: '✅',
    };
  }

  const segs =
    minimo < 100
      ? [
          { nombre: 'Libre', max: minimo, color: '#fecaca', colorDark: '#b91c1c' },
          { nombre: 'En regla', max: 100, color: '#bbf7d0', colorDark: '#166534' },
        ]
      : [
          { nombre: 'Libre', max: 99.9, color: '#fecaca', colorDark: '#b91c1c' },
          { nombre: 'En regla', max: 100, color: '#bbf7d0', colorDark: '#166534' },
        ];
  const chart = {
    type: 'scale' as const,
    marker: Math.min(porcentajeRedondo, 100),
    markerLabel: 'Tu asistencia: ' + porcentaje.toFixed(1) + '%',
    min: 0,
    unit: '%',
    segments: segs,
    ariaLabel: 'Escala de porcentaje de asistencia respecto al mínimo requerido para aprobar.',
  };

  return {
    porcentajeAsistencia: porcentajeRedondo,
    faltasUsadas,
    faltasDisponibles,
    estado,
    detalle: `Asististe a ${asistidas} de ${totales} clases (${porcentaje.toFixed(1)}%). Faltas usadas: ${faltasUsadas}/${faltasMaximas} permitidas.`,
    _chart: chart,
    _insight: insight,
  };
}
