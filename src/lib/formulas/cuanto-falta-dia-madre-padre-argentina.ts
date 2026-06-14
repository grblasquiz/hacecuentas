/**
 * Cuenta regresiva para el Día de la Madre (3.º domingo de octubre) y el
 * Día del Padre (3.º domingo de junio) en Argentina.
 *
 * No pide ningún input: calcula la próxima ocurrencia de cada fecha a partir
 * de la fecha actual (new Date()). Si la fecha de este año ya pasó, salta al
 * año siguiente automáticamente.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs {
  diasMadre: number;
  fechaMadre: string;
  diasPadre: number;
  fechaPadre: string;
  proxima: string;
  resumen: string;
  _insight?: any;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Tercer domingo de un mes (month: 0=enero … 11=diciembre) para un año dado. */
function tercerDomingo(year: number, month: number): Date {
  const primero = new Date(year, month, 1);
  // getDay(): 0=domingo. Días hasta el primer domingo del mes.
  const offsetPrimerDomingo = (7 - primero.getDay()) % 7;
  const diaPrimerDomingo = 1 + offsetPrimerDomingo;
  // Tercer domingo = primer domingo + 14 días.
  return new Date(year, month, diaPrimerDomingo + 14);
}

/** Próxima ocurrencia (>= hoy) del tercer domingo de un mes dado. */
function proximaFecha(hoy: Date, month: number): Date {
  let f = tercerDomingo(hoy.getFullYear(), month);
  if (f.getTime() < hoy.getTime()) f = tercerDomingo(hoy.getFullYear() + 1, month);
  return f;
}

function fmtLargo(d: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function cuantoFaltaDiaMadrePadreArgentina(_i: Inputs): Outputs {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Día de la Madre AR = 3.º domingo de octubre (mes 9).
  const fMadre = proximaFecha(hoy, 9);
  // Día del Padre AR = 3.º domingo de junio (mes 5).
  const fPadre = proximaFecha(hoy, 5);

  const diasMadre = Math.round((fMadre.getTime() - hoy.getTime()) / 86400000);
  const diasPadre = Math.round((fPadre.getTime() - hoy.getTime()) / 86400000);

  const fechaMadre = fmtLargo(fMadre);
  const fechaPadre = fmtLargo(fPadre);

  // ¿Cuál cae primero?
  const madrePrimero = fMadre.getTime() <= fPadre.getTime();
  const dProx = madrePrimero ? diasMadre : diasPadre;
  const nombreProx = madrePrimero ? 'Día de la Madre' : 'Día del Padre';
  const fechaProx = madrePrimero ? fechaMadre : fechaPadre;
  const proxima = `${nombreProx}: ${fechaProx} (faltan ${dProx} ${dProx === 1 ? 'día' : 'días'})`;

  const semProx = Math.floor(dProx / 7);
  const resumen = `Faltan **${diasMadre}** días para el Día de la Madre (${fechaMadre}) y **${diasPadre}** días para el Día del Padre (${fechaPadre}).`;

  let _insight: any;
  if (dProx <= 0) {
    _insight = {
      title: `¡Hoy es el ${nombreProx}!`,
      text: `Hoy se celebra el **${nombreProx}** en Argentina. ¡A disfrutarlo!`,
      tone: 'good',
      icon: '🎁',
    };
  } else if (dProx <= 7) {
    _insight = {
      title: `Recta final: ${nombreProx}`,
      text: `Quedan apenas **${dProx} ${dProx === 1 ? 'día' : 'días'}** para el **${nombreProx}** (${fechaProx}). Es semana pico: flores y restaurantes suben 30-50%. Conviene reservar o comprar ya, o tirar de gift card / regalo digital.`,
      tone: 'warn',
      icon: '⏰',
    };
  } else if (dProx <= 30) {
    _insight = {
      title: `Hora de organizarse`,
      text: `Faltan **${dProx} días** (${semProx} semanas) para el **${nombreProx}** (${fechaProx}). Buen momento para reservar restaurante (se llenan 2-3 semanas antes) y cerrar el regalo antes de que suban los precios.`,
      tone: 'neutral',
      icon: '🎁',
    };
  } else {
    _insight = {
      title: 'Todavía hay tiempo',
      text: `La próxima fecha es el **${nombreProx}** (${fechaProx}), dentro de **${dProx} días** (${semProx} semanas). Con esta anticipación podés ahorrar de a poco y aprovechar eventos de descuento (Hot Sale, Cyber Monday) sin pagar el recargo de la semana previa.`,
      tone: 'good',
      icon: '🌺',
    };
  }

  return {
    diasMadre: Math.max(0, diasMadre),
    fechaMadre,
    diasPadre: Math.max(0, diasPadre),
    fechaPadre,
    proxima,
    resumen,
    _insight,
  };
}
