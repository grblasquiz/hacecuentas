/**
 * Calculadora de energía eléctrica por print 3D
 */

export interface Inputs {
  horas: number; watts: number; kwh: number; printsMes: number;
}

export interface Outputs {
  kwhPrint: string; costoPrint: string; kwhMes: number; costoMes: string; equivalencia: string;
}

export function energiaElectricaImpresion3d(inputs: Inputs): Outputs {
  const h = Number(inputs.horas);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const pm = Number(inputs.printsMes);
  if (!h || !w || !kwh || !pm) throw new Error('Completá todos los campos');
  const kwhPrint = h * (w / 1000);
  const costoP = kwhPrint * kwh;
  const kwhMes = kwhPrint * pm;
  const costoMes = kwhMes * kwh;
  let equiv = '';
  if (kwhMes < 30) equiv = 'Equivale a 1 heladera por 1 semana';
  else if (kwhMes < 100) equiv = 'Equivale a A/C 3000 frig 30-50 hs';
  else if (kwhMes < 300) equiv = 'Equivale a consumo hogar pequeño';
  else equiv = 'Equivale a consumo hogar grande. Considerá solar.';
  return {
    kwhPrint: `${kwhPrint.toFixed(2)} kWh`,
    costoPrint: `$${costoP.toFixed(0)}`,
    kwhMes: Number(kwhMes.toFixed(1)),
    costoMes: `$${costoMes.toFixed(0)}/mes`,
    equivalencia: equiv,
  };
}
