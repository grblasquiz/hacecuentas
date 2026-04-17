/**
 * Ratio omega 6:3.
 */

export interface Omega36RatioInputs {
  omega6Gramos: number;
  omega3Gramos: number;
}

export interface Omega36RatioOutputs {
  ratio: string;
  evaluacion: string;
  recomendacion: string;
  resumen: string;
}

export function omega36Ratio(inputs: Omega36RatioInputs): Omega36RatioOutputs {
  const o6 = Number(inputs.omega6Gramos);
  const o3 = Number(inputs.omega3Gramos);
  if (!o3 || o3 <= 0) throw new Error('Ingresá omega-3 válido');
  const r = o6 / o3;
  let eval_: string, rec: string;
  if (r <= 4) { eval_ = 'Óptimo ✅'; rec = 'Mantené. Seguí con pescado 2-3/semana y oliva.'; }
  else if (r <= 10) { eval_ = 'Subóptimo ⚠️'; rec = 'Reducí aceite girasol/soja, subí pescado y semillas.'; }
  else { eval_ = 'Proinflamatorio 🚨'; rec = 'Urgente: eliminá aceites vegetales y suplementá EPA/DHA 1-2 g/día.'; }
  return {
    ratio: r.toFixed(1) + ':1',
    evaluacion: eval_,
    recomendacion: rec,
    resumen: `Tu ratio 6:3 es ${r.toFixed(1)}:1 - ${eval_}`,
  };
}
