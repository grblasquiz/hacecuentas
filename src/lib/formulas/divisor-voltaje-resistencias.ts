/**
 * Calculadora de divisor de voltaje (2 resistencias)
 *
 * Fórmula base: Vout = Vin × R2 / (R1 + R2)
 * Variantes:
 *   R1 = R2 × (Vin − Vout) / Vout
 *   R2 = R1 × Vout / (Vin − Vout)
 *
 * Considera efecto de carga: Vout_real = Vin × (R2 || R_carga) / (R1 + R2 || R_carga)
 */

export interface DivisorVoltajeInputs {
  modo: 'vout' | 'r1' | 'r2';
  vin: number;
  vout?: number;
  r1?: number;
  r2?: number;
  rCarga?: number;
}

export interface DivisorVoltajeOutputs {
  vout: number;
  r1Calc: number;
  r2Calc: number;
  corriente: number; // mA
  potenciaR1: number; // mW
  potenciaR2: number; // mW
  voutConCarga: number;
  errorCarga: number; // %
  resumen: string;
}

function formatOhms(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(2)} kΩ`;
  return `${ohms.toFixed(1)} Ω`;
}

export function divisorVoltajeResistencias(i: DivisorVoltajeInputs): DivisorVoltajeOutputs {
  const modo = i.modo || 'vout';
  const Vin = Number(i.vin);
  if (!Vin || Vin <= 0) throw new Error('Ingresá el voltaje de entrada Vin');

  let Vout: number, R1: number, R2: number;

  if (modo === 'vout') {
    R1 = Number(i.r1);
    R2 = Number(i.r2);
    if (!R1 || R1 <= 0) throw new Error('Ingresá R1');
    if (!R2 || R2 <= 0) throw new Error('Ingresá R2');
    Vout = (Vin * R2) / (R1 + R2);
  } else if (modo === 'r1') {
    Vout = Number(i.vout);
    R2 = Number(i.r2);
    if (!Vout || Vout <= 0) throw new Error('Ingresá el voltaje de salida Vout');
    if (Vout >= Vin) throw new Error('Vout debe ser menor que Vin');
    if (!R2 || R2 <= 0) throw new Error('Ingresá R2');
    R1 = (R2 * (Vin - Vout)) / Vout;
  } else {
    Vout = Number(i.vout);
    R1 = Number(i.r1);
    if (!Vout || Vout <= 0) throw new Error('Ingresá el voltaje de salida Vout');
    if (Vout >= Vin) throw new Error('Vout debe ser menor que Vin');
    if (!R1 || R1 <= 0) throw new Error('Ingresá R1');
    R2 = (R1 * Vout) / (Vin - Vout);
  }

  const I = Vin / (R1 + R2); // A
  const PR1 = I * I * R1 * 1000; // mW
  const PR2 = I * I * R2 * 1000;

  // Efecto de carga
  const rCarga = Number(i.rCarga ?? 0);
  let voutConCarga = Vout;
  let errorCarga = 0;
  if (rCarga > 0) {
    const r2Parallel = (R2 * rCarga) / (R2 + rCarga);
    voutConCarga = (Vin * r2Parallel) / (R1 + r2Parallel);
    errorCarga = ((Vout - voutConCarga) / Vout) * 100;
  }

  let resumen = `Vout = ${Vout.toFixed(3)} V con R1 = ${formatOhms(R1)}, R2 = ${formatOhms(R2)}. Corriente del divisor: ${(
    I * 1000
  ).toFixed(3)} mA.`;

  if (rCarga > 0) {
    if (errorCarga > 5) {
      resumen += ` ⚠️ Con carga de ${formatOhms(rCarga)} el Vout real cae a ${voutConCarga.toFixed(
        3,
      )} V (error ${errorCarga.toFixed(1)}%). Considerá reducir R1+R2 o usar buffer op-amp.`;
    } else {
      resumen += ` Con carga de ${formatOhms(rCarga)} el Vout real es ${voutConCarga.toFixed(
        3,
      )} V (error ${errorCarga.toFixed(1)}%, aceptable).`;
    }
  }

  // Advertencia de potencia
  if (PR1 > 250 || PR2 > 250) {
    resumen += ` ⚠️ Potencia >250 mW — usá resistencia de 1/2 W o superior.`;
  }

  return {
    vout: Number(Vout.toFixed(3)),
    r1Calc: Number(R1.toFixed(1)),
    r2Calc: Number(R2.toFixed(1)),
    corriente: Number((I * 1000).toFixed(3)),
    potenciaR1: Number(PR1.toFixed(2)),
    potenciaR2: Number(PR2.toFixed(2)),
    voutConCarga: Number(voutConCarga.toFixed(3)),
    errorCarga: Number(errorCarga.toFixed(2)),
    resumen,
  };
}
