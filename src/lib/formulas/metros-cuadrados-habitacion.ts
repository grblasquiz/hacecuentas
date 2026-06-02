/** Calculadora de metros cuadrados */
export interface Inputs {
  largo1: number; ancho1: number;
  largo2?: number; ancho2?: number;
  largo3?: number; ancho3?: number;
}
export interface Outputs {
  superficieTotal: string;
  espacio1: string;
  espacio2: string;
  espacio3: string;
  _insight?: any;
  _chart?: any;
}

export function metrosCuadradosHabitacion(i: Inputs): Outputs {
  const l1 = Number(i.largo1); const a1 = Number(i.ancho1);
  const l2 = Number(i.largo2) || 0; const a2 = Number(i.ancho2) || 0;
  const l3 = Number(i.largo3) || 0; const a3 = Number(i.ancho3) || 0;

  if (!l1 || l1 <= 0 || !a1 || a1 <= 0) throw new Error('Ingresá largo y ancho del espacio 1');

  const s1 = l1 * a1;
  const s2 = l2 > 0 && a2 > 0 ? l2 * a2 : 0;
  const s3 = l3 > 0 && a3 > 0 ? l3 * a3 : 0;
  const total = s1 + s2 + s3;

  const espaciosCount = 1 + (s2 > 0 ? 1 : 0) + (s3 > 0 ? 1 : 0);
  const fmt = (n: number) => n.toFixed(1).replace('.', ',');
  const _insight = {
    title: 'Superficie total',
    text: espaciosCount > 1
      ? `Sumando **${espaciosCount} espacios** obtenés **${fmt(total)} m²** de superficie total. Sirve para cotizar piso, pintura o calefacción de todo el ambiente de una vez.`
      : `El espacio mide **${fmt(s1)} m²** (${fmt(l1)} m × ${fmt(a1)} m). Tené a mano este número para cotizar materiales: comprá siempre un 10% extra por cortes y desperdicio.`,
    tone: 'neutral' as const,
    icon: '📐',
  };

  const slices = [
    { label: 'Espacio 1', value: Math.round(s1 * 100) / 100 },
    { label: 'Espacio 2', value: Math.round(s2 * 100) / 100 },
    { label: 'Espacio 3', value: Math.round(s3 * 100) / 100 },
  ].filter(s => s.value > 0);
  const _chart = espaciosCount > 1 ? {
    type: 'doughnut' as const,
    slices,
    suffix: ' m²',
    centerValue: fmt(total) + ' m²',
    centerLabel: 'Total',
    ariaLabel: 'Aporte de cada espacio a la superficie total',
  } : undefined;

  return {
    superficieTotal: `${total.toFixed(1)} m²`,
    espacio1: `${l1}m × ${a1}m = ${s1.toFixed(1)} m²`,
    espacio2: s2 > 0 ? `${l2}m × ${a2}m = ${s2.toFixed(1)} m²` : 'No ingresado',
    espacio3: s3 > 0 ? `${l3}m × ${a3}m = ${s3.toFixed(1)} m²` : 'No ingresado',
    _insight,
    _chart,
  };
}
