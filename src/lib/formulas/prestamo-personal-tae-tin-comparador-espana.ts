export interface Inputs {
  capital_prestamo: number;
  tin_porcentaje: number;
  comision_apertura: number;
  gasto_estudio: number;
  plazo_meses: number;
  gasto_mensual: number;
  oferta2_tin: number;
  oferta2_comision: number;
  oferta3_tin: number;
  oferta3_comision: number;
}

export interface Outputs {
  tae_calculada: number;
  cuota_mensual: number;
  interes_total: number;
  coste_total_oferta1: number;
  tae_oferta2: number;
  coste_total_oferta2: number;
  tae_oferta3: number;
  coste_total_oferta3: number;
  mejor_oferta: string;
  ahorro_vs_peor: number;
}

/**
 * Calcula TAE iterativamente usando método Newton-Raphson.
 * Converge cuando |f(x)| < tolerancia (0.0001).
 * Fuente: Banco de España - Definición TAE (Tasa Anual Equivalente)
 */
function calcularTAE(
  capitalPrestamo: number,
  tinAnual: number,
  comisionApertura: number,
  gastoEstudio: number,
  plazoMeses: number,
  gastoMensual: number
): number {
  // Capital neto recibido (resta comisión inicial)
  const capitalNeto = capitalPrestamo - (capitalPrestamo * comisionApertura) / 100 - gastoEstudio;
  
  // Cuota mensual con sistema francés
  const tinMensual = tinAnual / 100 / 12;
  const denominador = Math.pow(1 + tinMensual, plazoMeses) - 1;
  const numerador = tinMensual * Math.pow(1 + tinMensual, plazoMeses);
  const cuotaMensual = capitalPrestamo * (numerador / denominador);
  
  // Iteración Newton-Raphson para TAE
  let tae = tinAnual / 100; // aproximación inicial = TIN en decimal
  const maxIteraciones = 100;
  const tolerancia = 0.0001; // ±0.01%
  
  for (let iter = 0; iter < maxIteraciones; iter++) {
    const taeMensual = tae / 12;
    
    // Valor presente neto de flujos de caja
    let vpn = capitalNeto;
    let derivada = 0;
    
    for (let mes = 1; mes <= plazoMeses; mes++) {
      const cuotaTotal = cuotaMensual + gastoMensual;
      const factor = Math.pow(1 + taeMensual, mes);
      vpn -= cuotaTotal / factor;
      derivada -= (mes * cuotaTotal) / (Math.pow(1 + taeMensual, mes + 1) / 12);
    }
    
    // Comprobación convergencia
    if (Math.abs(vpn) < tolerancia) {
      break;
    }
    
    // Actualización Newton-Raphson
    if (Math.abs(derivada) > 1e-10) {
      tae = tae - vpn / derivada;
      // Limitar a rango sensato
      tae = Math.max(0, Math.min(tae, 0.5));
    }
  }
  
  return tae * 100; // retornar en porcentaje
}

/**
 * Calcula cuota mensual sistema francés (amortización constante).
 * Fuente: AEAT - sistemas de amortización préstamos personales España
 */
function calcularCuotaMensual(
  capitalPrestamo: number,
  tinAnual: number,
  plazoMeses: number
): number {
  const tinMensual = tinAnual / 100 / 12;
  
  if (tinMensual === 0) {
    // Si TIN es 0, cuota = capital / plazo
    return capitalPrestamo / plazoMeses;
  }
  
  const factor = Math.pow(1 + tinMensual, plazoMeses);
  const numerador = tinMensual * factor;
  const denominador = factor - 1;
  
  return capitalPrestamo * (numerador / denominador);
}

/**
 * Calcula coste total: capital + intereses + comisiones + gastos.
 */
function calcularCostetotal(
  capital: number,
  cuotaMensual: number,
  plazoMeses: number,
  comisionApertura: number,
  gastoEstudio: number,
  gastoMensual: number
): { interesTotal: number; costoTotal: number } {
  const comisionAbsoluta = (capital * comisionApertura) / 100;
  const totalPagado = cuotaMensual * plazoMeses;
  const interesTotal = totalPagado - capital;
  const costoTotal = capital + interesTotal + comisionAbsoluta + gastoEstudio + gastoMensual * plazoMeses;
  
  return { interesTotal, costoTotal };
}

export function compute(i: Inputs): Outputs {
  // OFERTA 1 — Cálculos principales
  const cuotaMensual1 = calcularCuotaMensual(i.capital_prestamo, i.tin_porcentaje, i.plazo_meses);
  const { interesTotal: interes1, costoTotal: coste1 } = calcularCostetotal(
    i.capital_prestamo,
    cuotaMensual1,
    i.plazo_meses,
    i.comision_apertura,
    i.gasto_estudio,
    i.gasto_mensual
  );
  const tae1 = calcularTAE(
    i.capital_prestamo,
    i.tin_porcentaje,
    i.comision_apertura,
    i.gasto_estudio,
    i.plazo_meses,
    i.gasto_mensual
  );
  
  // OFERTA 2 — Si se proporciona TIN
  let tae2 = 0;
  let coste2 = 0;
  if (i.oferta2_tin > 0) {
    const cuotaMensual2 = calcularCuotaMensual(i.capital_prestamo, i.oferta2_tin, i.plazo_meses);
    const { costoTotal: costoOferta2 } = calcularCostetotal(
      i.capital_prestamo,
      cuotaMensual2,
      i.plazo_meses,
      i.oferta2_comision,
      0,
      0
    );
    tae2 = calcularTAE(
      i.capital_prestamo,
      i.oferta2_tin,
      i.oferta2_comision,
      0,
      i.plazo_meses,
      0
    );
    coste2 = costoOferta2;
  } else {
    coste2 = coste1; // si no hay oferta 2, igualar a oferta 1
  }
  
  // OFERTA 3 — Si se proporciona TIN
  let tae3 = 0;
  let coste3 = 0;
  if (i.oferta3_tin > 0) {
    const cuotaMensual3 = calcularCuotaMensual(i.capital_prestamo, i.oferta3_tin, i.plazo_meses);
    const { costoTotal: costoOferta3 } = calcularCostetotal(
      i.capital_prestamo,
      cuotaMensual3,
      i.plazo_meses,
      i.oferta3_comision,
      0,
      0
    );
    tae3 = calcularTAE(
      i.capital_prestamo,
      i.oferta3_tin,
      i.oferta3_comision,
      0,
      i.plazo_meses,
      0
    );
    coste3 = costoOferta3;
  } else {
    coste3 = coste1; // si no hay oferta 3, igualar a oferta 1
  }
  
  // Determinar mejor oferta
  const costes = [
    { oferta: "Oferta 1", tae: tae1, coste: coste1 },
    { oferta: "Oferta 2", tae: tae2, coste: coste2 },
    { oferta: "Oferta 3", tae: tae3, coste: coste3 }
  ];
  
  // Filtrar solo ofertas activas (TAE > 0)
  const ofertasActivas = costes.filter(o => o.tae > 0);
  let mejorOferta = "Oferta 1";
  let taeMejor = tae1;
  let costeMejor = coste1;
  let costoMayor = coste1;
  
  if (ofertasActivas.length > 1) {
    const ordenado = [...ofertasActivas].sort((a, b) => a.coste - b.coste);
    mejorOferta = ordenado[0].oferta;
    costeMejor = ordenado[0].coste;
    costoMayor = ordenado[ordenado.length - 1].coste;
  } else if (ofertasActivas.length === 1) {
    mejorOferta = ofertasActivas[0].oferta;
    costeMejor = ofertasActivas[0].coste;
    costoMayor = costeMejor;
  }
  
  const ahorroVspeor = costoMayor - costeMejor;
  
  return {
    tae_calculada: Math.round(tae1 * 100) / 100,
    cuota_mensual: Math.round(cuotaMensual1 * 100) / 100,
    interes_total: Math.round(interes1 * 100) / 100,
    coste_total_oferta1: Math.round(coste1 * 100) / 100,
    tae_oferta2: tae2 > 0 ? Math.round(tae2 * 100) / 100 : 0,
    coste_total_oferta2: tae2 > 0 ? Math.round(coste2 * 100) / 100 : 0,
    tae_oferta3: tae3 > 0 ? Math.round(tae3 * 100) / 100 : 0,
    coste_total_oferta3: tae3 > 0 ? Math.round(coste3 * 100) / 100 : 0,
    mejor_oferta: mejorOferta,
    ahorro_vs_peor: Math.round(ahorroVspeor * 100) / 100
  };
}
