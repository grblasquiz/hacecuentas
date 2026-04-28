export interface Inputs {
  monto_origen: number;
  direccion_conversion: 'usd_a_clp' | 'clp_a_usd';
  fecha_conversion: string;
  casa_cambio: 'banco_central_observado' | 'bancoestado' | 'afex' | 'cocha' | 'comparar_todas';
}

export interface CasaCambioTasa {
  nombre: string;
  compra: number;
  venta: number;
  comision_porcentaje: number;
}

export interface ComparativaCasaCambio {
  casa_cambio: string;
  compra: number;
  venta: number;
  comision_porcentaje: number;
  monto_final: number;
}

export interface Outputs {
  tipo_cambio_observado: number;
  monto_convertido: number;
  comision_porcentaje: number;
  monto_final: number;
  spread_mercado: number;
  comparativa_casas_cambio: ComparativaCasaCambio[];
  diferencia_mejor_peor: number;
}

// Tipo cambio observado Banco Central 2026 (referencia actualizada cada día)
// Base de datos simulada - en producción conectar a API oficial BC
const tipo_cambio_bc: { [key: string]: number } = {
  '2026-04-28': 945.50,
  '2026-04-27': 944.75,
  '2026-04-26': 946.25,
  '2026-04-25': 945.00,
  '2026-04-24': 944.50,
  'default': 945.00
};

// Tasas casas cambio 2026 (datos aproximados, varían según monto)
const tasas_casas_cambio: { [key: string]: CasaCambioTasa } = {
  'banco_central_observado': {
    nombre: 'Banco Central (observado)',
    compra: 945.00,
    venta: 945.00,
    comision_porcentaje: 0
  },
  'bancoestado': {
    nombre: 'BancoEstado',
    compra: 941.00,
    venta: 949.00,
    comision_porcentaje: 0.50
  },
  'afex': {
    nombre: 'AFEX',
    compra: 940.50,
    venta: 949.50,
    comision_porcentaje: 1.00
  },
  'cocha': {
    nombre: 'Cocha',
    compra: 939.00,
    venta: 951.00,
    comision_porcentaje: 1.50
  }
};

export function compute(i: Inputs): Outputs {
  // Obtener tipo cambio observado para la fecha
  const tipo_cambio_obs = tipo_cambio_bc[i.fecha_conversion] || tipo_cambio_bc['default'];

  // Seleccionar tasa de casa cambio solicitada
  const tasa_seleccionada = tasas_casas_cambio[i.casa_cambio] || tasas_casas_cambio['banco_central_observado'];

  // Determinar tasa según dirección de conversión
  let tasa_aplicada = i.direccion_conversion === 'usd_a_clp' 
    ? tasa_seleccionada.venta 
    : tasa_seleccionada.compra;

  // Conversión básica
  let monto_convertido = i.monto_origen * tasa_aplicada;

  // Aplicar comisión
  const comision_monto = monto_convertido * (tasa_seleccionada.comision_porcentaje / 100);
  const monto_final = monto_convertido - comision_monto;

  // Calcular spread mercado
  const spread_mercado = tasa_seleccionada.venta - tasa_seleccionada.compra;

  // Generar comparativa de todas las casas cambio
  const comparativa_casas_cambio: ComparativaCasaCambio[] = [];
  
  for (const [key, tasa] of Object.entries(tasas_casas_cambio)) {
    const tasa_comp = i.direccion_conversion === 'usd_a_clp' ? tasa.venta : tasa.compra;
    const monto_conv = i.monto_origen * tasa_comp;
    const comision = monto_conv * (tasa.comision_porcentaje / 100);
    const final = monto_conv - comision;

    comparativa_casas_cambio.push({
      casa_cambio: tasa.nombre,
      compra: tasa.compra,
      venta: tasa.venta,
      comision_porcentaje: tasa.comision_porcentaje,
      monto_final: Math.round(final * 100) / 100
    });
  }

  // Ordenar por monto final (mayor a menor)
  comparativa_casas_cambio.sort((a, b) => b.monto_final - a.monto_final);

  // Diferencia mejor vs peor
  const mejor = comparativa_casas_cambio[0]?.monto_final || 0;
  const peor = comparativa_casas_cambio[comparativa_casas_cambio.length - 1]?.monto_final || 0;
  const diferencia_mejor_peor = Math.round((mejor - peor) * 100) / 100;

  return {
    tipo_cambio_observado: Math.round(tipo_cambio_obs * 100) / 100,
    monto_convertido: Math.round(monto_convertido * 100) / 100,
    comision_porcentaje: tasa_seleccionada.comision_porcentaje,
    monto_final: Math.round(monto_final * 100) / 100,
    spread_mercado: Math.round(spread_mercado * 100) / 100,
    comparativa_casas_cambio: comparativa_casas_cambio,
    diferencia_mejor_peor: diferencia_mejor_peor
  };
}
