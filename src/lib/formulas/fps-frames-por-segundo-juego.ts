/** Evaluación de FPS según tipo de juego y monitor */
export interface Inputs { fpsActuales: number; hzMonitor: number; tipoJuego?: string; }
export interface Outputs { evaluacion: string; fpsRecomendados: number; aprovechamiento: number; detalle: string; _insight?: any; _chart?: any; }

const recomendados: Record<string, { min: number; rec: number; ideal: number; nombre: string }> = {
  competitivo: { min: 120, rec: 144, ideal: 240, nombre: 'Competitivo' },
  accion: { min: 45, rec: 60, ideal: 120, nombre: 'Acción / RPG' },
  casual: { min: 30, rec: 60, ideal: 60, nombre: 'Casual / Indie' },
  simulacion: { min: 30, rec: 60, ideal: 90, nombre: 'Simulación' },
};

export function fpsFramesPorSegundoJuego(i: Inputs): Outputs {
  const fps = Number(i.fpsActuales);
  const hz = Number(i.hzMonitor);
  const tipo = String(i.tipoJuego || 'competitivo');

  if (!fps || fps <= 0) throw new Error('Ingresá tus FPS actuales');
  if (!hz || hz <= 0) throw new Error('Ingresá la tasa de refresco de tu monitor en Hz');

  const perfil = recomendados[tipo] || recomendados.competitivo;
  const aprovechamiento = Math.min((fps / hz) * 100, 100);

  let evaluacion: string;
  if (fps >= perfil.ideal) evaluacion = 'Excelente — rendimiento óptimo';
  else if (fps >= perfil.rec) evaluacion = 'Bueno — experiencia fluida';
  else if (fps >= perfil.min) evaluacion = 'Aceptable — jugable pero mejorable';
  else evaluacion = 'Bajo — se va a sentir trabado';

  const fpsTarget = Math.min(perfil.rec, hz);
  const aprovR = Number(aprovechamiento.toFixed(1));

  const esBueno = fps >= perfil.rec;
  const esBajo = fps < perfil.min;
  const tone: 'good' | 'warn' | 'neutral' = esBueno ? 'good' : esBajo ? 'warn' : 'neutral';
  const _insight = {
    title: `${fps} FPS para ${perfil.nombre}`,
    text:
      `${evaluacion}. Aprovechás el **${aprovR}%** de tu monitor de **${hz} Hz**. ` +
      (esBueno
        ? `Ya superás los **${perfil.rec} FPS** recomendados para este tipo de juego.`
        : `Para una experiencia fluida apuntá a **${perfil.rec} FPS**${fps < hz ? ` y, si la GPU da, a ${hz} para igualar tu monitor` : ''}.`),
    tone,
    icon: '🎮',
  };

  const _chart = {
    type: 'scale',
    marker: aprovR,
    markerLabel: `${aprovR}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Bajo', max: 50, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Parcial', max: 75, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Casi pleno', max: 99, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Pleno', max: 100, color: '#10b981', colorDark: '#34d399' },
    ],
    ariaLabel: `Aprovechamiento del monitor: ${aprovR}% de los ${hz} Hz`,
  };

  return {
    evaluacion,
    fpsRecomendados: perfil.rec,
    aprovechamiento: aprovR,
    detalle: `${fps} FPS en monitor de ${hz} Hz para ${perfil.nombre}: ${evaluacion}. Recomendado: ${perfil.rec} FPS. Aprovechás el ${aprovechamiento.toFixed(1)}% de tu monitor.`,
    _insight,
    _chart,
  };
}
