/** Calorías en ciclismo por potencia (watts) */
export interface Inputs {
  potencia: number;
  duracion: number;
  eficiencia: string;
}
export interface Outputs {
  calorias: number;
  kilojoules: number;
  caloriasHora: number;
  mensaje: string;
}

export function caloriasCiclismoWatts(i: Inputs): Outputs {
  const potencia = Number(i.potencia);
  const duracion = Number(i.duracion);
  const eficiencia = String(i.eficiencia || 'normal');
  if (!potencia || potencia <= 0) throw new Error('Ingresá la potencia');
  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración');

  // Work in kJ: watts × seconds / 1000
  const kilojoules = Math.round((potencia * duracion * 60) / 1000);

  // Efficiency factor
  let eff: number;
  if (eficiencia === 'baja') eff = 0.21;
  else if (eficiencia === 'alta') eff = 0.27;
  else eff = 0.24;

  // Total calories = kJ / (efficiency × 4.184)
  // Simplified: kJ / eff / 4.184
  // Since human eff ~0.24, and 1/0.24/4.184 ≈ 0.996 ≈ 1, so kJ ≈ kcal
  const calorias = Math.round(kilojoules / (eff * 4.184));
  const caloriasHora = Math.round(calorias / (duracion / 60));

  return {
    calorias,
    kilojoules,
    caloriasHora,
    mensaje: `${duracion} min a ${potencia}W = ${kilojoules} kJ de trabajo ≈ ${calorias} kcal quemadas (${caloriasHora} kcal/h).`
  };
}