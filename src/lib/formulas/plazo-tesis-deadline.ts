/** Calculadora de plazo y timeline de tesis */
export interface Inputs {
  fechaInicio: string;
  fechaEntrega: string;
  etapaActual: string;
  palabrasObjetivo: number;
  palabrasEscritas: number;
}
export interface Outputs {
  diasTotales: number;
  diasRestantes: number;
  porcentajeAvance: number;
  palabrasPorDia: number;
  paginasPorDia: number;
  estadoAlerta: string;
  cronograma: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function plazoTesisDeadline(i: Inputs): Outputs {
  const partsIni = String(i.fechaInicio || '').split('-').map(Number);
  if (partsIni.length !== 3 || partsIni.some(isNaN)) throw new Error('Fecha de inicio inválida');
  const fechaInicio = new Date(partsIni[0], partsIni[1] - 1, partsIni[2]);
  const partsEnt = String(i.fechaEntrega || '').split('-').map(Number);
  if (partsEnt.length !== 3 || partsEnt.some(isNaN)) throw new Error('Fecha de entrega inválida');
  const fechaEntrega = new Date(partsEnt[0], partsEnt[1] - 1, partsEnt[2]);
  const palabrasObj = Number(i.palabrasObjetivo) || 20000;
  const palabrasEscritas = Number(i.palabrasEscritas) || 0;

  if (isNaN(fechaInicio.getTime())) throw new Error('Fecha de inicio inválida');
  if (isNaN(fechaEntrega.getTime())) throw new Error('Fecha de entrega inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasTotales = Math.ceil((fechaEntrega.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = Math.max(0, Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));

  const palabrasRestantes = Math.max(0, palabrasObj - palabrasEscritas);
  const porcentajeAvance = (palabrasEscritas / palabrasObj) * 100;

  // Palabras por día necesarias (solo días hábiles, ~5/7)
  const diasHabiles = Math.max(1, Math.round(diasRestantes * 5 / 7));
  const palabrasPorDia = Math.ceil(palabrasRestantes / diasHabiles);
  const paginasPorDia = palabrasPorDia / 250; // ~250 palabras por página

  // Estado
  let estadoAlerta: string;
  const porcentajeTiempo = ((diasTotales - diasRestantes) / diasTotales) * 100;
  if (porcentajeAvance >= porcentajeTiempo) {
    estadoAlerta = 'En tiempo — tu avance está alineado con el cronograma';
  } else if (porcentajeAvance >= porcentajeTiempo - 20) {
    estadoAlerta = 'Atención — estás un poco atrasado/a, acelerá el ritmo';
  } else {
    estadoAlerta = 'Alerta — estás muy atrasado/a, necesitás dedicar más horas diarias';
  }

  // Cronograma sugerido
  const cronograma = `Escribí ${palabrasPorDia} palabras/día (~${paginasPorDia.toFixed(1)} páginas) de lunes a viernes para llegar a tiempo.`;

  // --- Insight narrativo (dinámico según el estado del cronograma) ---
  const avanceRed = Number(porcentajeAvance.toFixed(0));
  const ritmoTone = porcentajeAvance >= porcentajeTiempo
    ? 'good'
    : (porcentajeAvance >= porcentajeTiempo - 20 ? 'neutral' : 'warn');
  const insightText = porcentajeAvance >= porcentajeTiempo
    ? `Vas **en tiempo**: con **${avanceRed}%** escrito superás el ritmo esperado del cronograma. Mantené **${palabrasPorDia} palabras/día** hábiles y entregás holgado en **${diasRestantes} días**.`
    : (porcentajeAvance >= porcentajeTiempo - 20
        ? `Estás **un poco atrasado/a**: llevás **${avanceRed}%** y quedan **${diasRestantes} días**. Sostené **${palabrasPorDia} palabras/día** (~${paginasPorDia.toFixed(1)} pág.) de lunes a viernes para recuperar el terreno.`
        : `Atención: con **${avanceRed}%** escrito y **${diasRestantes} días** restantes vas **muy atrasado/a**. Necesitás **${palabrasPorDia} palabras/día** hábiles, un ritmo exigente que conviene reorganizar ya.`);
  const insight = {
    title: 'Tu ritmo vs. el cronograma',
    text: insightText,
    tone: ritmoTone,
    icon: '🎓',
  };

  // --- Gauge: avance escrito sobre el % de tiempo ya consumido ---
  const umbralAtraso = Math.min(98, Math.max(0, Math.round(porcentajeTiempo - 20)));
  const umbralJusto = Math.min(99, Math.max(umbralAtraso + 1, Math.round(porcentajeTiempo)));
  const chart = {
    type: 'scale' as const,
    marker: avanceRed,
    markerLabel: `${avanceRed}% escrito`,
    min: 0,
    segments: [
      { nombre: 'Atrasado', max: umbralAtraso, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Justo', max: umbralJusto, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'En tiempo', max: 100, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: 'Porcentaje de tesis escrita comparado con el porcentaje de tiempo ya transcurrido del plazo.',
  };

  return {
    diasTotales,
    diasRestantes,
    porcentajeAvance: Number(porcentajeAvance.toFixed(1)),
    palabrasPorDia,
    paginasPorDia: Number(paginasPorDia.toFixed(1)),
    estadoAlerta,
    cronograma,
    mensaje: `${diasRestantes} días restantes. Avance: ${porcentajeAvance.toFixed(1)}%. ${cronograma} ${estadoAlerta}.`,
    _insight: insight,
    _chart: chart,
  };
}
