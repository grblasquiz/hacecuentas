/** Calculadora de rendimiento de masa para empanadas */
export interface Inputs {
  modo: string;
  cantidad: number;
  tipoTapa?: string;
}
export interface Outputs {
  cantidadEmpanadas: number;
  harinaGramos: number;
  ingredientesMasa: string;
  rellenoKg: number;
  detalle: string;
}

export function rendimientoMasaEmpanadasCantidad(i: Inputs): Outputs {
  const modo = i.modo;
  const cantidad = Number(i.cantidad);
  const tipo = i.tipoTapa || 'casera_criolla';

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad');

  // Peso de masa (harina) por tapa
  const gramosHarinaPorTapa = tipo === 'casera_frita' ? 28 : 30;
  // Relleno por empanada
  const rellenoPorEmpanada = 40; // gramos

  let empanadas: number;
  let harina: number;

  if (modo === 'empanadas_deseadas') {
    empanadas = cantidad;
    harina = empanadas * gramosHarinaPorTapa;
  } else {
    // harina_disponible: cantidad = gramos de harina
    harina = cantidad;
    empanadas = Math.floor(harina / gramosHarinaPorTapa);
  }

  // Proporciones para la masa
  const grasa = Math.round(harina * (tipo === 'casera_frita' ? 0.20 : 0.30));
  const agua = Math.round(harina * 0.40);
  const sal = Math.round(harina * 0.02);
  const relleno = (empanadas * rellenoPorEmpanada) / 1000;

  const tipoNombre = tipo === 'casera_criolla' ? 'criollas (horno)' : tipo === 'casera_frita' ? 'para freír' : 'con tapas compradas';

  let ingredientes: string;
  if (tipo === 'comprada') {
    const paquetes = Math.ceil(empanadas / 12);
    ingredientes = `${paquetes} paquete(s) de 12 tapas`;
  } else {
    ingredientes = `${Math.round(harina)} g harina, ${grasa} g grasa${tipo === 'casera_frita' ? ', 1 huevo' : ''}, ${agua} ml agua, ${sal} g sal`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    cantidadEmpanadas: empanadas,
    harinaGramos: Math.round(harina),
    ingredientesMasa: ingredientes,
    rellenoKg: Number(relleno.toFixed(1)),
    detalle: `${empanadas} empanadas ${tipoNombre}: masa → ${ingredientes}. Relleno: ${relleno.toFixed(1)} kg (${fmt.format(rellenoPorEmpanada)} g/unidad).`,
  };
}
