/** xA simplificado: expected assists por pase clave segun zona de pase y tipo */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function xaExpectedAssists(i: Inputs): Outputs {
  const zona = String(i.zona || 'banda-lateral');
  const tipo = String(i.tipo || 'centro');

  // Base xA segun zona de origen del pase
  const zonaXA: Record<string, number> = {
    'area-chica': 0.35,
    'area-grande': 0.22,
    'banda-lateral': 0.10,
    'tres-cuartos': 0.08,
    'mediocampo': 0.04,
    'campo-propio': 0.015,
  };
  // Multiplicador segun tipo de pase
  const tipoMul: Record<string, number> = {
    filtrado: 1.3, // pase al hueco
    centro: 1.0,   // centro aereo al area
    raso: 1.15,    // centro raso / atras
    corto: 0.8,
    largo: 0.7,
  };

  const base = zonaXA[zona] ?? 0.05;
  const mul = tipoMul[tipo] ?? 1.0;
  const xa = Math.min(0.6, Math.max(0.005, base * mul));

  const cat = xa >= 0.3 ? 'Pase de gol clarísimo'
    : xa >= 0.15 ? 'Pase clave de alta calidad'
    : xa >= 0.07 ? 'Pase clave medio'
    : xa >= 0.03 ? 'Pase con potencial'
    : 'Pase de baja peligrosidad';

  const tone = xa >= 0.15 ? 'good' : xa >= 0.03 ? 'neutral' : 'warn';

  const _insight = {
    title: `xA ${xa.toFixed(2)}: ${cat.toLowerCase()}`,
    text: `Un pase **${tipo}** desde **${zona}** genera **xA ${xa.toFixed(3)}**, o sea ~**${(xa * 100).toFixed(1)}%** de chance de que el receptor convierta. ${xa >= 0.15 ? 'Es un pase de altísimo valor ofensivo: los que generan más xA son los que terminan en asistencia.' : xa >= 0.07 ? 'Es un pase con peligro real; acumular varios por partido sostiene la creación de juego.' : 'El valor por pase es bajo, sumás xA por volumen y constancia más que por brillo individual.'}`,
    tone: tone as 'good' | 'neutral' | 'warn',
    icon: '🅰️',
  };

  const _chart = {
    type: 'scale',
    marker: Number(xa.toFixed(3)),
    markerLabel: `xA ${xa.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Baja peligrosidad', max: 0.03, color: '#94a3b8', colorDark: '#64748b' },
      { nombre: 'Con potencial', max: 0.07, color: '#fbbf24', colorDark: '#d97706' },
      { nombre: 'Pase clave medio', max: 0.15, color: '#a3e635', colorDark: '#65a30d' },
      { nombre: 'Alta calidad', max: 0.3, color: '#34d399', colorDark: '#059669' },
      { nombre: 'Pase de gol', max: 0.6, color: '#10b981', colorDark: '#047857' },
    ],
    ariaLabel: `Escala de xA de 0 a 0,6. El pase ${tipo} desde ${zona} marca ${xa.toFixed(3)}, categoría ${cat}.`,
  };

  return {
    xa: xa.toFixed(3),
    probabilidadGolReceptor: `${(xa * 100).toFixed(1)}%`,
    zonaMostrada: zona,
    tipoMostrado: tipo,
    categoria: cat,
    interpretacion: `Un pase ${tipo} desde ${zona} genera xA ${xa.toFixed(2)}. Si el receptor convierte, el pase cuenta como asistencia.`,
    _insight,
    _chart,
  };
}
