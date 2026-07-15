export interface HomaInputs { glucosa: number; unidadGlucosa: string; insulina: number; }
export interface HomaOutputs { homaIr: number; homaBeta: number; quicki: number; glucosaMmol: number; interpretacion: string; advertencia: string; _insight?: any; }
export function homaIrQuicki(i: HomaInputs): HomaOutputs {
  const glucosaRaw = Number(i.glucosa), insulina = Number(i.insulina);
  if (!(glucosaRaw > 0) || !(insulina > 0)) throw new Error('Ingresá glucosa e insulina en ayunas mayores que cero');
  const mmol = i.unidadGlucosa === 'mmol' ? glucosaRaw : glucosaRaw / 18;
  if (mmol < 1 || mmol > 40 || insulina > 500) throw new Error('Revisá las unidades y los valores ingresados');
  const mgdl = mmol * 18;
  const homaIr = mmol * insulina / 22.5;
  const homaBeta = 20 * insulina / Math.max(0.1, mmol - 3.5);
  const quicki = 1 / (Math.log10(insulina) + Math.log10(mgdl));
  const interpretacion = 'No existe un punto de corte universal: edad, población, laboratorio y contexto clínico cambian la interpretación.';
  const advertencia = 'Resultado educativo. No diagnostica resistencia a la insulina ni reemplaza la evaluación médica.';
  return { homaIr: Number(homaIr.toFixed(2)), homaBeta: Number(homaBeta.toFixed(1)), quicki: Number(quicki.toFixed(3)), glucosaMmol: Number(mmol.toFixed(2)), interpretacion, advertencia,
    _insight: { title: `HOMA-IR estimado: ${homaIr.toFixed(2)}`, text: `Con glucosa de **${mmol.toFixed(2)} mmol/L** e insulina de **${insulina.toFixed(2)} µU/mL**, QUICKI es **${quicki.toFixed(3)}**. El valor no debe leerse con un umbral universal ni usarse para autodiagnóstico.`, tone: 'neutral', icon: '🧪' } };
}
