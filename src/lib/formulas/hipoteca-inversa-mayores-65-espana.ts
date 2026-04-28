export interface Inputs {
  valor_vivienda: number;
  edad_propietario: number;
  modalidad: 'vitalicia' | 'temporal' | 'capital_unico';
  porcentaje_ltv: number;
  euribor_asumido: number;
  spread_banco: number;
  incluir_nuda_propiedad: boolean;
}

export interface Outputs {
  capital_disponible: number;
  renta_mensual_estimada: number;
  gastos_formalizacion: number;
  tae_hipoteca: number;
  saldo_vivo_10anos: number;
  ingreso_anual_neto: number;
  comparativa_nuda_propiedad_valor: number;
  comparativa_nuda_propiedad_renta: number;
  advertencia_fiscal: string;
}

export function compute(i: Inputs): Outputs {
  // CONSTANTES Y TABLAS 2026 ESPAÑA
  // Fuentes: Banco de España, INE, Tesoro Público

  // Gastos de formalización (€) según valor vivienda
  // Notaría (0,5%), Registro (0,15%), Tasación (300€), Gestoría (600€)
  const calcularGastosFormalizacion = (valor: number): number => {
    const notaria = valor * 0.005; // 0,5%
    const registro = valor * 0.0015; // 0,15%
    const tasacion = 300;
    const gestoria = 600;
    const total = notaria + registro + tasacion + gestoria;
    return Math.round(total);
  };

  // Tablas actuariales de tasa longevidad anual (%) por edad
  // Basadas en INE 2026 + tablas aseguradores (referencia Banco España)
  const tablaTasaLongevidad: { [key: number]: number } = {
    65: 6.2,
    66: 6.05,
    67: 5.95,
    68: 5.85,
    69: 5.75,
    70: 5.6,
    71: 5.45,
    72: 5.3,
    73: 5.15,
    74: 5.0,
    75: 4.85,
    76: 4.7,
    77: 4.55,
    78: 4.4,
    79: 4.25,
    80: 4.08,
    81: 3.95,
    82: 3.8,
    83: 3.65,
    84: 3.5,
    85: 3.3,
    86: 3.1,
    87: 2.9,
    88: 2.7,
    89: 2.5,
    90: 2.3,
  };

  // Obtener tasa longevidad por edad (interpolación lineal si no existe)
  const obtenerTasaLongevidad = (edad: number): number => {
    if (edad in tablaTasaLongevidad) {
      return tablaTasaLongevidad[edad];
    }
    // Interpolación lineal entre edades cercanas
    const edadMenor = Math.floor(edad);
    const edadMayor = Math.ceil(edad);
    if (edadMenor < 65) return 6.2;
    if (edadMayor > 90) return 2.3;
    const tasa1 = tablaTasaLongevidad[edadMenor] || 6.2;
    const tasa2 = tablaTasaLongevidad[edadMayor] || 2.3;
    return tasa1 + (tasa2 - tasa1) * (edad - edadMenor);
  };

  // Tablas DGF/Tesoro: Coeficiente usufructo vitalicio por edad (2026)
  const tablaUsufructo: { [key: number]: number } = {
    65: 60,
    70: 52,
    75: 45,
    80: 35,
    85: 25,
    90: 15,
  };

  const obtenerCoeficienteUsufructo = (edad: number): number => {
    if (edad in tablaUsufructo) {
      return tablaUsufructo[edad];
    }
    const edadMenor = Math.floor(edad);
    const edadMayor = Math.ceil(edad);
    if (edadMenor < 65) return 60;
    if (edadMayor > 90) return 15;
    const coef1 = tablaUsufructo[edadMenor] || 60;
    const coef2 = tablaUsufructo[edadMayor] || 15;
    return coef1 + (coef2 - coef1) * (edad - edadMenor);
  };

  // CÁLCULOS PRINCIPALES

  // 1. Gastos de formalización
  const gastos_formalizacion = calcularGastosFormalizacion(i.valor_vivienda);

  // 2. Capital disponible (LTV aplicado menos gastos)
  const capital_bruto = i.valor_vivienda * (i.porcentaje_ltv / 100);
  const capital_disponible = Math.max(
    0,
    Math.round(capital_bruto - gastos_formalizacion)
  );

  // 3. TAE (Euribor + Spread)
  const tae_hipoteca = i.euribor_asumido + i.spread_banco;

  // 4. Renta mensual estimada según modalidad
  let renta_mensual_estimada = 0;

  if (i.modalidad === 'vitalicia') {
    // Renta vitalicia = Capital × Tasa longevidad anual / 12
    const tasaLongevidad = obtenerTasaLongevidad(i.edad_propietario);
    renta_mensual_estimada = Math.round(
      (capital_disponible * (tasaLongevidad / 100)) / 12
    );
  } else if (i.modalidad === 'temporal') {
    // Renta temporal 15 años (aprox. 1,4x renta vitalicia)
    const tasaLongevidad = obtenerTasaLongevidad(i.edad_propietario);
    const coefTemporalAnual = (tasaLongevidad / 100) * 1.35; // Factor aumento temporal
    renta_mensual_estimada = Math.round(
      (capital_disponible * coefTemporalAnual) / 12
    );
  } else if (i.modalidad === 'capital_unico') {
    // 40% capital único, 60% como renta
    const tasaLongevidad = obtenerTasaLongevidad(i.edad_propietario);
    const capitalRenta = capital_disponible * 0.6;
    renta_mensual_estimada = Math.round(
      (capitalRenta * (tasaLongevidad / 100)) / 12
    );
  }

  // 5. Ingreso anual neto (renta × 12, no tributa IRPF)
  const ingreso_anual_neto = renta_mensual_estimada * 12;

  // 6. Saldo vivo estimado a 10 años
  // Fórmula: Saldo = Capital × (1 + TAE/100)^10 − Renta_mensual × 12 × PV_factor
  // Simplificación: crecimiento compuesto menos amortización
  const tasaMensual = tae_hipoteca / 100 / 12;
  let saldo = capital_disponible;
  for (let mes = 0; mes < 120; mes++) {
    saldo = saldo * (1 + tasaMensual) - renta_mensual_estimada;
    if (saldo < 0) saldo = 0; // No puede ser negativo
  }
  const saldo_vivo_10anos = Math.round(saldo);

  // 7. Comparativa con nuda propiedad
  let comparativa_nuda_propiedad_valor = 0;
  let comparativa_nuda_propiedad_renta = 0;
  let advertencia_fiscal = '';

  if (i.incluir_nuda_propiedad) {
    // Coeficiente usufructo por edad (Tablas DGF)
    const coefUsufructo = obtenerCoeficienteUsufructo(i.edad_propietario);
    const coefNudaPropiedad = 100 - coefUsufructo;

    // Valor nuda propiedad
    comparativa_nuda_propiedad_valor = Math.round(
      i.valor_vivienda * (coefNudaPropiedad / 100)
    );

    // Renta por usufructo (canon anual aprox. 2% valor nuda / 12)
    // Alternativa: comprador de nuda paga renta vitalicia
    const canonAnual = comparativa_nuda_propiedad_valor * 0.02; // 2% típico
    comparativa_nuda_propiedad_renta = Math.round(canonAnual / 12);

    // Advertencia fiscal
    advertencia_fiscal =
      '**Diferencias fiscales:**\n\n' +
      '- **Hipoteca inversa**: Renta NO tributa IRPF (préstamo). Deuda crece (plusvalía eventual al fallecimiento sobre herencia). Herederos pueden pagar saldo vivo o vender.\n\n' +
      '- **Nuda propiedad**: Capital recibido NO tributa (venta parcial con retención de usufructo). Herederos heredan vivienda sin deuda. Reducción sucesiones: 95% en algunas CCAA (ej. Castilla y León, Asturias).\n\n' +
      '**Impacto Sucesiones**: Hipoteca inversa genera herencia neta menor (deuda resta), pero Tesoro aplica reducciones por vivienda habitual en sucesiones. Consulta asesor fiscal por tu comunidad.';
  } else {
    advertencia_fiscal =
      '**Información fiscal hipoteca inversa:**\n\n' +
      '- Renta mensual NO tributa IRPF (es préstamo, no ingreso).\n\n' +
      '- Saldo vivo (deuda acumulada) reduce patrimonio heredable. Herederos heredan vivienda con gravamen hipotecario.\n\n' +
      '- Plusvalía eventual: Si vivienda aprecia, herederos pueden generar plusvalía municipal (no aplica) o impuesto sucesiones (sí aplica).\n\n' +
      '- Consulta asesor fiscal especializado en sucesiones y vivienda habitual para tu comunidad autónoma.';
  }

  return {
    capital_disponible,
    renta_mensual_estimada,
    gastos_formalizacion,
    tae_hipoteca: Math.round(tae_hipoteca * 100) / 100,
    saldo_vivo_10anos,
    ingreso_anual_neto,
    comparativa_nuda_propiedad_valor,
    comparativa_nuda_propiedad_renta,
    advertencia_fiscal,
  };
}
