/** Conversor de sistema de notas a GPA */
export interface Inputs {
  sistemaOrigen: string;
  nota: number;
}
export interface Outputs {
  gpa4: number;
  gpa100: number;
  letraUS: string;
  notaArgentina: number;
  equivalencia: string;
  mensaje: string;
}

export function sistemaNotasGpa(i: Inputs): Outputs {
  const sistema = String(i.sistemaOrigen || 'argentina_10');
  const nota = Number(i.nota);
  if (isNaN(nota)) throw new Error('Ingresá una nota válida');

  let nota100: number;

  // Convertir todo a escala 0-100 primero
  switch (sistema) {
    case 'argentina_10': // 0-10
      if (nota < 0 || nota > 10) throw new Error('Nota argentina: 0-10');
      nota100 = nota * 10;
      break;
    case 'usa_4': // 0-4.0
      if (nota < 0 || nota > 4) throw new Error('GPA USA: 0-4.0');
      nota100 = nota * 25;
      break;
    case 'espana_10': // 0-10
      if (nota < 0 || nota > 10) throw new Error('Nota española: 0-10');
      nota100 = nota * 10;
      break;
    case 'mexico_10': // 0-10
      if (nota < 0 || nota > 10) throw new Error('Nota mexicana: 0-10');
      nota100 = nota * 10;
      break;
    case 'colombia_5': // 0-5
      if (nota < 0 || nota > 5) throw new Error('Nota colombiana: 0-5');
      nota100 = nota * 20;
      break;
    case 'chile_7': // 1-7
      if (nota < 1 || nota > 7) throw new Error('Nota chilena: 1-7');
      nota100 = ((nota - 1) / 6) * 100;
      break;
    case 'brasil_10': // 0-10
      if (nota < 0 || nota > 10) throw new Error('Nota brasileña: 0-10');
      nota100 = nota * 10;
      break;
    case 'porcentaje': // 0-100
      if (nota < 0 || nota > 100) throw new Error('Porcentaje: 0-100');
      nota100 = nota;
      break;
    default:
      nota100 = nota * 10;
  }

  // GPA 4.0
  let gpa4: number;
  if (nota100 >= 93) gpa4 = 4.0;
  else if (nota100 >= 90) gpa4 = 3.7;
  else if (nota100 >= 87) gpa4 = 3.3;
  else if (nota100 >= 83) gpa4 = 3.0;
  else if (nota100 >= 80) gpa4 = 2.7;
  else if (nota100 >= 77) gpa4 = 2.3;
  else if (nota100 >= 73) gpa4 = 2.0;
  else if (nota100 >= 70) gpa4 = 1.7;
  else if (nota100 >= 67) gpa4 = 1.3;
  else if (nota100 >= 63) gpa4 = 1.0;
  else if (nota100 >= 60) gpa4 = 0.7;
  else gpa4 = 0.0;

  // Letra US
  let letraUS: string;
  if (nota100 >= 93) letraUS = 'A';
  else if (nota100 >= 90) letraUS = 'A-';
  else if (nota100 >= 87) letraUS = 'B+';
  else if (nota100 >= 83) letraUS = 'B';
  else if (nota100 >= 80) letraUS = 'B-';
  else if (nota100 >= 77) letraUS = 'C+';
  else if (nota100 >= 73) letraUS = 'C';
  else if (nota100 >= 70) letraUS = 'C-';
  else if (nota100 >= 67) letraUS = 'D+';
  else if (nota100 >= 60) letraUS = 'D';
  else letraUS = 'F';

  const notaArgentina = nota100 / 10;

  let equivalencia: string;
  if (nota100 >= 80) equivalencia = 'Excelente / distinguido';
  else if (nota100 >= 60) equivalencia = 'Aprobado / bueno';
  else if (nota100 >= 40) equivalencia = 'Desaprobado (en Argentina: menos de 4)';
  else equivalencia = 'Insuficiente';

  return {
    gpa4,
    gpa100: Number(nota100.toFixed(1)),
    letraUS,
    notaArgentina: Number(notaArgentina.toFixed(1)),
    equivalencia,
    mensaje: `GPA 4.0: ${gpa4} (${letraUS}). Escala 100: ${nota100.toFixed(1)}. Argentina (1-10): ${notaArgentina.toFixed(1)}. ${equivalencia}.`,
  };
}
