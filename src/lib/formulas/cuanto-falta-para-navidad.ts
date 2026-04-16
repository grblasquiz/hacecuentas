/** Cuenta regresiva para Navidad */
export interface Inputs { fechaHoy: string; }
export interface Outputs { diasFaltan: number; semanas: number; horas: number; diaNavidad: string; mensaje: string; }

export function cuantoFaltaParaNavidad(i: Inputs): Outputs {
  const hoy = new Date(i.fechaHoy + 'T00:00:00');
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

  return { diasFaltan: Math.max(0, diasFaltan), semanas, horas: Math.max(0, horas), diaNavidad, mensaje };
}