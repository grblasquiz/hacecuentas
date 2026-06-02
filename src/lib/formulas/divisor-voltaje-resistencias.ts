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
  _insight?: any;
  _chart?: any;
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

  // Insight dinámico: prioriza el problema más crítico (potencia > carga > ok)
  const vDropR1 = Vin - Vout;
  const potMax = Math.max(PR1, PR2);
  let insightTone: 'good' | 'warn' | 'neutral' = 'good';
  let insightTitle = 'Divisor balanceado';
  let insightText = `Con **Vin = ${Vin} V** obtenés **Vout = ${Vout.toFixed(3)} V** (${((Vout / Vin) * 100).toFixed(0)}% de la entrada), drenando **${(I * 1000).toFixed(2)} mA** por R1 y R2.`;
  if (potMax > 250) {
    insightTone = 'warn';
    insightTitle = 'Disipación alta';
    insightText = `Una resistencia disipa **${potMax.toFixed(0)} mW**: superás los 250 mW de una resistencia común de 1/4 W. Usá una de **1/2 W o más** o subí R1+R2 para bajar la corriente (**${(I * 1000).toFixed(2)} mA**).`;
  } else if (rCarga > 0 && errorCarga > 5) {
    insightTone = 'warn';
    insightTitle = 'Carga hunde el Vout';
    insightText = `La carga de ${formatOhms(rCarga)} baja el Vout de ${Vout.toFixed(3)} V a **${voutConCarga.toFixed(3)} V** (error **${errorCarga.toFixed(1)}%**). Reducí R1+R2 o intercalá un buffer op-amp para que la salida no dependa de la carga.`;
  } else if (rCarga > 0) {
    insightTone = 'good';
    insightTitle = 'Carga bien tolerada';
    insightText = `Con la carga de ${formatOhms(rCarga)} el Vout real es **${voutConCarga.toFixed(3)} V** (error **${errorCarga.toFixed(1)}%**, despreciable): el divisor está bien dimensionado frente a la carga.`;
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
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '🔌',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: `Caída en R1`, value: Number(vDropR1.toFixed(3)) },
        { label: `Vout (R2)`, value: Number(Vout.toFixed(3)) },
      ],
      suffix: ' V',
      centerValue: `${Vout.toFixed(2)} V`,
      centerLabel: 'Vout',
      ariaLabel: `Reparto del voltaje de entrada ${Vin} V: ${vDropR1.toFixed(2)} V caen en R1 y ${Vout.toFixed(2)} V quedan en la salida`,
    },
  };
}
