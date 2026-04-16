/** Riesgo en embarazo por edad materna */
export interface Inputs { edadMaterna: number; semanasGestacion?: number; }
export interface Outputs { riesgoDown: string; riesgoAborto: string; riesgoCromosomico: string; recomendacion: string; }

export function riesgoEmbarazoEdad(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadMaterna));
  if (!edad || edad < 18 || edad > 50) throw new Error('Ingresá una edad entre 18 y 50');

  // Riesgo de Down al nacer por edad (datos Morris 2002 / Hook 1981)
  const downRisk: Record<number, number> = {
    18: 1500, 19: 1500, 20: 1500, 21: 1500, 22: 1450, 23: 1400, 24: 1350,
    25: 1250, 26: 1200, 27: 1100, 28: 1000, 29: 950, 30: 900, 31: 800,
    32: 720, 33: 570, 34: 450, 35: 350, 36: 280, 37: 240, 38: 175,
    39: 135, 40: 100, 41: 75, 42: 55, 43: 40, 44: 30, 45: 25,
    46: 20, 47: 15, 48: 12, 49: 10, 50: 8,
  };

  // Riesgo de aborto por rango de edad
  let aborto = '';
  if (edad < 25) aborto = '~10%';
  else if (edad < 30) aborto = '~12%';
  else if (edad < 35) aborto = '~15%';
  else if (edad < 40) aborto = '~20-25%';
  else if (edad < 45) aborto = '~35-50%';
  else aborto = '~50-75%';

  const dRisk = downRisk[edad] || (edad < 18 ? 1500 : 8);
  const riesgoDown = `1 en ${dRisk} (${(100 / dRisk).toFixed(2)}%)`;

  // Riesgo cromosómico total (~1.5x del riesgo de Down aislado)
  const cromTotal = Math.round(dRisk / 1.5);
  const riesgoCromosomico = `1 en ${cromTotal} (${(100 / cromTotal).toFixed(2)}%)`;

  // Recomendación de estudios
  let recomendacion = '';
  if (edad < 35) {
    recomendacion = 'Screening combinado del primer trimestre (ecografía TN + sangre). NIPT opcional.';
  } else if (edad < 38) {
    recomendacion = 'Screening combinado del primer trimestre + considerar NIPT para mayor precisión. Discutir opciones con tu obstetra.';
  } else {
    recomendacion = 'Se recomienda NIPT y/o diagnóstico invasivo (amniocentesis o biopsia coriónica). Consultá con tu obstetra sobre la mejor opción.';
  }

  return { riesgoDown, riesgoAborto: aborto, riesgoCromosomico, recomendacion };
}
