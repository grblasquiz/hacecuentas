export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function emailGestionInboxZeroTiempoDedicado(i: Inputs): Outputs {
  // v1 = presupuesto diario de email (min/día); v2 = número de sesiones de revisión por día
  const presupuesto = Number(i.v1) || 0;
  const sesiones = Math.max(1, Number(i.v2) || 1);
  const minPorSesion = presupuesto / sesiones;
  // Referencia: ~1,5 min por email (Microsoft Research, 2016)
  const emailsPorSesion = Math.floor(minPorSesion / 1.5);
  const emailsDia = emailsPorSesion * sesiones;

  let tone: 'positive' | 'neutral' | 'caution' = 'neutral';
  let veredicto = '';
  if (minPorSesion < 15) {
    tone = 'caution';
    veredicto = `Cada bloque queda en **${minPorSesion.toFixed(0)} min**, demasiado corto: no alcanza para emails que requieren respuesta real. Reducí a 1 o 2 sesiones para tener bloques de 20–45 min.`;
  } else if (minPorSesion > 60) {
    tone = 'caution';
    veredicto = `Cada bloque dura **${minPorSesion.toFixed(0)} min**: más de 60 min seguidos genera fatiga de decisión y empezás a saltear los emails difíciles. Sumá una sesión más para repartir la carga.`;
  } else {
    tone = 'positive';
    veredicto = `Cada bloque dura **${minPorSesion.toFixed(0)} min**, dentro del rango ideal (20–45 min). Alcanza para procesar ~${emailsPorSesion} emails por sesión a 1,5 min/email.`;
  }

  return {
    resultado: minPorSesion.toFixed(2),
    resumen: `${presupuesto} min/día ÷ ${sesiones} ${sesiones === 1 ? 'sesión' : 'sesiones'} = ${minPorSesion.toFixed(0)} min por bloque (~${emailsDia} emails/día a 1,5 min c/u).`,
    _insight: {
      title: 'Tu plan de sesiones',
      text: veredicto,
      tone,
      icon: '📥',
    },
  };
}
