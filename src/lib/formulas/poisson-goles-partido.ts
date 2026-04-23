/** Distribución de Poisson para modelar goles por partido — modelo estadístico educativo */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

function poissonPmf(k: number, lambda: number): number {
  // P(X=k) = e^-lambda * lambda^k / k!
  let num = Math.exp(-lambda) * Math.pow(lambda, k);
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return num / fact;
}

export function poissonGolesPartido(i: Inputs): Outputs {
  const lambdaLocal = Number(i.golesEsperadosLocal) || 1.5;
  const lambdaVisit = Number(i.golesEsperadosVisitante) || 1.2;

  if (lambdaLocal <= 0 || lambdaVisit <= 0) {
    throw new Error('Los goles esperados deben ser > 0');
  }

  // Probabilidades 0-5 goles por lado
  const maxGoles = 6;
  const pL: number[] = [];
  const pV: number[] = [];
  for (let k = 0; k <= maxGoles; k++) {
    pL.push(poissonPmf(k, lambdaLocal));
    pV.push(poissonPmf(k, lambdaVisit));
  }

  let pLocalGana = 0;
  let pEmpate = 0;
  let pVisitGana = 0;
  let pOver25 = 0; // >2.5 goles
  let pBtts = 0; // both teams to score
  for (let gL = 0; gL <= maxGoles; gL++) {
    for (let gV = 0; gV <= maxGoles; gV++) {
      const p = pL[gL] * pV[gV];
      if (gL > gV) pLocalGana += p;
      else if (gL === gV) pEmpate += p;
      else pVisitGana += p;
      if (gL + gV > 2) pOver25 += p;
      if (gL >= 1 && gV >= 1) pBtts += p;
    }
  }

  const p00 = (pL[0] * pV[0] * 100).toFixed(1);
  const p10 = (pL[1] * pV[0] * 100).toFixed(1);
  const p11 = (pL[1] * pV[1] * 100).toFixed(1);
  const p21 = (pL[2] * pV[1] * 100).toFixed(1);
  const p20 = (pL[2] * pV[0] * 100).toFixed(1);

  const marcadorMasProbable = (() => {
    let best = { g: '0-0', p: 0 };
    for (let gL = 0; gL <= maxGoles; gL++) {
      for (let gV = 0; gV <= maxGoles; gV++) {
        const p = pL[gL] * pV[gV];
        if (p > best.p) best = { g: `${gL}-${gV}`, p };
      }
    }
    return `${best.g} (${(best.p * 100).toFixed(1)}%)`;
  })();

  return {
    probabilidadLocalGana: `${(pLocalGana * 100).toFixed(1)}%`,
    probabilidadEmpate: `${(pEmpate * 100).toFixed(1)}%`,
    probabilidadVisitanteGana: `${(pVisitGana * 100).toFixed(1)}%`,
    probabilidadOver25: `${(pOver25 * 100).toFixed(1)}%`,
    probabilidadBTTS: `${(pBtts * 100).toFixed(1)}%`,
    marcadorMasProbable,
    probabilidad00: `${p00}%`,
    probabilidad10: `${p10}%`,
    probabilidad20: `${p20}%`,
    probabilidad11: `${p11}%`,
    probabilidad21: `${p21}%`,
    notaEducativa: 'Modelo Poisson educativo: asume independencia y parámetros fijos. No es recomendación de apuestas.',
  };
}
