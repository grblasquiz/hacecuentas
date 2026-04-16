/**
 * Calculadora de Herencia Legítima Argentina
 * CCyCN Arts. 2444-2461
 * Descendientes: 2/3. Cónyuge: 1/2. Ascendientes: 1/2.
 */

export interface HerenciaLegitimaInputs {
  patrimonioTotal: number;
  herederos: string;
  cantidadHijos: number;
}

export interface HerenciaLegitimaOutputs {
  legitimaTotal: number;
  porcionDisponible: number;
  porcionPorHeredero: string;
  detalleReparto: string;
}

export function herenciaLegitima(inputs: HerenciaLegitimaInputs): HerenciaLegitimaOutputs {
  const patrimonio = Number(inputs.patrimonioTotal);
  const tipo = inputs.herederos || 'hijos';
  const cantHijos = Math.max(0, Number(inputs.cantidadHijos) || 0);

  if (!patrimonio || patrimonio <= 0) {
    throw new Error('Ingresá el patrimonio total del causante');
  }

  let fraccionLegitima: number;
  let detalle: string;
  let porcionPorHeredero: string;

  switch (tipo) {
    case 'hijos': {
      fraccionLegitima = 2 / 3;
      const hijos = Math.max(1, cantHijos);
      const porHijo = (patrimonio * fraccionLegitima) / hijos;
      porcionPorHeredero = `$${Math.round(porHijo).toLocaleString()} por cada hijo (${hijos} hijo${hijos > 1 ? 's' : ''})`;
      detalle = `Legítima 2/3 dividida en ${hijos} parte${hijos > 1 ? 's' : ''} iguales`;
      break;
    }
    case 'hijos-conyuge': {
      fraccionLegitima = 2 / 3;
      const hijos = Math.max(1, cantHijos);
      const partes = hijos + 1; // cónyuge como un hijo más (bienes propios)
      const porParte = (patrimonio * fraccionLegitima) / partes;
      porcionPorHeredero = `$${Math.round(porParte).toLocaleString()} cada uno (cónyuge + ${hijos} hijo${hijos > 1 ? 's' : ''})`;
      detalle = `Legítima 2/3 dividida en ${partes} partes (cónyuge hereda como un hijo más sobre bienes propios)`;
      break;
    }
    case 'conyuge-solo': {
      fraccionLegitima = 1 / 2;
      porcionPorHeredero = `$${Math.round(patrimonio * fraccionLegitima).toLocaleString()} para el cónyuge`;
      detalle = 'Legítima 1/2 para cónyuge único heredero forzoso';
      break;
    }
    case 'padres': {
      fraccionLegitima = 1 / 2;
      const porPadre = (patrimonio * fraccionLegitima) / 2;
      porcionPorHeredero = `$${Math.round(porPadre).toLocaleString()} por cada padre`;
      detalle = 'Legítima 1/2 dividida entre ambos padres';
      break;
    }
    case 'padres-conyuge': {
      fraccionLegitima = 1 / 2;
      const mitadConyuge = (patrimonio * fraccionLegitima) / 2;
      const mitadPadres = (patrimonio * fraccionLegitima) / 2;
      porcionPorHeredero = `Cónyuge: $${Math.round(mitadConyuge).toLocaleString()}, Padres: $${Math.round(mitadPadres).toLocaleString()} (a dividir)`;
      detalle = 'Legítima 1/2: mitad cónyuge, mitad padres';
      break;
    }
    default:
      fraccionLegitima = 2 / 3;
      porcionPorHeredero = 'Seleccioná un tipo de heredero';
      detalle = '';
  }

  const legitimaTotal = patrimonio * fraccionLegitima;
  const porcionDisponible = patrimonio - legitimaTotal;

  return {
    legitimaTotal: Math.round(legitimaTotal),
    porcionDisponible: Math.round(porcionDisponible),
    porcionPorHeredero,
    detalleReparto: detalle,
  };
}
