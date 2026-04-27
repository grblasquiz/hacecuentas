export interface Inputs {
  edadMeses: number;
  interesEnBanio: string;
  comunicaMojado: string;
  mantieneSeco2h: string;
  siguePautas: string;
  sube_baja_ropa: string;
  expresaGanas: string;
}

export interface Outputs {
  probabilidadListo: number;
  nivelReadiness: string;
  signosPresentes: string;
  edadEstimadaDiurno: string;
  edadEstimadaNocturno: string;
  proximosPasos: string;
}

export function compute(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadMeses) || 0);

  if (edad <= 0) {
    return {
      probabilidadListo: 0,
      nivelReadiness: "Ingresá la edad del niño",
      signosPresentes: "—",
      edadEstimadaDiurno: "—",
      edadEstimadaNocturno: "—",
      proximosPasos: "Por favor ingresá la edad del niño en meses.",
    };
  }

  // --- Señales de readiness y sus pesos (fuente: AAP, Pediatrics 1999) ---
  const PESO_INTERES = 15;       // interés en el baño
  const PESO_COMUNICA = 20;      // avisa mojado/sucio
  const PESO_SECO_2H = 20;       // permanece seco 2h+
  const PESO_PAUTAS = 10;        // sigue instrucciones
  const PESO_ROPA = 10;          // sube/baja ropa
  const PESO_EXPRESA = 15;       // expresa ganas activamente

  const sInteres = i.interesEnBanio === "si";
  const sComunica = i.comunicaMojado === "si";
  const sSeco = i.mantieneSeco2h === "si";
  const sPautas = i.siguePautas === "si";
  const sRopa = i.sube_baja_ropa === "si";
  const sExpresa = i.expresaGanas === "si";

  let puntosSenales = 0;
  const signosArray: string[] = [];

  if (sInteres) { puntosSenales += PESO_INTERES; signosArray.push("Interés en el baño"); }
  if (sComunica) { puntosSenales += PESO_COMUNICA; signosArray.push("Avisa cuando está mojado/sucio"); }
  if (sSeco) { puntosSenales += PESO_SECO_2H; signosArray.push("Permanece seco 2 horas o más"); }
  if (sPautas) { puntosSenales += PESO_PAUTAS; signosArray.push("Sigue instrucciones simples"); }
  if (sRopa) { puntosSenales += PESO_ROPA; signosArray.push("Puede subirse/bajarse la ropa"); }
  if (sExpresa) { puntosSenales += PESO_EXPRESA; signosArray.push("Expresa ganas antes de ir"); }

  // --- Bonus por edad (rango óptimo: 24-35 meses) ---
  // Antes de 18m: la madurez neuromuscular no está lista -> bonus 0
  // 18-23m: señales tempranas posibles -> +10
  // 24-35m: ventana óptima -> +20
  // >=36m: mayoría ya listo fisiológicamente, pero puede haber resistencia -> +15
  let bonusEdad = 0;
  if (edad < 18) {
    bonusEdad = 0;
  } else if (edad < 24) {
    bonusEdad = 10;
  } else if (edad < 36) {
    bonusEdad = 20;
  } else {
    bonusEdad = 15;
  }

  const probabilidadRaw = puntosSenales + bonusEdad;
  const probabilidadListo = Math.min(probabilidadRaw, 100);

  // --- Nivel de readiness ---
  let nivelReadiness: string;
  let proximosPasos: string;

  if (probabilidadListo <= 30) {
    nivelReadiness = "No listo todavía";
    proximosPasos =
      edad < 18
        ? "Es muy temprano para iniciar el entrenamiento. Esperá a que el niño cumpla al menos 18 meses y aparezcan las primeras señales."
        : "Todavía no se observan suficientes señales de madurez. Presentá la pelela o el adaptador sin presión, leé cuentos sobre el tema y esperá 4-8 semanas para reevaluar.";
  } else if (probabilidadListo <= 55) {
    nivelReadiness = "Señales tempranas — preparar el entorno";
    proximosPasos =
      "Comenzá a preparar el entorno: colocá la pelela en el baño, dejá que el niño la explore, nombrá el proceso durante el cambio de pañal. No presiones ni establezcas rutinas fijas aún. Reevaluá en 4-6 semanas.";
  } else if (probabilidadListo <= 79) {
    nivelReadiness = "Listo con apoyo — buen momento para empezar";
    proximosPasos =
      "Es un buen momento para iniciar. Establecé momentos fijos (al levantarse, después de comer, antes de dormir). Usá ropa fácil de bajar, elogiá los intentos aunque no haya resultado, y no castigues los accidentes. Esperá al menos 2-3 semanas de práctica antes de evaluar resultados.";
  } else {
    nivelReadiness = "Muy listo — iniciar activamente";
    proximosPasos =
      "El niño muestra casi todas las señales de preparación. Podés iniciar el entrenamiento activo: dedicá 1-3 días de entrenamiento intensivo si es posible, ofrecé ir al baño cada 1.5-2 horas, usá ropa interior de tela durante el día. Mantené el pañal nocturno hasta que amanezca seco de forma consistente durante 2 semanas.";
  }

  // --- Estimación de edades típicas ---
  // Control diurno: 18-30 meses, promedio 24-27m (AAP)
  let edadEstimadaDiurno: string;
  if (edad < 18) {
    edadEstimadaDiurno = "La mayoría de los niños logra el control diurno entre los 22 y 30 meses. Aún es temprano.";
  } else if (edad >= 18 && edad < 30) {
    edadEstimadaDiurno = `Con las señales actuales, el control diurno es esperable entre los ${edad} y los 30 meses. El promedio es ~24-27 meses.`;
  } else if (edad >= 30 && edad < 42) {
    edadEstimadaDiurno = "Estás en el rango donde la mayoría ya logró el control diurno. Si aún no ocurre, consultá con el pediatra.";
  } else {
    edadEstimadaDiurno = "A esta edad el control diurno debería estar establecido. Si no es así, consultá con el pediatra para descartar causas específicas.";
  }

  // Control nocturno: 1-2 años después del diurno; normal hasta los 5-6 años
  let edadEstimadaNocturno: string;
  const mesesNocturnoMin = Math.max(edad + 12, 36);
  const mesesNocturnoMax = Math.max(edad + 24, 48);
  const anosMin = Math.floor(mesesNocturnoMin / 12);
  const anosMax = Math.floor(mesesNocturnoMax / 12);
  edadEstimadaNocturno = `El control nocturno suele alcanzarse entre 1 y 2 años después del diurno (~${anosMin}-${anosMax} años). Mojar la cama es normal hasta los 5-6 años y no requiere tratamiento antes de esa edad.`;

  const signosPresentes =
    signosArray.length > 0
      ? signosArray.join(" · ")
      : "Ninguna señal detectada";

  return {
    probabilidadListo,
    nivelReadiness,
    signosPresentes,
    edadEstimadaDiurno,
    edadEstimadaNocturno,
    proximosPasos,
  };
}
