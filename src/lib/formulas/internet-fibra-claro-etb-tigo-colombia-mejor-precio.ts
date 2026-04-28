export interface Inputs {
  velocidad_mbps: number;
  ciudad: string;
  tipo_plan: string;
  operador: string;
  contrato_meses: number;
}

export interface Outputs {
  precio_mensual_claro: number;
  precio_mensual_etb: number;
  precio_mensual_tigo: number;
  precio_mensual_movistar: number;
  instalacion_claro: number;
  instalacion_etb: number;
  instalacion_tigo: number;
  instalacion_movistar: number;
  costo_total_12_meses_claro: number;
  costo_total_12_meses_etb: number;
  costo_total_12_meses_tigo: number;
  costo_total_12_meses_movistar: number;
  mejor_opcion: string;
  ahorro_vs_peor: number;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Tarifas base 2026 solo internet (Bogotá)
  // Fuente: Sitios web operadores abril 2026
  const tarifasBase: { [key: number]: { claro: number; etb: number; tigo: number; movistar: number } } = {
    100: { claro: 49900, etb: 54900, tigo: 59900, movistar: 52900 },
    300: { claro: 89900, etb: 94900, tigo: 99900, movistar: 92900 },
    500: { claro: 129900, etb: 134900, tigo: 139900, movistar: 132900 },
    600: { claro: 159900, etb: 164900, tigo: 189900, movistar: 162900 }
  };

  // Ajuste por ciudad
  const ajustesCiudad: { [key: string]: number } = {
    bogota: 1.0,
    medellin: 1.08,
    cali: 1.10,
    barranquilla: 1.12,
    bucaramanga: 1.15,
    cartagena: 1.18,
    manizales: 1.20,
    pereira: 1.22,
    santa_marta: 1.25,
    otra: 1.30
  };

  const ajusteCiudad = ajustesCiudad[i.ciudad] || 1.0;

  // Costo instalación por operador
  const instalaciones: { [key: string]: { sin: number; con: number } } = {
    claro: { sin: 99900, con: i.contrato_meses >= 24 ? 0 : 49900 },
    etb: { sin: 79900, con: i.contrato_meses >= 24 ? 0 : 39900 },
    tigo: { sin: 89900, con: i.contrato_meses >= 24 ? 0 : 49900 },
    movistar: { sin: 99900, con: i.contrato_meses >= 24 ? 0 : 49900 }
  };

  const instClaro = i.contrato_meses === 0 ? instalaciones.claro.sin : instalaciones.claro.con;
  const instEtb = i.contrato_meses === 0 ? instalaciones.etb.sin : instalaciones.etb.con;
  const instTigo = i.contrato_meses === 0 ? instalaciones.tigo.sin : instalaciones.tigo.con;
  const instMovistar = i.contrato_meses === 0 ? instalaciones.movistar.sin : instalaciones.movistar.con;

  // Precio mensual base
  const baseClaro = (tarifasBase[i.velocidad_mbps as keyof typeof tarifasBase]?.claro || 0) * ajusteCiudad;
  const baseEtb = (tarifasBase[i.velocidad_mbps as keyof typeof tarifasBase]?.etb || 0) * ajusteCiudad;
  const baseTigo = (tarifasBase[i.velocidad_mbps as keyof typeof tarifasBase]?.tigo || 0) * ajusteCiudad;
  const baseMovistar = (tarifasBase[i.velocidad_mbps as keyof typeof tarifasBase]?.movistar || 0) * ajusteCiudad;

  // Recargo triple play
  const recargoTriplePlay: { [key: string]: number } = {
    claro: i.tipo_plan === 'triple_play' ? 19900 : 0,
    etb: i.tipo_plan === 'triple_play' ? 24900 : 0,
    tigo: i.tipo_plan === 'triple_play' ? 16900 : 0,
    movistar: i.tipo_plan === 'triple_play' ? 22900 : 0
  };

  const precioMensualClaro = Math.round(baseClaro + recargoTriplePlay.claro);
  const precioMensualEtb = Math.round(baseEtb + recargoTriplePlay.etb);
  const precioMensualTigo = Math.round(baseTigo + recargoTriplePlay.tigo);
  const precioMensualMovistar = Math.round(baseMovistar + recargoTriplePlay.movistar);

  // Costo total año 1
  const costoAno1Claro = Math.round(instClaro + precioMensualClaro * 12);
  const costoAno1Etb = Math.round(instEtb + precioMensualEtb * 12);
  const costoAno1Tigo = Math.round(instTigo + precioMensualTigo * 12);
  const costoAno1Movistar = Math.round(instMovistar + precioMensualMovistar * 12);

  // Mejor opción (menor costo año 1)
  const opciones = [
    { nom: 'Claro', costo: costoAno1Claro, precio: precioMensualClaro },
    { nom: 'ETB', costo: costoAno1Etb, precio: precioMensualEtb },
    { nom: 'Tigo', costo: costoAno1Tigo, precio: precioMensualTigo },
    { nom: 'Movistar', costo: costoAno1Movistar, precio: precioMensualMovistar }
  ];

  const mejorOpcion = opciones.reduce((a, b) => a.costo < b.costo ? a : b);
  const peorOpcion = opciones.reduce((a, b) => a.costo > b.costo ? a : b);
  const ahorro = peorOpcion.costo - mejorOpcion.costo;

  // Recomendación según uso y velocidad
  let recomendacion = '';
  if (i.velocidad_mbps === 100) {
    recomendacion = '100 Mbps es básico. Ideal para 1-2 personas, streaming HD, trabajo remoto simple. ' + mejorOpcion.nom + ' es más económico.';
  } else if (i.velocidad_mbps === 300) {
    recomendacion = '300 Mbps es estándar (recomendado). Ideal para 3-4 personas, múltiples dispositivos, 4K. Buen balance precio-velocidad con ' + mejorOpcion.nom + '.';
  } else if (i.velocidad_mbps === 500) {
    recomendacion = '500 Mbps para 5+ personas o gaming serio. ' + mejorOpcion.nom + ' ofrece mejor relación. Considera si necesitas realmente 500+.';
  } else if (i.velocidad_mbps === 600) {
    recomendacion = '600 Mbps es máximo. Solo si necesitas gaming competitivo, streaming 4K simultáneo o diseño gráfico. ' + mejorOpcion.nom + ' cuesta más pero ofrece máxima velocidad.';
  }

  if (i.tipo_plan === 'triple_play') {
    recomendacion += ' Triple play añade TV y telefonía; útil si los necesitas.';
  }

  return {
    precio_mensual_claro: precioMensualClaro,
    precio_mensual_etb: precioMensualEtb,
    precio_mensual_tigo: precioMensualTigo,
    precio_mensual_movistar: precioMensualMovistar,
    instalacion_claro: instClaro,
    instalacion_etb: instEtb,
    instalacion_tigo: instTigo,
    instalacion_movistar: instMovistar,
    costo_total_12_meses_claro: costoAno1Claro,
    costo_total_12_meses_etb: costoAno1Etb,
    costo_total_12_meses_tigo: costoAno1Tigo,
    costo_total_12_meses_movistar: costoAno1Movistar,
    mejor_opcion: mejorOpcion.nom,
    ahorro_vs_peor: Math.round(ahorro),
    recomendacion: recomendacion
  };
}
