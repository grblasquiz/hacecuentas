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
  _insight?: any;
  _chart?: any;
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
  const tone = r <= 4 ? 'good' : r <= 10 ? 'warn' : 'warn';
  const insightText = r <= 4
    ? `Tu ratio omega 6:3 es **${r.toFixed(1)}:1**, dentro del rango antiinflamatorio ideal (≤4:1). Es un perfil parecido al de las dietas mediterránea y ancestral.`
    : r <= 10
    ? `Tu ratio omega 6:3 es **${r.toFixed(1)}:1**: por encima del ideal de **4:1** pero lejos del patrón occidental típico (15-20:1). Bajando aceites de girasol/soja y sumando pescado lo acercás al objetivo.`
    : `Tu ratio omega 6:3 es **${r.toFixed(1)}:1**, en zona proinflamatoria (>10:1). Es el desbalance asociado a la dieta occidental moderna; conviene corregirlo cuanto antes.`;

  // Marker para el gauge: el ratio crudo puede dispararse, lo acotamos visualmente a 16
  const markerVal = Math.min(r, 16);
  const lastMax = Math.max(20, Math.ceil(markerVal) + 1);

  return {
    ratio: r.toFixed(1) + ':1',
    evaluacion: eval_,
    recomendacion: rec,
    resumen: `Tu ratio 6:3 es ${r.toFixed(1)}:1 - ${eval_}`,
    _insight: {
      title: 'Tu balance omega 6:3',
      text: insightText,
      tone,
      icon: '🐟',
    },
    _chart: {
      type: 'scale',
      marker: Number(markerVal.toFixed(1)),
      markerLabel: `${r.toFixed(1)}:1`,
      min: 0,
      segments: [
        { nombre: 'Óptimo', max: 4, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Subóptimo', max: 10, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Proinflamatorio', max: lastMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Ratio omega 6:3 de ${r.toFixed(1)} a 1 sobre una escala de zonas: óptimo hasta 4, subóptimo hasta 10, proinflamatorio por encima`,
    },
  };
}
