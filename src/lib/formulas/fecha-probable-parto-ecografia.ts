/** Fecha probable de parto por ecografía */
export interface Inputs {
  fechaEco: string;
  semanasEco: number;
  diasEco?: number;
}
export interface Outputs {
  fechaParto: string;
  semanasActuales: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function fechaProbablePartoEcografia(i: Inputs): Outputs {
  const parts = String(i.fechaEco || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha de ecografía válida');
  const [yy, mm, dd] = parts;
  const fechaEco = new Date(yy, mm - 1, dd);
  if (isNaN(fechaEco.getTime())) throw new Error('Ingresá una fecha de ecografía válida');

  const semanas = Number(i.semanasEco);
  const dias = Number(i.diasEco) || 0;

  if (semanas < 4 || semanas > 40) throw new Error('Las semanas deben estar entre 4 y 40');
  if (dias < 0 || dias > 6) throw new Error('Los días adicionales deben estar entre 0 y 6');

  const diasGestacionEnEco = semanas * 7 + dias;
  const diasRestantes = 280 - diasGestacionEnEco;

  // FPP
  const fpp = new Date(fechaEco.getTime());
  fpp.setDate(fpp.getDate() + diasRestantes);

  // Semanas actuales
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaEco.setHours(0, 0, 0, 0);
  const diasDesdeEco = Math.floor((hoy.getTime() - fechaEco.getTime()) / 86400000);
  const diasGestacionHoy = diasGestacionEnEco + diasDesdeEco;
  const semanasHoy = Math.floor(diasGestacionHoy / 7);
  const diasHoy = diasGestacionHoy % 7;

  const formatFecha = (d: Date) =>
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const fechaParto = formatFecha(fpp);
  const semanasActuales = `${semanasHoy} semanas y ${diasHoy} días`;

  const detalle =
    `Edad gestacional en la eco: ${semanas}s ${dias}d (${diasGestacionEnEco} días) | ` +
    `Días restantes hasta semana 40: ${diasRestantes} | ` +
    `FPP: ${fechaParto} | ` +
    `Hoy: ${semanasActuales}.`;

  const diasHastaParto = Math.max(0, Math.floor((fpp.getTime() - hoy.getTime()) / 86400000));

  // Insight dinámico según edad gestacional actual
  let insight;
  if (semanasHoy >= 37) {
    insight = {
      title: 'Embarazo a término',
      text: `Según la ecografía, hoy llevás **${semanasActuales}**: ya estás en zona de término. La fecha probable de parto es el **${fechaParto}**.`,
      tone: 'good',
      icon: '👶',
    };
  } else {
    insight = {
      title: 'Datación por ecografía',
      text: `La ecografía ubica el embarazo en **${semanasActuales}** hoy, con fecha probable de parto el **${fechaParto}** (faltan **${diasHastaParto} ${diasHastaParto === 1 ? 'día' : 'días'}**). La datación por eco del primer trimestre es la más precisa.`,
      tone: 'neutral',
      icon: '🩺',
    };
  }

  // Gauge de avance del embarazo (0–42 semanas) con zonas por trimestre.
  const markerSem = Math.max(0, Math.min(semanasHoy, 42));
  const chart = {
    type: 'scale',
    marker: markerSem,
    markerLabel: `Semana ${markerSem}`,
    min: 0,
    segments: [
      { nombre: '1.er trimestre', max: 13, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: '2.º trimestre', max: 27, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: '3.er trimestre', max: 40, color: '#fde68a', colorDark: '#92400e' },
      { nombre: 'Postérmino', max: 42, color: '#fecaca', colorDark: '#991b1b' },
    ],
    ariaLabel: `Avance del embarazo: semana ${markerSem} de 40.`,
  };

  return {
    fechaParto,
    semanasActuales,
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
