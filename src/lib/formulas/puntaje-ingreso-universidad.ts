/** Calculadora de puntaje ponderado para ingreso universitario */

export interface Inputs {
  promedioSecundario: number;
  notaExamen: number;
  pesoSecundario: number;
  pesoExamen: number;
}

export interface Outputs {
  puntajeFinal: number;
  aporteSecundario: number;
  aporteExamen: number;
  detalle: string;
}

export function puntajeIngresoUniversidad(i: Inputs): Outputs {
  const promSec = Number(i.promedioSecundario);
  const notaEx = Number(i.notaExamen);
  const pesoSec = Number(i.pesoSecundario);
  const pesoEx = Number(i.pesoExamen);

  if (isNaN(promSec) || promSec < 1 || promSec > 10) {
    throw new Error('El promedio del secundario debe estar entre 1 y 10');
  }
  if (isNaN(notaEx) || notaEx < 0 || notaEx > 10) {
    throw new Error('La nota del examen debe estar entre 0 y 10');
  }
  if (isNaN(pesoSec) || pesoSec < 0 || pesoSec > 100) {
    throw new Error('El peso del secundario debe estar entre 0% y 100%');
  }
  if (isNaN(pesoEx) || pesoEx < 0 || pesoEx > 100) {
    throw new Error('El peso del examen debe estar entre 0% y 100%');
  }

  const sumaPesos = pesoSec + pesoEx;
  if (sumaPesos !== 100) {
    throw new Error(`Los pesos deben sumar 100%. Actualmente suman ${sumaPesos}%.`);
  }

  const aporteSecundario = promSec * (pesoSec / 100);
  const aporteExamen = notaEx * (pesoEx / 100);
  const puntajeFinal = aporteSecundario + aporteExamen;

  return {
    puntajeFinal: Math.round(puntajeFinal * 100) / 100,
    aporteSecundario: Math.round(aporteSecundario * 100) / 100,
    aporteExamen: Math.round(aporteExamen * 100) / 100,
    detalle: `Secundario: ${promSec} × ${pesoSec}% = ${aporteSecundario.toFixed(2)}. Examen: ${notaEx} × ${pesoEx}% = ${aporteExamen.toFixed(2)}. Puntaje final: ${puntajeFinal.toFixed(2)}/10`,
  };
}
