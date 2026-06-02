/**
 * FPP desde FUM con ajuste por ciclo (regla de Naegele).
 * FPP = FUM + 280 días + (ciclo − 28).
 */
export interface Inputs {
  fum: string;
  cicloDias: number;
}
export interface Outputs {
  fpp: string;
  semanaHoy: string;
  diasRestantes: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function parseLocal(s: string): Date | null {
  const parts = String(s || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return isNaN(d.getTime()) ? null : d;
}

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fechaProbablePartoUltimaMenstruacion(i: Inputs): Outputs {
  if (!i.fum) throw new Error('Ingresá la fecha de tu última menstruación');
  const ciclo = Number(i.cicloDias) || 28;
  if (ciclo < 21 || ciclo > 45) {
    throw new Error('La duración del ciclo debe estar entre 21 y 45 días');
  }
  const fum = parseLocal(i.fum);
  if (!fum) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fum.setHours(0, 0, 0, 0);
  if (fum > hoy) throw new Error('La FUM no puede ser futura');

  const diasTranscurridos = Math.floor((hoy.getTime() - fum.getTime()) / 86_400_000);
  if (diasTranscurridos > 320) {
    throw new Error('FUM demasiado antigua (>320 días). Revisá el valor ingresado.');
  }

  // Naegele con ajuste por ciclo.
  const totalDias = 280 + (ciclo - 28);
  const fpp = new Date(fum.getTime());
  fpp.setDate(fpp.getDate() + totalDias);

  const sem = Math.floor(diasTranscurridos / 7);
  const diasExtra = diasTranscurridos % 7;
  const semanaHoy = `${sem} semanas y ${diasExtra} días`;
  const diasRestantes = Math.max(0, totalDias - diasTranscurridos);

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fppNice = `${fpp.getDate()} de ${meses[fpp.getMonth()]} de ${fpp.getFullYear()}`;

  const ajuste = ciclo === 28
    ? 'ciclo estándar 28 días (Naegele clásica).'
    : `ajuste por ciclo ${ciclo} días: ${ciclo > 28 ? '+' : ''}${ciclo - 28} días sobre Naegele.`;

  const resumen = `FPP estimada: ${fppNice} · Semana ${sem}+${diasExtra} hoy · ${diasRestantes} días restantes · ${ajuste}`;

  const trimNombre = sem < 13 ? '1.er trimestre' : sem < 28 ? '2.º trimestre' : '3.er trimestre';

  // Insight dinámico según etapa del embarazo
  let insight;
  if (sem >= 37) {
    insight = {
      title: 'Embarazo a término',
      text: `Con **${semanaHoy}** ya estás en zona de término: el parto puede ocurrir en cualquier momento. Fecha probable de parto: **${fppNice}**.`,
      tone: 'good',
      icon: '👶',
    };
  } else {
    insight = {
      title: `${trimNombre} en curso`,
      text: `Hoy llevás **${semanaHoy}** de gestación. Faltan **${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}** para tu fecha probable de parto (**${fppNice}**), calculada con ${ajuste}`,
      tone: 'neutral',
      icon: '🤰',
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
    ariaLabel: `Avance del embarazo: semana ${markerSem} de 40, en el ${trimNombre}.`,
  };

  return {
    fpp: formatIso(fpp),
    semanaHoy,
    diasRestantes,
    resumen,
    _insight: insight,
    _chart: chart,
  };
}
