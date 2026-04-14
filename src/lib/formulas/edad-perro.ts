/** Edad del perro en años humanos (fórmula científica logarítmica UCSD 2019) */
export interface Inputs {
  anos: number;
  tamano?: string;
}
export interface Outputs {
  edadHumanaLog: number;
  edadHumanaSimple: number;
  etapaVida: string;
  expectativa: number;
}

export function edadPerro(i: Inputs): Outputs {
  const a = Number(i.anos);
  const tamano = String(i.tamano || 'mediano');
  if (!a || a < 0) throw new Error('Ingresá la edad en años');

  // Fórmula UCSD 2019 (metilación del ADN): edad_humana = 16 × ln(edad_perro) + 31
  // Válida a partir del año 1
  let edadLog = 0;
  if (a < 1) edadLog = a * 15; // aproximación para cachorros
  else edadLog = 16 * Math.log(a) + 31;

  // Fórmula tradicional ajustada por tamaño (AAHA)
  let tradFactor = 5;
  if (tamano === 'pequeno') tradFactor = 4.5;
  else if (tamano === 'mediano') tradFactor = 5;
  else if (tamano === 'grande') tradFactor = 6;
  else if (tamano === 'gigante') tradFactor = 7;

  let edadSimple = 0;
  if (a <= 1) edadSimple = a * 15;
  else if (a <= 2) edadSimple = 15 + (a - 1) * 9;
  else edadSimple = 24 + (a - 2) * tradFactor;

  // Etapa
  let etapa = '';
  if (a < 0.5) etapa = 'Cachorro';
  else if (a < 1) etapa = 'Juvenil';
  else if (a < 3) etapa = 'Joven adulto';
  else if (a < 7) etapa = 'Adulto';
  else if (a < 10) etapa = 'Adulto senior';
  else etapa = 'Senior (geriátrico)';

  // Expectativa de vida por tamaño
  let expectativa = 12;
  if (tamano === 'pequeno') expectativa = 14;
  else if (tamano === 'mediano') expectativa = 12;
  else if (tamano === 'grande') expectativa = 10;
  else if (tamano === 'gigante') expectativa = 8;

  return {
    edadHumanaLog: Math.round(edadLog),
    edadHumanaSimple: Math.round(edadSimple),
    etapaVida: etapa,
    expectativa,
  };
}
