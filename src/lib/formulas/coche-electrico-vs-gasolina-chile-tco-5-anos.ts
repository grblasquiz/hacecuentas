export interface Inputs {
  precio_compra_electrico: number;
  precio_compra_gasolina: number;
  km_anuales: number;
  consumo_electrico_kwh_100km: number;
  consumo_gasolina_litros_100km: number;
  precio_bencina_litro: number;
  precio_kwh_hogar: number;
  mantencin_anual_electrico: number;
  mantencin_anual_gasolina: number;
  patente_anual_electrico: number;
  patente_anual_gasolina: number;
  revision_tecnica_anual_electrico: number;
  revision_tecnica_anual_gasolina: number;
  seguro_anual_electrico: number;
  seguro_anual_gasolina: number;
  tasa_depreciacion_electrico: number;
  tasa_depreciacion_gasolina: number;
}

export interface Outputs {
  costo_combustible_total_5anos: number;
  costo_mantencin_total_5anos: number;
  costo_patente_total_5anos: number;
  costo_revision_tecnica_total_5anos: number;
  costo_seguro_total_5anos: number;
  valor_residual_electrico: number;
  valor_residual_gasolina: number;
  tco_electrico_5anos: number;
  tco_gasolina_5anos: number;
  ahorro_neto_5anos: number;
  porcentaje_ahorro: number;
  breakeven_ano: number;
  ahorro_anual_promedio: number;
  costo_por_km_electrico: number;
  costo_por_km_gasolina: number;
}

export function compute(i: Inputs): Outputs {
  const ANOS = 5;
  const MESES_ANO = 12;

  // Costo anual combustible/electricidad
  const costo_combustible_anual_electrico =
    (i.km_anuales * (i.consumo_electrico_kwh_100km / 100)) * i.precio_kwh_hogar;
  const costo_combustible_anual_gasolina =
    (i.km_anuales * (i.consumo_gasolina_litros_100km / 100)) * i.precio_bencina_litro;

  // Costos totales 5 años (operacionales: mantención, patente, RTV, seguro)
  const costo_mantencin_total_5anos =
    (i.mantencin_anual_electrico * ANOS + i.mantencin_anual_gasolina * ANOS) / 2;
  const costo_mantencin_total_5anos_electrico = i.mantencin_anual_electrico * ANOS;
  const costo_mantencin_total_5anos_gasolina = i.mantencin_anual_gasolina * ANOS;

  const costo_patente_total_5anos =
    (i.patente_anual_electrico * ANOS + i.patente_anual_gasolina * ANOS) / 2;
  const costo_patente_total_5anos_electrico = i.patente_anual_electrico * ANOS;
  const costo_patente_total_5anos_gasolina = i.patente_anual_gasolina * ANOS;

  const costo_revision_tecnica_total_5anos =
    (i.revision_tecnica_anual_electrico * ANOS + i.revision_tecnica_anual_gasolina * ANOS) / 2;
  const costo_revision_tecnica_total_5anos_electrico = i.revision_tecnica_anual_electrico * ANOS;
  const costo_revision_tecnica_total_5anos_gasolina = i.revision_tecnica_anual_gasolina * ANOS;

  const costo_seguro_total_5anos =
    (i.seguro_anual_electrico * ANOS + i.seguro_anual_gasolina * ANOS) / 2;
  const costo_seguro_total_5anos_electrico = i.seguro_anual_electrico * ANOS;
  const costo_seguro_total_5anos_gasolina = i.seguro_anual_gasolina * ANOS;

  const costo_combustible_total_5anos =
    (costo_combustible_anual_electrico + costo_combustible_anual_gasolina) / 2;
  const costo_combustible_total_5anos_electrico = costo_combustible_anual_electrico * ANOS;
  const costo_combustible_total_5anos_gasolina = costo_combustible_anual_gasolina * ANOS;

  // Valor residual (depreciación compuesta)
  const tasa_dep_electrico_decimal = i.tasa_depreciacion_electrico / 100;
  const tasa_dep_gasolina_decimal = i.tasa_depreciacion_gasolina / 100;

  const valor_residual_electrico =
    i.precio_compra_electrico * Math.pow(1 - tasa_dep_electrico_decimal, ANOS);
  const valor_residual_gasolina =
    i.precio_compra_gasolina * Math.pow(1 - tasa_dep_gasolina_decimal, ANOS);

  // TCO = Precio inicial + Operación (5 años) - Valor residual
  const tco_electrico_5anos =
    i.precio_compra_electrico +
    costo_combustible_total_5anos_electrico +
    costo_mantencin_total_5anos_electrico +
    costo_patente_total_5anos_electrico +
    costo_revision_tecnica_total_5anos_electrico +
    costo_seguro_total_5anos_electrico -
    valor_residual_electrico;

  const tco_gasolina_5anos =
    i.precio_compra_gasolina +
    costo_combustible_total_5anos_gasolina +
    costo_mantencin_total_5anos_gasolina +
    costo_patente_total_5anos_gasolina +
    costo_revision_tecnica_total_5anos_gasolina +
    costo_seguro_total_5anos_gasolina -
    valor_residual_gasolina;

  // Ahorro
  const ahorro_neto_5anos = tco_gasolina_5anos - tco_electrico_5anos;
  const porcentaje_ahorro =
    tco_gasolina_5anos > 0 ? (ahorro_neto_5anos / tco_gasolina_5anos) * 100 : 0;

  // Breakeven (año en que TCO acumulado eléctrico ≤ gasolina)
  let breakeven_ano = ANOS + 1; // Default: no hay breakeven en 5 años
  let tco_acumulado_electrico = i.precio_compra_electrico;
  let tco_acumulado_gasolina = i.precio_compra_gasolina;

  for (let ano = 1; ano <= ANOS; ano++) {
    tco_acumulado_electrico +=
      costo_combustible_anual_electrico +
      (i.mantencin_anual_electrico + i.patente_anual_electrico + i.revision_tecnica_anual_electrico + i.seguro_anual_electrico);
    tco_acumulado_gasolina +=
      costo_combustible_anual_gasolina +
      (i.mantencin_anual_gasolina + i.patente_anual_gasolina + i.revision_tecnica_anual_gasolina + i.seguro_anual_gasolina);

    if (tco_acumulado_electrico <= tco_acumulado_gasolina && breakeven_ano === ANOS + 1) {
      breakeven_ano = ano;
    }
  }

  // Ajustar por valor residual en el breakeven
  if (breakeven_ano <= ANOS) {
    const val_residual_interp =
      i.precio_compra_electrico * Math.pow(1 - tasa_dep_electrico_decimal, breakeven_ano);
    tco_acumulado_electrico -= val_residual_interp;
    const val_residual_interp_gasolina =
      i.precio_compra_gasolina * Math.pow(1 - tasa_dep_gasolina_decimal, breakeven_ano);
    tco_acumulado_gasolina -= val_residual_interp_gasolina;

    if (tco_acumulado_electrico > tco_acumulado_gasolina) {
      breakeven_ano = ANOS + 1;
    }
  }

  // Ahorro anual promedio
  const ahorro_anual_promedio = ahorro_neto_5anos / ANOS;

  // Costo por km
  const km_totales_5anos = i.km_anuales * ANOS;
  const costo_por_km_electrico = km_totales_5anos > 0 ? tco_electrico_5anos / km_totales_5anos : 0;
  const costo_por_km_gasolina = km_totales_5anos > 0 ? tco_gasolina_5anos / km_totales_5anos : 0;

  return {
    costo_combustible_total_5anos: Math.round(costo_combustible_total_5anos),
    costo_mantencin_total_5anos: Math.round(costo_mantencin_total_5anos),
    costo_patente_total_5anos: Math.round(costo_patente_total_5anos),
    costo_revision_tecnica_total_5anos: Math.round(costo_revision_tecnica_total_5anos),
    costo_seguro_total_5anos: Math.round(costo_seguro_total_5anos),
    valor_residual_electrico: Math.round(valor_residual_electrico),
    valor_residual_gasolina: Math.round(valor_residual_gasolina),
    tco_electrico_5anos: Math.round(tco_electrico_5anos),
    tco_gasolina_5anos: Math.round(tco_gasolina_5anos),
    ahorro_neto_5anos: Math.round(ahorro_neto_5anos),
    porcentaje_ahorro: Math.round(porcentaje_ahorro * 10) / 10,
    breakeven_ano: breakeven_ano <= ANOS ? Math.round(breakeven_ano * 10) / 10 : ANOS + 0.5,
    ahorro_anual_promedio: Math.round(ahorro_anual_promedio),
    costo_por_km_electrico: Math.round(costo_por_km_electrico * 10) / 10,
    costo_por_km_gasolina: Math.round(costo_por_km_gasolina * 10) / 10
  };
}
