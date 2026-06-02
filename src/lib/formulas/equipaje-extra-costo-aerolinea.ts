/**
 * Calculadora de costo de equipaje extra por aerolínea
 * Estimación basada en tarifas públicas 2026.
 */

export interface EquipajeExtraCostoAerolineaInputs {
  aerolinea: string;
  tipoEquipaje: string;
  tramo: string;
  momento: string;
  tipoCambio: number;
}

export interface EquipajeExtraCostoAerolineaOutputs {
  costoUSD: number;
  costoARS: number;
  ahorroVsMostrador: string;
  recomendacion: string;
  _insight?: any;
}

type TarifaBase = { cabina10: number; bodega15: number; bodega23: number; bodega32: number };

const TARIFAS_USD: Record<string, { cabotaje: TarifaBase; regional: TarifaBase; internacional: TarifaBase }> = {
  flybondi: {
    cabotaje: { cabina10: 15, bodega15: 30, bodega23: 40, bodega32: 70 },
    regional: { cabina10: 20, bodega15: 40, bodega23: 55, bodega32: 90 },
    internacional: { cabina10: 25, bodega15: 50, bodega23: 70, bodega32: 110 },
  },
  jetsmart: {
    cabotaje: { cabina10: 15, bodega15: 30, bodega23: 45, bodega32: 75 },
    regional: { cabina10: 20, bodega15: 40, bodega23: 55, bodega32: 95 },
    internacional: { cabina10: 25, bodega15: 50, bodega23: 75, bodega32: 115 },
  },
  aerolineas: {
    cabotaje: { cabina10: 10, bodega15: 25, bodega23: 40, bodega32: 75 },
    regional: { cabina10: 0, bodega15: 25, bodega23: 0, bodega32: 90 },
    internacional: { cabina10: 0, bodega15: 0, bodega23: 0, bodega32: 120 },
  },
  latam: {
    cabotaje: { cabina10: 0, bodega15: 25, bodega23: 45, bodega32: 80 },
    regional: { cabina10: 0, bodega15: 35, bodega23: 55, bodega32: 100 },
    internacional: { cabina10: 0, bodega15: 0, bodega23: 0, bodega32: 130 },
  },
  sky: {
    cabotaje: { cabina10: 15, bodega15: 30, bodega23: 45, bodega32: 80 },
    regional: { cabina10: 20, bodega15: 40, bodega23: 60, bodega32: 100 },
    internacional: { cabina10: 25, bodega15: 50, bodega23: 75, bodega32: 120 },
  },
  ryanair: {
    cabotaje: { cabina10: 10, bodega15: 30, bodega23: 45, bodega32: 80 },
    regional: { cabina10: 15, bodega15: 40, bodega23: 55, bodega32: 95 },
    internacional: { cabina10: 20, bodega15: 50, bodega23: 70, bodega32: 110 },
  },
  american: {
    cabotaje: { cabina10: 0, bodega15: 35, bodega23: 40, bodega32: 100 },
    regional: { cabina10: 0, bodega15: 35, bodega23: 45, bodega32: 120 },
    internacional: { cabina10: 0, bodega15: 0, bodega23: 0, bodega32: 150 },
  },
};

const RECARGO_MOMENTO: Record<string, number> = {
  online: 1.0,
  previo: 1.25,
  mostrador: 2.0,
};

export function equipajeExtraCostoAerolinea(
  inputs: EquipajeExtraCostoAerolineaInputs,
): EquipajeExtraCostoAerolineaOutputs {
  const tarifa = TARIFAS_USD[inputs.aerolinea] ?? TARIFAS_USD.flybondi;
  const tramo = (tarifa as any)[inputs.tramo] ?? tarifa.cabotaje;
  const base: number = tramo[inputs.tipoEquipaje] ?? 0;
  const factor = RECARGO_MOMENTO[inputs.momento] ?? 1.0;

  const tc = Number(inputs.tipoCambio) || 1200;
  const costoUSD = Math.round(base * factor);
  const costoARS = Math.round(costoUSD * tc);

  let ahorroVsMostrador = 'No aplica (equipaje incluido).';
  let recomendacion = 'Equipaje incluido — no pagás extra.';

  if (base === 0) {
    return {
      costoUSD: 0,
      costoARS: 0,
      ahorroVsMostrador,
      recomendacion: 'Tu tarifa ya incluye este equipaje. No pagues de más.',
      _insight: {
        title: 'Buena noticia',
        text: 'Esta combinación de aerolínea y tramo **incluye este equipaje sin cargo**: no tenés que pagar ningún extra. Verificá que la tarifa que compraste sea la misma del cálculo.',
        tone: 'good',
        icon: '🧳',
      },
    };
  }

  const costoMostrador = Math.round(base * RECARGO_MOMENTO.mostrador);
  const diffUSD = costoMostrador - costoUSD;

  if (inputs.momento === 'mostrador') {
    ahorroVsMostrador = 'Estás pagando la tarifa más cara.';
    recomendacion = `Si lo compraras online ahorrarías ${Math.round(base * 1.0)} USD (mitad).`;
  } else if (inputs.momento === 'previo') {
    ahorroVsMostrador = `Ahorrás ${diffUSD} USD vs mostrador.`;
    recomendacion = `Bien — pero si lo hubieras comprado con el ticket ahorrabas otros ${Math.round(base * 0.25)} USD.`;
  } else {
    ahorroVsMostrador = `Ahorrás ${diffUSD} USD vs mostrador.`;
    recomendacion = 'Excelente — estás pagando la tarifa más barata.';
  }

  const _insight = {
    title: inputs.momento === 'mostrador' ? 'Estás pagando de más' : 'Cómo cae tu costo',
    text: inputs.momento === 'mostrador'
      ? `Comprar el equipaje **en el mostrador** te cuesta **USD ${costoUSD}** (~$${costoARS.toLocaleString('es-AR')}), el doble de la tarifa online. Comprándolo por la web pagarías la mitad y te ahorrarías **USD ${diffUSD}**.`
      : inputs.momento === 'previo'
      ? `Sumarlo **antes del vuelo** cuesta **USD ${costoUSD}** (~$${costoARS.toLocaleString('es-AR')}) y ya te ahorra **USD ${diffUSD}** frente al mostrador. Si lo hubieras agregado junto al ticket, ahorrabas otros USD ${Math.round(base * 0.25)}.`
      : `Comprándolo **online junto al ticket** pagás la tarifa más barata: **USD ${costoUSD}** (~$${costoARS.toLocaleString('es-AR')}), **USD ${diffUSD}** menos que en el mostrador.`,
    tone: inputs.momento === 'mostrador' ? 'warn' : inputs.momento === 'previo' ? 'neutral' : 'good',
    icon: '🧳',
  };
  return {
    costoUSD,
    costoARS,
    ahorroVsMostrador,
    recomendacion,
    _insight,
  };
}
