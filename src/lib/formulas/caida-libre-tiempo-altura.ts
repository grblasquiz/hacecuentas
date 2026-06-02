/** Calculadora de Caída Libre — t = √(2h/g) */
export interface Inputs { altura: number; gravedad: number; }
export interface Outputs { tiempo: number; velocidadImpacto: number; velocidadKmh: number; formula: string; _insight?: any; }

export function caidaLibreTiempoAltura(i: Inputs): Outputs {
  const h = Number(i.altura);
  const g = Number(i.gravedad) || 9.81;
  if (h < 0) throw new Error('La altura no puede ser negativa');
  if (g <= 0) throw new Error('La gravedad debe ser mayor a 0');

  const t = Math.sqrt(2 * h / g);
  const v = Math.sqrt(2 * g * h);
  const vKmh = v * 3.6;

  return {
    tiempo: Number(t.toFixed(4)),
    velocidadImpacto: Number(v.toFixed(2)),
    velocidadKmh: Number(vKmh.toFixed(2)),
    formula: `t = √(2 × ${h} / ${g}) = ${t.toFixed(4)} s; v = √(2 × ${g} × ${h}) = ${v.toFixed(2)} m/s`,
    _insight: {
      title: 'La caída en números',
      text: `Soltado desde **${h} m**, un objeto tarda **${t.toFixed(2)} s** en caer y llega al suelo a **${vKmh.toFixed(0)} km/h** (${v.toFixed(1)} m/s). El cálculo ignora la resistencia del aire, así que en la práctica la velocidad real es algo menor.`,
      tone: 'neutral',
      icon: '🪂',
    },
  };
}
