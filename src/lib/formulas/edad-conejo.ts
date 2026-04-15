/** Edad equivalente humana de un conejo */
export interface Inputs {
  edadConejo: number;
  raza?: string;
}
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  esperanzaVida: string;
  detalle: string;
}

export function edadConejo(i: Inputs): Outputs {
  const edad = Number(i.edadConejo);
  const raza = String(i.raza || 'mediano');

  if (!edad || edad <= 0) throw new Error('Ingresá la edad del conejo');

  // Años humanos adicionales por año de conejo después del primero
  let factorAnual = 8; // mediano
  let esperanza = '8-10 años';

  if (raza === 'enano') {
    factorAnual = 6;
    esperanza = '10-12 años';
  } else if (raza === 'gigante') {
    factorAnual = 10;
    esperanza = '5-7 años';
  }

  // Primer año = 21 años humanos, después sumar factor
  let edadHumana = 0;
  if (edad <= 1) {
    edadHumana = edad * 21;
  } else {
    edadHumana = 21 + (edad - 1) * factorAnual;
  }

  // Etapa de vida
  let etapa = '';
  if (edad < 0.5) etapa = 'Cachorro (bebé)';
  else if (edad < 1) etapa = 'Adolescente';
  else if (edad < 3) etapa = 'Adulto joven';
  else if (edad < 5) etapa = 'Adulto maduro';
  else if (edad < 7) etapa = 'Senior';
  else etapa = 'Senior avanzado (geriátrico)';

  // Ajustar etapa para gigantes (envejecen antes)
  if (raza === 'gigante') {
    if (edad >= 3 && edad < 4) etapa = 'Adulto maduro';
    else if (edad >= 4 && edad < 5) etapa = 'Senior';
    else if (edad >= 5) etapa = 'Senior avanzado (geriátrico)';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    edadHumana: Math.round(edadHumana),
    etapaVida: etapa,
    esperanzaVida: esperanza,
    detalle: `Tu conejo (${raza}) de ${edad} años equivale a ~${fmt.format(edadHumana)} años humanos. Etapa: ${etapa}. Esperanza de vida promedio: ${esperanza}.`,
  };
}
