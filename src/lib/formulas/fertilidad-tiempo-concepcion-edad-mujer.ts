export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; }

/**
 * Calcula el tiempo promedio estimado para concebir según edad de la mujer.
 *
 * Método: Distribución geométrica basada en fecundabilidad mensual por grupo etario.
 * La fecundabilidad (p) es la probabilidad de concepción por ciclo menstrual.
 * Tiempo esperado en ciclos = 1/p (valor esperado de distribución geométrica).
 * Probabilidad acumulada tras n ciclos = 1 - (1-p)^n
 *
 * Fuente de referencia: Dunson DB, Baird DD, Colombo B. (2004) "Increased Infertility With
 * Age in Men and Women". Obstetrics & Gynecology 103(1):51-56. PMID: 14704244.
 * Natural Cycles (2022) "Average Time To Get Pregnant By Age".
 * Flo Health / Gnoth et al. (2003) Hum Reprod. 18(9):1959-66.
 */

// Fecundabilidad mensual (probabilidad de concepción por ciclo) por grupo etario
// Basada en datos publicados: Dunson et al. 2004, Gnoth et al. 2003, Bonde et al. 1998
interface AgeGroup {
  label: string;
  labelEN: string;
  labelPT: string;
  p: number; // probabilidad mensual de concepción
  infertilityRisk: number; // porcentaje con problemas de fertilidad
  consultMonths: number; // meses tras los cuales consultar especialista
}

const AGE_GROUPS: AgeGroup[] = [
  { label: "Menos de 25 años",    labelEN: "Under 25",   labelPT: "Menos de 25 anos",   p: 0.25, infertilityRisk: 0.08, consultMonths: 12 },
  { label: "25–29 años",          labelEN: "25–29",      labelPT: "25–29 anos",          p: 0.22, infertilityRisk: 0.08, consultMonths: 12 },
  { label: "30–34 años",          labelEN: "30–34",      labelPT: "30–34 anos",          p: 0.18, infertilityRisk: 0.13, consultMonths: 12 },
  { label: "35–37 años",          labelEN: "35–37",      labelPT: "35–37 anos",          p: 0.14, infertilityRisk: 0.18, consultMonths: 6  },
  { label: "38–40 años",          labelEN: "38–40",      labelPT: "38–40 anos",          p: 0.09, infertilityRisk: 0.25, consultMonths: 6  },
  { label: "41–43 años",          labelEN: "41–43",      labelPT: "41–43 anos",          p: 0.05, infertilityRisk: 0.40, consultMonths: 6  },
  { label: "44 años o más",       labelEN: "44 or older",labelPT: "44 anos ou mais",     p: 0.02, infertilityRisk: 0.65, consultMonths: 3  },
];

// Índice de grupos, 0-based
const AGE_GROUP_OPTIONS_ES = AGE_GROUPS.map((g, i) => ({ value: String(i), label: g.label }));

export function fertilidadTiempoConcepcionEdadMujer(i: Inputs): Outputs {
  const lang = String(i.__lang || "es");
  const isEN = lang === "en";
  const isPT = lang === "pt";

  const grupoIdx = Math.min(Math.max(Number(i.grupo_edad) || 0, 0), AGE_GROUPS.length - 1);
  const cicloPrev = Number(i.ciclos_previos) || 0; // ciclos ya intentados
  const grupo = AGE_GROUPS[grupoIdx];

  const p = grupo.p;

  // Ciclos ya intentados sin éxito → actualizar probabilidad condicional
  // P(concebir en ciclo n+1 | no concebido en n ciclos) = p (memoryless, geométrica)
  // Pero sí mostramos probabilidad acumulada restante desde ahora

  // Tiempo esperado total: 1/p ciclos
  const expectedCycles = 1 / p;
  const expectedMonths = expectedCycles; // 1 ciclo ≈ 1 mes

  // Ciclos restantes esperados (si ya intentó algunos sin éxito)
  // En distribución geométrica sin memoria, sigue siendo 1/p desde ahora
  const remainingCycles = 1 / p;
  const remainingMonths = Math.round(remainingCycles * 10) / 10;

  // Probabilidad acumulada en los PRÓXIMOS N ciclos desde hoy (condicional en no haber concebido aún)
  const cumProb6 = Math.round((1 - Math.pow(1 - p, 6)) * 100);
  const cumProb12 = Math.round((1 - Math.pow(1 - p, 12)) * 100);

  // Probabilidad acumulada total desde ciclo 1 para contexto
  const cumProb6Total = Math.round((1 - Math.pow(1 - p, 6)) * 100);
  const cumProb12Total = Math.round((1 - Math.pow(1 - p, 12)) * 100);

  // Ciclos ya intentados: probabilidad acumulada de que haya concebido ya
  // (útil para contextualizar, no para el resultado principal)
  const cumPrevios = cicloPrev > 0
    ? Math.round((1 - Math.pow(1 - p, cicloPrev)) * 100)
    : 0;

  // Resultado principal: tiempo esperado en meses redondeado
  const mesesEsperados = Math.round(expectedMonths);
  const porcentajePorCiclo = Math.round(p * 100);

  // Construir resultado
  let resultado: string;
  let resumen: string;
  let insightTitle: string;
  let insightText: string;
  let insightTone: string;
  let insightIcon: string;

  if (isEN) {
    const ageLabel = grupo.labelEN;
    resultado = `~${mesesEsperados} months expected`;
    if (cicloPrev > 0) {
      resumen = `For a healthy woman aged ${ageLabel}, the estimated conception probability per cycle is ${porcentajePorCiclo}%. Starting from now, there is a ${cumProb6}% chance of conceiving in the next 6 cycles, and ${cumProb12}% within 12 cycles. After ${cicloPrev} cycles without success, if no result within ${grupo.consultMonths} months from now, consult a reproductive specialist.`;
    } else {
      resumen = `For a healthy woman aged ${ageLabel}, the estimated conception probability per cycle is ${porcentajePorCiclo}%. Statistically, ${cumProb6Total}% of women in this age group conceive within 6 months, and ${cumProb12Total}% within 12 months. Doctors recommend consulting a fertility specialist if no pregnancy occurs after ${grupo.consultMonths} months of active trying.`;
    }
    insightTitle = "Your fertility outlook";
    if (p >= 0.20) {
      insightTone = "positive";
      insightIcon = "🌸";
      insightText = `With a **${porcentajePorCiclo}% monthly conception probability**, most women in your age group conceive within **2–5 months**. Keep tracking your fertile window and consult a doctor if needed after **${grupo.consultMonths} months**.`;
    } else if (p >= 0.12) {
      insightTone = "neutral";
      insightIcon = "🕐";
      insightText = `With a **${porcentajePorCiclo}% monthly conception probability**, it may take several months — roughly **${mesesEsperados} on average**. An early consultation with a reproductive specialist after **${grupo.consultMonths} months** of trying is recommended.`;
    } else {
      insightTone = "warning";
      insightIcon = "⏳";
      insightText = `At this age, monthly conception probability is approximately **${porcentajePorCiclo}%**. Consulting a reproductive specialist sooner — ideally within **${grupo.consultMonths} months** of trying — is recommended to explore all available options.`;
    }
  } else if (isPT) {
    const ageLabel = grupo.labelPT;
    resultado = `~${mesesEsperados} meses esperados`;
    if (cicloPrev > 0) {
      resumen = `Para uma mulher saudável na faixa ${ageLabel}, a probabilidade estimada de concepção por ciclo é de ${porcentajePorCiclo}%. A partir de agora, há ${cumProb6}% de chance de engravidar nos próximos 6 ciclos e ${cumProb12}% em 12 ciclos. Após ${cicloPrev} ciclos sem sucesso, consulte um especialista em reprodução se não houver resultado em ${grupo.consultMonths} meses.`;
    } else {
      resumen = `Para uma mulher saudável na faixa ${ageLabel}, a probabilidade de concepção por ciclo é de aproximadamente ${porcentajePorCiclo}%. Estatisticamente, ${cumProb6Total}% das mulheres nessa faixa etária engravidam em 6 meses e ${cumProb12Total}% em 12 meses. Recomenda-se consultar um especialista se não ocorrer gravidez após ${grupo.consultMonths} meses de tentativas.`;
    }
    insightTitle = "Sua perspectiva de fertilidade";
    if (p >= 0.20) {
      insightTone = "positive";
      insightIcon = "🌸";
      insightText = `Com **${porcentajePorCiclo}% de probabilidade mensal**, a maioria das mulheres na sua faixa etária engravida em **2 a 5 meses**. Consulte um médico se não houver resultado após **${grupo.consultMonths} meses**.`;
    } else if (p >= 0.12) {
      insightTone = "neutral";
      insightIcon = "🕐";
      insightText = `Com **${porcentajePorCiclo}% de probabilidade por ciclo**, pode levar em média **${mesesEsperados} meses**. A consulta com especialista em reprodução é recomendada após **${grupo.consultMonths} meses** de tentativas.`;
    } else {
      insightTone = "warning";
      insightIcon = "⏳";
      insightText = `Nessa faixa etária, a probabilidade mensal de concepção é de aproximadamente **${porcentajePorCiclo}%**. Recomenda-se consultar um especialista em reprodução dentro de **${grupo.consultMonths} meses** após o início das tentativas.`;
    }
  } else {
    // Español (default)
    const ageLabel = grupo.label;
    resultado = `~${mesesEsperados} meses promedio`;
    if (cicloPrev > 0) {
      resumen = `Para una mujer sana en el rango ${ageLabel}, la probabilidad estimada de concepción por ciclo es del ${porcentajePorCiclo}%. Partiendo de hoy, hay un ${cumProb6}% de probabilidad de concebir en los próximos 6 ciclos y un ${cumProb12}% en 12 ciclos. Llevás ${cicloPrev} ciclos de búsqueda. Si no hay resultado en ${grupo.consultMonths} meses más, la recomendación médica es consultar con un especialista en reproducción.`;
    } else {
      resumen = `Para una mujer sana en el rango ${ageLabel}, la probabilidad estimada de concepción por ciclo es del ${porcentajePorCiclo}%. Estadísticamente, el ${cumProb6Total}% de las mujeres en este grupo de edad conciben dentro de los primeros 6 meses y el ${cumProb12Total}% en 12 meses. Si después de ${grupo.consultMonths} meses de búsqueda activa no lograste el embarazo, la medicina reproductiva recomienda consultar con un especialista.`;
    }
    insightTitle = "Tu pronóstico de fertilidad";
    if (p >= 0.20) {
      insightTone = "positive";
      insightIcon = "🌸";
      insightText = `Con una probabilidad mensual del **${porcentajePorCiclo}%**, la mayoría de las mujeres en tu rango de edad conciben en **2 a 5 meses**. Controlá tu ventana fértil y consultá a un médico si no hay resultado después de **${grupo.consultMonths} meses**.`;
    } else if (p >= 0.12) {
      insightTone = "neutral";
      insightIcon = "🕐";
      insightText = `Con un **${porcentajePorCiclo}% de probabilidad por ciclo**, el proceso puede tomar varios meses — alrededor de **${mesesEsperados} en promedio**. Se recomienda consultar con un especialista en reproducción si no hay resultado tras **${grupo.consultMonths} meses** de búsqueda.`;
    } else {
      insightTone = "warning";
      insightIcon = "⏳";
      insightText = `En este rango etario, la probabilidad mensual de concepción es de aproximadamente el **${porcentajePorCiclo}%**. Consultar con un especialista en reproducción dentro de los **${grupo.consultMonths} meses** de inicio de la búsqueda es altamente recomendado para evaluar todas las opciones disponibles.`;
    }
  }

  return {
    resultado,
    resumen,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: insightIcon,
    },
  };
}
