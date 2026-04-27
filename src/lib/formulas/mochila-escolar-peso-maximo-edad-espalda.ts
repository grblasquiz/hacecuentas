export interface Inputs {
  pesoNino: number;
  edad: number;
  pesoCorporalSano: string;
}

export interface Outputs {
  pesoMaximoIdeal: number;
  pesoMaximoAbsoluto: number;
  nivelRiesgo: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  const pesoNino = Number(i.pesoNino) || 0;
  const edad = Number(i.edad) || 0;
  const pesoCorporalSano = i.pesoCorporalSano ?? "si";

  // Validaciones básicas
  if (pesoNino <= 0 || edad <= 0) {
    return {
      pesoMaximoIdeal: 0,
      pesoMaximoAbsoluto: 0,
      nivelRiesgo: "Datos insuficientes",
      recomendacion: "Ingresá el peso y la edad del niño/a para obtener el resultado.",
    };
  }

  if (edad > 18 || edad < 2) {
    return {
      pesoMaximoIdeal: 0,
      pesoMaximoAbsoluto: 0,
      nivelRiesgo: "Fuera de rango",
      recomendacion: "Esta calculadora está diseñada para niños y adolescentes de 2 a 18 años.",
    };
  }

  // Porcentaje ideal según edad
  // Fuente: consenso kinesiología / AAP
  let porcentajeIdeal: number;
  let porcentajeAbsoluto: number;

  if (edad <= 5) {
    // Jardín / inicial: columna en desarrollo intensivo
    porcentajeIdeal = 0.10;
    porcentajeAbsoluto = 0.10; // sin excepciones en esta etapa
  } else if (edad <= 9) {
    // Primaria baja
    porcentajeIdeal = 0.10;
    porcentajeAbsoluto = 0.12;
  } else if (edad <= 12) {
    // Primaria alta
    porcentajeIdeal = 0.10;
    porcentajeAbsoluto = 0.13;
  } else {
    // Secundaria
    porcentajeIdeal = 0.10;
    porcentajeAbsoluto = 0.15;
  }

  // Si el peso corporal no es saludable, aplicar siempre el 10% estricto
  if (pesoCorporalSano === "no") {
    porcentajeAbsoluto = 0.10;
  }

  const pesoMaximoIdeal = parseFloat((pesoNino * porcentajeIdeal).toFixed(2));
  const pesoMaximoAbsoluto = parseFloat((pesoNino * porcentajeAbsoluto).toFixed(2));

  // Nivel de riesgo base (sin saber el peso actual de la mochila,
  // se informa el riesgo general según edad y condición)
  let nivelRiesgo: string;
  let recomendacion: string;

  const limiteMuyBajo = edad <= 5;
  const enPicoCrec = edad >= 10 && edad <= 14;

  if (limiteMuyBajo) {
    nivelRiesgo = "⚠️ Alto — columna en desarrollo intensivo";
    recomendacion =
      "En jardín e inicial el límite es estricto: máximo " +
      pesoMaximoIdeal.toFixed(1) +
      " kg incluyendo la mochila vacía. " +
      "Usá mochila ultraliviana (menos de 400 g vacía), con dos asas y respaldo acolchado. " +
      "No cargar más de 1-2 útiles livianos. Evitá mochilas de un solo hombro.";
  } else if (pesoCorporalSano === "no") {
    nivelRiesgo = "⚠️ Moderado-alto — peso corporal fuera del rango saludable";
    recomendacion =
      "Como el peso corporal no está en rango saludable, el límite se calcula al 10% estricto: " +
      pesoMaximoIdeal.toFixed(1) +
      " kg. La musculatura de sostén no es proporcional al peso real. " +
      "Recomendamos mochila con ruedas. Consultá con kinesiólogo o pediatra para evaluación postural.";
  } else if (enPicoCrec) {
    nivelRiesgo = "⚠️ Moderado — pico de crecimiento (mayor vulnerabilidad)";
    recomendacion =
      "Entre los 10 y 14 años es el período de mayor crecimiento: la columna es más vulnerable. " +
      "Límite ideal: " +
      pesoMaximoIdeal.toFixed(1) +
      " kg; máximo absoluto: " +
      pesoMaximoAbsoluto.toFixed(1) +
      " kg. Preferí mochila con ruedas si el contenido supera el límite ideal. " +
      "Ajustá las correas para que la mochila quede pegada a la espalda, no colgando.";
  } else {
    nivelRiesgo = "✅ Moderado — riesgo estándar para la edad";
    recomendacion =
      "Límite ideal (10%): " +
      pesoMaximoIdeal.toFixed(1) +
      " kg. Límite absoluto (" +
      Math.round(porcentajeAbsoluto * 100) +
      "%): " +
      pesoMaximoAbsoluto.toFixed(1) +
      " kg, incluyendo la mochila vacía. " +
      "Usá mochila con dos asas anchas y acolchadas. Colocá los objetos más pesados cerca de la espalda. " +
      "Si supera el límite frecuentemente, considerá mochila con ruedas o dejar materiales en el aula.";
  }

  // Advertencia adicional si la mochila vacía típica ya compromete el límite
  const mochilaMinimaVacia = 0.5; // kg promedio mochila liviana
  const espacioUtil = pesoMaximoIdeal - mochilaMinimaVacia;
  if (espacioUtil < 1.0 && edad > 5) {
    recomendacion +=
      " Tené en cuenta que una mochila vacía pesa ~0,5 kg; el espacio para útiles es solo " +
      espacioUtil.toFixed(1) +
      " kg.";
  }

  return {
    pesoMaximoIdeal,
    pesoMaximoAbsoluto,
    nivelRiesgo,
    recomendacion,
  };
}
