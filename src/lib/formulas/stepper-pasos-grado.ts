export interface StepperPasosGradoInputs { angulo: number; microstep: string; __lang?: string; }
export interface StepperPasosGradoOutputs { pasosPorRev: string; pasosPorGrado: string; resumen: string; }
export function stepperPasosGrado(i: StepperPasosGradoInputs): StepperPasosGradoOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const a = Number(i.angulo); const ms = Number(i.microstep);
  if (!a || a <= 0) throw new Error(__lang === 'en' ? 'Enter step angle' : 'Ingresá ángulo por paso');
  const ppr = (360 / a) * ms;
  const ppg = ppr / 360;
  return { pasosPorRev: ppr.toFixed(0), pasosPorGrado: ppg.toFixed(2),
    resumen: __lang === 'en'
      ? `Stepper ${a}°/step with microstepping 1/${ms}: ${ppr} steps/rev (${ppg.toFixed(1)} steps/°).`
      : `Stepper ${a}°/paso con microstepping 1/${ms}: ${ppr} pasos/rev (${ppg.toFixed(1)} pasos/°).` };
}
