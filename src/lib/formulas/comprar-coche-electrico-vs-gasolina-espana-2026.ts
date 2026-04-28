export interface Inputs {
  km_anio: number;
  precio_electrico: number;
  precio_gasolina_coche: number;
  moves_iii: number;
  precio_kwh: number;
  consumo_electrico_kwh: number;
  precio_gasolina_litro: number;
  consumo_gasolina_l: number;
  ivtm_electrico: number;
  ivtm_gasolina: number;
  seguro_electrico: number;
  seguro_gasolina: number;
  mantenimiento_electrico: number;
  mantenimiento_gasolina: number;
  itv_electrico: number;
  itv_gasolina: number;
  anos: number;
}

export interface Outputs {
  coste_total_electrico: number;
  coste_total_gasolina: number;
  ahorro_total: number;
  ahorro_anual_energia: number;
  breakeven_anos: number;
  coste_km_electrico: number;
  coste_km_gasolina: number;
  diferencia_compra: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  // --- Sanidad de inputs ---
  const kmAnio = Math.max(1000, i.km_anio);
  const anos = Math.max(1, i.anos);
  const precioKwh = Math.max(0.01, i.precio_kwh);
  const precioGasolinaLitro = Math.max(0.5, i.precio_gasolina_litro);
  const consumoElectricoKwh = Math.max(1, i.consumo_electrico_kwh);
  const consumoGasolinaL = Math.max(1, i.consumo_gasolina_l);

  // --- 1. Precio de adquisición neto ---
  // MOVES III: Fuente IDAE — hasta 7.000€ con achatarramiento (BEV particular)
  const adquisicionElectrico = Math.max(0, i.precio_electrico - i.moves_iii);
  const adquisicionGasolina = Math.max(0, i.precio_gasolina_coche);
  const diferenciaCompra = adquisicionElectrico - adquisicionGasolina;

  // --- 2. Coste anual de energía ---
  // Energía eléctrico: (km/año ÷ 100) × kWh/100km × €/kWh
  const energiaElectricoAnio = (kmAnio / 100) * consumoElectricoKwh * precioKwh;

  // Energía gasolina: (km/año ÷ 100) × L/100km × €/L
  // Fuente precios carburante: CORES 2025
  const energiaGasolinaAnio = (kmAnio / 100) * consumoGasolinaL * precioGasolinaLitro;

  const ahorroAnualEnergia = energiaGasolinaAnio - energiaElectricoAnio;

  // --- 3. ITV prorrateada ---
  // Obligatoria cada 2 años a partir del 4.º año; se aproxima a 0,5 inspecciones/año
  // Fuente: RD 920/2017 y tarifas medias estaciones ITV 2025
  const itvElectricoAnio = i.itv_electrico * 0.5;
  const itvGasolinaAnio = i.itv_gasolina * 0.5;

  // --- 4. Coste operativo anual ---
  const operativoElectricoAnio =
    energiaElectricoAnio +
    i.ivtm_electrico +
    i.seguro_electrico +
    i.mantenimiento_electrico +
    itvElectricoAnio;

  const operativoGasolinaAnio =
    energiaGasolinaAnio +
    i.ivtm_gasolina +
    i.seguro_gasolina +
    i.mantenimiento_gasolina +
    itvGasolinaAnio;

  // --- 5. TCO total ---
  // TCO = Adquisición + Operativo × años
  const costeTotalElectrico = adquisicionElectrico + operativoElectricoAnio * anos;
  const costeTotalGasolina = adquisicionGasolina + operativoGasolinaAnio * anos;

  const ahorroTotal = costeTotalGasolina - costeTotalElectrico;

  // --- 6. Punto de equilibrio (breakeven) ---
  // Breakeven = Diferencia de adquisición ÷ Ahorro operativo anual
  // Si el eléctrico ya es más barato de compra (diferencia negativa), breakeven = 0
  const ahorroOperativoAnio = operativoGasolinaAnio - operativoElectricoAnio;
  let breakevenAnos: number;
  if (diferenciaCompra <= 0) {
    // El eléctrico es más barato desde el primer día (incluida la ayuda)
    breakevenAnos = 0;
  } else if (ahorroOperativoAnio <= 0) {
    // El gasolina tiene costes operativos iguales o menores: el eléctrico no se amortiza
    breakevenAnos = 999;
  } else {
    breakevenAnos = diferenciaCompra / ahorroOperativoAnio;
  }

  // --- 7. Coste por kilómetro total (TCO ÷ km totales) ---
  const kmTotales = kmAnio * anos;
  const costeKmElectrico = kmTotales > 0 ? costeTotalElectrico / kmTotales : 0;
  const costeKmGasolina = kmTotales > 0 ? costeTotalGasolina / kmTotales : 0;

  // --- 8. Resumen textual ---
  let resumen: string;
  const ahorroTotalRedondeado = Math.round(Math.abs(ahorroTotal));

  if (ahorroTotal > 0) {
    if (breakevenAnos === 0) {
      resumen = `El eléctrico es más económico desde el primer día. Ahorras ${ahorroTotalRedondeado.toLocaleString('es-ES')}€ en ${anos} años. Su coste por km (${costeKmElectrico.toFixed(4).replace('.', ',')} €/km) es inferior al del gasolina (${costeKmGasolina.toFixed(4).replace('.', ',')} €/km).`;
    } else if (breakevenAnos < anos) {
      resumen = `El eléctrico se amortiza en ${breakevenAnos.toFixed(1).replace('.', ',')} años y genera un ahorro de ${ahorroTotalRedondeado.toLocaleString('es-ES')}€ en el periodo de ${anos} años analizado.`;
    } else {
      resumen = `El eléctrico aún no se amortiza en ${anos} años (breakeven estimado: ${breakevenAnos.toFixed(1).replace('.', ',')} años), pero ahorra ${ahorroTotalRedondeado.toLocaleString('es-ES')}€ frente al gasolina en el periodo. Amplía el horizonte de análisis.`;
    }
  } else if (ahorroTotal < 0) {
    resumen = `En ${anos} años, el gasolina resulta ${ahorroTotalRedondeado.toLocaleString('es-ES')}€ más económico con los parámetros introducidos. Revisa los km anuales o las ayudas disponibles.`;
  } else {
    resumen = `El coste total de ambos vehículos es idéntico en ${anos} años. Cualquier variación en precio de energía o mantenimiento decantará la balanza.`;
  }

  return {
    coste_total_electrico: Math.round(costeTotalElectrico * 100) / 100,
    coste_total_gasolina: Math.round(costeTotalGasolina * 100) / 100,
    ahorro_total: Math.round(ahorroTotal * 100) / 100,
    ahorro_anual_energia: Math.round(ahorroAnualEnergia * 100) / 100,
    breakeven_anos: breakevenAnos === 999 ? 999 : Math.round(breakevenAnos * 100) / 100,
    coste_km_electrico: Math.round(costeKmElectrico * 10000) / 10000,
    coste_km_gasolina: Math.round(costeKmGasolina * 10000) / 10000,
    diferencia_compra: Math.round(diferenciaCompra * 100) / 100,
    resumen
  };
}
