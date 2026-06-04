/** Cuenta regresiva para Navidad */
export interface Inputs { fechaHoy: string; }
export interface Outputs { diasFaltan: number; semanas: number; domingos: number; horas: number; diaNavidad: string; desgloseDias: string; mensaje: string; _insight?: any; }

export function cuantoFaltaParaNavidad(i: Inputs): Outputs {
  const parts = String(i.fechaHoy || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const hoy = new Date(yy, mm - 1, dd);
  if (isNaN(hoy.getTime())) throw new Error('Ingresá una fecha válida');

  const year = hoy.getMonth() === 11 && hoy.getDate() > 25 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const navidad = new Date(year, 11, 25); // Dec 25

  const diffMs = navidad.getTime() - hoy.getTime();
  const diasFaltan = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diasFaltan / 7);
  const horas = Math.ceil(diffMs / (1000 * 60 * 60));

  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const diaNavidad = `${dias[navidad.getDay()]} 25 de diciembre de ${year}`;

  // Conteo de cada día de la semana que falta (desde mañana hasta el 25/12 inclusive).
  // Responde directo "cuántos domingos/lunes/… faltan para Navidad".
  const cuenta = [0, 0, 0, 0, 0, 0, 0];
  const cursor = new Date(hoy.getTime());
  cursor.setDate(cursor.getDate() + 1);
  while (cursor.getTime() <= navidad.getTime()) {
    cuenta[cursor.getDay()]++;
    cursor.setDate(cursor.getDate() + 1);
  }
  const domingos = cuenta[0];
  const desgloseDias = diasFaltan <= 0
    ? 'Navidad ya pasó este año.'
    : `Hasta el ${diaNavidad} faltan ${cuenta[0]} domingos, ${cuenta[1]} lunes, ${cuenta[2]} martes, ${cuenta[3]} miércoles, ${cuenta[4]} jueves, ${cuenta[5]} viernes y ${cuenta[6]} sábados.`;

  let mensaje: string;
  if (diasFaltan <= 0) mensaje = '🎄 ¡Feliz Navidad!';
  else if (diasFaltan <= 7) mensaje = `¡Quedan solo ${diasFaltan} días para Navidad! Últimos preparativos.`;
  else if (diasFaltan <= 30) mensaje = `Faltan ${diasFaltan} días (${semanas} semanas, ${domingos} domingos). ¡Hora de comprar regalos!`;
  else mensaje = `Faltan ${diasFaltan} días (${semanas} semanas y ${diasFaltan % 7} días, ${domingos} domingos) para Navidad ${year}.`;

  let _insight;
  if (diasFaltan <= 0) {
    _insight = { title: '¡Llegó Navidad!', text: 'Hoy es **25 de diciembre**: a disfrutar la mesa y los regalos. ¡Feliz Navidad! 🎄', tone: 'good', icon: '🎅' };
  } else if (diasFaltan <= 7) {
    _insight = { title: 'Recta final', text: `Quedan apenas **${diasFaltan} días** (${horas} horas) para Navidad. Últimas compras, envoltorios y a confirmar la cena del **${diaNavidad}**.`, tone: 'warn', icon: '⏰' };
  } else if (diasFaltan <= 30) {
    _insight = { title: 'Hora de organizarse', text: `Faltan **${diasFaltan} días** (${semanas} semanas, **${domingos} domingos**) para el **${diaNavidad}**. Buen momento para cerrar la lista de regalos antes de que suban los precios.`, tone: 'neutral', icon: '🎁' };
  } else {
    _insight = { title: 'Todavía hay tiempo', text: `Faltan **${diasFaltan} días** (${semanas} semanas, **${domingos} domingos**) para Navidad. Con esta anticipación podés ahorrar de a poco y cazar ofertas sin apuro.`, tone: 'good', icon: '🎄' };
  }

  return { diasFaltan: Math.max(0, diasFaltan), semanas, domingos, horas: Math.max(0, horas), diaNavidad, desgloseDias, mensaje, _insight };
}
