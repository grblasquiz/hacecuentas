/**
 * Calculadora de Jet Lag - Días de Recuperación
 * Regla Sleep Foundation: 1 día por zona al Este, 1 día cada 1.5 zonas al Oeste.
 */

export interface JetLagRecoveryDiasRutaInputs {
  zonasHorarias: number;
  direccion: string;
  edad: number;
}

export interface JetLagRecoveryDiasRutaOutputs {
  diasRecovery: number;
  severidad: string;
  recomendacion: string;
}

export function jetLagRecoveryDiasRuta(inputs: JetLagRecoveryDiasRutaInputs): JetLagRecoveryDiasRutaOutputs {
  const zonas = Number(inputs.zonasHorarias);
  const edad = Number(inputs.edad);
  const direccion = String(inputs.direccion || "este");

  if (!zonas || zonas <= 0) throw new Error("Ingresá zonas horarias válidas");
  if (!edad || edad <= 0) throw new Error("Ingresá una edad válida");

  let dias = direccion === "oeste" ? zonas / 1.5 : zonas;
  if (edad > 50) dias *= 1.2;
  dias = Math.round(dias * 10) / 10;

  let severidad = "Leve";
  if (zonas >= 5 && zonas < 8) severidad = "Moderado";
  else if (zonas >= 8) severidad = "Severo";

  let recomendacion = "Hidratación y buen sueño previo alcanzan.";
  if (severidad === "Moderado") recomendacion = "Ajustá horarios 2-3 días antes. Exposición a luz matinal.";
  if (severidad === "Severo") recomendacion = "Ajuste previo + melatonina + exposición lumínica estratégica. Consultá médico.";

  return { diasRecovery: dias, severidad, recomendacion };
}
