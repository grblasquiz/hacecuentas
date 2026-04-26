// Calculadora RESICO Persona Física México 2026
// Fuente: LISR Art. 113-E - Régimen Simplificado de Confianza
// https://www.sat.gob.mx/personas/regimen-simplificado-confianza

export interface Inputs {
  ingresosMensuales: number;
}

export interface Outputs {
  cuotaResico: number;
  tasaAplicada: string;
  ingresoNeto: number;
  anualizado: number;
  detalle: string;
}

// Tabla mensual RESICO PF 2026 (Art. 113-E LISR)
const TRAMOS_RESICO = [
  { limiteSuperior: 25000, tasa: 0.01, etiqueta: "1.00%" },
  { limiteSuperior: 50000, tasa: 0.011, etiqueta: "1.10%" },
  { limiteSuperior: 83333.33, tasa: 0.015, etiqueta: "1.50%" },
  { limiteSuperior: 208333.33, tasa: 0.02, etiqueta: "2.00%" },
  { limiteSuperior: Infinity, tasa: 0.025, etiqueta: "2.50%" },
];

// Tope anual de ingresos para permanecer en RESICO PF (LISR Art. 113-E)
const TOPE_ANUAL_RESICO = 3500000;

export function rfcResicoPfMexico(inputs: Inputs): Outputs {
  const ingresos = Number(inputs.ingresosMensuales) || 0;

  if (ingresos < 0) {
    return {
      cuotaResico: 0,
      tasaAplicada: "-",
      ingresoNeto: 0,
      anualizado: 0,
      detalle: "Los ingresos no pueden ser negativos.",
    };
  }

  if (ingresos === 0) {
    return {
      cuotaResico: 0,
      tasaAplicada: "0%",
      ingresoNeto: 0,
      anualizado: 0,
      detalle: "Sin ingresos cobrados en el mes. Aún así debes presentar declaración en ceros.",
    };
  }

  // Determinar tramo aplicable
  const tramo = TRAMOS_RESICO.find((t) => ingresos <= t.limiteSuperior)!;
  const cuotaResico = ingresos * tramo.tasa;
  const ingresoNeto = ingresos - cuotaResico;
  const anualizado = cuotaResico * 12;

  // Construir detalle
  let detalle = `Tasa ${tramo.etiqueta} aplicada sobre $${ingresos.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;

  // Verificar tope anual
  const proyeccionAnual = ingresos * 12;
  if (proyeccionAnual > TOPE_ANUAL_RESICO) {
    detalle += ` ⚠️ A este ritmo proyectarías $${proyeccionAnual.toLocaleString("es-MX", { maximumFractionDigits: 0 })} anuales y rebasarías el tope de $3,500,000 del Art. 113-I LISR, lo que te sacaría del régimen.`;
  } else {
    detalle += ` Cuota DEFINITIVA según Art. 113-E LISR.`;
  }

  return {
    cuotaResico: Math.round(cuotaResico * 100) / 100,
    tasaAplicada: tramo.etiqueta,
    ingresoNeto: Math.round(ingresoNeto * 100) / 100,
    anualizado: Math.round(anualizado * 100) / 100,
    detalle,
  };
}
