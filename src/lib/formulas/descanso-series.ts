/** Tiempo de descanso recomendado entre series */
export interface Inputs { objetivo: string; intensidad: string; grupoMuscular: string; }
export interface Outputs {
  descansoSegundos: number;
  descansoFormateado: string;
  explicacion: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const BASE_DESCANSO: Record<string, number> = {
  fuerza: 210,      // 3:30 base
  hipertrofia: 90,   // 1:30 base
  resistencia: 40,   // 0:40 base
};

const AJUSTE_INTENSIDAD: Record<string, number> = {
  baja: -15,
  media: 15,
  alta: 40,
};

const AJUSTE_GRUPO: Record<string, number> = {
  grande: 20,
  pequeno: -10,
};

export function descansoSeries(i: Inputs): Outputs {
  const obj = String(i.objetivo || 'hipertrofia');
  const int = String(i.intensidad || 'media');
  const grupo = String(i.grupoMuscular || 'grande');

  const base = BASE_DESCANSO[obj] || BASE_DESCANSO['hipertrofia'];
  const ajusteInt = AJUSTE_INTENSIDAD[int] || 0;
  const ajusteGrupo = AJUSTE_GRUPO[grupo] || 0;

  const totalSeg = Math.max(20, base + ajusteInt + ajusteGrupo);
  const minutos = Math.floor(totalSeg / 60);
  const segundos = totalSeg % 60;

  const formateado = minutos > 0
    ? `${minutos}:${segundos.toString().padStart(2, '0')} min`
    : `${segundos} seg`;

  const objNombres: Record<string, string> = {
    fuerza: 'fuerza máxima',
    hipertrofia: 'hipertrofia',
    resistencia: 'resistencia muscular',
  };

  const grupoNombres: Record<string, string> = {
    grande: 'grupo muscular grande',
    pequeno: 'grupo muscular pequeño',
  };

  const explicacion = obj === 'fuerza'
    ? 'Para fuerza máxima necesitás recuperar casi todo el ATP-CP (fosfocreatina), lo que toma 3-5 minutos. Esto permite levantar el máximo peso posible en cada serie.'
    : obj === 'hipertrofia'
    ? 'Para hipertrofia, descansos de 90-180 seg generan estrés metabólico suficiente manteniendo la capacidad de trabajo. Estudios recientes (Schoenfeld 2016) sugieren que 2-3 min puede ser incluso mejor para compuestos.'
    : 'Para resistencia muscular, descansos cortos (30-60 seg) mantienen la FC alta y trabajan la capacidad de tolerar lactato. El peso es bajo, así que no necesitás recuperación de ATP completa.';

  const zona = totalSeg <= 60 ? 'corto' : totalSeg <= 180 ? 'medio' : 'largo';
  const _insight = {
    title: 'Tu ventana de descanso',
    text: `Para ${objNombres[obj] || obj} con intensidad ${int} en ${grupoNombres[grupo] || grupo}, lo óptimo es descansar **${formateado}** entre series. Es un descanso **${zona}**: ${zona === 'corto' ? 'mantenés la FC alta y el estrés metabólico, ideal para resistencia.' : zona === 'medio' ? 'equilibra recuperación y bombeo, el clásico para ganar masa.' : 'recuperás casi todo el ATP-CP para mover el máximo peso en cada serie.'}`,
    tone: 'neutral' as const,
    icon: '⏱️',
  };
  const _chart = {
    type: 'scale',
    marker: totalSeg,
    markerLabel: formateado,
    min: 0,
    segments: [
      { nombre: 'Corto (resistencia)', max: 60, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Medio (hipertrofia)', max: 180, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Largo (fuerza)', max: 300, color: '#3b82f6', colorDark: '#60a5fa' },
    ],
    ariaLabel: `Descanso recomendado de ${totalSeg} segundos dentro de las zonas de entrenamiento`,
  };

  return {
    descansoSegundos: totalSeg,
    descansoFormateado: formateado,
    explicacion,
    detalle: `Objetivo: ${objNombres[obj] || obj} | Intensidad: ${int} | ${grupoNombres[grupo] || grupo} → descanso recomendado: ${formateado} (${totalSeg} seg).`,
    _insight,
    _chart,
  };
}
