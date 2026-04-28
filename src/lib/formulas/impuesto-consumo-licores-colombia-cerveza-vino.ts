export interface Inputs {
  tipo_producto: string;
  precio_unitario: number;
  cantidad: number;
  grado_alcohol?: number;
}

export interface Outputs {
  tarifa_impuesto: number;
  subtotal_base: number;
  impuesto_consumo_unitario: number;
  impuesto_consumo_total: number;
  base_iva: number;
  iva_total: number;
  precio_final_unitario: number;
  precio_final_total: number;
  total_impuestos: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas vigentes DIAN 2026 - Impuesto al Consumo
  // Fuente: DIAN Circular 2026, Decreto 1625/2016
  const TARIFA_CERVEZA = 0.48; // 48% - cerveza nacional e importada
  const TARIFA_CERVEZA_PREMIUM = 0.48; // 48% - cerveza > 6° alcohol
  const TARIFA_VINO_NACIONAL = 0.25; // 25% - vino nacional hasta 15°
  const TARIFA_VINO_IMPORTADO = 0.25; // 25% - vino importado hasta 15°
  const TARIFA_LICOR_BAJO = 0.35; // 35% - licores destilados ≤ 30° alcohol
  const TARIFA_LICOR_ALTO = 0.40; // 40% - licores destilados > 30° alcohol
  const TARIFA_AGUARDIENTE = 0.32; // 32% - aguardiente nacional
  const TARIFA_CIGARRILLOS = 0.315; // 31.5% - cigarrillos (simplificado sin componente específico)
  const TARIFA_IVA = 0.19; // 19% - IVA estándar Colombia

  // Determina tarifa según tipo de producto
  let tarifa: number = 0;

  switch (i.tipo_producto) {
    case "cerveza":
      tarifa = TARIFA_CERVEZA;
      break;
    case "cerveza_premium":
      tarifa = TARIFA_CERVEZA_PREMIUM;
      break;
    case "vino_nacional":
      tarifa = TARIFA_VINO_NACIONAL;
      break;
    case "vino_importado":
      tarifa = TARIFA_VINO_IMPORTADO;
      break;
    case "licor_destilado":
      // Valida grado de alcohol para determinar tarifa
      if (i.grado_alcohol !== undefined && i.grado_alcohol > 30) {
        tarifa = TARIFA_LICOR_ALTO;
      } else {
        tarifa = TARIFA_LICOR_BAJO;
      }
      break;
    case "aguardiente":
      tarifa = TARIFA_AGUARDIENTE;
      break;
    case "cigarrillos_nacionales":
      tarifa = TARIFA_CIGARRILLOS;
      break;
    case "cigarrillos_importados":
      tarifa = TARIFA_CIGARRILLOS;
      break;
    default:
      tarifa = TARIFA_CERVEZA; // default si no coincide
  }

  // Cálculos
  const subtotal_base = i.precio_unitario * i.cantidad;
  const impuesto_consumo_unitario = i.precio_unitario * tarifa;
  const impuesto_consumo_total = impuesto_consumo_unitario * i.cantidad;
  const base_iva = subtotal_base + impuesto_consumo_total;
  const iva_total = base_iva * TARIFA_IVA;
  const precio_final_total = base_iva + iva_total;
  const precio_final_unitario = precio_final_total / i.cantidad;
  const total_impuestos = impuesto_consumo_total + iva_total;

  // Retorna en formato monetario con 2 decimales
  return {
    tarifa_impuesto: Math.round(tarifa * 10000) / 100, // porcentaje con 2 decimales
    subtotal_base: Math.round(subtotal_base * 100) / 100,
    impuesto_consumo_unitario: Math.round(impuesto_consumo_unitario * 100) / 100,
    impuesto_consumo_total: Math.round(impuesto_consumo_total * 100) / 100,
    base_iva: Math.round(base_iva * 100) / 100,
    iva_total: Math.round(iva_total * 100) / 100,
    precio_final_unitario: Math.round(precio_final_unitario * 100) / 100,
    precio_final_total: Math.round(precio_final_total * 100) / 100,
    total_impuestos: Math.round(total_impuestos * 100) / 100
  };
}
