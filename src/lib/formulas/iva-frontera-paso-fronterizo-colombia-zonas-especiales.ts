export interface Inputs {
  valor_operacion: number;
  zona_especial: 'amazonas' | 'san_andres' | 'guaina' | 'vaupes' | 'vichada' | 'zona_franca';
  tipo_operacion: 'exportacion' | 'venta_local' | 'venta_resto_pais' | 'transferencia_cf';
  aplicar_exclucion_iva: boolean;
}

export interface Outputs {
  iva_aplicable: number;
  iva_valor: number;
  valor_total: number;
  ahorro_fiscal: number;
  regimen_aplicable: string;
  normativa: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026
  const TASA_IVA_ESTANDAR = 0.19;
  const TASA_IVA_CERO = 0.0;
  const TASA_IVA_EXCLUIDO = 0.0;

  let tasa_iva_aplicable = TASA_IVA_ESTANDAR;
  let regimen = '';
  let normativa = '';

  // Lógica según zona y tipo operación
  // Fuente: Decreto 306/1992, Decreto 4383/2005, Decreto 444/1992

  if (i.zona_especial === 'zona_franca') {
    // Zonas francas: Decreto 444/1992
    if (i.tipo_operacion === 'exportacion') {
      tasa_iva_aplicable = TASA_IVA_CERO;
      regimen = 'Exportación franquiciada (zona franca)';
      normativa = 'Decreto 444/1992, Art. 11';
    } else if (i.tipo_operacion === 'venta_local' || i.tipo_operacion === 'venta_resto_pais') {
      tasa_iva_aplicable = TASA_IVA_ESTANDAR;
      regimen = 'Venta interna (zona franca, no exportada)';
      normativa = 'Decreto 444/1992, Art. 13';
    } else if (i.tipo_operacion === 'transferencia_cf') {
      tasa_iva_aplicable = TASA_IVA_CERO;
      regimen = 'Transferencia entre franquiciarios (depósito/conservación)';
      normativa = 'Decreto 444/1992, Art. 12';
    }
  } else if (['amazonas', 'san_andres', 'guaina', 'vaupes', 'vichada'].includes(i.zona_especial)) {
    // Zonas especiales: Decreto 306/1992, Decreto 4383/2005
    if (i.tipo_operacion === 'exportacion') {
      // Exportación desde zona especial: 0% IVA
      tasa_iva_aplicable = TASA_IVA_CERO;
      regimen = `Exportación desde ${i.zona_especial} (régimen diferenciado)`;
      normativa = 'Decreto 306/1992, Art. 3';
    } else if (i.tipo_operacion === 'venta_local') {
      // Venta interna dentro de zona especial
      if (i.aplicar_exclucion_iva) {
        tasa_iva_aplicable = TASA_IVA_EXCLUIDO;
        regimen = `Bien excluido en ${i.zona_especial} (canasta básica)`;
        normativa = 'CTAT 2014, Art. 477 + Decreto 306/1992';
      } else {
        tasa_iva_aplicable = TASA_IVA_ESTANDAR;
        regimen = `Venta interna ${i.zona_especial} (bien gravado)`;
        normativa = 'Decreto 4383/2005, Art. 2';
      }
    } else if (i.tipo_operacion === 'venta_resto_pais') {
      // Venta a resto de Colombia desde zona especial
      // Tratamiento especial: algunos bienes 0%, otros 19% según decreto histórico
      if (i.aplicar_exclucion_iva) {
        tasa_iva_aplicable = TASA_IVA_CERO;
        regimen = `Bien excluido (venta a resto país desde ${i.zona_especial})`;
        normativa = 'Decreto 306/1992, Art. 5';
      } else {
        // Por defecto, venta a resto país desde zona especial: aplicar IVA estándar
        tasa_iva_aplicable = TASA_IVA_ESTANDAR;
        regimen = `Venta a resto país desde ${i.zona_especial}`;
        normativa = 'Decreto 4383/2005';
      }
    }
  }

  // Cálculos
  const iva_valor = Math.round(i.valor_operacion * tasa_iva_aplicable);
  const valor_total = i.valor_operacion + iva_valor;
  const ahorro_fiscal = Math.round(i.valor_operacion * TASA_IVA_ESTANDAR) - iva_valor;

  return {
    iva_aplicable: Math.round(tasa_iva_aplicable * 100 * 10) / 10, // porcentaje con 1 decimal
    iva_valor: iva_valor,
    valor_total: valor_total,
    ahorro_fiscal: Math.max(0, ahorro_fiscal), // no negativo
    regimen_aplicable: regimen,
    normativa: normativa
  };
}
