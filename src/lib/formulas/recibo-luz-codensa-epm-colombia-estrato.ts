export interface Inputs {
  estrato: number; // 1-6
  consumo_kwh: number; // kWh/mes
  ciudad: 'bogota' | 'medellin' | 'cali' | 'barranquilla' | 'bucaramanga' | 'otra';
}

export interface Outputs {
  cargo_fijo: number;
  cargo_variable: number;
  subtotal_antes_ajuste: number;
  ajuste_estrato: number;
  subtotal_con_ajuste: number;
  otros_cargos: number;
  impuesto_nacional: number;
  total_recibo: number;
  tarifa_promedio: number;
  tipo_subsidio: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes tarifarias 2026 por ciudad (CREG, distribuidores)
  const tarifasBase: Record<string, { cargoFijo: number; tarifaE4: number }> = {
    bogota: { cargoFijo: 12500, tarifaE4: 618 }, // Codensa
    medellin: { cargoFijo: 11800, tarifaE4: 598 }, // EPM
    cali: { cargoFijo: 13200, tarifaE4: 625 }, // EPSA
    barranquilla: { cargoFijo: 12000, tarifaE4: 640 }, // Electricaribe
    bucaramanga: { cargoFijo: 11500, tarifaE4: 610 }, // Energía Bogotá
    otra: { cargoFijo: 12300, tarifaE4: 612 }, // Promedio nacional
  };

  const config = tarifasBase[i.ciudad] || tarifasBase['otra'];

  // Factores de subsidio/contribución por estrato (DIAN 2026)
  // Negativo = subsidio, positivo = contribución
  const factoresEstrato: Record<number, number> = {
    1: -0.5, // 50% subsidio
    2: -0.4, // 40% subsidio
    3: -0.15, // 15% subsidio
    4: 0, // Neutro
    5: 0.2, // 20% contribución
    6: 0.5, // 50% contribución
  };

  const factorEstrato = factoresEstrato[i.estrato] ?? 0;

  // 1. Cargo fijo
  const cargoFijo = config.cargoFijo;

  // 2. Tarifa variable con ajuste estrato
  // Tarifa aplicada = tarifaBase × (1 + factor estrato)
  const tarifaAplicada = config.tarifaE4 * (1 + factorEstrato);
  const cargoVariable = tarifaAplicada * i.consumo_kwh;

  // 3. Subtotal antes de ajuste (cargos sin subsidio/contribución explícito)
  const subtotalAntesAjuste = cargoFijo + config.tarifaE4 * i.consumo_kwh;

  // 4. Ajuste por estrato (diferencia entre tarifa subsidada/contributiva y base)
  // Ajuste = (tarifaAplicada - tarifaBase) × consumo
  const ajusteEstrato = (tarifaAplicada - config.tarifaE4) * i.consumo_kwh;

  // 5. Subtotal con ajuste
  const subtotalConAjuste = cargoFijo + cargoVariable;

  // 6. Otros cargos (alumbrado público, aseo, contribuciones municipales)
  // Aproximadamente 8-12% del subtotal según ciudad
  const porcentajeOtros: Record<string, number> = {
    bogota: 0.10, // Bogotá alto por servicios municipales
    medellin: 0.09, // EPM incluye más servicios
    cali: 0.08,
    barranquilla: 0.07,
    bucaramanga: 0.07,
    otra: 0.08,
  };
  const otrosCargos = subtotalConAjuste * (porcentajeOtros[i.ciudad] ?? 0.08);

  // 7. Base para impuesto (subtotal + otros)
  const baseImpuesto = subtotalConAjuste + otrosCargos;

  // 8. Impuesto nacional 4% (DIAN)
  const impuestoNacional = baseImpuesto * 0.04;

  // 9. Total a pagar
  const totalRecibo = baseImpuesto + impuestoNacional;

  // 10. Tarifa promedio ($/kWh incluyendo todos los cargos)
  const tarifaPromedio = i.consumo_kwh > 0 ? totalRecibo / i.consumo_kwh : 0;

  // 11. Clasificación subsidio/contribución
  let tipoSubsidio = 'Neutro';
  if (i.estrato <= 3) {
    tipoSubsidio = `Subsidiado (E${i.estrato}): ${Math.abs(factorEstrato * 100).toFixed(0)}% descuento`;
  } else if (i.estrato >= 5) {
    tipoSubsidio = `Contributivo (E${i.estrato}): ${(factorEstrato * 100).toFixed(0)}% sobrecosto`;
  }

  // Insight narrativo dinámico según estrato
  const cop = (n: number) => Math.round(n).toLocaleString('es-CO');
  let _insight: any = undefined;
  if (i.consumo_kwh > 0) {
    if (i.estrato <= 3) {
      _insight = {
        title: 'Estrato subsidiado',
        text: `Tu recibo estimado es **$${cop(totalRecibo)}** por **${i.consumo_kwh} kWh** ($${tarifaPromedio.toLocaleString('es-CO')}/kWh). El estrato ${i.estrato} recibe **${Math.abs(factorEstrato * 100).toFixed(0)}% de subsidio** sobre la energía.`,
        tone: 'good',
        icon: '💡',
      };
    } else if (i.estrato >= 5) {
      _insight = {
        title: 'Estrato con contribución',
        text: `Tu recibo estimado es **$${cop(totalRecibo)}** por **${i.consumo_kwh} kWh** ($${tarifaPromedio.toLocaleString('es-CO')}/kWh). El estrato ${i.estrato} paga **${(factorEstrato * 100).toFixed(0)}% de sobrecosto** que financia a los estratos bajos.`,
        tone: 'warn',
        icon: '💡',
      };
    } else {
      _insight = {
        title: 'Estrato neutro',
        text: `Tu recibo estimado es **$${cop(totalRecibo)}** por **${i.consumo_kwh} kWh** ($${tarifaPromedio.toLocaleString('es-CO')}/kWh). El estrato 4 paga la tarifa plena, sin subsidio ni contribución.`,
        tone: 'neutral',
        icon: '💡',
      };
    }
  }

  // Gráfico: composición del total (cargo fijo + variable + otros + impuesto = total)
  let _chart: any = undefined;
  if (i.consumo_kwh > 0 && totalRecibo > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Cargo fijo', value: Math.round(cargoFijo) },
        { label: 'Consumo (con estrato)', value: Math.round(cargoVariable) },
        { label: 'Otros cargos', value: Math.round(otrosCargos) },
        { label: 'Impuesto nacional 4%', value: Math.round(impuestoNacional) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: '$' + cop(totalRecibo),
      centerLabel: 'Total recibo',
      ariaLabel: 'Composición del recibo de luz: cargo fijo, consumo, otros cargos e impuesto',
    };
  }

  return {
    cargo_fijo: Math.round(cargoFijo),
    cargo_variable: Math.round(cargoVariable),
    subtotal_antes_ajuste: Math.round(subtotalAntesAjuste),
    ajuste_estrato: Math.round(ajusteEstrato),
    subtotal_con_ajuste: Math.round(subtotalConAjuste),
    otros_cargos: Math.round(otrosCargos),
    impuesto_nacional: Math.round(impuestoNacional),
    total_recibo: Math.round(totalRecibo),
    tarifa_promedio: Math.round(tarifaPromedio * 100) / 100,
    tipo_subsidio: tipoSubsidio,
    _insight,
    _chart,
  };
}
