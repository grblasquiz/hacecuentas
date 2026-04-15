/** Minutos de paseo diario recomendados para un perro */
export interface Inputs {
  tamano?: string;
  edad?: string;
  energia?: string;
}
export interface Outputs {
  minutosDiarios: number;
  paseosPorDia: number;
  kmAproximados: number;
  detalle: string;
}

export function paseoPerro(i: Inputs): Outputs {
  const tamano = String(i.tamano || 'mediano');
  const edad = String(i.edad || 'adulto');
  const energia = String(i.energia || 'media');

  // Minutos base por tamaño
  let base = 60;
  if (tamano === 'mini') base = 30;
  else if (tamano === 'pequeno') base = 45;
  else if (tamano === 'grande') base = 75;
  else if (tamano === 'gigante') base = 45;

  // Factor edad
  let factorEdad = 1.0;
  if (edad === 'cachorro') factorEdad = 0.5;
  else if (edad === 'senior') factorEdad = 0.6;

  // Factor energía
  let factorEnergia = 1.0;
  if (energia === 'baja') factorEnergia = 0.7;
  else if (energia === 'alta') factorEnergia = 1.5;

  let minutos = Math.round(base * factorEdad * factorEnergia);
  // Mínimo 15 min, máximo 150 min
  minutos = Math.max(15, Math.min(150, minutos));

  // Paseos por día
  let paseos = 2;
  if (edad === 'cachorro') paseos = 3;
  else if (minutos > 90) paseos = 3;
  else if (minutos <= 30) paseos = 2;

  // Km aproximados (velocidad promedio paseo: 4 km/h)
  const km = Number(((minutos / 60) * 4).toFixed(1));

  return {
    minutosDiarios: minutos,
    paseosPorDia: paseos,
    kmAproximados: km,
    detalle: `Perro ${tamano} ${edad} con energía ${energia}: ~${minutos} min/día divididos en ${paseos} paseos (~${km} km). ${edad === 'cachorro' ? 'Para cachorros: paseos cortos y frecuentes, no forzar.' : ''}${edad === 'senior' ? 'Para seniors: paseos más cortos, prestar atención a señales de cansancio.' : ''}`,
  };
}
