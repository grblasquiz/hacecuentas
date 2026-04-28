export interface Inputs {
  tipo_producto: 'bebida_saborizada' | 'cigarro' | 'comida_chatarra' | 'gasolina';
  monto_producto: number;
  unidad_medida: 'mxn' | 'litros' | 'unidades' | 'gramos';
  precio_unitario?: number;
  incluir_iva: boolean;
}

export interface Outputs {
  base_gravable: number;
  ieps_aplicable: number;
  tasa_ieps: number;
  base_iva: number;
  iva_sobre_ieps: number;
  total_impuestos: number;
  precio_final: number;
  porcentaje_total_impuestos: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes IEPS 2026 México (SAT)
  const IEPS_BEBIDA_SABORIZADA_POR_LITRO = 1.4451; // $/L
  const IEPS_CIGARRO_PORCENTAJE = 1.6; // 160% ad valorem
  const IEPS_CIGARRO_CUOTA_FIJA = 0.40; // $/cigarro
  const IEPS_COMIDA_CHATARRA = 0.08; // 8%
  const IEPS_GASOLINA_APROXIMADO = 0.55; // $/L referencia 2026 (variable)
  const IVA_TASA = 0.16; // 16% nacional (8% frontera no incluido)
  const IVA_FRONTERA = 0.08; // Baja Cal, Sonora, Chih, Coah, NL, Tam

  let base_gravable = 0;
  let ieps_aplicable = 0;
  let tasa_ieps = 0;

  // 1. Convertir monto a pesos (base gravable)
  if (i.unidad_medida === 'mxn') {
    base_gravable = i.monto_producto;
  } else if (i.unidad_medida === 'litros') {
    if (!i.precio_unitario || i.precio_unitario <= 0) {
      return {
        base_gravable: 0,
        ieps_aplicable: 0,
        tasa_ieps: 0,
        base_iva: 0,
        iva_sobre_ieps: 0,
        total_impuestos: 0,
        precio_final: 0,
        porcentaje_total_impuestos: 0
      };
    }
    base_gravable = i.monto_producto * i.precio_unitario;
  } else if (i.unidad_medida === 'unidades') {
    if (!i.precio_unitario || i.precio_unitario <= 0) {
      return {
        base_gravable: 0,
        ieps_aplicable: 0,
        tasa_ieps: 0,
        base_iva: 0,
        iva_sobre_ieps: 0,
        total_impuestos: 0,
        precio_final: 0,
        porcentaje_total_impuestos: 0
      };
    }
    base_gravable = i.monto_producto * i.precio_unitario;
  } else if (i.unidad_medida === 'gramos') {
    if (!i.precio_unitario || i.precio_unitario <= 0) {
      return {
        base_gravable: 0,
        ieps_aplicable: 0,
        tasa_ieps: 0,
        base_iva: 0,
        iva_sobre_ieps: 0,
        total_impuestos: 0,
        precio_final: 0,
        porcentaje_total_impuestos: 0
      };
    }
    base_gravable = (i.monto_producto / 1000) * i.precio_unitario; // g a kg/precio
  }

  // 2. Calcular IEPS según tipo de producto
  if (i.tipo_producto === 'bebida_saborizada') {
    // IEPS por litro: convertir base a litros si es necesario
    let litros = 0;
    if (i.unidad_medida === 'litros') {
      litros = i.monto_producto;
    } else if (i.unidad_medida === 'mxn' && i.precio_unitario && i.precio_unitario > 0) {
      litros = i.monto_producto / i.precio_unitario;
    } else if (i.unidad_medida === 'gramos') {
      litros = i.monto_producto / 1000; // aproximación: 1kg agua ≈ 1L
    }
    ieps_aplicable = litros * IEPS_BEBIDA_SABORIZADA_POR_LITRO;
    tasa_ieps = (ieps_aplicable / base_gravable) * 100;

  } else if (i.tipo_producto === 'cigarro') {
    // IEPS: 160% ad valorem + $0.40 por cigarro
    const componente_advalorem = base_gravable * IEPS_CIGARRO_PORCENTAJE;
    let unidades = 0;
    if (i.unidad_medida === 'unidades') {
      unidades = i.monto_producto;
    } else if (i.unidad_medida === 'mxn' && i.precio_unitario && i.precio_unitario > 0) {
      unidades = Math.round(i.monto_producto / i.precio_unitario);
    }
    const componente_cuota_fija = unidades * IEPS_CIGARRO_CUOTA_FIJA;
    ieps_aplicable = componente_advalorem + componente_cuota_fija;
    tasa_ieps = (ieps_aplicable / base_gravable) * 100;

  } else if (i.tipo_producto === 'comida_chatarra') {
    // IEPS 8% sobre base
    ieps_aplicable = base_gravable * IEPS_COMIDA_CHATARRA;
    tasa_ieps = IEPS_COMIDA_CHATARRA * 100;

  } else if (i.tipo_producto === 'gasolina') {
    // IEPS variable por litro (referencia 2026)
    let litros = 0;
    if (i.unidad_medida === 'litros') {
      litros = i.monto_producto;
    } else if (i.unidad_medida === 'mxn' && i.precio_unitario && i.precio_unitario > 0) {
      litros = i.monto_producto / i.precio_unitario;
    }
    ieps_aplicable = litros * IEPS_GASOLINA_APROXIMADO;
    tasa_ieps = (ieps_aplicable / base_gravable) * 100;
  }

  // 3. Calcular base para IVA: base gravable + IEPS
  const base_iva = base_gravable + ieps_aplicable;

  // 4. Calcular IVA (16% nacional, 8% frontera - aquí asumimos nacional)
  const iva_sobre_ieps = i.incluir_iva ? base_iva * IVA_TASA : 0;

  // 5. Totales
  const total_impuestos = ieps_aplicable + iva_sobre_ieps;
  const precio_final = base_gravable + total_impuestos;
  const porcentaje_total_impuestos = base_gravable > 0 ? (total_impuestos / base_gravable) * 100 : 0;

  return {
    base_gravable: Math.round(base_gravable * 100) / 100,
    ieps_aplicable: Math.round(ieps_aplicable * 100) / 100,
    tasa_ieps: Math.round(tasa_ieps * 100) / 100,
    base_iva: Math.round(base_iva * 100) / 100,
    iva_sobre_ieps: Math.round(iva_sobre_ieps * 100) / 100,
    total_impuestos: Math.round(total_impuestos * 100) / 100,
    precio_final: Math.round(precio_final * 100) / 100,
    porcentaje_total_impuestos: Math.round(porcentaje_total_impuestos * 100) / 100
  };
}
