/** Fecha probable de parto (FPP) — regla de Naegele (FUM) o datación por ecografía */
export interface Inputs {
  fechaUltimaMenstruacion?: string;
  fechaEcografia?: string;
  semanasEco?: number | string;
  diasEco?: number | string;
}
export interface Outputs {
  fechaProbableParto: string;
  semanasEmbarazo: number;
  diasEmbarazo: number;
  trimestre: number;
  fechaControl: string;
  metodo: string;
  _insight?: any;
  _chart?: any;
}

function parseFecha(s: string): Date {
  const parts = String(s || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const d = new Date(yy, mm - 1, dd);
  if (isNaN(d.getTime())) throw new Error('Fecha inválida');
  return d;
}

export function fechaParto(i: Inputs): Outputs {
  // Campos opcionales: el form manda '' (no la clave ausente). Tratamos
  // ''/null/undefined como "no provisto" para no confundir Number('')=0.
  const ecoRaw = i.fechaEcografia && String(i.fechaEcografia).trim() ? String(i.fechaEcografia).trim() : null;
  const semEco = i.semanasEco === '' || i.semanasEco == null ? null : Number(i.semanasEco);
  const diasEcoNum = i.diasEco === '' || i.diasEco == null ? 0 : Number(i.diasEco);

  // `fecha` = FUM efectiva: la FUM real, o la derivada de la ecografía.
  let fecha: Date;
  let metodo: string;
  if (ecoRaw && semEco != null && Number.isFinite(semEco)) {
    // La ecografía informa la edad gestacional directa (semanas+días a esa fecha).
    // FUM efectiva = fecha de la eco − edad gestacional. Es el estándar obstétrico
    // (no requiere convertir CRL→semanas: la eco ya entrega las semanas).
    if (semEco < 0 || semEco > 42) throw new Error('Las semanas de la ecografía deben estar entre 0 y 42');
    const ega = semEco * 7 + (Number.isFinite(diasEcoNum) ? diasEcoNum : 0);
    const ecoDate = parseFecha(ecoRaw);
    fecha = new Date(ecoDate.getTime());
    fecha.setDate(fecha.getDate() - ega);
    metodo = 'ecografía';
  } else {
    const fum = i.fechaUltimaMenstruacion;
    if (!fum) throw new Error('Ingresá la fecha de última menstruación (FUM) o los datos de tu ecografía');
    fecha = parseFecha(fum);
    metodo = 'FUM';
  }

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
  const datadoPor = metodo === 'ecografía' ? 'datado por ecografía (±5 días)' : 'datado por FUM (regla de Naegele)';

  // Insight dinámico según etapa del embarazo
  let insight;
  if (semanas >= 37) {
    insight = {
      title: 'Embarazo a término',
      text: `Con **${semanas} semanas y ${dias} ${dias === 1 ? 'día' : 'días'}** ya estás en zona de término: el parto puede ocurrir en cualquier momento. Fecha probable de parto: **${fppStr}** (${datadoPor}).`,
      tone: 'good',
      icon: '👶',
    };
  } else if (semanas >= 0) {
    insight = {
      title: 'Embarazo en curso',
      text: `Llevás **${semanas} semanas y ${dias} ${dias === 1 ? 'día' : 'días'}** de gestación (**${trimNombre}**, ${datadoPor}). Tu fecha probable de parto es el **${fppStr}** y tu próximo control sugerido, el **${fmt(proxControl)}**.`,
      tone: 'neutral',
      icon: '🤰',
    };
  } else {
    insight = {
      title: 'Fecha de parto estimada',
      text: `Tu fecha probable de parto sería el **${fppStr}** (${datadoPor}).`,
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
    metodo,
    _insight: insight,
    _chart: chart,
  };
}
