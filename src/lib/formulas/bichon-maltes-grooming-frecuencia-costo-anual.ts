export interface Inputs {
  precioGroomingProfesional: number;
  frecuenciaGrooming: string;
  peluqueriaEntreSesiones: string;
  tipAlimento: string;
  visitasVet: number;
  costoVisitaVet: number;
  incluyeVacunas: string;
  antiparasitarios: string;
  accesoriosExtras: number;
}

export interface Outputs {
  costoMensual: number;
  costoAnual: number;
  costoGroomingAnual: number;
  costoAlimentacionAnual: number;
  costoSaludAnual: number;
  desglose: string;
}

export function compute(i: Inputs): Outputs {
  // --- Grooming profesional ---
  const precioSesion = Math.max(0, Number(i.precioGroomingProfesional) || 0);
  const frecSemanas = parseInt(i.frecuenciaGrooming, 10) || 8;
  const sesionesAnuales = 52 / frecSemanas;
  const costoGroomingBruto = sesionesAnuales * precioSesion;

  // Si el dueño hace mantenimiento en casa, ahorra ~USD 15/mes en sesiones extra
  const AHORRO_CASA_MENSUAL = 15; // USD/mes estimado
  const ahorroCasa = i.peluqueriaEntreSesiones === "si" ? AHORRO_CASA_MENSUAL * 12 : 0;
  const costoGroomingAnual = Math.max(0, costoGroomingBruto - ahorroCasa);

  // --- Alimentación ---
  // Costos mensuales de referencia 2026 por tipo de alimento
  const ALIMENTO_MENSUAL: Record<string, number> = {
    economico: 20,   // estándar raza pequeña
    premium: 40,     // premium raza pequeña
    superpremium: 65 // super premium / grain-free
  };
  const alimentoMensual = ALIMENTO_MENSUAL[i.tipAlimento] ?? 40;
  const costoAlimentacionAnual = alimentoMensual * 12;

  // --- Salud: veterinario ---
  const visitas = Math.max(0, Math.round(Number(i.visitasVet) || 0));
  const costoVisita = Math.max(0, Number(i.costoVisitaVet) || 0);
  const costoVetAnual = visitas * costoVisita;

  // --- Vacunas anuales ---
  const COSTO_VACUNAS_ANUAL = 60; // USD/año plan básico 2026
  const costoVacunas = i.incluyeVacunas === "si" ? COSTO_VACUNAS_ANUAL : 0;

  // --- Antiparasitarios ---
  const ANTIPARASITARIO_MENSUAL: Record<string, number> = {
    basico: 8,      // solo antipulgas tópico
    completo: 20,   // pulgas + garrapatas + heartworm
    ninguno: 0
  };
  const antiparaMensual = ANTIPARASITARIO_MENSUAL[i.antiparasitarios] ?? 0;
  const costoAntiparaAnual = antiparaMensual * 12;

  const costoSaludAnual = costoVetAnual + costoVacunas + costoAntiparaAnual;

  // --- Accesorios y extras ---
  const accesoriosMensual = Math.max(0, Number(i.accesoriosExtras) || 0);
  const costoAccesoriosAnual = accesoriosMensual * 12;

  // --- Total ---
  const costoAnual = costoGroomingAnual + costoAlimentacionAnual + costoSaludAnual + costoAccesoriosAnual;
  const costoMensual = costoAnual / 12;

  // --- Desglose textual ---
  const lineas: string[] = [
    `Grooming profesional: USD ${costoGroomingAnual.toFixed(0)}/año (${sesionesAnuales.toFixed(1)} sesiones × USD ${precioSesion}${ahorroCasa > 0 ? `, ahorro cuidado en casa USD ${ahorroCasa}` : ""})`,
    `Alimentación: USD ${costoAlimentacionAnual.toFixed(0)}/año (USD ${alimentoMensual}/mes)`,
    `Veterinario: USD ${costoVetAnual.toFixed(0)}/año (${visitas} visita${visitas !== 1 ? "s" : ""} × USD ${costoVisita})`,
    costoVacunas > 0 ? `Vacunas: USD ${costoVacunas.toFixed(0)}/año` : "Vacunas: no incluidas",
    antiparaMensual > 0 ? `Antiparasitarios: USD ${costoAntiparaAnual.toFixed(0)}/año (USD ${antiparaMensual}/mes)` : "Antiparasitarios: no incluidos",
    `Accesorios/extras: USD ${costoAccesoriosAnual.toFixed(0)}/año`
  ];

  const desglose = lineas.join(" | ");

  return {
    costoMensual,
    costoAnual,
    costoGroomingAnual,
    costoAlimentacionAnual,
    costoSaludAnual,
    desglose
  };
}
