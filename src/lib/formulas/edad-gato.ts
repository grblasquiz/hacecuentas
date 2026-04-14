/** Edad del gato en años humanos */
export interface Inputs { anos: number; }
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  expectativa: number;
}

export function edadGato(i: Inputs): Outputs {
  const a = Number(i.anos);
  if (!a || a < 0) throw new Error('Ingresá la edad');

  // Tabla Cornell Feline Health Center
  // Año 1 = 15 humanos; año 2 = +9 (24 total); cada año siguiente = +4
  let edad = 0;
  if (a <= 1) edad = a * 15;
  else if (a <= 2) edad = 15 + (a - 1) * 9;
  else edad = 24 + (a - 2) * 4;

  let etapa = '';
  if (a < 0.5) etapa = 'Gatito';
  else if (a < 2) etapa = 'Junior';
  else if (a < 7) etapa = 'Adulto';
  else if (a < 11) etapa = 'Maduro';
  else if (a < 15) etapa = 'Senior';
  else etapa = 'Geriátrico';

  return {
    edadHumana: Math.round(edad),
    etapaVida: etapa,
    expectativa: 15, // 12-18 años típico
  };
}
