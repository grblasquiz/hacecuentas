/**
 * Calculadora de barniz y aceite por m² de madera
 */

export interface Inputs {
  m2: number; producto: number; capas: number; porosidad: number;
}

export interface Outputs {
  litros: string; envase: string; tiempoAplicacion: string; consejo: string;
}

export function barnizAceiteM2Madera(inputs: Inputs): Outputs {
  const m2 = Number(inputs.m2);
  const pr = Math.round(Number(inputs.producto));
  const c = Math.round(Number(inputs.capas));
  const po = Math.round(Number(inputs.porosidad));
  if (!m2 || !pr || !c || !po) throw new Error('Completá los campos');
  const rendimiento: Record<number, number> = { 1: 13, 2: 17, 3: 11, 4: 9, 5: 22 };
  const r = rendimiento[pr] || 13;
  const ajustePoro: Record<number, number> = { 1: 0.9, 2: 1.0, 3: 1.2 };
  const ap = ajustePoro[po] || 1.0;
  const rEfectivo = r / ap;
  const litros = (m2 * c / rEfectivo) * 1.10; // margen 10%
  const envases: Record<number, string> = {
    1: 'Barniz poliuretano',
    2: 'Aceite lino/tung',
    3: 'Laca nitro',
    4: 'Lasur',
    5: 'Cera',
  };
  let env = '';
  if (litros < 1) env = `${envases[pr]} 1 L`;
  else if (litros < 4) env = `${envases[pr]} ${Math.ceil(litros)} L (envase 4 L si hay)`;
  else env = `${envases[pr]} ${Math.ceil(litros)} L (envase 4L + 1L)`;
  const tiempoHsMap: Record<number, number> = { 1: 6, 2: 18, 3: 0.7, 4: 3, 5: 1 };
  const hsCapa = tiempoHsMap[pr];
  const tiempoTotal = c * hsCapa + (c - 1) * 2; // secado + lijado
  return {
    litros: `${litros.toFixed(2)} L`,
    envase: env,
    tiempoAplicacion: `${tiempoTotal.toFixed(1)} hs totales (${c} capas)`,
    consejo: `Lijá 180→240 antes; lijado suave 280 entre capas.`,
  };
}
