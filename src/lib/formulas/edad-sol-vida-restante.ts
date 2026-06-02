/** Calculadora Vida del Sol — vida ∝ M^(-2.5) */
export interface Inputs { masaEstelar: number; edadActual: number; }
export interface Outputs { resultado: string; vidaTotal: number; vidaRestante: number; porcentaje: number; _insight?: any; _chart?: any; }

export function edadSolVidaRestante(i: Inputs): Outputs {
  const M = Number(i.masaEstelar);
  const edad = Number(i.edadActual);
  if (M < 0.08 || M > 150) throw new Error('La masa debe estar entre 0,08 y 150 masas solares');
  if (edad < 0) throw new Error('La edad no puede ser negativa');

  // Vida en secuencia principal aproximada: T ≈ 10000 × M^(-2.5) millones de años
  // (para el Sol: M=1 → T ≈ 10000 M años)
  const vidaTotal = 10000 * Math.pow(M, -2.5);
  const restante = Math.max(0, vidaTotal - edad);
  const pct = Math.min(100, (edad / vidaTotal) * 100);

  let estado: string;
  if (pct < 10) estado = 'Estrella joven';
  else if (pct < 50) estado = 'Primera mitad de vida';
  else if (pct < 90) estado = 'Segunda mitad de vida';
  else if (pct < 100) estado = 'Final de secuencia principal';
  else estado = 'Post-secuencia principal';

  const pctRest = Math.max(0, 100 - pct);
  const _insight = {
    title: estado,
    text: `Una estrella de **${M} masas solares** vive ~**${vidaTotal.toFixed(0)} millones de años** en secuencia principal. A los ${edad} M.a. ya consumió el **${pct.toFixed(0)}%** de esa vida, y le quedan **${restante.toFixed(0)} M.a.** (${pctRest.toFixed(0)}%).`,
    tone: pct >= 90 ? "warn" : pct >= 50 ? "neutral" : "good",
    icon: pct >= 90 ? "🌅" : "☀️",
  };
  const _chart = {
    type: "scale",
    marker: Math.min(pct, 99.9),
    markerLabel: `${pct.toFixed(0)}% vivido`,
    min: 0,
    segments: [
      { nombre: "Joven", max: 10, color: "#60a5fa", colorDark: "#1d4ed8" },
      { nombre: "Primera mitad", max: 50, color: "#34d399", colorDark: "#047857" },
      { nombre: "Segunda mitad", max: 90, color: "#fbbf24", colorDark: "#b45309" },
      { nombre: "Final 2ª", max: 100, color: "#f87171", colorDark: "#b91c1c" },
    ],
    ariaLabel: `Vida estelar consumida: ${pct.toFixed(0)}% de ${vidaTotal.toFixed(0)} millones de años, estado ${estado}`,
  };

  return {
    resultado: `${estado} · ${(100 - pct).toFixed(0)}% restante`,
    vidaTotal: Number(vidaTotal.toFixed(0)),
    vidaRestante: Number(restante.toFixed(0)),
    porcentaje: Number(pct.toFixed(2)),
    _insight,
    _chart,
  };
}
