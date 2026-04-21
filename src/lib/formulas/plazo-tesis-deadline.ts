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

  return {
    diasTotales,
    diasRestantes,
    porcentajeAvance: Number(porcentajeAvance.toFixed(1)),
    palabrasPorDia,
    paginasPorDia: Number(paginasPorDia.toFixed(1)),
    estadoAlerta,
    cronograma,
    mensaje: `${diasRestantes} días restantes. Avance: ${porcentajeAvance.toFixed(1)}%. ${cronograma} ${estadoAlerta}.`,
  };
}
