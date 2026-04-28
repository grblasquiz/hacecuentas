export interface Inputs {
  monto_herencia: number;
  parentesco: 'conyuge' | 'hijo_descendiente' | 'padre_abuelo' | 'hermano' | 'tio_sobrino' | 'otro_pariente' | 'no_pariente';
  es_donacion: boolean;
  años_donacion: number;
  vivienda_hereditaria: boolean;
  deuda_herencia: number;
}

export interface Outputs {
  base_imponible: number;
  tarifa_aplicada: number;
  cuota_impuesto: number;
  descuento_donacion: number;
  exencion_vivienda: number;
  impuesto_neto: number;
  tasa_efectiva: number;
  observacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuente: SII
  const UTA_2026 = 30440; // Unidad Tributaria Anual 2026 (aprox.)
  const UTA_VIVIENDA_LIMITE = 2000 * UTA_2026; // $60.880.000
  const TASA_DESCUENTO_DONACION = 0.05; // 5% anual
  
  // Objeto tarifas por parentesco (en % - tramo medio)
  const tarifas: Record<string, number> = {
    'conyuge': 0,                  // Exento total
    'hijo_descendiente': 0.04,     // 1-4% (tramo medio)
    'padre_abuelo': 0.10,          // 5-15%
    'hermano': 0.15,               // 5-25% (tramo medio)
    'tio_sobrino': 0.16,           // 8-25%
    'otro_pariente': 0.17,         // Variable
    'no_pariente': 0.25            // 25% plano
  };
  
  // Paso 1: Calcular exención vivienda hereditaria
  let exencion_vivienda = 0;
  if (i.vivienda_hereditaria && (i.parentesco === 'conyuge' || i.parentesco === 'hijo_descendiente')) {
    exencion_vivienda = Math.min(i.monto_herencia, UTA_VIVIENDA_LIMITE);
  }
  
  // Paso 2: Calcular base imponible (monto - exenciones - deudas)
  const base_imponible = Math.max(
    0,
    i.monto_herencia - exencion_vivienda - i.deuda_herencia
  );
  
  // Paso 3: Obtener tarifa aplicable según parentesco
  const tarifa_aplicada = tarifas[i.parentesco] || 0.17;
  
  // Paso 4: Calcular cuota de impuesto
  const cuota_impuesto = base_imponible * tarifa_aplicada;
  
  // Paso 5: Calcular descuento por antigüedad donación (solo si es donación)
  let descuento_donacion = 0;
  if (i.es_donacion && i.años_donacion > 0) {
    const años_validos = Math.min(i.años_donacion, 5);
    descuento_donacion = cuota_impuesto * (TASA_DESCUENTO_DONACION * años_validos);
  }
  
  // Paso 6: Calcular impuesto neto (cuota - descuentos)
  const impuesto_neto = Math.max(0, cuota_impuesto - descuento_donacion);
  
  // Paso 7: Calcular tasa efectiva sobre monto original
  const tasa_efectiva = i.monto_herencia > 0 ? impuesto_neto / i.monto_herencia : 0;
  
  // Paso 8: Generar observación legal
  let observacion = '';
  
  if (i.parentesco === 'conyuge') {
    observacion = 'Cónyuge exento de impuesto a herencias. No hay cuota tributaria.';
  } else if (i.vivienda_hereditaria && exencion_vivienda > 0) {
    observacion = `Exención vivienda hereditaria aplicada: $${exencion_vivienda.toLocaleString('es-CL')}. Base reducida.`;
  } else if (i.deuda_herencia > 0) {
    observacion = `Deudas hereditarias rebajadas: $${i.deuda_herencia.toLocaleString('es-CL')}. Base imponible neta.`;
  }
  
  if (i.es_donacion && descuento_donacion > 0) {
    observacion += ` Descuento donación antigüedad: $${descuento_donacion.toLocaleString('es-CL')}.`;
  }
  
  if (i.parentesco === 'no_pariente') {
    observacion += ' Tercero no pariente: tarifa máxima 25% aplicada.';
  }
  
  if (impuesto_neto === 0) {
    observacion = 'Beneficiario exento de impuesto. Cero cuota tributaria.';
  }
  
  return {
    base_imponible: Math.round(base_imponible),
    tarifa_aplicada: tarifa_aplicada * 100,
    cuota_impuesto: Math.round(cuota_impuesto),
    descuento_donacion: Math.round(descuento_donacion),
    exencion_vivienda: Math.round(exencion_vivienda),
    impuesto_neto: Math.round(impuesto_neto),
    tasa_efectiva: tasa_efectiva * 100,
    observacion: observacion.trim() || 'Cálculo completado según Ley 16.271.'
  };
}
