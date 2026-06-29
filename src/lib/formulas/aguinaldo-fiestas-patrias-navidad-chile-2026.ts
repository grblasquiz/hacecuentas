// Aguinaldo de Fiestas Patrias y Navidad para el sector público en Chile — Ley 21.806.
// El monto base depende del tramo de renta líquida (umbral $1.060.493) y de la fecha.
// El adicional por carga familiar NO está confirmado en la fuente, por eso se fija en 0.
export interface Inputs {
  tipo: string; // "fiestas_patrias" | "navidad"
  rentaLiquida: number;
  cargasFamiliares: number;
}

export interface Outputs {
  montoBase: number;
  adicionalCargas: number;
  total: number;
  _insight?: any;
  _chart?: any;
}

const UMBRAL = 1_060_493; // renta líquida que separa el tramo alto del bajo

// Montos por tipo de aguinaldo: [renta <= umbral, renta > umbral]
const MONTOS: Record<string, { bajo: number; alto: number }> = {
  fiestas_patrias: { bajo: 91_682, alto: 63_645 },
  navidad: { bajo: 71_206, alto: 37_666 },
};

export function compute(i: Inputs): Outputs {
  const tipo = i.tipo === 'navidad' ? 'navidad' : 'fiestas_patrias';
  const renta = Math.max(0, i.rentaLiquida || 0);

  const tabla = MONTOS[tipo];
  const montoBase = renta <= UMBRAL ? tabla.bajo : tabla.alto;

  // Adicional por carga familiar no confirmado en la Ley 21.806 → 0 (ver FAQ).
  const adicionalCargas = 0;
  const total = montoBase + adicionalCargas;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const nombre = tipo === 'navidad' ? 'Navidad' : 'Fiestas Patrias';
  const tramo = renta <= UMBRAL ? 'tramo de renta más baja' : 'tramo de renta más alta';

  const _insight = {
    title: `Aguinaldo de ${nombre}: ${fmt(total)}`,
    text: `Con una renta líquida de **${fmt(renta)}** caés en el **${tramo}** (umbral ${fmt(UMBRAL)}), así que el aguinaldo de ${nombre} es de **${fmt(montoBase)}**. Estos montos fijos los define la Ley 21.806 para el sector público.`,
    tone: 'good' as const,
    icon: '🎁',
  };

  const _chart = {
    type: 'scale',
    marker: Math.round(renta),
    markerLabel: `Tu renta: ${fmt(renta)}`,
    min: 0,
    segments: [
      { nombre: `≤ umbral (${fmt(tabla.bajo)})`, max: UMBRAL, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: `> umbral (${fmt(tabla.alto)})`, max: Math.max(UMBRAL + 600000, renta + 1), color: '#d97706', colorDark: '#f59e0b' },
    ],
    ariaLabel: `Tramos de renta para el aguinaldo de ${nombre}: tu renta de ${fmt(renta)} cae en el ${tramo}.`,
  };

  return { montoBase, adicionalCargas, total, _insight, _chart };
}
