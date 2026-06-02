/** Fecha probable de parto (FPP) — regla de Naegele */
export interface Inputs { fechaUltimaMenstruacion: string; }
export interface Outputs {
  fechaProbableParto: string;
  semanasEmbarazo: number;
  diasEmbarazo: number;
  trimestre: number;
  fechaControl: string;
  _insight?: any;
  _chart?: any;
}

export function fechaParto(i: Inputs): Outputs {
  const fum = i.fechaUltimaMenstruacion;
  if (!fum) throw new Error('Ingresá la fecha de última menstruación');
  const parts = String(fum || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const fecha = new Date(yy, mm - 1, dd);
  if (isNaN(fecha.getTime())) throw new Error('Fecha inválida');

  // Naegele: FUM + 280 días (40 semanas). Clonamos sin +'T' (bug NaN en Date).
  const fpp = new Date(fecha.getTime());
  fpp.setDate(fpp.getDate() + 280);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasTranscurridos = Math.round((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diasTranscurridos / 7);
  const dias = diasTranscurridos % 7;

  let trim = 1;
  if (semanas >= 27) trim = 3;
  else if (semanas >= 13) trim = 2;

  // Próximo control (cada 4 semanas hasta sem 28, luego cada 2 semanas hasta 36, luego semanal)
  const proxControl = new Date(hoy);
  if (semanas < 28) proxControl.setDate(proxControl.getDate() + 28);
  else if (semanas < 36) proxControl.setDate(proxControl.getDate() + 14);
  else proxControl.setDate(proxControl.getDate() + 7);

  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  const fppStr = fmt(fpp);
  const trimNombre = trim === 1 ? '1.er trimestre' : trim === 2 ? '2.º trimestre' : '3.er trimestre';

  // Insight dinámico según etapa del embarazo
  let insight;
  if (semanas >= 37) {
    insight = {
      title: 'Embarazo a término',
      text: `Con **${semanas} semanas y ${dias} ${dias === 1 ? 'día' : 'días'}** ya estás en zona de término: el parto puede ocurrir en cualquier momento. Fecha probable de parto: **${fppStr}**.`,
      tone: 'good',
      icon: '👶',
    };
  } else if (semanas >= 0) {
    insight = {
      title: 'Embarazo en curso',
      text: `Llevás **${semanas} semanas y ${dias} ${dias === 1 ? 'día' : 'días'}** de gestación (**${trimNombre}**). Tu fecha probable de parto es el **${fppStr}** y tu próximo control sugerido, el **${fmt(proxControl)}**.`,
      tone: 'neutral',
      icon: '🤰',
    };
  } else {
    insight = {
      title: 'Fecha de parto estimada',
      text: `Según la FUM ingresada, tu fecha probable de parto sería el **${fppStr}** (regla de Naegele: FUM + 280 días).`,
      tone: 'neutral',
      icon: '🗓️',
    };
  }

  // Gauge de avance del embarazo (0–42 semanas) con zonas por trimestre.
  // El marcador se acota al rango del gráfico para no salirse de la última zona.
  const markerSem = Math.max(0, Math.min(semanas, 42));
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
    fechaProbableParto: fppStr,
    semanasEmbarazo: semanas,
    diasEmbarazo: dias,
    trimestre: trim,
    fechaControl: fmt(proxControl),
    _insight: insight,
    _chart: chart,
  };
}
