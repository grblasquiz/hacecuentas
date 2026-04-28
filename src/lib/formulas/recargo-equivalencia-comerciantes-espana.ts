export interface Inputs {
  ventas_tipo_general: number;
  ventas_tipo_reducido: number;
  ventas_tipo_superreducido: number;
  porcentaje_compras: number;
}

export interface Outputs {
  base_compras_general: number;
  base_compras_reducido: number;
  base_compras_superreducido: number;
  recargo_general: number;
  recargo_reducido: number;
  recargo_superreducido: number;
  recargo_total: number;
  iva_repercutido_total: number;
  iva_soportado_total: number;
  cuota_neta_regimen_general: number;
  diferencia_regimenes: number;
  mensaje_resultado: string;
}

export function compute(i: Inputs): Outputs {
  // Tipos de IVA y recargos de equivalencia vigentes 2026
  // Fuente: Art. 161 Ley 37/1992 y AEAT (https://sede.agenciatributaria.gob.es)
  const TIPO_IVA_GENERAL = 0.21;
  const TIPO_IVA_REDUCIDO = 0.10;
  const TIPO_IVA_SUPERREDUCIDO = 0.04;

  const RECARGO_GENERAL = 0.052;        // 5,2% sobre base imponible compras (IVA 21%)
  const RECARGO_REDUCIDO = 0.014;       // 1,4% sobre base imponible compras (IVA 10%)
  const RECARGO_SUPERREDUCIDO = 0.005;  // 0,5% sobre base imponible compras (IVA 4%)

  // Saneamiento de inputs: valores mínimos 0, porcentaje compras entre 1 y 99
  const ventasGeneral = Math.max(0, i.ventas_tipo_general || 0);
  const ventasReducido = Math.max(0, i.ventas_tipo_reducido || 0);
  const ventasSuperreducido = Math.max(0, i.ventas_tipo_superreducido || 0);
  const pctCompras = Math.min(99, Math.max(1, i.porcentaje_compras || 60)) / 100;

  // Bases de compras estimadas (el recargo se aplica sobre las compras al proveedor,
  // no sobre las ventas; se estima la base de compras como porcentaje de las ventas)
  const baseComprasGeneral = ventasGeneral * pctCompras;
  const baseComprasReducido = ventasReducido * pctCompras;
  const baseComprasSuperreducido = ventasSuperreducido * pctCompras;

  // Recargo de equivalencia por tramo
  const recargoGeneral = baseComprasGeneral * RECARGO_GENERAL;
  const recargoReducido = baseComprasReducido * RECARGO_REDUCIDO;
  const recargoSuperreducido = baseComprasSuperreducido * RECARGO_SUPERREDUCIDO;

  const recargoTotal = recargoGeneral + recargoReducido + recargoSuperreducido;

  // IVA repercutido en ventas (lo cobra el comerciante de sus clientes)
  const ivaRepercutidoGeneral = ventasGeneral * TIPO_IVA_GENERAL;
  const ivaRepercutidoReducido = ventasReducido * TIPO_IVA_REDUCIDO;
  const ivaRepercutidoSuperreducido = ventasSuperreducido * TIPO_IVA_SUPERREDUCIDO;
  const ivaRepercutidoTotal = ivaRepercutidoGeneral + ivaRepercutidoReducido + ivaRepercutidoSuperreducido;

  // IVA soportado en compras (lo paga el comerciante al proveedor)
  const ivaSoportadoGeneral = baseComprasGeneral * TIPO_IVA_GENERAL;
  const ivaSoportadoReducido = baseComprasReducido * TIPO_IVA_REDUCIDO;
  const ivaSoportadoSuperreducido = baseComprasSuperreducido * TIPO_IVA_SUPERREDUCIDO;
  const ivaSoportadoTotal = ivaSoportadoGeneral + ivaSoportadoReducido + ivaSoportadoSuperreducido;

  // Cuota neta en régimen general: IVA repercutido - IVA soportado
  const cuotaNetaRegimenGeneral = ivaRepercutidoTotal - ivaSoportadoTotal;

  // Diferencia: recargo de equivalencia - cuota régimen general
  // Positivo: el recargo de equivalencia sale más caro
  // Negativo: el recargo de equivalencia sale más barato
  const diferenciaRegimenes = recargoTotal - cuotaNetaRegimenGeneral;

  // Generación del mensaje de conclusión
  const ventasTotal = ventasGeneral + ventasReducido + ventasSuperreducido;

  let mensajeResultado: string;

  if (ventasTotal === 0) {
    mensajeResultado =
      'Introduce al menos un importe de ventas para obtener el cálculo del recargo de equivalencia.';
  } else if (recargoTotal === 0) {
    mensajeResultado =
      'Con los datos introducidos el recargo de equivalencia es 0,00 €. Revisa que el porcentaje de compras sea mayor que cero.';
  } else {
    const recargoFormateado = recargoTotal.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const cuotaFormateada = cuotaNetaRegimenGeneral.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const difFormateada = Math.abs(diferenciaRegimenes).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (diferenciaRegimenes > 0.005) {
      mensajeResultado =
        `Tu recargo de equivalencia estimado es ${recargoFormateado} €, frente a una cuota neta de ${cuotaFormateada} € en régimen general. ` +
        `Con los márgenes indicados, el recargo de equivalencia te cuesta ${difFormateada} € MÁS que el régimen general. ` +
        `Recuerda que este régimen es obligatorio si cumples los requisitos del art. 148 Ley 37/1992; la comparativa es solo informativa.`;
    } else if (diferenciaRegimenes < -0.005) {
      mensajeResultado =
        `Tu recargo de equivalencia estimado es ${recargoFormateado} €, frente a una cuota neta de ${cuotaFormateada} € en régimen general. ` +
        `Con los márgenes indicados, el recargo de equivalencia te cuesta ${difFormateada} € MENOS que el régimen general. ` +
        `Recuerda que este régimen es obligatorio si cumples los requisitos del art. 148 Ley 37/1992; la comparativa es solo informativa.`;
    } else {
      mensajeResultado =
        `Tu recargo de equivalencia estimado es ${recargoFormateado} €, prácticamente equivalente a la cuota neta en régimen general (${cuotaFormateada} €). ` +
        `Recuerda que este régimen es obligatorio si cumples los requisitos del art. 148 Ley 37/1992.`;
    }
  }

  return {
    base_compras_general: Math.round(baseComprasGeneral * 100) / 100,
    base_compras_reducido: Math.round(baseComprasReducido * 100) / 100,
    base_compras_superreducido: Math.round(baseComprasSuperreducido * 100) / 100,
    recargo_general: Math.round(recargoGeneral * 100) / 100,
    recargo_reducido: Math.round(recargoReducido * 100) / 100,
    recargo_superreducido: Math.round(recargoSuperreducido * 100) / 100,
    recargo_total: Math.round(recargoTotal * 100) / 100,
    iva_repercutido_total: Math.round(ivaRepercutidoTotal * 100) / 100,
    iva_soportado_total: Math.round(ivaSoportadoTotal * 100) / 100,
    cuota_neta_regimen_general: Math.round(cuotaNetaRegimenGeneral * 100) / 100,
    diferencia_regimenes: Math.round(diferenciaRegimenes * 100) / 100,
    mensaje_resultado: mensajeResultado,
  };
}
