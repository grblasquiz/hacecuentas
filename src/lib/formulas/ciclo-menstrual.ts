/** Calculadora del ciclo menstrual */
export interface Inputs { fumCiclo: string; duracionCicloM: number; duracionSangrado?: number; }
export interface Outputs { proximaMenstruacion: string; ovulacionEstimada: string; fasesActuales: string; proximosTresCiclos: string; }

export function cicloMenstrual(i: Inputs): Outputs {
  const fum = new Date(i.fumCiclo + 'T00:00:00');
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
  let proxReal = new Date(proxima + 'T00:00:00');
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

  return {
    proximaMenstruacion: fmt(proxReal),
    ovulacionEstimada: fmt(ovulReal),
    fasesActuales: fase,
    proximosTresCiclos: ciclos.join(', '),
  };
}
