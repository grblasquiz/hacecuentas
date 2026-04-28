export interface Inputs {
  ciudad: 'cdmx' | 'monterrey' | 'guadalajara' | 'puebla';
  valor_catastral: number;
  aplica_subsidio: boolean;
  pago_anticipado_enero: boolean;
}

export interface Outputs {
  predial_bruto_anual: number;
  subsidio_estatal: number;
  predial_neto_anual: number;
  descuento_pago_anticipado: number;
  predial_final: number;
  predial_mensual: number;
  vencimiento_mensual: string;
  ahorro_anticipado: number;
}

export function compute(i: Inputs): Outputs {
  // Tasas prediales por ciudad 2026 (Fuente: SAT, tesorerías municipales)
  const tasas: Record<string, number> = {
    'cdmx': 0.0084,      // 0.84% CDMX
    'monterrey': 0.0090, // 0.90% Monterrey (Nuevo León)
    'guadalajara': 0.0085, // 0.85% Guadalajara (Jalisco)
    'puebla': 0.0080     // 0.80% Puebla
  };

  // Porcentajes de subsidio estatal 2026 (vivienda principal, valor ≤ $1.5M)
  const subsidios: Record<string, number> = {
    'cdmx': 0.50,        // 50% subsidio CDMX
    'monterrey': 0.50,   // 50% subsidio Nuevo León
    'guadalajara': 0.45, // 45% subsidio Jalisco
    'puebla': 0.40       // 40% subsidio Puebla
  };

  // Descuentos por pago anticipado (antes 31 enero)
  const descuentos: Record<string, number> = {
    'cdmx': 0.10,        // 10% CDMX
    'monterrey': 0.08,   // 8% Monterrey
    'guadalajara': 0.09, // 9% Guadalajara
    'puebla': 0.08       // 8% Puebla
  };

  const tasa = tasas[i.ciudad] || 0.0085;
  const subsidioRate = subsidios[i.ciudad] || 0.40;
  const descuentoRate = descuentos[i.ciudad] || 0.08;

  // 1. Predial bruto anual
  const predial_bruto = i.valor_catastral * tasa;

  // 2. Subsidio estatal (solo si aplica, valor ≤ $1.5M y vivienda principal)
  let subsidio = 0;
  if (i.aplica_subsidio && i.valor_catastral <= 1500000) {
    subsidio = predial_bruto * subsidioRate;
  }

  // 3. Predial neto (sin descuento anticipado aún)
  const predial_neto = predial_bruto - subsidio;

  // 4. Descuento por pago anticipado (31 enero)
  let descuento = 0;
  if (i.pago_anticipado_enero) {
    descuento = predial_neto * descuentoRate;
  }

  // 5. Predial final
  const predial_final = predial_neto - descuento;

  // 6. Equivalente mensual (si fraccionado)
  const predial_mensual = Math.round((predial_neto / 12) * 100) / 100;

  // 7. Vencimiento mensual aprox (consulta catastro para exactitud)
  const vencimientos: Record<string, string> = {
    'cdmx': 'Día 20 de cada mes (sujeto a aviso de catastro)',
    'monterrey': 'Antes del día 10 de cada mes',
    'guadalajara': 'Según clave catastral (consulta tesorería)',
    'puebla': 'Día 15 de cada mes'
  };
  const vencimiento_mensual = vencimientos[i.ciudad] || 'Consulta catastro municipal';

  // 8. Ahorro total por pago anticipado
  const ahorro_anticipado = descuento;

  return {
    predial_bruto_anual: Math.round(predial_bruto * 100) / 100,
    subsidio_estatal: Math.round(subsidio * 100) / 100,
    predial_neto_anual: Math.round(predial_neto * 100) / 100,
    descuento_pago_anticipado: Math.round(descuento * 100) / 100,
    predial_final: Math.round(predial_final * 100) / 100,
    predial_mensual: predial_mensual,
    vencimiento_mensual: vencimiento_mensual,
    ahorro_anticipado: Math.round(ahorro_anticipado * 100) / 100
  };
}
