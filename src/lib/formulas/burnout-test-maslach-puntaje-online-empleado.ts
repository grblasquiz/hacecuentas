export interface Inputs {
  ae1: string;
  ae2: string;
  ae3: string;
  ae4: string;
  ae5: string;
  ae6: string;
  ae7: string;
  ae8: string;
  ae9: string;
  dp1: string;
  dp2: string;
  dp3: string;
  dp4: string;
  dp5: string;
  rp1: string;
  rp2: string;
  rp3: string;
  rp4: string;
  rp5: string;
  rp6: string;
  rp7: string;
  rp8: string;
}

export interface Outputs {
  nivelGeneral: string;
  puntajeAE: number;
  nivelAE: string;
  puntajeDP: number;
  nivelDP: string;
  puntajeRP: number;
  nivelRP: string;
  interpretacion: string;
}

// Baremos MBI-HSS (Human Services Survey) — Maslach & Jackson, 3rd ed. 1996
const UMBRAL_AE = { bajo: 18, alto: 27 }; // <=18 bajo, 19-26 moderado, >=27 alto
const UMBRAL_DP = { bajo: 5, alto: 10 };  // <=5 bajo, 6-9 moderado, >=10 alto
const UMBRAL_RP = { alto: 33, moderado: 39 }; // <=33 alto burnout, 34-39 moderado, >=40 bajo (invertido)

function parseItem(val: string): number {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 0) return 0;
  if (n > 6) return 6;
  return n;
}

function nivelAE(score: number): string {
  if (score <= UMBRAL_AE.bajo) return "Bajo";
  if (score < UMBRAL_AE.alto) return "Moderado";
  return "Alto";
}

function nivelDP(score: number): string {
  if (score <= UMBRAL_DP.bajo) return "Bajo";
  if (score < UMBRAL_DP.alto) return "Moderado";
  return "Alto";
}

// Realización Personal: MENOR puntaje = MAYOR burnout
function nivelRP(score: number): string {
  if (score <= UMBRAL_RP.alto) return "Alto";
  if (score <= UMBRAL_RP.moderado) return "Moderado";
  return "Bajo";
}

export function compute(i: Inputs): Outputs {
  // Calcular puntajes por dimensión
  const puntajeAE =
    parseItem(i.ae1) +
    parseItem(i.ae2) +
    parseItem(i.ae3) +
    parseItem(i.ae4) +
    parseItem(i.ae5) +
    parseItem(i.ae6) +
    parseItem(i.ae7) +
    parseItem(i.ae8) +
    parseItem(i.ae9);

  const puntajeDP =
    parseItem(i.dp1) +
    parseItem(i.dp2) +
    parseItem(i.dp3) +
    parseItem(i.dp4) +
    parseItem(i.dp5);

  const puntajeRP =
    parseItem(i.rp1) +
    parseItem(i.rp2) +
    parseItem(i.rp3) +
    parseItem(i.rp4) +
    parseItem(i.rp5) +
    parseItem(i.rp6) +
    parseItem(i.rp7) +
    parseItem(i.rp8);

  const labelAE = nivelAE(puntajeAE);
  const labelDP = nivelDP(puntajeDP);
  const labelRP = nivelRP(puntajeRP);

  // Contar cuántas dimensiones están en nivel alto
  const altasCount = [labelAE === "Alto", labelDP === "Alto", labelRP === "Alto"].filter(Boolean).length;
  const moderadasCount = [labelAE === "Moderado", labelDP === "Moderado", labelRP === "Moderado"].filter(Boolean).length;

  let nivelGeneral: string;
  let interpretacion: string;

  if (altasCount === 3) {
    nivelGeneral = "🔴 Burnout alto";
    interpretacion =
      "Las tres dimensiones están en zona de riesgo alto. Esto indica burnout establecido según los criterios del MBI. " +
      "Se recomienda consultar con un profesional de salud mental o médico del trabajo de forma prioritaria. " +
      "AE: " + puntajeAE + "/54, DP: " + puntajeDP + "/30, RP: " + puntajeRP + "/48.";
  } else if (altasCount === 2 || (altasCount === 1 && moderadasCount >= 1)) {
    nivelGeneral = "🟠 Burnout moderado";
    interpretacion =
      "Dos o más dimensiones muestran señales de alerta. Existen síntomas significativos de burnout que requieren atención. " +
      "Considerar ajustes en carga laboral, apoyo profesional o intervención preventiva. " +
      "AE: " + puntajeAE + "/54, DP: " + puntajeDP + "/30, RP: " + puntajeRP + "/48.";
  } else if (altasCount === 1 || moderadasCount >= 2) {
    nivelGeneral = "🟡 Riesgo leve";
    interpretacion =
      "Algunas dimensiones presentan niveles moderados. Hay señales tempranas a monitorear. " +
      "Revisar hábitos de autocuidado, límites laborales y red de apoyo. " +
      "AE: " + puntajeAE + "/54, DP: " + puntajeDP + "/30, RP: " + puntajeRP + "/48.";
  } else {
    nivelGeneral = "🟢 Sin burnout significativo";
    interpretacion =
      "Los puntajes se encuentran dentro de rangos normales en las tres dimensiones. " +
      "Mantener hábitos de autocuidado y repetir el test en 3-6 meses si las condiciones laborales cambian. " +
      "AE: " + puntajeAE + "/54, DP: " + puntajeDP + "/30, RP: " + puntajeRP + "/48.";
  }

  return {
    nivelGeneral,
    puntajeAE,
    nivelAE: labelAE,
    puntajeDP,
    nivelDP: labelDP,
    puntajeRP,
    nivelRP: labelRP,
    interpretacion,
  };
}
