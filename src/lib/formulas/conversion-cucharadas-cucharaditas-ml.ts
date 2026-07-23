/** Conversor volumétrico de cocina: cucharadas, cucharaditas, tazas, ml, litros y onzas líquidas */
export interface Inputs {
  cantidad?: number;
  unidadOrigen?: string;
  unidadDestino?: string;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  enMl: number;
  enCucharadas: number;
  enCucharaditas: number;
  formula: string;
  _insight?: any;
}

const ML: Record<string, { ml: number; label: string }> = {
  cucharada: { ml: 15, label: 'cucharadas' },
  cucharadita: { ml: 5, label: 'cucharaditas' },
  taza: { ml: 240, label: 'tazas' },
  ml: { ml: 1, label: 'ml' },
  litro: { ml: 1000, label: 'litros' },
  oz: { ml: 29.57, label: 'onzas líquidas' },
};

export function conversionCucharadasCucharaditasMl(i: Inputs): Outputs {
  const cantidad = Number(i.cantidad) || 0;
  const origen = String(i.unidadOrigen || 'cucharada');
  const destino = String(i.unidadDestino || 'cucharadita');

  if (cantidad <= 0) throw new Error('Ingresá una cantidad mayor a cero');
  const uO = ML[origen];
  const uD = ML[destino];
  if (!uO || !uD) throw new Error('Elegí unidades válidas');

  const enMlExacto = cantidad * uO.ml;
  const resultado = Number((enMlExacto / uD.ml).toFixed(4));
  const enMl = Number(enMlExacto.toFixed(4));
  const enCucharadas = Number((enMlExacto / 15).toFixed(4));
  const enCucharaditas = Number((enMlExacto / 5).toFixed(4));

  const formula = `${cantidad} ${uO.label} × ${uO.ml} ml ÷ ${uD.ml} ml = ${resultado} ${uD.label}`;

  return {
    resultado,
    enMl,
    enCucharadas,
    enCucharaditas,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `**${cantidad} ${uO.label} equivalen a ${resultado} ${uD.label}** (${enMl} ml en total). Regla de oro de la cocina: **1 cucharada = 3 cucharaditas = 15 ml**, y 1 taza estándar = 240 ml = 16 cucharadas. Estas equivalencias valen para líquidos y volumen; para pasar a gramos necesitás la densidad del ingrediente.`,
      tone: 'neutral',
      icon: '🥄',
    },
  };
}
