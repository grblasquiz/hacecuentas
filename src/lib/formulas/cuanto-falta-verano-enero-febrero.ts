/**
 * Cuenta regresiva al verano del hemisferio sur (Argentina).
 *
 * No pide ningún input: toma la fecha actual con new Date() y calcula cuántos
 * días faltan para el próximo inicio del verano astronómico, el solsticio de
 * diciembre, que cae aproximadamente el 21 de diciembre. Si el 21/12 de este
 * año ya pasó, salta automáticamente al del año siguiente.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs {
  dias: number;
  fecha: string;
  semanas: number;
  meses: number;
  resumen: string;
  _insight?: any;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function fmtLargo(d: Date): string {
  return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function cuantoFaltaVeranoEneroFebrero(_i: Inputs): Outputs {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Solsticio de verano austral ≈ 21 de diciembre (mes 11). Próxima ocurrencia
  // a partir de hoy; si ya pasó el de este año, salta al año que viene.
  let solsticio = new Date(hoy.getFullYear(), 11, 21);
  solsticio.setHours(0, 0, 0, 0);
  if (solsticio.getTime() < hoy.getTime()) {
    solsticio = new Date(hoy.getFullYear() + 1, 11, 21);
    solsticio.setHours(0, 0, 0, 0);
  }

  const dias = Math.round((solsticio.getTime() - hoy.getTime()) / 86400000);
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30.44);
  const fecha = fmtLargo(solsticio);

  const resumen = dias === 0
    ? `¡Hoy arranca el verano! El solsticio de diciembre cae **hoy**, ${fecha}.`
    : `Faltan **${dias} días** (${semanas} semanas) para el inicio del verano: el solsticio de diciembre del ${fecha}.`;

  let _insight: any;
  if (dias === 0) {
    _insight = {
      title: '¡Llegó el verano!',
      text: `Hoy es el **solsticio de diciembre** (${fecha}): arranca oficialmente el verano en el hemisferio sur. El día más largo del año. 🏖️`,
      tone: 'good',
      icon: '🌊',
    };
  } else if (dias <= 7) {
    _insight = {
      title: 'Recta final al verano',
      text: `Quedan apenas **${dias} ${dias === 1 ? 'día' : 'días'}** para el solsticio de verano (${fecha}). Última semana para cerrar reservas y armar el bolso de playa: protección UV, traje de baño y botiquín.`,
      tone: 'good',
      icon: '☀️',
    };
  } else if (dias <= 30) {
    _insight = {
      title: 'El verano está a la vuelta',
      text: `Faltan **${dias} días** (${semanas} semanas) para el inicio del verano (${fecha}). Buen momento para confirmar el alojamiento y planificar el presupuesto de las vacaciones de enero.`,
      tone: 'neutral',
      icon: '🏖️',
    };
  } else if (dias <= 120) {
    _insight = {
      title: 'Tiempo de planificar',
      text: `Faltan **${dias} días** (unos ${meses} ${meses === 1 ? 'mes' : 'meses'}) para el solsticio de verano (${fecha}). Con esta anticipación conviene reservar alojamiento en Mar del Plata, Pinamar o Las Grutas: a partir de octubre escasean las opciones premium.`,
      tone: 'neutral',
      icon: '☀️',
    };
  } else {
    _insight = {
      title: 'Cuenta regresiva al verano',
      text: `Faltan **${dias} días** (unos ${meses} ${meses === 1 ? 'mes' : 'meses'}) para el inicio del verano: el solsticio de diciembre del ${fecha}. Tiempo de sobra para ahorrar de a poco y, si buscás un cambio físico, arrancar la rutina con margen.`,
      tone: 'good',
      icon: '🌞',
    };
  }

  return {
    dias,
    fecha,
    semanas,
    meses,
    resumen,
    _insight,
  };
}
