/**
 * Cuánta falta para Navidad (25/12) y Año Nuevo (01/01).
 *
 * No pide la fecha al usuario: usa new Date() para "hoy" y calcula la PRÓXIMA
 * Navidad y el PRÓXIMO Año Nuevo (si ya pasaron este año, los del año que viene).
 * Corre client-side al apretar Calcular, así que el conteo nunca queda congelado.
 *
 * Input opcional `objetivo` ("navidad" | "ano-nuevo" | "ambas"): sólo cambia
 * el énfasis del resultado/insight; ambos conteos se calculan siempre.
 */
export interface Inputs { objetivo?: string; [k: string]: number | string | undefined; }
export interface Outputs {
  diasNavidad: number;
  diasAnoNuevo: number;
  fechaNavidad: string;
  fechaAnoNuevo: string;
  resumen: string;
  _insight?: any;
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function diasHasta(hoy: Date, objetivo: Date): number {
  return Math.ceil((objetivo.getTime() - hoy.getTime()) / 86400000);
}

export function cuantoFaltaNavidadAnoNuevo(i: Inputs): Outputs {
  const objetivo = String(i.objetivo || 'ambas');

  // "Hoy" a medianoche local, calculado en el cliente al apretar Calcular.
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const anio = hoy.getFullYear();

  // Próxima Navidad: 25/12 de este año; si ya pasó, la del año que viene.
  let navidad = new Date(anio, 11, 25);
  if (navidad.getTime() < hoy.getTime()) navidad = new Date(anio + 1, 11, 25);

  // Próximo Año Nuevo: 01/01 SIEMPRE es del año siguiente al de hoy salvo que
  // hoy ya sea 1 de enero (en cuyo caso faltan 0 días, es hoy mismo).
  let anoNuevo = new Date(anio, 0, 1);
  if (anoNuevo.getTime() < hoy.getTime()) anoNuevo = new Date(anio + 1, 0, 1);

  const diasNavidad = Math.max(0, diasHasta(hoy, navidad));
  const diasAnoNuevo = Math.max(0, diasHasta(hoy, anoNuevo));

  const fechaNavidad = `${DIAS_SEMANA[navidad.getDay()]} 25 de diciembre de ${navidad.getFullYear()}`;
  const fechaAnoNuevo = `${DIAS_SEMANA[anoNuevo.getDay()]} 1 de enero de ${anoNuevo.getFullYear()}`;

  const esNavidadHoy = diasNavidad === 0;
  const esAnoNuevoHoy = diasAnoNuevo === 0;

  const fmt = (d: number) => `${d} ${d === 1 ? 'día' : 'días'}`;

  let resumen: string;
  if (esNavidadHoy) {
    resumen = `🎄 ¡Hoy es Navidad! Y faltan ${fmt(diasAnoNuevo)} para Año Nuevo (${fechaAnoNuevo}).`;
  } else if (esAnoNuevoHoy) {
    resumen = `🎉 ¡Hoy es Año Nuevo! La próxima Navidad (${fechaNavidad}) es en ${fmt(diasNavidad)}.`;
  } else {
    resumen = `Faltan ${fmt(diasNavidad)} para Navidad (${fechaNavidad}) y ${fmt(diasAnoNuevo)} para Año Nuevo (${fechaAnoNuevo}).`;
  }

  // El insight enfatiza el objetivo elegido (o el más cercano si es "ambas").
  let foco: 'navidad' | 'ano-nuevo';
  if (objetivo === 'navidad') foco = 'navidad';
  else if (objetivo === 'ano-nuevo') foco = 'ano-nuevo';
  else foco = diasNavidad <= diasAnoNuevo ? 'navidad' : 'ano-nuevo';

  const dias = foco === 'navidad' ? diasNavidad : diasAnoNuevo;
  const nombre = foco === 'navidad' ? 'Navidad' : 'Año Nuevo';
  const fechaFoco = foco === 'navidad' ? fechaNavidad : fechaAnoNuevo;
  const semanas = Math.floor(dias / 7);
  const resto = dias % 7;

  let _insight: any;
  if (dias === 0) {
    _insight = {
      title: `¡Llegó ${nombre}!`,
      text: `Hoy es **${fechaFoco}**. ¡A disfrutar la mesa, los brindis y los regalos! 🎉`,
      tone: 'good',
      icon: foco === 'navidad' ? '🎅' : '🥂',
    };
  } else if (dias <= 7) {
    _insight = {
      title: 'Recta final',
      text: `Quedan apenas **${fmt(dias)}** para ${nombre} (**${fechaFoco}**). Últimas compras, envoltorios y a confirmar la cena. Acordate que el 24 y el 31 son días laborables: muchos negocios cierran temprano.`,
      tone: 'warn',
      icon: '⏰',
    };
  } else if (dias <= 30) {
    const escala = semanas > 0 ? ` (≈ ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}${resto ? ` y ${resto} ${resto === 1 ? 'día' : 'días'}` : ''})` : '';
    _insight = {
      title: 'Hora de organizarse',
      text: `Faltan **${fmt(dias)}**${escala} para ${nombre} (**${fechaFoco}**). Buen momento para cerrar la lista de regalos y reservar mesa antes de que suban los precios de diciembre.`,
      tone: 'neutral',
      icon: '🎁',
    };
  } else {
    const meses = Math.round(dias / 30.44);
    _insight = {
      title: 'Todavía hay tiempo',
      text: `Faltan **${fmt(dias)}** (≈ ${meses} ${meses === 1 ? 'mes' : 'meses'}) para ${nombre} (**${fechaFoco}**). Con esta anticipación podés ahorrar de a poco y cazar ofertas (Cyber Monday de noviembre) sin apuro.`,
      tone: 'good',
      icon: '🎄',
    };
  }

  return { diasNavidad, diasAnoNuevo, fechaNavidad, fechaAnoNuevo, resumen, _insight };
}
