export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// Inicio de clases en Argentina: primeros días de marzo (referencia 1 de marzo).
// La fecha exacta la fija cada jurisdicción en su calendario escolar.
function inicioClasesDe(year: number): Date {
  return new Date(year, 2, 1); // 2 = marzo (0-indexado)
}

export function cuantoFaltaFinCursoEscolarMarzo(i: Inputs): Outputs {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const diasSem = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const fmt = (d: Date) => `${diasSem[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Año de referencia: por defecto el actual (derivado de new Date()).
  // El usuario puede forzar opcionalmente un año (no es obligatorio).
  const anioPedido = Number(i.anio);
  const seForzo = Number.isFinite(anioPedido) && anioPedido >= hoy.getFullYear() && anioPedido <= 2100;
  let year = seForzo ? Math.trunc(anioPedido) : hoy.getFullYear();

  let inicio = inicioClasesDe(year);

  // Si NO se forzó un año y el inicio de marzo de este año ya pasó, saltar al año que viene.
  if (!seForzo && inicio.getTime() < hoy.getTime()) {
    year = year + 1;
    inicio = inicioClasesDe(year);
  }

  const dias = Math.round((inicio.getTime() - hoy.getTime()) / 86400000);
  const abs = Math.abs(dias);
  const semanas = Math.floor(abs / 7);
  const mesesAprox = Math.round(abs / 30.44);
  const escala = abs >= 60 ? `unos ${mesesAprox} meses` : abs >= 14 ? `unas ${semanas} semanas` : `${abs} días`;

  let _insight: any;
  if (dias > 0) {
    _insight = {
      title: `Faltan ${dias} días para el inicio de clases`,
      text: `El ciclo lectivo **${year}** arranca aproximadamente el **${fmt(inicio)}** (primeros días de marzo). Quedan **${dias} días** (${escala}). La fecha exacta la fija cada jurisdicción: confirmá con tu escuela o el calendario de tu provincia, porque suele moverse uno o dos días según el año.`,
      tone: dias <= 14 ? 'warn' : 'neutral',
      icon: '🎒',
    };
  } else if (dias === 0) {
    _insight = {
      title: '¡Hoy arrancan las clases!',
      text: `Hoy, **${fmt(inicio)}**, comienza el ciclo lectivo ${year}. La fecha exacta varía por provincia, así que verificá el calendario de tu jurisdicción.`,
      tone: 'good',
      icon: '🎓',
    };
  } else {
    _insight = {
      title: 'Las clases ya empezaron',
      text: `El ciclo lectivo ${year} arrancó el **${fmt(inicio)}**, hace **${abs} días** (${escala}). El próximo inicio será aproximadamente el **${fmt(inicioClasesDe(year + 1))}**.`,
      tone: 'neutral',
      icon: '📚',
    };
  }

  const etiqueta = dias > 0 ? `Faltan ${dias} días` : dias === 0 ? 'Hoy' : `Empezaron hace ${abs} días`;

  return {
    resultado: dias > 0 ? `${dias} días` : dias === 0 ? 'Hoy' : `Empezaron hace ${abs} días`,
    fechaInicio: fmt(inicio),
    resumen: `Inicio de clases ${year}: aprox. ${fmt(inicio)} (${etiqueta}). La fecha exacta varía por provincia.`,
    _insight,
  };
}
