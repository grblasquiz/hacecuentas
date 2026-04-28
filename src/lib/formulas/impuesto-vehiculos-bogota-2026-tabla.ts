export interface Inputs {
  avaluo_minhacienda: number;
  anio_modelo: number;
  es_electrico: boolean;
  pago_anticipado: boolean;
}

export interface Outputs {
  tarifa_aplicable: number;
  impuesto_base: number;
  descuento_pronto_pago: number;
  impuesto_final: number;
  fecha_vencimiento: string;
  detalles: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 - Fuente: Ministerio de Hacienda
  const RANGO_1_MAX = 50_000_000; // $50M
  const RANGO_1_TARIFA = 0.015; // 1.5%
  const RANGO_2_MAX = 110_000_000; // $110M
  const RANGO_2_TARIFA = 0.025; // 2.5%
  const RANGO_3_TARIFA = 0.035; // 3.5%
  const DESCUENTO_PRONTO_PAGO = 0.10; // 10%

  // Validación básica
  const avaluo = Math.max(1_000_000, Math.min(500_000_000, i.avaluo_minhacienda || 0));
  const anioModelo = Math.max(1990, Math.min(2026, i.anio_modelo || 2024));

  let tarifaAplicable = 0;
  let impuestoBase = 0;

  // Si es vehículo eléctrico, exención total
  if (i.es_electrico) {
    tarifaAplicable = 0;
    impuestoBase = 0;
  } else {
    // Determinar tarifa según rango de avalúo
    if (avaluo <= RANGO_1_MAX) {
      tarifaAplicable = RANGO_1_TARIFA;
    } else if (avaluo <= RANGO_2_MAX) {
      tarifaAplicable = RANGO_2_TARIFA;
    } else {
      tarifaAplicable = RANGO_3_TARIFA;
    }

    // Calcular impuesto base
    impuestoBase = Math.round(avaluo * tarifaAplicable);
  }

  // Aplicar descuento por pronto pago
  let descuentoProntoPago = 0;
  let impuestoFinal = impuestoBase;

  if (i.pago_anticipado && impuestoBase > 0) {
    descuentoProntoPago = Math.round(impuestoBase * DESCUENTO_PRONTO_PAGO);
    impuestoFinal = impuestoBase - descuentoProntoPago;
  }

  // Fecha de vencimiento (30 de junio del año fiscal)
  const anioFiscal = new Date().getFullYear();
  const fechaVencimiento = `30 de junio de ${anioFiscal}`;

  // Detalles del cálculo
  let detalles = '';
  if (i.es_electrico) {
    detalles = `Vehículo eléctrico: EXENTO de impuesto. Avalúo: $${avaluo.toLocaleString('es-CO')}. No hay impuesto a pagar.`;
  } else {
    detalles = `Avalúo: $${avaluo.toLocaleString('es-CO')}. Tarifa: ${(tarifaAplicable * 100).toFixed(1)}%. `;
    detalles += `Impuesto base: $${impuestoBase.toLocaleString('es-CO')}.`;
    if (i.pago_anticipado) {
      detalles += ` Con descuento pronto pago (10%): $${impuestoFinal.toLocaleString('es-CO')}.`;
      detalles += ` Plazo: enero 1 a marzo 31.`;
    } else {
      detalles += ` Vencimiento normal: ${fechaVencimiento}.`;
    }
  }

  return {
    tarifa_aplicable: tarifaAplicable * 100,
    impuesto_base: impuestoBase,
    descuento_pronto_pago: descuentoProntoPago,
    impuesto_final: impuestoFinal,
    fecha_vencimiento: fechaVencimiento,
    detalles: detalles
  };
}
