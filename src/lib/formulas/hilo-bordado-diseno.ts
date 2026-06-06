/**
 * Calculadora de hilo para bordado por diseño.
 *
 * Modelo basado en el consumo real de hilo por área cubierta.
 * Anclaje verificado: 1 madeja DMC (8 m, 2 hebras) rinde ~960 puntos de cruz
 * en tela Aida 14 ct → ~0,0083 m por punto. A 14 puntos/pulgada eso es
 * ~304 puntos/cm² → ~2.530 m por m² a cobertura 100% en punto cruz.
 * Los demás puntos se escalan por densidad relativa.
 */

export interface Inputs {
  ancho: number; alto: number; puntada: number; colores: number; cobertura: number;
}

export interface Outputs {
  metrosTotales: string; metrosPorColor: string; madejasNecesarias: string; consejo: string;
  _insight?: any;
}

// Consumo de hilo (m) por m² de área a cobertura 100%, según tipo de puntada.
const CONSUMO_POR_M2: Record<number, number> = {
  1: 2500, // Punto cruz (2 hebras, Aida 14 ct)
  2: 4500, // Punto lleno / satín (cobertura sólida, pasadas densas)
  3: 3000, // Cadena
  4: 5500, // Relleno máquina (tatami/relleno denso)
  5: 800,  // Back stitch (contorno, lineal)
};

const LARGO_MADEJA = 8; // m por madeja DMC Mouliné estándar

export function hiloBordadoDiseno(inputs: Inputs): Outputs {
  const a = Number(inputs.ancho);
  const h = Number(inputs.alto);
  const pt = Math.round(Number(inputs.puntada));
  const c = Math.round(Number(inputs.colores));
  const cov = Number(inputs.cobertura);
  if (!a || !h || !pt || !c || !cov) throw new Error('Completá los campos');

  const cons = CONSUMO_POR_M2[pt] || CONSUMO_POR_M2[1];
  const areaM2 = (a * h / 10000) * (cov / 100); // cm² → m², con cobertura
  const metrosReales = areaM2 * cons;
  const metrosPC = metrosReales / c;
  const madejas = Math.ceil(metrosPC / LARGO_MADEJA) + 1; // +1 madeja de seguridad por color

  let tip = '';
  if (pt === 5) tip = 'Back stitch (contorno): el consumo es bajo, 1 madeja por color suele alcanzar de sobra.';
  else if (pt === 2 || pt === 4) tip = 'Consumo alto (relleno sólido): comprá 30% extra del color dominante y, si podés, todo del mismo lote.';
  else if (pt === 1) tip = 'Punto cruz: comprá las madejas del color clave del mismo lote; un lote nuevo puede tener un tinte levemente distinto.';
  else tip = 'Consumo medio: 1-2 madejas por color alcanza en diseños pequeños.';

  const madejasTotales = madejas * c;
  const _insight = {
    title: 'Tu compra de hilo',
    text: `Tu diseño de **${a}×${h} cm** con **${c} ${c === 1 ? 'color' : 'colores'}** consume unos **${metrosReales.toFixed(0)} m** de hilo en total (**${metrosPC.toFixed(0)} m por color**), lo que equivale a **${madejas} madejas por color** y **${madejasTotales} madejas** en total. ${tip}`,
    tone: 'neutral' as const,
    icon: '🧵',
  };
  return {
    metrosTotales: `${metrosReales.toFixed(1)} m`,
    metrosPorColor: `${metrosPC.toFixed(1)} m`,
    madejasNecesarias: `${madejas} madejas por color`,
    consejo: tip,
    _insight,
  };
}
