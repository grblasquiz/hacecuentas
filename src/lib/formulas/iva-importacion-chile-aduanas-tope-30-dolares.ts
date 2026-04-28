export interface Inputs {
  precio_fob_usd: number;
  tipo_cambio_usd_clp: number;
  categoria_producto: 'electronica' | 'ropa_calzado' | 'libros_educacion' | 'maquinaria' | 'cosmetica' | 'alimentos_bebidas' | 'otros';
  incluir_gasto_envio_usd: boolean;
  gasto_envio_usd: number;
}

export interface Outputs {
  precio_fob_clp: number;
  exento_impuestos: boolean;
  base_imponible_clp: number;
  arancel_base_clp: number;
  ad_valorem_clp: number;
  subtotal_impuestos_clp: number;
  iva_19_clp: number;
  derechos_aduanales_clp: number;
  total_impuestos_clp: number;
  costo_final_clp: number;
  markup_porcentaje: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuente: SII, Banco Central, Aduanas
  const LIMITE_EXENCION_USD = 30; // Resolución Exenta 108/2011 SII
  const ARANCEL_BASE_PORCENTAJE = 0.06; // 6% arancel base
  const IVA_PORCENTAJE = 0.19; // 19% IVA Chile 2026
  const DERECHOS_ADUANALES_CLP = 4000; // Aprox. gestión courier DHL/FedEx/Correos
  
  // Mapeo ad valorem por categoría producto (% sobre base imponible)
  const AD_VALOREM_MAPA: Record<string, number> = {
    'electronica': 0.25,        // Electrónica, NCM 84-85
    'ropa_calzado': 0.20,       // Prendas, calzado NCM 61-65
    'libros_educacion': 0.00,   // Libros exentos NCM 49
    'maquinaria': 0.15,         // Máquinas, herramientas NCM 84
    'cosmetica': 0.20,          // Perfumería, cosmética NCM 33
    'alimentos_bebidas': 0.25,  // Alimentos, bebidas NCM 02-21
    'otros': 0.15               // Otros genéricos
  };
  
  const ad_valorem_tasa = AD_VALOREM_MAPA[i.categoria_producto] || 0.15;
  
  // Validaciones
  if (i.precio_fob_usd < 0) {
    return {
      precio_fob_clp: 0,
      exento_impuestos: true,
      base_imponible_clp: 0,
      arancel_base_clp: 0,
      ad_valorem_clp: 0,
      subtotal_impuestos_clp: 0,
      iva_19_clp: 0,
      derechos_aduanales_clp: DERECHOS_ADUANALES_CLP,
      total_impuestos_clp: DERECHOS_ADUANALES_CLP,
      costo_final_clp: DERECHOS_ADUANALES_CLP,
      markup_porcentaje: 0
    };
  }
  
  if (i.tipo_cambio_usd_clp <= 0) {
    return {
      precio_fob_clp: 0,
      exento_impuestos: true,
      base_imponible_clp: 0,
      arancel_base_clp: 0,
      ad_valorem_clp: 0,
      subtotal_impuestos_clp: 0,
      iva_19_clp: 0,
      derechos_aduanales_clp: DERECHOS_ADUANALES_CLP,
      total_impuestos_clp: DERECHOS_ADUANALES_CLP,
      costo_final_clp: DERECHOS_ADUANALES_CLP,
      markup_porcentaje: 0
    };
  }
  
  // Calcular envío USD
  const envio_usd = i.incluir_gasto_envio_usd ? (i.gasto_envio_usd || 0) : 0;
  
  // Total USD (FOB + envío)
  const total_usd = i.precio_fob_usd + envio_usd;
  
  // Conversión a CLP
  const precio_fob_clp = Math.round(i.precio_fob_usd * i.tipo_cambio_usd_clp);
  const envio_clp = Math.round(envio_usd * i.tipo_cambio_usd_clp);
  const base_imponible_clp = precio_fob_clp + envio_clp;
  
  // Determinar si está exento
  const exento_impuestos = total_usd <= LIMITE_EXENCION_USD;
  
  // Si está exento: solo derechos aduanales
  if (exento_impuestos) {
    return {
      precio_fob_clp,
      exento_impuestos: true,
      base_imponible_clp,
      arancel_base_clp: 0,
      ad_valorem_clp: 0,
      subtotal_impuestos_clp: 0,
      iva_19_clp: 0,
      derechos_aduanales_clp: DERECHOS_ADUANALES_CLP,
      total_impuestos_clp: DERECHOS_ADUANALES_CLP,
      costo_final_clp: base_imponible_clp + DERECHOS_ADUANALES_CLP,
      markup_porcentaje: (DERECHOS_ADUANALES_CLP / base_imponible_clp) * 100
    };
  }
  
  // Supera USD 30: calcular impuestos completos
  const arancel_base_clp = Math.round(base_imponible_clp * ARANCEL_BASE_PORCENTAJE);
  const ad_valorem_clp = Math.round(base_imponible_clp * ad_valorem_tasa);
  const subtotal_impuestos_clp = arancel_base_clp + ad_valorem_clp;
  
  // IVA sobre base imponible + aranceles (art. 6º Ley IVA)
  const base_iva_clp = base_imponible_clp + subtotal_impuestos_clp;
  const iva_19_clp = Math.round(base_iva_clp * IVA_PORCENTAJE);
  
  // Total impuestos
  const total_impuestos_clp = subtotal_impuestos_clp + iva_19_clp + DERECHOS_ADUANALES_CLP;
  const costo_final_clp = base_imponible_clp + total_impuestos_clp;
  const markup_porcentaje = (total_impuestos_clp / base_imponible_clp) * 100;
  
  return {
    precio_fob_clp,
    exento_impuestos: false,
    base_imponible_clp,
    arancel_base_clp,
    ad_valorem_clp,
    subtotal_impuestos_clp,
    iva_19_clp,
    derechos_aduanales_clp: DERECHOS_ADUANALES_CLP,
    total_impuestos_clp,
    costo_final_clp,
    markup_porcentaje
  };
}
