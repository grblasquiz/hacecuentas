/** Comparador de precio por kilo/litro/unidad */
export interface Inputs {
  precioA: number;
  cantidadA: number;
  unidad: string;
  precioB: number;
  cantidadB: number;
  precioC?: number;
  cantidadC?: number;
}
export interface Outputs {
  ganador: string;
  precioUnitarioA: string;
  precioUnitarioB: string;
  precioUnitarioC: string;
  diferencia: string;
}

export function precioPorKiloLitro(i: Inputs): Outputs {
  const pA = Number(i.precioA);
  const cA = Number(i.cantidadA);
  const pB = Number(i.precioB);
  const cB = Number(i.cantidadB);
  const pC = Number(i.precioC) || 0;
  const cC = Number(i.cantidadC) || 0;
  const unidad = i.unidad || 'g';

  if (!pA || pA <= 0 || !cA || cA <= 0) throw new Error('Ingresá precio y cantidad del Producto A');
  if (!pB || pB <= 0 || !cB || cB <= 0) throw new Error('Ingresá precio y cantidad del Producto B');

  // Normalize to base unit (kg, L, or units)
  const labels: Record<string, string> = { g: '/kg', kg: '/kg', ml: '/L', l: '/L', u: '/u' };
  const factors: Record<string, number> = { g: 1000, kg: 1, ml: 1000, l: 1, u: 1 };
  const label = labels[unidad] || '/u';
  const factor = factors[unidad] || 1;

  const unitA = (pA / cA) * factor;
  const unitB = (pB / cB) * factor;
  const unitC = pC > 0 && cC > 0 ? (pC / cC) * factor : Infinity;

  const fmt = (n: number) => `$${n.toFixed(2)}${label}`;

  const entries: { name: string; unit: number }[] = [
    { name: 'Producto A', unit: unitA },
    { name: 'Producto B', unit: unitB },
  ];
  if (pC > 0 && cC > 0) entries.push({ name: 'Producto C', unit: unitC });

  entries.sort((a, b) => a.unit - b.unit);
  const best = entries[0];
  const worst = entries[entries.length - 1];
  const diffPct = (((worst.unit - best.unit) / worst.unit) * 100).toFixed(1);

  return {
    ganador: `${best.name} es el más barato: ${fmt(best.unit)}`,
    precioUnitarioA: fmt(unitA),
    precioUnitarioB: fmt(unitB),
    precioUnitarioC: pC > 0 && cC > 0 ? fmt(unitC) : 'No ingresado',
    diferencia: `${best.name} es ${diffPct}% más barato que ${worst.name}`,
  };
}
