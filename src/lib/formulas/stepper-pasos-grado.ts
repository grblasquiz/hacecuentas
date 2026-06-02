export interface StepperPasosGradoInputs { angulo: number; microstep: string; __lang?: string; }
export interface StepperPasosGradoOutputs { pasosPorRev: string; pasosPorGrado: string; resumen: string; _insight?: any; }
export function stepperPasosGrado(i: StepperPasosGradoInputs): StepperPasosGradoOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a = Number(i.angulo); const ms = Number(i.microstep);
  if (!a || a <= 0) throw new Error(__lang === 'en' ? 'Enter step angle' : __lang === 'pt' ? 'Informe o ângulo por passo' : 'Ingresá ángulo por paso');
  const ppr = (360 / a) * ms;
  const ppg = ppr / 360;
  const pprFmt = ppr.toFixed(0);
  const ppgFmt = ppg.toFixed(1);
  const _insight = {
    title: __lang === 'en' ? 'Angular resolution' : __lang === 'pt' ? 'Resolução angular' : 'Resolución angular',
    text: __lang === 'en'
      ? `Each step moves **${a}°** and with 1/${ms} microstepping you get **${pprFmt} steps/rev** (${ppgFmt} steps per degree). Higher microstepping means smoother motion but lower torque per step.`
      : __lang === 'pt'
      ? `Cada passo move **${a}°** e com microstepping 1/${ms} você obtém **${pprFmt} passos/rot** (${ppgFmt} passos por grau). Mais microstepping significa movimento mais suave mas menos torque por passo.`
      : `Cada paso mueve **${a}°** y con microstepping 1/${ms} tenés **${pprFmt} pasos/rev** (${ppgFmt} pasos por grado). Más microstepping da movimiento más suave pero menos torque por paso.`,
    tone: 'neutral',
    icon: '⚙️',
  };
  return { pasosPorRev: pprFmt, pasosPorGrado: ppg.toFixed(2),
    resumen: __lang === 'en'
      ? `Stepper ${a}°/step with microstepping 1/${ms}: ${ppr} steps/rev (${ppg.toFixed(1)} steps/°).`
      : __lang === 'pt'
      ? `Motor de passo ${a}°/passo com microstepping 1/${ms}: ${ppr} passos/rot (${ppg.toFixed(1)} passos/°).`
      : `Stepper ${a}°/paso con microstepping 1/${ms}: ${ppr} pasos/rev (${ppg.toFixed(1)} pasos/°).`,
    _insight };
}
