export interface Inputs {
  velocidad_fibra: number;
  lineas_movil: number;
  gb_movil: number;
  incluir_promocion: boolean;
}

export interface Outputs {
  movistar_mensual: number;
  movistar_anual: number;
  orange_mensual: number;
  orange_anual: number;
  vodafone_mensual: number;
  vodafone_anual: number;
  masmovil_mensual: number;
  masmovil_anual: number;
  lowi_mensual: number;
  lowi_anual: number;
  pepephone_mensual: number;
  pepephone_anual: number;
  mejor_opcion: string;
  ahorro_maximo: number;
  permanencia_info: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes tarifas operadores abril 2026 (sin IVA)
  // Fuente: Tarifas públicas operadores España Q2 2026
  
  interface TarifaBase {
    fibra300: number;
    fibra600: number;
    fibra1000: number;
    movilBase: number;
    incremento5gb: number;
    incremento10gb: number;
    incremento20gb: number;
    incremento50gb: number;
    incremento100gb: number;
    nombre: string;
    ofertaEntrada: number; // descuento en € primeros 6 meses
  }

  const tarifas: { [key: string]: TarifaBase } = {
    movistar: {
      fibra300: 39.99,
      fibra600: 49.99,
      fibra1000: 59.99,
      movilBase: 15.0,
      incremento5gb: 3.0,
      incremento10gb: 6.0,
      incremento20gb: 10.0,
      incremento50gb: 18.0,
      incremento100gb: 28.0,
      nombre: "Movistar",
      ofertaEntrada: 5.0
    },
    orange: {
      fibra300: 34.99,
      fibra600: 44.99,
      fibra1000: 54.99,
      movilBase: 14.0,
      incremento5gb: 2.5,
      incremento10gb: 5.0,
      incremento20gb: 8.5,
      incremento50gb: 15.0,
      incremento100gb: 24.0,
      nombre: "Orange",
      ofertaEntrada: 4.0
    },
    vodafone: {
      fibra300: 29.99,
      fibra600: 39.99,
      fibra1000: 49.99,
      movilBase: 12.0,
      incremento5gb: 2.0,
      incremento10gb: 4.0,
      incremento20gb: 7.0,
      incremento50gb: 14.0,
      incremento100gb: 22.0,
      nombre: "Vodafone",
      ofertaEntrada: 3.5
    },
    masmovil: {
      fibra300: 32.99,
      fibra600: 42.99,
      fibra1000: 52.99,
      movilBase: 11.0,
      incremento5gb: 1.5,
      incremento10gb: 3.0,
      incremento20gb: 5.5,
      incremento50gb: 12.0,
      incremento100gb: 20.0,
      nombre: "MásMóvil",
      ofertaEntrada: 2.5
    },
    lowi: {
      fibra300: 27.99,
      fibra600: 37.99,
      fibra1000: 47.99,
      movilBase: 9.99,
      incremento5gb: 1.0,
      incremento10gb: 2.0,
      incremento20gb: 3.5,
      incremento50gb: 10.0,
      incremento100gb: 18.0,
      nombre: "Lowi",
      ofertaEntrada: 2.0
    },
    pepephone: {
      fibra300: 28.99,
      fibra600: 38.99,
      fibra1000: 48.99,
      movilBase: 10.99,
      incremento5gb: 1.5,
      incremento10gb: 2.5,
      incremento20gb: 4.0,
      incremento50gb: 11.0,
      incremento100gb: 19.0,
      nombre: "Pepephone",
      ofertaEntrada: 2.0
    }
  };

  // Seleccionar tarifa fibra según velocidad
  const getSegmentFibra = (vel: number, tarifa: TarifaBase): number => {
    if (vel === 300) return tarifa.fibra300;
    if (vel === 600) return tarifa.fibra600;
    if (vel === 1000) return tarifa.fibra1000;
    return tarifa.fibra600; // default
  };

  // Seleccionar incremento datos móvil
  const getIncrementoDatos = (gb: number, tarifa: TarifaBase): number => {
    if (gb <= 3) return 0;
    if (gb === 5) return tarifa.incremento5gb;
    if (gb === 10) return tarifa.incremento10gb;
    if (gb === 20) return tarifa.incremento20gb;
    if (gb === 50) return tarifa.incremento50gb;
    if (gb === 100) return tarifa.incremento100gb;
    return tarifa.incremento10gb; // default
  };

  // Calcular cuota mensual sin IVA
  const calcularMensual = (tarifa: TarifaBase, velocidad: number, numLineas: number, gb: number): number => {
    const precioFibra = getSegmentFibra(velocidad, tarifa);
    const incrementoDatos = getIncrementoDatos(gb, tarifa);
    const precioMovil = (tarifa.movilBase + incrementoDatos) * numLineas;
    return precioFibra + precioMovil;
  };

  // IVA 21% (obligatorio España)
  const IVA = 0.21;
  const aplicarIVA = (precioSinIVA: number): number => {
    return precioSinIVA * (1 + IVA);
  };

  // Calcular con oferta entrada si aplica
  const calcularAnual = (mensualSinIVA: number, conOferta: boolean, descuentoOferta: number): number => {
    if (conOferta) {
      // Primeros 6 meses con descuento, últimos 6 meses precio regular
      const mes1a6 = (mensualSinIVA - descuentoOferta) * 6;
      const mes7a12 = mensualSinIVA * 6;
      const totalSinIVA = mes1a6 + mes7a12;
      return aplicarIVA(totalSinIVA);
    } else {
      return aplicarIVA(mensualSinIVA * 12);
    }
  };

  // Calcular para cada operadora
  const resultados: { [key: string]: { mensual: number; anual: number } } = {};

  Object.entries(tarifas).forEach(([clave, tarifa]) => {
    const mensualSinIVA = calcularMensual(tarifa, i.velocidad_fibra, i.lineas_movil, i.gb_movil);
    const mensualConIVA = aplicarIVA(mensualSinIVA);
    const anualConIVA = calcularAnual(mensualSinIVA, i.incluir_promocion, tarifa.ofertaEntrada);
    resultados[clave] = {
      mensual: Math.round(mensualConIVA * 100) / 100,
      anual: Math.round(anualConIVA * 100) / 100
    };
  });

  // Encontrar mejor opción y ahorro máximo
  const anuales = Object.entries(resultados).map(([op, vals]) => ({
    operadora: op,
    nombre: tarifas[op].nombre,
    anual: vals.anual
  }));

  const mejorOpcion = anuales.reduce((prev, curr) => curr.anual < prev.anual ? curr : prev);
  const peorOpcion = anuales.reduce((prev, curr) => curr.anual > prev.anual ? curr : prev);
  const ahorroMaximo = Math.round((peorOpcion.anual - mejorOpcion.anual) * 100) / 100;

  // Info permanencia
  const infoMes = i.lineas_movil === 1 ? "línea" : "líneas";
  const permanencia_info = `Con ${i.lineas_movil} ${infoMes} móvil y ${i.gb_movil} GB/mes a ${i.velocidad_fibra} Mbps:\n- Mejor opción: ${mejorOpcion.nombre} (${mejorOpcion.anual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/año)\n- Permanencia típica: 12 meses\n- Penalización rescisión anticipada: ~50€ por línea\n- Portabilidad número móvil: gratuita\n- IVA 21% incluido en todos los precios`;

  return {
    movistar_mensual: resultados.movistar.mensual,
    movistar_anual: resultados.movistar.anual,
    orange_mensual: resultados.orange.mensual,
    orange_anual: resultados.orange.anual,
    vodafone_mensual: resultados.vodafone.mensual,
    vodafone_anual: resultados.vodafone.anual,
    masmovil_mensual: resultados.masmovil.mensual,
    masmovil_anual: resultados.masmovil.anual,
    lowi_mensual: resultados.lowi.mensual,
    lowi_anual: resultados.lowi.anual,
    pepephone_mensual: resultados.pepephone.mensual,
    pepephone_anual: resultados.pepephone.anual,
    mejor_opcion: `${mejorOpcion.nombre}: ${mejorOpcion.anual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/año`,
    ahorro_maximo: ahorroMaximo,
    permanencia_info: permanencia_info
  };
}
