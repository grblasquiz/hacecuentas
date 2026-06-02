export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function fechaProbablePartoCalcularSemanas(i: Inputs): Outputs {
  const f=String(i.fum||''); if (!f) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const fpp=new Date(d.getTime()+280*86400000);
  const hoy=new Date();
  const sem=Math.floor((hoy.getTime()-d.getTime())/(7*86400000));
  const tri=sem<=13?'Primer':sem<=27?'Segundo':'Tercer';
  const fppIso=fpp.toISOString().slice(0,10);

  // Insight dinámico según etapa
  let insight;
  if (sem >= 37) {
    insight = {
      title: 'Embarazo a término',
      text: `Con **${sem} semanas** ya estás en zona de término: el parto puede ocurrir en cualquier momento. Fecha probable de parto: **${fppIso}**.`,
      tone: 'good',
      icon: '👶',
    };
  } else if (sem >= 0) {
    insight = {
      title: `${tri} trimestre`,
      text: `Hoy llevás **${sem} semanas** de gestación (**${tri} trimestre**). Tu fecha probable de parto, según la regla de Naegele (FUM + 280 días), es el **${fppIso}**.`,
      tone: 'neutral',
      icon: '🤰',
    };
  } else {
    insight = {
      title: 'Fecha de parto estimada',
      text: `Según la FUM ingresada, tu fecha probable de parto sería el **${fppIso}** (regla de Naegele: FUM + 280 días).`,
      tone: 'neutral',
      icon: '🗓️',
    };
  }

  // Gauge de avance del embarazo (0–42 semanas) con zonas por trimestre.
  const markerSem = Math.max(0, Math.min(sem, 42));
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

  return { fpp:fppIso, semanasHoy:sem+' semanas', trimestre:tri, resumen:`FPP: ${fppIso}. Hoy ${sem} semanas (${tri} trimestre).`, _insight:insight, _chart:chart };
}
