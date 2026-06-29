import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  sancion_liquidada: number;
  reduccion: string; // "ninguna" | "50" | "75"
}

export interface Outputs {
  sancion_minima: number;
  sancion_aplicable: number;
  sancion_final: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Redondeo al múltiplo de mil más cercano (aproximación oficial, art. 577 ET).
function redondearMil(n: number): number {
  return Math.round(n / 1000) * 1000;
}

// Factor de pago según la reducción aplicada (art. 640 ET).
function factorReduccion(reduccion: string): number {
  if (reduccion === '75') return 0.25; // reducción del 75% → se paga el 25%
  if (reduccion === '50') return 0.5; // reducción del 50% → se paga el 50%
  return 1.0; // ninguna
}

export function compute(i: Inputs): Outputs {
  const UVT = COLOMBIA_2026.uvt; // UVT 2026 = $52.374
  const minimaUvt = COLOMBIA_2026.sanciones.minimaUvt; // 10 UVT (art. 639 ET)

  const sancionMinima = redondearMil(minimaUvt * UVT); // 10 × 52.374 = 523.740 → $524.000 redondeado
  const sancionLiquidada = Math.max(0, i.sancion_liquidada || 0);
  const reduccion = i.reduccion || 'ninguna';

  // La sanción aplicable nunca puede ser inferior a la mínima (art. 639).
  const sancionAplicable = Math.max(sancionLiquidada, minimaUvt * UVT);

  const factor = factorReduccion(reduccion);
  // Redondeo al mil sobre el monto ya reducido (art. 577 ET).
  const sancionFinal = redondearMil(sancionAplicable * factor);

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const pctReduccion = reduccion === '75' ? '75%' : reduccion === '50' ? '50%' : '0%';
  const aplicoMinima = sancionLiquidada < minimaUvt * UVT;

  const _insight = {
    title: `Sanción final: ${fmtCOP(sancionFinal)}`,
    text: aplicoMinima
      ? `Tu sanción liquidada (**${fmtCOP(sancionLiquidada)}**) quedaba por debajo de la **sanción mínima de 10 UVT** (${fmtCOP(minimaUvt * UVT)}), así que se aplica el piso. ${reduccion !== 'ninguna' ? `Con la reducción del **${pctReduccion}** pagás **${fmtCOP(sancionFinal)}**.` : `Pagás **${fmtCOP(sancionFinal)}**.`}`
      : `Sobre una sanción liquidada de **${fmtCOP(sancionLiquidada)}**${reduccion !== 'ninguna' ? `, con la reducción del **${pctReduccion}** (art. 640 ET),` : ''} la sanción final es **${fmtCOP(sancionFinal)}** (redondeada al mil más cercano, art. 577 ET).`,
    tone: 'warn' as const,
    icon: '⚖️',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Sanción aplicable', value: redondearMil(sancionAplicable) },
      { label: 'Sanción final', value: sancionFinal },
    ],
    format: 'currency' as const,
    ariaLabel: `Comparación entre la sanción aplicable (${fmtCOP(sancionAplicable)}) y la final tras la reducción (${fmtCOP(sancionFinal)})`,
  };

  // Tabla computada: la sanción aplicable bajo cada nivel de reducción, con el MISMO
  // helper factorReduccion + redondearMil → coherente con el resultado principal.
  const niveles: { clave: string; nombre: string; factor: number }[] = [
    { clave: 'ninguna', nombre: 'Sin reducción', factor: 1.0 },
    { clave: '50', nombre: 'Reducción 50% (art. 640)', factor: 0.5 },
    { clave: '75', nombre: 'Reducción 75% (art. 640)', factor: 0.25 },
  ];
  const tableRows = niveles.map((n) => {
    const final = redondearMil(sancionAplicable * n.factor);
    const ahorro = redondearMil(sancionAplicable) - final;
    return [
      `${n.nombre}${n.clave === reduccion ? ' (tu caso)' : ''}`,
      `${Math.round((1 - n.factor) * 100)}%`,
      fmtCOP(final),
      fmtCOP(ahorro),
    ];
  });
  const _table = {
    title: 'Sanción final según la reducción aplicada',
    headers: ['Escenario', 'Reducción', 'Sanción a pagar', 'Ahorro'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: `La sanción mínima es 10 UVT = ${fmtCOP(sancionMinima)} en 2026 (art. 639 ET). Las reducciones del 50% y 75% (art. 640) aplican cuando se cumplen requisitos como subsanar la conducta y pagar dentro de los plazos. Los montos se redondean al mil más cercano (art. 577 ET).`,
  };

  return {
    sancion_minima: sancionMinima,
    sancion_aplicable: redondearMil(sancionAplicable),
    sancion_final: sancionFinal,
    _insight,
    _chart,
    _table,
  };
}
