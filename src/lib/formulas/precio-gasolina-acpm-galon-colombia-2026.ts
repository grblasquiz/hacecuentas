export interface Inputs {
  ciudad: string; // 'bogota' | 'medellin' | 'cali' | 'barranquilla' | 'bucaramanga' | 'cucuta' | 'manizales' | 'pereira' | 'cartagena' | 'santa_marta'
  tipo_combustible: string; // 'gasolina_corriente' | 'gasolina_extra' | 'acpm'
  galones_mes: number;
}

export interface ComponentesPrecio {
  precio_refineria: number;
  ibgm: number;
  sobretasa: number;
  subtotal: number;
  iva_19: number;
}

export interface Outputs {
  precio_galon: number;
  gasto_mensual: number;
  desglose_precio: ComponentesPrecio;
}

export function compute(i: Inputs): Outputs {
  // Precios base refinería por tipo combustible (COP/galón, 2026)
  // Fuente: DIAN, última revisión abril 2026
  const preciosRefineria: Record<string, number> = {
    'gasolina_corriente': 9200,
    'gasolina_extra': 9850,
    'acpm': 8320
  };

  // IBGM (Impuesto sobre Gasolina y Diésel Motor) por tipo
  // Fuente: DIAN decreto 4035/2009 y modificaciones 2026
  const ibgm: Record<string, number> = {
    'gasolina_corriente': 2100,
    'gasolina_extra': 2100,
    'acpm': 1980
  };

  // Sobretasas por ciudad (COP/galón)
  // Fuente: UPME y ordenanzas departamentales vigentes
  const sobretasasPorCiudad: Record<string, number> = {
    'bogota': 1200,
    'medellin': 1120,
    'cali': 1100,
    'barranquilla': 1050,
    'bucaramanga': 1180,
    'cucuta': 880, // ciudad frontera, subsidio implícito
    'manizales': 1140,
    'pereira': 1130,
    'cartagena': 1080,
    'santa_marta': 1000
  };

  const precioRef = preciosRefineria[i.tipo_combustible] || 9200;
  const impuestoIbgm = ibgm[i.tipo_combustible] || 2100;
  const sobretasa = sobretasasPorCiudad[i.ciudad] || 1200;

  // Cálculo componentes
  const subtotal = precioRef + impuestoIbgm + sobretasa;
  const iva = subtotal * 0.19; // IVA 19% sobre subtotal
  const precioFinal = subtotal + iva;

  // Redondeo a centenas (práctica comercial Colombia)
  const precioGalonRedondeado = Math.round(precioFinal / 100) * 100;
  const gastoMensualTotal = precioGalonRedondeado * i.galones_mes;

  return {
    precio_galon: precioGalonRedondeado,
    gasto_mensual: Math.round(gastoMensualTotal),
    desglose_precio: {
      precio_refineria: precioRef,
      ibgm: impuestoIbgm,
      sobretasa: sobretasa,
      subtotal: subtotal,
      iva_19: Math.round(iva)
    }
  };
}
