export interface Inputs {
  precio_vivienda_estimado: number;
  proposito_tasacion: 'hipoteca_compra' | 'herencia' | 'judicial' | 'refinanciamiento' | 'seguro' | 'donacion';
  tipo_tasador: 'banco' | 'dictuc' | 'empresa_privada' | 'independiente';
  cliente_hipotecario: 'no' | 'si_otro_banco' | 'si_mismo_banco';
  complejidad_propiedad: 'simple' | 'media' | 'compleja';
}

export interface Outputs {
  costo_tasacion_base: number;
  descuento_aplicado: number;
  costo_tasacion_neto: number;
  plazo_dias: number;
  iva_tasacion: number;
  costo_total_iva: number;
  recomendacion_tasador: string;
}

export function compute(i: Inputs): Outputs {
  // Fuente: SIR, CMF, aranceles DICTUC 2026, prácticas mercado bancario
  const IVA = 0.19;
  
  // 1. Calcular costo base según rango precio (CLP 2026)
  let costo_base = 0;
  if (i.precio_vivienda_estimado <= 60_000_000) {
    costo_base = 90_000;
  } else if (i.precio_vivienda_estimado <= 150_000_000) {
    costo_base = 115_000;
  } else if (i.precio_vivienda_estimado <= 300_000_000) {
    costo_base = 145_000;
  } else if (i.precio_vivienda_estimado <= 600_000_000) {
    costo_base = 170_000;
  } else {
    costo_base = 210_000;
  }

  // 2. Factor complejidad propiedad
  let factor_complejidad = 1.0;
  if (i.complejidad_propiedad === 'media') {
    factor_complejidad = 1.15;
  } else if (i.complejidad_propiedad === 'compleja') {
    factor_complejidad = 1.35;
  }
  costo_base = costo_base * factor_complejidad;

  // 3. Ajuste tipo tasador (banco puede incluir en crédito o reducir costo)
  if (i.tipo_tasador === 'banco') {
    costo_base = costo_base * 0.85; // Banco 15% descuento interno
  }

  // 4. Descuento cliente hipotecario
  let descuento_cliente = 0.0;
  if (i.cliente_hipotecario === 'si_mismo_banco') {
    descuento_cliente = 0.25; // 25% descuento
  } else if (i.cliente_hipotecario === 'si_otro_banco') {
    descuento_cliente = 0.12; // 12% descuento
  }
  const descuento_aplicado = Math.round(costo_base * descuento_cliente);
  const costo_tasacion_neto = Math.round(costo_base - descuento_aplicado);

  // 5. IVA (aplica a DICTUC, empresa privada, independiente; NO a banco si lo incluye en crédito)
  let iva_tasacion = 0;
  if (i.tipo_tasador !== 'banco') {
    iva_tasacion = Math.round(costo_tasacion_neto * IVA);
  }
  const costo_total_iva = costo_tasacion_neto + iva_tasacion;

  // 6. Plazo según propósito
  let plazo_dias = 7; // default
  if (i.proposito_tasacion === 'hipoteca_compra') {
    plazo_dias = 7;
  } else if (i.proposito_tasacion === 'herencia') {
    plazo_dias = 10;
  } else if (i.proposito_tasacion === 'judicial') {
    plazo_dias = 15;
  } else if (i.proposito_tasacion === 'refinanciamiento') {
    plazo_dias = 6;
  } else if (i.proposito_tasacion === 'seguro') {
    plazo_dias = 4;
  } else if (i.proposito_tasacion === 'donacion') {
    plazo_dias = 8;
  }

  // 7. Recomendación tasador
  let recomendacion = '';
  if (i.tipo_tasador === 'banco' && i.proposito_tasacion === 'hipoteca_compra') {
    recomendacion = 'Tasador bancario es obligatorio. Solicita inclusión en crédito si es posible para reducir desembolso inicial.';
  } else if (i.tipo_tasador === 'dictuc') {
    recomendacion = 'DICTUC es independiente y altamente confiable. Recomendado para herencias, judicial y refinanciamiento. Vigencia máx. 6 meses.';
  } else if (i.tipo_tasador === 'empresa_privada') {
    recomendacion = 'Empresa privada: verificar acreditación SIR antes de contratar. Negocia descuento si es cliente hipotecario.';
  } else if (i.tipo_tasador === 'independiente') {
    recomendacion = 'Perito independiente: exigir credencial SIR vigente. Costo puede ser superior pero independencia es garantía en litigio.';
  }

  return {
    costo_tasacion_base: Math.round(costo_base),
    descuento_aplicado,
    costo_tasacion_neto,
    plazo_dias,
    iva_tasacion,
    costo_total_iva,
    recomendacion_tasador: recomendacion
  };
}
