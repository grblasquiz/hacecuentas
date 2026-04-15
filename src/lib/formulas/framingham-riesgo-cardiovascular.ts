/** Framingham Risk Score simplificado: riesgo cardiovascular a 10 años */
export interface Inputs {
  edad: number;
  sexo: string;
  colesterolTotal: number;
  hdl: number;
  sistolica: number;
  tratamientoHTA: boolean;
  fumador: boolean;
  diabetico: boolean;
}
export interface Outputs {
  puntaje: number;
  riesgoPorcentaje: number;
  categoria: string;
  edadCardiovascular: number;
  recomendacion: string;
  resumen: string;
}

// Puntos por edad y sexo (simplificado - D'Agostino 2008)
function puntosEdad(edad: number, sexo: string): number {
  if (sexo === 'm') {
    if (edad < 35) return 0;
    if (edad < 40) return 2;
    if (edad < 45) return 5;
    if (edad < 50) return 7;
    if (edad < 55) return 8;
    if (edad < 60) return 10;
    if (edad < 65) return 11;
    if (edad < 70) return 12;
    if (edad < 75) return 14;
    return 15;
  } else {
    if (edad < 35) return 0;
    if (edad < 40) return 2;
    if (edad < 45) return 4;
    if (edad < 50) return 5;
    if (edad < 55) return 7;
    if (edad < 60) return 8;
    if (edad < 65) return 9;
    if (edad < 70) return 10;
    if (edad < 75) return 11;
    return 12;
  }
}

function puntosColesterol(c: number, sexo: string): number {
  if (sexo === 'm') {
    if (c < 160) return 0;
    if (c < 200) return 1;
    if (c < 240) return 2;
    if (c < 280) return 3;
    return 4;
  } else {
    if (c < 160) return 0;
    if (c < 200) return 1;
    if (c < 240) return 3;
    if (c < 280) return 4;
    return 5;
  }
}

function puntosHDL(h: number): number {
  if (h >= 60) return -2;
  if (h >= 50) return -1;
  if (h >= 45) return 0;
  if (h >= 35) return 1;
  return 2;
}

function puntosPAS(sist: number, tratada: boolean, sexo: string): number {
  let p = 0;
  if (sexo === 'm') {
    if (sist < 120) p = 0;
    else if (sist < 130) p = 1;
    else if (sist < 140) p = 2;
    else if (sist < 160) p = 3;
    else p = 4;
  } else {
    if (sist < 120) p = 0;
    else if (sist < 130) p = 2;
    else if (sist < 140) p = 3;
    else if (sist < 160) p = 4;
    else p = 5;
  }
  return tratada ? p + 1 : p;
}

function riesgoFromPuntaje(pts: number, sexo: string): number {
  const tabla: Record<string, number[]> = {
    m: [1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 30, 30],
    f: [1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 6, 8, 11, 14, 17, 22, 27, 30],
  };
  const arr = tabla[sexo] || tabla['m'];
  const idx = Math.max(0, Math.min(arr.length - 1, pts));
  return arr[idx];
}

export function framinghamRiesgoCardiovascular(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const ct = Number(i.colesterolTotal);
  const hdl = Number(i.hdl);
  const pas = Number(i.sistolica);
  const tratada = Boolean(i.tratamientoHTA);
  const fuma = Boolean(i.fumador);
  const diab = Boolean(i.diabetico);

  if (!edad || edad < 30 || edad > 85) throw new Error('La edad debe estar entre 30 y 85 años');
  if (!ct || ct < 100 || ct > 400) throw new Error('Ingresá colesterol total válido (100-400 mg/dL)');
  if (!hdl || hdl < 20 || hdl > 120) throw new Error('Ingresá HDL válido (20-120 mg/dL)');
  if (!pas || pas < 80 || pas > 220) throw new Error('Ingresá presión sistólica válida (80-220 mmHg)');

  let puntaje = 0;
  puntaje += puntosEdad(edad, sexo);
  puntaje += puntosColesterol(ct, sexo);
  puntaje += puntosHDL(hdl);
  puntaje += puntosPAS(pas, tratada, sexo);
  if (fuma) puntaje += sexo === 'm' ? 4 : 3;
  if (diab) puntaje += sexo === 'm' ? 3 : 4;

  const riesgoPorcentaje = riesgoFromPuntaje(puntaje, sexo);

  let categoria = '';
  let recomendacion = '';
  if (riesgoPorcentaje < 5) {
    categoria = 'Riesgo bajo';
    recomendacion = 'Mantené estilo de vida saludable. Control cada 2-5 años.';
  } else if (riesgoPorcentaje < 10) {
    categoria = 'Riesgo intermedio-bajo';
    recomendacion = 'Foco en dieta, ejercicio. Control anual.';
  } else if (riesgoPorcentaje < 20) {
    categoria = 'Riesgo intermedio';
    recomendacion = 'Considerá estatinas según LDL. Consultá con cardiólogo.';
  } else {
    categoria = 'Riesgo alto';
    recomendacion = 'Tratamiento intensivo: estatinas, control de PA, antiagregante si corresponde.';
  }

  // Edad cardiovascular estimada: cuando ese riesgo se daría con perfil "ideal"
  // Aproximación simplificada
  const edadCV = edad + Math.round((riesgoPorcentaje - 5) * 0.8);

  return {
    puntaje,
    riesgoPorcentaje: Number(riesgoPorcentaje.toFixed(1)),
    categoria,
    edadCardiovascular: Math.max(edad, edadCV),
    recomendacion,
    resumen: `Puntaje Framingham: ${puntaje}. Riesgo cardiovascular a 10 años: ${riesgoPorcentaje}% (${categoria}).`,
  };
}
