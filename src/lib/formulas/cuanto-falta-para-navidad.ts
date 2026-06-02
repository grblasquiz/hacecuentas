/** Cuenta regresiva para Navidad */
export interface Inputs { fechaHoy: string; }
export interface Outputs { diasFaltan: number; semanas: number; horas: number; diaNavidad: string; mensaje: string; _insight?: any; }

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

  let mensaje: string;
  if (diasFaltan <= 0) mensaje = '🎄 ¡Feliz Navidad!';
  else if (diasFaltan <= 7) mensaje = `¡Quedan solo ${diasFaltan} días para Navidad! Últimos preparativos.`;
  else if (diasFaltan <= 30) mensaje = `Faltan ${diasFaltan} días (${semanas} semanas). ¡Hora de comprar regalos!`;
  else mensaje = `Faltan ${diasFaltan} días (${semanas} semanas y ${diasFaltan % 7} días) para Navidad ${year}.`;

  let _insight;
  if (diasFaltan <= 0) {
    _insight = { title: '¡Llegó Navidad!', text: 'Hoy es **25 de diciembre**: a disfrutar la mesa y los regalos. ¡Feliz Navidad! 🎄', tone: 'good', icon: '🎅' };
  } else if (diasFaltan <= 7) {
    _insight = { title: 'Recta final', text: `Quedan apenas **${diasFaltan} días** (${horas} horas) para Navidad. Últimas compras, envoltorios y a confirmar la cena del **${diaNavidad}**.`, tone: 'warn', icon: '⏰' };
  } else if (diasFaltan <= 30) {
    _insight = { title: 'Hora de organizarse', text: `Faltan **${diasFaltan} días** (${semanas} semanas) para el **${diaNavidad}**. Buen momento para cerrar la lista de regalos antes de que suban los precios.`, tone: 'neutral', icon: '🎁' };
  } else {
    _insight = { title: 'Todavía hay tiempo', text: `Faltan **${diasFaltan} días** (${semanas} semanas) para Navidad. Con esta anticipación podés ahorrar de a poco y cazar ofertas sin apuro.`, tone: 'good', icon: '🎄' };
  }

  return { diasFaltan: Math.max(0, diasFaltan), semanas, horas: Math.max(0, horas), diaNavidad, mensaje, _insight };
}