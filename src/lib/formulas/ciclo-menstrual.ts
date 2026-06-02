/** Calculadora del ciclo menstrual */
export interface Inputs { fumCiclo: string; duracionCicloM: number; duracionSangrado?: number; }
export interface Outputs { proximaMenstruacion: string; ovulacionEstimada: string; fasesActuales: string; proximosTresCiclos: string; _insight?: any; _chart?: any; }

export function cicloMenstrual(i: Inputs): Outputs {
  const parts = String(i.fumCiclo || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error('Ingresá una fecha válida');
  const ciclo = Number(i.duracionCicloM) || 28;
  const sangrado = Number(i.duracionSangrado) || 5;
  if (ciclo < 21 || ciclo > 45) throw new Error('El ciclo debe estar entre 21 y 45 días');

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // Próxima menstruación
  const proxima = new Date(fum.getTime());
  proxima.setDate(proxima.getDate() + ciclo);

  // Si ya pasó, calcular la siguiente
  let proxReal = new Date(proxima.getTime());
  while (proxReal < hoy) { proxReal.setDate(proxReal.getDate() + ciclo); }

  // Ovulación: ciclo - 14
  const diaOvulacion = ciclo - 14;
  const ovulacion = new Date(fum.getTime());
  ovulacion.setDate(ovulacion.getDate() + diaOvulacion);
  // Si ya pasó, siguiente ciclo
  let ovulReal = new Date(ovulacion);
  while (ovulReal < hoy) { ovulReal.setDate(ovulReal.getDate() + ciclo); }

  // Fase actual
  const diasDesde = Math.floor((hoy.getTime() - fum.getTime()) / (1000 * 60 * 60 * 24));
  const diaEnCiclo = ((diasDesde % ciclo) + ciclo) % ciclo;
  let fase = '';
  if (diaEnCiclo < sangrado) fase = `Fase menstrual (día ${diaEnCiclo + 1} del ciclo)`;
  else if (diaEnCiclo < diaOvulacion - 1) fase = `Fase folicular (día ${diaEnCiclo + 1} del ciclo)`;
  else if (diaEnCiclo <= diaOvulacion + 1) fase = `Fase ovulatoria (día ${diaEnCiclo + 1} del ciclo) — ventana fértil`;
  else fase = `Fase lútea (día ${diaEnCiclo + 1} del ciclo)`;

  // Próximos 3 ciclos
  const ciclos: string[] = [];
  let d = new Date(proxReal);
  for (let j = 0; j < 3; j++) {
    ciclos.push(fmt(d));
    d = new Date(d.getTime()); d.setDate(d.getDate() + ciclo);
  }

  const diaActual = diaEnCiclo + 1;
  const diasAProxima = Math.round((proxReal.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const esFertil = diaEnCiclo >= diaOvulacion - 1 && diaEnCiclo <= diaOvulacion + 1;
  const esMenstrual = diaEnCiclo < sangrado;
  const faseCorta = esMenstrual ? 'menstrual' : diaEnCiclo < diaOvulacion - 1 ? 'folicular' : esFertil ? 'ovulatoria' : 'lútea';
  const tone = esFertil ? 'warn' : 'neutral';
  const icon = esFertil ? '🔴' : esMenstrual ? '🩸' : '🌸';
  const textoFase = esFertil
    ? `estás en tu **ventana fértil**: la concepción es más probable estos días`
    : esMenstrual
    ? `estás en fase **menstrual**`
    : `estás en fase **${faseCorta}**`;

  return {
    proximaMenstruacion: fmt(proxReal),
    ovulacionEstimada: fmt(ovulReal),
    fasesActuales: fase,
    proximosTresCiclos: ciclos.join(', '),
    _insight: {
      title: 'En qué punto de tu ciclo estás',
      text: `Hoy es el **día ${diaActual}** de un ciclo de **${ciclo} días** y ${textoFase}. Tu próxima menstruación cae en **${diasAProxima} día${diasAProxima === 1 ? '' : 's'}**.`,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: diaActual,
      markerLabel: `Día ${diaActual}`,
      min: 1,
      segments: [
        { nombre: 'Menstrual', max: sangrado, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Folicular', max: diaOvulacion - 1, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Fértil', max: diaOvulacion + 1, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Lútea', max: ciclo, color: '#8b5cf6', colorDark: '#7c3aed' },
      ],
      ariaLabel: `Día ${diaActual} de un ciclo de ${ciclo} días, ubicado en la fase ${faseCorta}.`,
    },
  };
}
