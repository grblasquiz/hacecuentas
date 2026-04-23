/** xA simplificado: expected assists por pase clave segun zona de pase y tipo */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

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

  return {
    xa: xa.toFixed(3),
    probabilidadGolReceptor: `${(xa * 100).toFixed(1)}%`,
    zonaMostrada: zona,
    tipoMostrado: tipo,
    categoria: cat,
    interpretacion: `Un pase ${tipo} desde ${zona} genera xA ${xa.toFixed(2)}. Si el receptor convierte, el pase cuenta como asistencia.`,
  };
}
