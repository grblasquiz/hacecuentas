export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * ¿Cuántos puntos / victorias le faltan a un equipo para llegar a un objetivo?
 *
 * Sirve para cualquier liga de 3 puntos por victoria (clasificar a una copa,
 * salir campeón, o salvarse del descenso). Genérica y parametrizable.
 *
 *   puntosActuales (v1), partidosRestantes (v2), objetivo en puntos (v3)
 *   puntosFaltan      = max(objetivo - actuales, 0)
 *   maxAlcanzable     = actuales + restantes × 3
 *   victoriasMin      = ceil(puntosFaltan / 3)   (si el resto se pierde)
 *   promedioRequerido = puntosFaltan / restantes (puntos por partido)
 */
export function puntosNecesariosClasificarFutbol(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const es = __lang !== 'en';

  const actuales = Math.max(Math.round(Number(i.v1) || 0), 0);
  const restantes = Math.max(Math.round(Number(i.v2) || 0), 0);
  const objetivo = Math.max(Math.round(Number(i.v3) || 0), 0);

  if (objetivo <= 0 || restantes <= 0) {
    return {
      resultado: es ? 'Completá los datos' : 'Fill in the data',
      resumen: es
        ? 'Ingresá los puntos actuales, los partidos que faltan y los puntos objetivo.'
        : 'Enter current points, matches left and the target points.',
    };
  }

  const puntosFaltan = Math.max(objetivo - actuales, 0);
  const maxAlcanzable = actuales + restantes * 3;
  const puntosEnJuego = restantes * 3;

  // Ya alcanzado
  if (puntosFaltan === 0) {
    return {
      resultado: es ? '¡Objetivo ya alcanzado!' : 'Target already reached!',
      resumen: es
        ? `Con ${actuales} puntos ya superás el objetivo de ${objetivo}. Te quedan ${restantes} partidos para estirar la ventaja.`
        : `With ${actuales} points you already passed the target of ${objetivo}. You still have ${restantes} matches to extend the lead.`,
      _insight: {
        title: es ? 'Objetivo cumplido' : 'Target met',
        text: es
          ? `Tu equipo ya llegó a la marca de **${objetivo} puntos**. Cualquier punto extra es colchón.`
          : `Your team already reached the **${objetivo}-point** mark. Any extra point is a cushion.`,
        tone: 'positive',
        icon: '✅',
      },
    };
  }

  // Matemáticamente imposible
  if (puntosFaltan > puntosEnJuego) {
    return {
      resultado: es ? 'Matemáticamente imposible' : 'Mathematically impossible',
      resumen: es
        ? `Faltan ${puntosFaltan} puntos pero solo quedan ${puntosEnJuego} en juego (${restantes} partidos × 3). El máximo que podés alcanzar es ${maxAlcanzable} puntos.`
        : `You need ${puntosFaltan} points but only ${puntosEnJuego} are left (${restantes} matches × 3). The most you can reach is ${maxAlcanzable} points.`,
      _insight: {
        title: es ? 'Ya no alcanza' : 'Out of reach',
        text: es
          ? `Aun ganando los ${restantes} partidos restantes llegarías a **${maxAlcanzable} puntos**, por debajo del objetivo de ${objetivo}.`
          : `Even winning all ${restantes} remaining matches you would reach **${maxAlcanzable} points**, below the target of ${objetivo}.`,
        tone: 'negative',
        icon: '❌',
      },
    };
  }

  const victoriasMin = Math.ceil(puntosFaltan / 3);
  // Empates que “sobran” si ganás el mínimo de partidos: cuántos empates extra cubren el resto.
  const restoTrasVictorias = victoriasMin * 3 - puntosFaltan; // 0, 1 o 2 puntos de más
  const promedioRequerido = puntosFaltan / restantes;
  const promFmt = (Math.round(promedioRequerido * 100) / 100).toString().replace('.', ',');

  // Alternativa solo con empates (si fuera posible)
  const soloEmpates = puntosFaltan <= restantes; // alcanzás empatando todo
  const empatesNecesarios = puntosFaltan; // 1 punto por empate

  const resultado = es
    ? `Necesitás ${puntosFaltan} puntos en ${restantes} partidos`
    : `You need ${puntosFaltan} points in ${restantes} matches`;

  const altEmpates = soloEmpates
    ? (es ? ` o empatando ${empatesNecesarios} de los ${restantes}` : ` or drawing ${empatesNecesarios} of the ${restantes}`)
    : '';

  const resumen = es
    ? `Te faltan ${puntosFaltan} puntos para llegar a ${objetivo}. Lo lográs con ${victoriasMin} victoria${victoriasMin > 1 ? 's' : ''}${altEmpates}. Promedio requerido: ${promFmt} puntos por partido. Máximo alcanzable: ${maxAlcanzable} puntos.`
    : `You need ${puntosFaltan} more points to reach ${objetivo}. You get there with ${victoriasMin} win${victoriasMin > 1 ? 's' : ''}${altEmpates}. Required average: ${promFmt} points per match. Max reachable: ${maxAlcanzable} points.`;

  const dificultad = promedioRequerido >= 2.5 ? (es ? 'muy exigente' : 'very demanding')
    : promedioRequerido >= 1.8 ? (es ? 'exigente' : 'demanding')
    : promedioRequerido >= 1.0 ? (es ? 'accesible' : 'achievable')
    : (es ? 'cómodo' : 'comfortable');

  const insightText = es
    ? `Para llegar a **${objetivo} puntos** te faltan **${puntosFaltan}** en ${restantes} partidos: alcanza con **${victoriasMin} triunfo${victoriasMin > 1 ? 's' : ''}**${altEmpates}. Necesitás un promedio de **${promFmt} puntos por partido**, un ritmo ${dificultad}. Si ganás los ${restantes}, terminás con ${maxAlcanzable}.`
    : `To reach **${objetivo} points** you need **${puntosFaltan}** more in ${restantes} matches: ${victoriasMin} win${victoriasMin > 1 ? 's' : ''}${altEmpates} is enough. You need an average of **${promFmt} points per match**, a ${dificultad} pace. Win all ${restantes} and you finish on ${maxAlcanzable}.`;

  return {
    resultado,
    resumen,
    _insight: {
      title: es ? 'Lo que te falta' : 'What you need',
      text: insightText,
      tone: promedioRequerido >= 2.5 ? 'warning' : 'info',
      icon: '⚽',
    },
  };
}
