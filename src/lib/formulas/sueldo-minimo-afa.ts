/** Sueldo mínimo CCT AFA-FAA Liga Profesional Argentina 2026 */
export interface Inputs {
  categoria: 'primera' | 'primera-nacional' | 'primera-b' | 'primera-c' | 'reserva';
  anosAfa: number;
  premiosMensuales?: number;
  descuentoAportes?: boolean;
}
export interface Outputs {
  minimoMensual: number;
  antiguedad: number;
  premios: number;
  bruto: number;
  aportes: number;
  neto: number;
  categoriaLabel: string;
  mensaje: string;
}

// Referencia CCT AFA-FAA 2026 (ARS/mes)
const MINIMOS: Record<string, { label: string; minimo: number }> = {
  'primera':           { label: 'Primera División',           minimo: 1_200_000 },
  'primera-nacional':  { label: 'Primera Nacional (Ascenso)', minimo:   700_000 },
  'primera-b':         { label: 'Primera B',                  minimo:   420_000 },
  'primera-c':         { label: 'Primera C',                  minimo:   280_000 },
  'reserva':           { label: 'Reserva / inferiores',       minimo:   340_000 },
};

export function sueldoMinimoAfa(i: Inputs): Outputs {
  const catKey = i.categoria;
  const anos = Math.max(0, Number(i.anosAfa) || 0);
  const premios = Math.max(0, Number(i.premiosMensuales) || 0);
  const fila = MINIMOS[catKey];
  if (!fila) throw new Error('Categoría AFA inválida.');

  const minimo = fila.minimo;
  // Antigüedad FAA: 1% por año afiliado
  const antiguedad = minimo * 0.01 * anos;
  const bruto = minimo + antiguedad + premios;
  // Aportes futbolistas: ~17% (jubilación 11% + obra social 3% + FAA 3%)
  const descuenta = i.descuentoAportes !== false;
  const aportes = descuenta ? Math.round(bruto * 0.17) : 0;
  const neto = bruto - aportes;

  return {
    minimoMensual: Math.round(minimo),
    antiguedad: Math.round(antiguedad),
    premios: Math.round(premios),
    bruto: Math.round(bruto),
    aportes: Math.round(aportes),
    neto: Math.round(neto),
    categoriaLabel: fila.label,
    mensaje: `${fila.label}: mínimo $${Math.round(minimo).toLocaleString('es-AR')}/mes. Con antigüedad y premios, bruto $${Math.round(bruto).toLocaleString('es-AR')}.`,
  };
}
