export interface StepperPasosGradoInputs { angulo: number; microstep: string; }
export interface StepperPasosGradoOutputs { pasosPorRev: string; pasosPorGrado: string; resumen: string; }
export function stepperPasosGrado(i: StepperPasosGradoInputs): StepperPasosGradoOutputs {
  const a = Number(i.angulo); const ms = Number(i.microstep);
  if (!a || a <= 0) throw new Error('Ingresá ángulo por paso');
  const ppr = (360 / a) * ms;
  const ppg = ppr / 360;
  return { pasosPorRev: ppr.toFixed(0), pasosPorGrado: ppg.toFixed(2),
    resumen: `Stepper ${a}°/paso con microstepping 1/${ms}: ${ppr} pasos/rev (${ppg.toFixed(1)} pasos/°).` };
}
