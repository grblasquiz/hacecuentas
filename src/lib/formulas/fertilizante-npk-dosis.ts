/** Fertilizante NPK: dosis por m² */
export interface Inputs {
  npkN: number;
  npkP: number;
  npkK: number;
  superficieM2: number;
  tipoCultivo?: string;
}
export interface Outputs {
  gramosPorM2: number;
  gramosTotal: number;
  kgTotal: number;
  nAportado: number;
}

const DOSIS_BASE_GM2: Record<string, number> = {
  hortaliza: 40,
  cesped: 25,
  frutal: 60,
  ornamental: 35,
  aromatica: 20,
};

export function fertilizanteNpkDosis(i: Inputs): Outputs {
  const n = Number(i.npkN);
  const p = Number(i.npkP);
  const k = Number(i.npkK);
  const m2 = Number(i.superficieM2);
  const tipo = String(i.tipoCultivo || 'hortaliza');

  if (m2 <= 0) throw new Error('Ingresá la superficie en m²');
  if (n + p + k <= 0) throw new Error('Ingresá al menos un valor NPK mayor a 0');

  const concentracion = (n + p + k) / 100;
  const dosisBase = DOSIS_BASE_GM2[tipo] || 40;
  const ajuste = concentracion > 0 ? 0.45 / concentracion : 1;
  const gm2 = dosisBase * ajuste;
  const total = gm2 * m2;
  const nAportado = total * (n / 100);

  return {
    gramosPorM2: Number(gm2.toFixed(1)),
    gramosTotal: Number(total.toFixed(0)),
    kgTotal: Number((total / 1000).toFixed(2)),
    nAportado: Number(nAportado.toFixed(1)),
  };
}
