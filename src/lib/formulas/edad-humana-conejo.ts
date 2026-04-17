/** Edad del conejo en años humanos según raza. */
export interface Inputs {
  edadAnios: number;
  raza?: string;
}
export interface Outputs {
  edadHumana: number;
  etapaVital: string;
  controlVeterinario: string;
  cuidadosEspecificos: string;
}

export function edadHumanaConejo(i: Inputs): Outputs {
  const e = Number(i.edadAnios);
  if (e < 0) throw new Error('La edad no puede ser negativa');

  const raza = String(i.raza || 'enano');
  // Factor año adicional por raza
  const factorAnio: Record<string, number> = {
    'enano': 4, 'mediano': 6, 'gigante': 8,
  };
  const primerAnio: Record<string, number> = {
    'enano': 18, 'mediano': 20, 'gigante': 22,
  };

  let humana = 0;
  if (e <= 1) humana = e * (primerAnio[raza] ?? 18);
  else humana = (primerAnio[raza] ?? 18) + (e - 1) * (factorAnio[raza] ?? 4);

  let etapa = '';
  if (e < 0.25) etapa = 'Bebé';
  else if (e < 0.5) etapa = 'Adolescente';
  else if (e < 1) etapa = 'Joven adulto';
  else if (e < 5) etapa = 'Adulto';
  else if (raza === 'gigante' && e >= 4) etapa = e >= 6 ? 'Anciano' : 'Senior';
  else if (raza === 'mediano' && e >= 5) etapa = e >= 7 ? 'Anciano' : 'Senior';
  else if (e >= 6) etapa = e >= 9 ? 'Anciano' : 'Senior';
  else etapa = 'Adulto';

  const vet = etapa === 'Anciano' ? 'Cada 3-4 meses, con hemograma y control renal'
    : etapa === 'Senior' ? 'Cada 6 meses con análisis y revisión dental'
    : etapa === 'Adulto' ? 'Anual (dentición, peso, parásitos)'
    : 'Cada 3-4 meses hasta el primer año, luego anual';

  const cuidados = etapa === 'Anciano' ? 'Rampas suaves, superficies antideslizantes, calefacción en invierno, dieta senior.'
    : etapa === 'Senior' ? 'Heno timothy, menos pellets, ejercicio moderado, revisión dental semestral.'
    : 'Heno ilimitado, verduras variadas, ejercicio diario, castración si no está hecha.';

  return {
    edadHumana: Math.round(humana),
    etapaVital: etapa,
    controlVeterinario: vet,
    cuidadosEspecificos: cuidados,
  };
}
