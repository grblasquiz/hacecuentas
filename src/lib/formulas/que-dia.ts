/** Qué día de la semana fue / será */
export interface Inputs { fecha: string; }
export interface Outputs {
  diaSemana: string;
  numeroDia: number;
  numeroSemana: number;
  diaDelAno: number;
  esBisiesto: boolean;
  resumen: string;
}

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function queDia(i: Inputs): Outputs {
  const f = new Date(i.fecha);
  if (isNaN(f.getTime())) throw new Error('Ingresá una fecha válida');

  const diaSem = f.getUTCDay();
  const diaStr = dias[diaSem];
  const year = f.getUTCFullYear();
  const mes = f.getUTCMonth();
  const diaMes = f.getUTCDate();

  // Día del año
  const inicio = new Date(Date.UTC(year, 0, 1));
  const diaDelAno = Math.floor((f.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Semana del año (ISO 8601 aproximado)
  const target = new Date(f.getTime());
  target.setUTCDate(target.getUTCDate() + 3 - ((target.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const numeroSemana = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);

  // Año bisiesto
  const esBisiesto = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const resumen = `El ${diaMes} de ${meses[mes]} de ${year} fue/será **${diaStr}**.`;

  return {
    diaSemana: diaStr,
    numeroDia: diaMes,
    numeroSemana,
    diaDelAno,
    esBisiesto,
    resumen,
  };
}
