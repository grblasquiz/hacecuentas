// calculadora-prestamo-coche-espana-cdc-vs-renting
// Fórmulas financieras estándar. Fuentes: Banco de España Circular 5/2012, Ley 16/2011.

export interface Inputs {
  precio_coche: number;                 // € con IVA
  entrada: number;                      // € al contado
  plazo_meses: number;                  // 12-96
  tin_banco: number;                    // % anual
  tin_concesionario: number;            // % anual
  comision_apertura_banco: number;      // €
  comision_apertura_concesionario: number; // €
  cuota_renting: number;                // €/mes todo incluido
  km_anuales_renting: number;           // km/año contratados
  valor_residual_renting_pct: number;   // % del precio
  tin_leasing: number;                  // % anual
  valor_residual_leasing_pct: number;   // % del precio
  es_autonomo: boolean;
  km_reales_anuales: number;            // km/año reales previstos
}

export interface Outputs {
  cuota_banco: number;               // €/mes
  tae_banco: number;                 // %
  total_banco: number;               // € total pagado
  cuota_concesionario: number;       // €/mes
  tae_concesionario: number;         // %
  total_concesionario: number;       // € total pagado
  total_renting: number;             // € total pagado (sin exceso km)
  coste_exceso_km: number;           // € estimado exceso km
  cuota_leasing: number;             // €/mes
  tae_leasing: number;               // %
  total_leasing: number;             // € total (cuotas + residual + entrada)
  ahorro_iva_leasing_renting: number; // € IVA deducible si autónomo
  ranking_costes: string;            // texto ranking
  recomendacion: string;             // texto recomendación
}

/** Cuota mensual sistema francés (amortización constante) */
function cuotaFrances(capital: number, tinAnual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  if (tinAnual <= 0) {
    // Tipo 0%: división simple
    return capital / meses;
  }
  const r = tinAnual / 100 / 12;
  const factor = Math.pow(1 + r, meses);
  return capital * r * factor / (factor - 1);
}

/**
 * Calcula la TAE mediante Newton-Raphson.
 * La TAE es el tipo anual que iguala el capital neto recibido
 * con el valor actual de todas las cuotas.
 * Fuente: Circular 5/2012 Banco de España.
 */
function calcularTAE(
  capitalNeto: number,    // Capital efectivamente recibido (capital - comisión)
  cuota: number,
  meses: number
): number {
  if (capitalNeto <= 0 || cuota <= 0 || meses <= 0) return 0;

  // Valor inicial: TIN aproximado
  let tae = 0.07; // 7% inicial
  const MAX_ITER = 50;
  const TOLERANCIA = 1e-8;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const r = tae / 12;
    let vp = 0;
    let dvp = 0;
    for (let k = 1; k <= meses; k++) {
      const descuento = Math.pow(1 + r, k);
      vp += cuota / descuento;
      dvp -= (k / 12) * cuota / (descuento * (1 + tae));
    }
    const f = vp - capitalNeto;
    const df = dvp;
    if (Math.abs(df) < 1e-12) break;
    const taeNueva = tae - f / df;
    if (Math.abs(taeNueva - tae) < TOLERANCIA) {
      tae = taeNueva;
      break;
    }
    tae = Math.max(0, taeNueva);
  }

  return Math.round(tae * 10000) / 100; // %  con 2 decimales
}

/** Redondea a 2 decimales */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // --- Validaciones y clamps ---
  const precioCoche = Math.max(0, i.precio_coche ?? 25000);
  const entrada = Math.min(Math.max(0, i.entrada ?? 0), precioCoche);
  const plazo = Math.max(1, Math.round(i.plazo_meses ?? 60));
  const tinBanco = Math.max(0, i.tin_banco ?? 6.5);
  const tinConc = Math.max(0, i.tin_concesionario ?? 3.9);
  const comBanco = Math.max(0, i.comision_apertura_banco ?? 300);
  const comConc = Math.max(0, i.comision_apertura_concesionario ?? 0);
  const cuotaRenting = Math.max(0, i.cuota_renting ?? 450);
  const kmRentingContratados = Math.max(0, i.km_anuales_renting ?? 15000);
  const vrRentingPct = Math.min(Math.max(0, i.valor_residual_renting_pct ?? 0), 100);
  const tinLeasing = Math.max(0, i.tin_leasing ?? 5.5);
  const vrLeasingPct = Math.min(Math.max(0, i.valor_residual_leasing_pct ?? 15), 60);
  const esAutonomo = i.es_autonomo ?? false;
  const kmReales = Math.max(0, i.km_reales_anuales ?? 15000);

  // Tipo IVA vehículos España 2026: 21%
  // Fuente: AEAT - https://sede.agenciatributaria.gob.es
  const IVA_TIPO = 0.21;

  // Coste exceso km renting (media mercado España 2026: 0,09 €/km)
  const COSTE_EXCESO_KM_UNITARIO = 0.09;

  const capitalFinanciado = precioCoche - entrada;

  // ==========================================================
  // 1. PRÉSTAMO BANCARIO (CDC Banco)
  // ==========================================================
  const cuotaBanco = r2(cuotaFrances(capitalFinanciado, tinBanco, plazo));
  const totalCuotasBanco = r2(cuotaBanco * plazo);
  const totalBanco = r2(totalCuotasBanco + entrada + comBanco);
  // TAE: capital neto = capital financiado - comisión apertura
  const capitalNetoBanco = Math.max(1, capitalFinanciado - comBanco);
  const taeBanco = calcularTAE(capitalNetoBanco, cuotaBanco, plazo);

  // ==========================================================
  // 2. FINANCIACIÓN CONCESIONARIO (CDC Concesionario)
  // ==========================================================
  const cuotaConcesionario = r2(cuotaFrances(capitalFinanciado, tinConc, plazo));
  const totalCuotasConc = r2(cuotaConcesionario * plazo);
  const totalConcesionario = r2(totalCuotasConc + entrada + comConc);
  const capitalNetoConc = Math.max(1, capitalFinanciado - comConc);
  const taeConc = calcularTAE(capitalNetoConc, cuotaConcesionario, plazo);

  // ==========================================================
  // 3. RENTING
  // ==========================================================
  const totalRentingBase = r2(cuotaRenting * plazo);

  // Exceso de kilómetros
  const anosContrato = plazo / 12;
  const kmExcesoPorAnio = Math.max(0, kmReales - kmRentingContratados);
  const costeExcesoKm = r2(kmExcesoPorAnio * anosContrato * COSTE_EXCESO_KM_UNITARIO);

  // Valor residual renting (si existe opción de compra)
  const vrRentingEuros = r2(precioCoche * vrRentingPct / 100);
  // El total de renting incluye el exceso de km; el VR solo si ejerces la opción de compra
  // (se muestra por separado; el total base NO incluye VR)
  const totalRenting = r2(totalRentingBase + costeExcesoKm);

  // IVA deducible en renting para autónomos: 21% sobre cuotas
  // Fuente: AEAT art.95 Ley 37/1992
  const ivaRenting = esAutonomo ? r2((cuotaRenting / (1 + IVA_TIPO)) * IVA_TIPO * plazo) : 0;

  // ==========================================================
  // 4. LEASING FINANCIERO
  // ==========================================================
  // En leasing, el valor residual se descuenta del capital a financiar
  // (balloon payment al final).
  // Las cuotas se calculan sobre el capital - VR descontado.
  // Fuente: práctica estándar financieras España 2026.
  const vrLeasingEuros = r2(precioCoche * vrLeasingPct / 100);
  const rLeasingMensual = tinLeasing / 100 / 12;

  let capitalLeasingAmortizar: number;
  if (rLeasingMensual > 0) {
    const factorDescuento = Math.pow(1 + rLeasingMensual, plazo);
    const vrDescontado = vrLeasingEuros / factorDescuento;
    capitalLeasingAmortizar = Math.max(0, capitalFinanciado - vrDescontado);
  } else {
    // Tipo 0%
    capitalLeasingAmortizar = Math.max(0, capitalFinanciado - vrLeasingEuros);
  }

  const cuotaLeasing = r2(cuotaFrances(capitalLeasingAmortizar, tinLeasing, plazo));
  const totalCuotasLeasing = r2(cuotaLeasing * plazo);
  // Coste total leasing = entrada + cuotas + valor residual (para adquirir el coche)
  const totalLeasing = r2(totalCuotasLeasing + entrada + vrLeasingEuros);

  // TAE leasing: capital neto = capital financiado (sin descontar comisión, leasing no suele tenerla)
  const taeLeasing = calcularTAE(Math.max(1, capitalFinanciado), cuotaLeasing, plazo);

  // IVA deducible en leasing para autónomos
  // La base imponible de cada cuota = cuota / 1.21 (IVA incluido en la cuota cotizada)
  const ivaLeasing = esAutonomo ? r2((cuotaLeasing / (1 + IVA_TIPO)) * IVA_TIPO * plazo) : 0;

  // IVA deducible total (el mayor de renting o leasing — no son acumulables entre sí)
  // Se muestra el del producto que el usuario termina eligiendo;
  // por simplicidad mostramos el del leasing (más habitual en autonomos para compra)
  const ahorroIvaLeasingRenting = esAutonomo ? r2(Math.max(ivaLeasing, ivaRenting)) : 0;

  // ==========================================================
  // 5. RANKING por coste total
  // ==========================================================
  const opciones: { nombre: string; coste: number }[] = [
    { nombre: "Banco", coste: totalBanco },
    { nombre: "Concesionario", coste: totalConcesionario },
    { nombre: "Renting", coste: totalRenting },
    { nombre: "Leasing", coste: totalLeasing },
  ];

  opciones.sort((a, b) => a.coste - b.coste);

  const rankingCostes = opciones
    .map((o, idx) => `${idx + 1}. ${o.nombre}: ${o.coste.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`)
    .join(" | ");

  // ==========================================================
  // 6. RECOMENDACIÓN según perfil
  // ==========================================================
  const mejorOpcion = opciones[0].nombre;
  const excesoPorcentaje = kmRentingContratados > 0
    ? (kmReales - kmRentingContratados) / kmRentingContratados
    : 0;

  let recomendacion = "";

  if (esAutonomo) {
    recomendacion +=
      "Como autónomo, el leasing y el renting te permiten deducir el IVA de las cuotas (art. 95 Ley 37/1992) si el vehículo está afecto al 100% a tu actividad. ";
    if (vrLeasingPct > 0) {
      recomendacion +=
        `El leasing te permite adquirir el vehículo al final por ${vrLeasingEuros.toLocaleString("es-ES")} € (${vrLeasingPct}% del precio). `;
    }
  }

  if (kmReales > kmRentingContratados * 1.15) {
    recomendacion +=
      `Atención: prevés superar en más de un 15% los km del contrato de renting (${kmReales.toLocaleString("es-ES")} vs ${kmRentingContratados.toLocaleString("es-ES")} km/año), lo que añade un sobrecoste estimado de ${costeExcesoKm.toLocaleString("es-ES", { minimumFractionDigits: 2 })} € al coste total del renting. Considera aumentar los km contratados o una modalidad de compra. `;
  }

  if (tinConc === 0 && comConc === 0) {
    recomendacion +=
      "La financiación al 0% del concesionario parece muy competitiva; verifica que el precio del vehículo no incluye un recargo oculto frente al precio al contado. ";
  }

  if (plazo > 72) {
    recomendacion +=
      "Con plazos superiores a 72 meses el vehículo puede perder valor más rápido que la deuda pendiente (saldo negativo). Considera un plazo más corto si es posible. ";
  }

  recomendacion += `Por coste total, la opción más económica en tu caso es el ${mejorOpcion} (${opciones[0].coste.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €). `;

  if (mejorOpcion === "Renting") {
    recomendacion +=
      "Recuerda que con el renting no adquieres el vehículo al finalizar el contrato (salvo que exista opción de compra), por lo que el patrimonio neto al final es menor.";
  } else if (mejorOpcion === "Leasing") {
    recomendacion +=
      "Al final del leasing deberás abonar el valor residual para ser propietario del vehículo; planifica ese pago con antelación.";
  } else {
    recomendacion +=
      "Al finalizar el préstamo eres propietario del vehículo sin pago adicional.";
  }

  return {
    cuota_banco: cuotaBanco,
    tae_banco: taeBanco,
    total_banco: totalBanco,
    cuota_concesionario: cuotaConcesionario,
    tae_concesionario: taeConc,
    total_concesionario: totalConcesionario,
    total_renting: totalRenting,
    coste_exceso_km: costeExcesoKm,
    cuota_leasing: cuotaLeasing,
    tae_leasing: taeLeasing,
    total_leasing: totalLeasing,
    ahorro_iva_leasing_renting: ahorroIvaLeasingRenting,
    ranking_costes: rankingCostes,
    recomendacion: recomendacion.trim(),
  };
}
