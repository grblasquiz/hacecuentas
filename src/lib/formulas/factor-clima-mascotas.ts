/** Tiempo seguro al exterior para mascotas según temp + humedad + tamaño + pelaje. */
export interface Inputs {
  temperatura: number;   // °C
  humedad: number;       // %
  especie: 'perro' | 'gato';
  tamano: 'pequeno' | 'mediano' | 'grande';
  pelaje: 'sinPelo' | 'corto' | 'medio' | 'largo';
}
export interface Outputs {
  minutosSeguros: string;      // "45 min"
  minutosNumero: number;
  riesgo: string;
  categoria: string;
  advertencia: string;
  mensaje: string;
}

export function factorClimaMascotas(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const H = Number(i.humedad);
  if (!Number.isFinite(T) || T < -40 || T > 55) throw new Error('Temperatura fuera de rango.');
  if (!Number.isFinite(H) || H < 0 || H > 100) throw new Error('Humedad fuera de rango.');

  // Base en minutos por tamaño + pelaje + especie
  let base = 60; // minutos en 15-20°C
  if (i.especie === 'gato') base = 45;
  if (i.tamano === 'grande') base += 15;
  if (i.tamano === 'pequeno') base -= 15;

  // Ajuste por pelaje (factor contra el frío)
  const pelajeFactor: Record<string, number> = {
    sinPelo: 0.4,
    corto: 0.7,
    medio: 1.0,
    largo: 1.3,
  };
  const fPelo = pelajeFactor[i.pelaje] ?? 1.0;

  // Curva por temperatura (minutos seguros) - frío
  let multTemp = 1.0;
  if (T <= -15) multTemp = 0.05;
  else if (T <= -10) multTemp = i.pelaje === 'largo' && i.tamano === 'grande' ? 0.5 : 0.15;
  else if (T <= -5) multTemp = i.especie === 'gato' ? 0.35 : 0.5;
  else if (T <= 0) multTemp = 0.75;
  else if (T <= 10) multTemp = 1.0;
  else if (T <= 20) multTemp = 1.2;
  else if (T <= 25) multTemp = 1.0;
  else if (T <= 30) multTemp = 0.6;
  else if (T <= 35) multTemp = 0.25;
  else if (T <= 40) multTemp = 0.1;
  else multTemp = 0.03;

  // Humedad alta (>70%) en calor reduce capacidad termorreguladora
  if (T >= 25 && H >= 70) multTemp *= 0.6;
  // Humedad baja en frío empeora pérdida térmica leve
  if (T <= 0 && H >= 80) multTemp *= 0.8;

  const minutos = Math.max(1, Math.round(base * fPelo * multTemp));

  let categoria = 'Seguro';
  let riesgo = 'Bajo';
  let adv = 'Monitorear y ofrecer agua fresca o refugio si hace falta.';
  if (minutos < 5) {
    categoria = 'Peligro extremo';
    riesgo = 'Crítico';
    adv = 'NO sacar a la mascota salvo necesidad fisiológica urgente. Riesgo de hipotermia/hipertermia grave.';
  } else if (minutos < 15) {
    categoria = 'Alto riesgo';
    riesgo = 'Alto';
    adv = 'Paseo muy breve. Abrigo en frío, patas protegidas en asfalto caliente.';
  } else if (minutos < 30) {
    categoria = 'Precaución';
    riesgo = 'Moderado';
    adv = 'Limitar tiempo y vigilar signos de estrés térmico (jadeo, temblor).';
  }

  return {
    minutosSeguros: `${minutos} min`,
    minutosNumero: minutos,
    riesgo,
    categoria,
    advertencia: adv,
    mensaje: `${i.especie} ${i.tamano} pelo ${i.pelaje} a ${T.toFixed(1)} °C y ${H.toFixed(0)}% HR: hasta ~${minutos} min seguros (${categoria}).`,
  };
}
