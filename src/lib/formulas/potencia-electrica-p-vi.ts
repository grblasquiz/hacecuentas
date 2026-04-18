/**
 * Calculadora de potencia eléctrica: P = V × I = I² × R = V² / R
 *
 * Resuelve potencia según el par de variables conocidas (VI, IR, VR).
 * También calcula consumo diario/mensual en kWh y costo mensual según tarifa.
 */

export interface PotenciaElectricaInputs {
  modo: 'VI' | 'IR' | 'VR';
  valor1: number;
  valor2: number;
  horasPorDia?: number;
  tarifaKwh?: number;
}

export interface PotenciaElectricaOutputs {
  potenciaWatts: number;
  potenciaKw: number;
  voltaje: number;
  corriente: number;
  resistencia: number;
  consumoDiario: number;
  consumoMensual: number;
  costoMensual: number;
  formulaAplicada: string;
  resumen: string;
}

export function potenciaElectricaPVi(i: PotenciaElectricaInputs): PotenciaElectricaOutputs {
  const modo = i.modo || 'VI';
  const v1 = Number(i.valor1);
  const v2 = Number(i.valor2);
  const horasDia = Number(i.horasPorDia ?? 8);
  const tarifa = Number(i.tarifaKwh ?? 50);

  if (!v1 || v1 <= 0) throw new Error('Ingresá el primer valor');
  if (!v2 || v2 <= 0) throw new Error('Ingresá el segundo valor');

  let P: number, V: number, I: number, R: number, formula: string;

  if (modo === 'VI') {
    V = v1;
    I = v2;
    P = V * I;
    R = V / I;
    formula = `P = V × I = ${V} × ${I} = ${P.toFixed(2)} W`;
  } else if (modo === 'IR') {
    I = v1;
    R = v2;
    P = I * I * R;
    V = I * R;
    formula = `P = I² × R = ${I}² × ${R} = ${P.toFixed(2)} W`;
  } else {
    V = v1;
    R = v2;
    P = (V * V) / R;
    I = V / R;
    formula = `P = V² / R = ${V}² / ${R} = ${P.toFixed(2)} W`;
  }

  const consumoDiario = (P * horasDia) / 1000; // kWh/día
  const consumoMensual = consumoDiario * 30; // kWh/mes
  const costoMensual = consumoMensual * tarifa;

  let resumen: string;
  if (P >= 1000) {
    resumen = `Potencia alta: ${(P / 1000).toFixed(2)} kW. Requiere cable grueso (>2.5 mm²) y termomagnética adecuada.`;
  } else if (P >= 100) {
    resumen = `Potencia media: ${P.toFixed(0)} W. Consumo normal de electrodoméstico pequeño.`;
  } else if (P >= 10) {
    resumen = `Potencia baja: ${P.toFixed(1)} W. Típico de iluminación o electrónica.`;
  } else {
    resumen = `Potencia muy baja: ${P.toFixed(3)} W. Electrónica de señal, sensor o micro-controlador.`;
  }

  if (horasDia && tarifa) {
    resumen += ` Costo mensual estimado (${horasDia}h/día × $${tarifa}/kWh): $${costoMensual.toLocaleString('es-AR', {
      maximumFractionDigits: 0,
    })}.`;
  }

  return {
    potenciaWatts: Number(P.toFixed(2)),
    potenciaKw: Number((P / 1000).toFixed(3)),
    voltaje: Number(V.toFixed(2)),
    corriente: Number(I.toFixed(3)),
    resistencia: Number(R.toFixed(2)),
    consumoDiario: Number(consumoDiario.toFixed(2)),
    consumoMensual: Number(consumoMensual.toFixed(1)),
    costoMensual: Math.round(costoMensual),
    formulaAplicada: formula,
    resumen,
  };
}
