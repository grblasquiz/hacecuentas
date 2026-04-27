export interface Inputs {
  etapa: string;
  peso_kg: number;
  actividad: string;
  displasia: string;
  esterilizado: string;
  densidad_kcal: number;
}

export interface Outputs {
  gramos_dia: number;
  raciones_dia: string;
  gramos_por_racion: number;
  kcal_dia: number;
  gramos_mes: number;
  nota: string;
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso_kg) || 0;
  const densidad = Number(i.densidad_kcal) || 350;

  if (peso <= 0) {
    return {
      gramos_dia: 0,
      raciones_dia: "—",
      gramos_por_racion: 0,
      kcal_dia: 0,
      gramos_mes: 0,
      nota: "Ingresá un peso válido.",
    };
  }

  if (densidad <= 0) {
    return {
      gramos_dia: 0,
      raciones_dia: "—",
      gramos_por_racion: 0,
      kcal_dia: 0,
      gramos_mes: 0,
      nota: "Ingresá una densidad calórica válida.",
    };
  }

  // RER: Resting Energy Requirement (WSAVA / NRC)
  // RER (kcal/day) = 70 × peso_kg^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // Factor de vida según etapa y estado reproductivo
  // Fuente: WSAVA Global Nutrition Guidelines 2023
  let factorVida: number;
  const esEsterilizado = i.esterilizado === "si";

  switch (i.etapa) {
    case "cachorro":
      // Cachorros < 4 meses usan 3.0; de 4-12 meses usan 2.0
      // Por simplicidad (no tenemos edad exacta en meses), usamos 2.0 para
      // toda la etapa cachorro (usuario con < 4 meses puede ajustar manualmente)
      factorVida = 2.0;
      break;
    case "adulto_joven":
      factorVida = esEsterilizado ? 1.6 : 1.8;
      break;
    case "adulto":
      factorVida = esEsterilizado ? 1.4 : 1.6;
      break;
    case "senior":
      factorVida = esEsterilizado ? 1.2 : 1.4;
      break;
    default:
      factorVida = esEsterilizado ? 1.4 : 1.6;
  }

  // Factor de actividad
  let factorActividad: number;
  switch (i.actividad) {
    case "bajo":
      factorActividad = 0.9;
      break;
    case "moderado":
      factorActividad = 1.0;
      break;
    case "alto":
      factorActividad = 1.2;
      break;
    case "trabajo":
      factorActividad = 1.4;
      break;
    default:
      factorActividad = 1.0;
  }

  // Factor displasia: reducción 10% para mantener peso corporal magro
  // Fuente: recomendaciones WSAVA / veterinaria ortopédica
  const factorDisplasia = i.displasia === "si" ? 0.9 : 1.0;

  // MER ajustado
  const merAjustado = rer * factorVida * factorActividad * factorDisplasia;

  // Gramos por día
  // densidad_kcal está en kcal/100 g → dividir por (densidad/100)
  const gramosDia = Math.round((merAjustado / densidad) * 100);

  // Raciones por día según etapa
  let racionesNum: number;
  let racionesTexto: string;
  if (i.etapa === "cachorro") {
    racionesNum = 3;
    racionesTexto = "3 raciones/día (cada ~8 h)";
  } else {
    racionesNum = 2;
    racionesTexto = "2 raciones/día (mañana y tarde)";
  }

  const gramosPorRacion = Math.round(gramosDia / racionesNum);
  const gramosMes = gramosDia * 30;
  const kcalDia = Math.round(merAjustado);

  // Nota orientativa
  const notas: string[] = [];

  if (i.etapa === "cachorro") {
    notas.push("Usá fórmula large breed puppy con DHA y Ca 1.0–1.6 % (MS).");
  }
  if (i.displasia === "si") {
    notas.push("Ración reducida 10 % por displasia; controlá peso mensualmente.");
  }
  if (esEsterilizado) {
    notas.push("Factor reducido por esterilización; controlá condición corporal (BCS ideal 4–5/9).");
  }
  if (peso > 34) {
    notas.push("Peso superior al rango típico Golden (25–34 kg); verificá con tu veterinario.");
  }
  if (peso < 20 && i.etapa !== "cachorro") {
    notas.push("Peso bajo para un Golden adulto; consultá si hay causa médica.");
  }
  if (notas.length === 0) {
    notas.push("Ajustá ±10 % según condición corporal observada (costillas palpables sin exceso).");
  }

  return {
    gramos_dia: gramosDia,
    raciones_dia: racionesTexto,
    gramos_por_racion: gramosPorRacion,
    kcal_dia: kcalDia,
    gramos_mes: gramosMes,
    nota: notas.join(" "),
  };
}
