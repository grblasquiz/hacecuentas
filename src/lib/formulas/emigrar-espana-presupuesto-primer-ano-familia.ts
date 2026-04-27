export interface Inputs {
  ciudad: string;
  adultos: number;
  menores: number;
  tipoVisado: string;
  tipoMudanza: string;
  tipoAlquiler: string;
  escolarizacion: string;
  seguroMedico: string;
}

export interface Outputs {
  totalUSD: number;
  desglose: string;
  totalMensualUSD: number;
  ahorroMinimo: number;
}

export function compute(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const menores = Math.max(0, Math.floor(Number(i.menores) || 0));
  const personas = adultos + menores;

  if (personas === 0) {
    return {
      totalUSD: 0,
      desglose: "Ingresá al menos una persona.",
      totalMensualUSD: 0,
      ahorroMinimo: 0,
    };
  }

  // Tipo de cambio EUR a USD (referencia BCE 2026)
  const EUR_TO_USD = 1.08;

  // ─── VISADO ───────────────────────────────────────────────────────────────
  // Aranceles consulares MAEC 2026 (por adulto; menores pagan lo mismo)
  const ARANCEL_VISADO_USD: Record<string, number> = {
    no_lucrativa: 80,
    digital_nomad: 80,
    cuenta_ajena: 80,
    ciudadania_ue: 0,
  };
  const arancelPorPersona = ARANCEL_VISADO_USD[i.tipoVisado] ?? 80;
  const costoVisado = arancelPorPersona * personas;

  // ─── VUELOS ───────────────────────────────────────────────────────────────
  // Precios promedio temporada media 2026 EZE/AEP → MAD/BCN
  // Valencia y Málaga requieren conexión interna adicional
  const conexionInterna =
    i.ciudad === "valencia" || i.ciudad === "malaga" ? 80 : 0;
  const VUELO_ADULTO_USD = 1000 + conexionInterna;
  const VUELO_MENOR_USD = 780 + conexionInterna;
  const costoVuelos = adultos * VUELO_ADULTO_USD + menores * VUELO_MENOR_USD;

  // ─── MUDANZA ──────────────────────────────────────────────────────────────
  // Buenos Aires → España
  const COSTO_MUDANZA_USD: Record<string, number> = {
    equipaje: 0,
    grupaje: 3500,
    contenedor: 8500,
  };
  const costoMudanza = COSTO_MUDANZA_USD[i.tipoMudanza] ?? 3500;

  // ─── ALQUILER MENSUAL (EUR) ────────────────────────────────────────────────
  // Precios de mercado libre 2026 según MIVAU / portales inmobiliarios
  const ALQUILER_EUR: Record<string, Record<string, number>> = {
    madrid: { piso_2hab: 1600, piso_3hab: 2100, piso_4hab: 2700 },
    barcelona: { piso_2hab: 1700, piso_3hab: 2300, piso_4hab: 2900 },
    valencia: { piso_2hab: 1100, piso_3hab: 1500, piso_4hab: 1900 },
    malaga: { piso_2hab: 1200, piso_3hab: 1600, piso_4hab: 2000 },
  };
  const alquilerMensualEUR =
    (ALQUILER_EUR[i.ciudad] ?? ALQUILER_EUR["madrid"])[
      i.tipoAlquiler
    ] ?? 2100;

  // Depósito: 2 meses fianza + 1 mes agencia = 3 meses por adelantado
  const MESES_DEPOSITO = 3;
  const depositoAlquilerEUR = alquilerMensualEUR * MESES_DEPOSITO;
  const depositoAlquilerUSD = depositoAlquilerEUR * EUR_TO_USD;

  // Alquiler anual (12 meses)
  const alquilerAnualUSD = alquilerMensualEUR * 12 * EUR_TO_USD;

  // ─── MANUTENCIÓN MENSUAL (EUR) ────────────────────────────────────────────
  // Alimentación, higiene, ocio básico, ropa estimado INE 2026
  const MANUTENCION_ADULTO_EUR = 700;
  const MANUTENCION_MENOR_EUR = 400;
  const manutencionMensualEUR =
    adultos * MANUTENCION_ADULTO_EUR + menores * MANUTENCION_MENOR_EUR;
  const manutencionAnualUSD = manutencionMensualEUR * 12 * EUR_TO_USD;

  // ─── SEGURO MÉDICO (EUR/mes) ───────────────────────────────────────────────
  // Obligatorio para visa no lucrativa y nómade digital
  // Fuente: tarifas Sanitas/Adeslas/Asisa 2026
  let seguroAdultoMensualEUR = 0;
  let seguroMenorMensualEUR = 0;

  if (i.tipoVisado !== "ciudadania_ue") {
    if (i.seguroMedico === "basico") {
      seguroAdultoMensualEUR = 70;
      seguroMenorMensualEUR = 40;
    } else {
      // completo con dental
      seguroAdultoMensualEUR = 135;
      seguroMenorMensualEUR = 55;
    }
  } else {
    // Ciudadanía UE: acceso sistema público, pero se puede contratar igualmente
    if (i.seguroMedico === "basico") {
      seguroAdultoMensualEUR = 70;
      seguroMenorMensualEUR = 40;
    } else if (i.seguroMedico === "completo") {
      seguroAdultoMensualEUR = 135;
      seguroMenorMensualEUR = 55;
    }
    // Si ciudadanía UE y quieren ir sin seguro privado extra: 0 (pero la UI obliga a elegir)
  }

  const seguroMensualEUR =
    adultos * seguroAdultoMensualEUR + menores * seguroMenorMensualEUR;
  const seguroAnualUSD = seguroMensualEUR * 12 * EUR_TO_USD;

  // ─── ESCOLARIZACIÓN ───────────────────────────────────────────────────────
  // Solo aplica si hay menores en edad escolar (se asume todos en edad escolar)
  const MATRICULA_ANUAL_EUR: Record<string, number> = {
    publica: 0,
    concertada: 150, // promedio matrícula anual concertado
    privada: 8000,   // privado internacional (por alumno/año)
  };
  const CUOTA_MENSUAL_EUR: Record<string, number> = {
    publica: 0,
    concertada: 100,  // actividades + material estimado concertado
    privada: 700,     // cuota mensual privado internacional
  };
  const matriculaAnualEUR =
    (MATRICULA_ANUAL_EUR[i.escolarizacion] ?? 0) * menores;
  const cuotaMensualEscuelaEUR =
    (CUOTA_MENSUAL_EUR[i.escolarizacion] ?? 0) * menores;
  const escolarizacionAnualUSD =
    (matriculaAnualEUR + cuotaMensualEscuelaEUR * 12) * EUR_TO_USD;

  // ─── TRANSPORTE MENSUAL (EUR) ──────────────────────────────────────────────
  // Abono mensual transporte público por adulto
  // Fuente: tarifas 2026 Consorcio de Transportes Madrid/TMB Barcelona/Metrovalencia/EMT Málaga
  const ABONO_MENSUAL_EUR: Record<string, number> = {
    madrid: 54.6,
    barcelona: 54.6,
    valencia: 30,
    malaga: 25,
  };
  const abonoMensualEUR =
    adultos * (ABONO_MENSUAL_EUR[i.ciudad] ?? 54.6);
  const transporteAnualUSD = abonoMensualEUR * 12 * EUR_TO_USD;

  // ─── TOTALES ──────────────────────────────────────────────────────────────
  const costoInstalacionUSD =
    costoVisado +
    costoVuelos +
    costoMudanza +
    depositoAlquilerUSD +
    matriculaAnualEUR * EUR_TO_USD;

  const costoRecurrenteAnualUSD =
    alquilerAnualUSD +
    manutencionAnualUSD +
    seguroAnualUSD +
    escolarizacionAnualUSD -
    matriculaAnualEUR * EUR_TO_USD + // ya contada arriba
    transporteAnualUSD;

  const totalUSD = Math.round(
    costoInstalacionUSD + costoRecurrenteAnualUSD
  );

  // Gasto mensual recurrente (sin costos únicos)
  const gastoMensualEUR =
    alquilerMensualEUR +
    manutencionMensualEUR +
    seguroMensualEUR +
    cuotaMensualEscuelaEUR +
    abonoMensualEUR;
  const totalMensualUSD = Math.round(gastoMensualEUR * EUR_TO_USD);

  // Ahorro mínimo recomendado: costos instalación + 3 meses recurrentes
  const ahorroMinimo = Math.round(
    costoInstalacionUSD + totalMensualUSD * 3
  );

  // ─── DESGLOSE ─────────────────────────────────────────────────────────────
  const fmt = (n: number) =>
    "USD " + Math.round(n).toLocaleString("es-AR");

  const lines = [
    `🛂 Visado y trámites: ${fmt(costoVisado)}`,
    `✈️ Vuelos (${personas} persona${personas !== 1 ? "s" : ""}): ${fmt(costoVuelos)}`,
    `📦 Mudanza (${i.tipoMudanza}): ${fmt(costoMudanza)}`,
    `🏠 Depósito alquiler (3 meses): ${fmt(depositoAlquilerUSD)}`,
    `🏠 Alquiler 12 meses: ${fmt(alquilerAnualUSD)}`,
    `🛒 Manutención 12 meses: ${fmt(manutencionAnualUSD)}`,
    `💊 Seguro médico 12 meses: ${fmt(seguroAnualUSD)}`,
    `🎒 Escolarización (${i.escolarizacion}): ${fmt(escolarizacionAnualUSD)}`,
    `🚇 Transporte 12 meses: ${fmt(transporteAnualUSD)}`,
    `─────────────────────────────`,
    `💰 TOTAL PRIMER AÑO: ${fmt(totalUSD)}`,
  ];

  return {
    totalUSD,
    desglose: lines.join("\n"),
    totalMensualUSD,
    ahorroMinimo,
  };
}
