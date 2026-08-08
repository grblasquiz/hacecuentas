/** Priming sugar */
export interface Inputs { volumenCerveza: number; volumenesCO2: number; temperaturaFermentacion: number; tipoAzucar: string; __lang?: string; }
export interface Outputs { gramosAzucar: number; co2Residual: number; gramosOnzas: string; recomendacion: string; _insight?: any; _chart?: any; }

export function primingSugarCarbonatacionCerveza(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const TR = ({
    es: {
      errVolumen: 'Ingresá volumen',
      errCO2: 'Ingresá volúmenes CO2',
      recAlta: 'ALTA carbonatación — usá botellas belgas gruesas, riesgo en botellas estándar.',
      recBaja: 'Baja carbonatación estilo British — servir fresca.',
      recEstandar: 'Carbonatación estándar — cualquier botella comercial sirve.',
      insTitle: 'Azúcar de cebado a agregar',
      insText: (g: string, oz: string, v: string, co2: string, tipo: string, res: string) =>
        `Agregá **${g} g** de ${tipo} (**${oz} oz**) a tus **${v} L** para llegar a **${co2} vol** de CO2. La fermentación ya dejó **${res} vol** residuales, así que solo cebás la diferencia.`,
      insWarn: 'A más de 3,5 vol el riesgo de botellas reventadas es real: usá envases gruesos.',
      gaugeMarker: 'tu objetivo',
      gaugeAria: 'Nivel de carbonatación objetivo en volúmenes de CO2',
      segBaja: 'Baja (British)',
      segEstandar: 'Estándar',
      segAlta: 'Alta (riesgo)',
    },
    en: {
      errVolumen: 'Enter beer volume',
      errCO2: 'Enter CO2 volumes',
      recAlta: 'HIGH carbonation — use thick Belgian bottles, risk with standard bottles.',
      recBaja: 'Low carbonation British style — serve fresh.',
      recEstandar: 'Standard carbonation — any commercial bottle works.',
      insTitle: 'Priming sugar to add',
      insText: (g: string, oz: string, v: string, co2: string, tipo: string, res: string) =>
        `Add **${g} g** of ${tipo} (**${oz} oz**) to your **${v} L** to reach **${co2} vol** of CO2. Fermentation already left **${res} vol** residual, so you only prime the difference.`,
      insWarn: 'Above 3.5 vol the risk of exploding bottles is real: use thick-walled bottles.',
      gaugeMarker: 'your target',
      gaugeAria: 'Target carbonation level in CO2 volumes',
      segBaja: 'Low (British)',
      segEstandar: 'Standard',
      segAlta: 'High (risk)',
    },
  } as const)[__lang];

  const V = Number(i.volumenCerveza);
  const objCO2 = Number(i.volumenesCO2);
  const T = Number(i.temperaturaFermentacion);
  const tipo = String(i.tipoAzucar || 'dextrosa');
  if (!V || V <= 0) throw new Error(TR.errVolumen);
  if (!objCO2 || objCO2 <= 0) throw new Error(TR.errCO2);

  // El polinomio clásico de CO2 residual espera °F; el input llega en °C.
  const TF = T * 9 / 5 + 32;
  const residual = 3.0378 - 0.050062 * TF + 0.00026555 * TF * TF;
  const delta = Math.max(0, objCO2 - residual);
  const factores: Record<string, number> = { dextrosa: 3.86, sacarosa: 3.51, dme: 4.50, miel: 4.26 };
  const f = factores[tipo] ?? 3.86;
  const gramos = delta * V * f;
  const onzas = gramos / 28.3495;

  let rec = '';
  if (objCO2 > 3.5) rec = TR.recAlta;
  else if (objCO2 < 1.8) rec = TR.recBaja;
  else rec = TR.recEstandar;

  // Insight narrativo
  const _insight = {
    title: TR.insTitle,
    text: TR.insText(gramos.toFixed(0), onzas.toFixed(2), String(V), objCO2.toFixed(1), tipo, residual.toFixed(2))
      + (objCO2 > 3.5 ? ' ' + TR.insWarn : ''),
    tone: objCO2 > 3.5 ? 'warn' : 'neutral',
    icon: '🍺',
  };

  // Gráfico gauge: dónde cae el objetivo de carbonatación
  const lastMax = Math.max(6, objCO2 + 0.5);
  const _chart = {
    type: 'scale',
    marker: Number(objCO2.toFixed(2)),
    markerLabel: TR.gaugeMarker,
    min: 0,
    segments: [
      { nombre: TR.segBaja, max: 1.8, color: '#93c5fd', colorDark: '#3b82f6' },
      { nombre: TR.segEstandar, max: 3.5, color: '#86efac', colorDark: '#22c55e' },
      { nombre: TR.segAlta, max: lastMax, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: TR.gaugeAria,
  };

  return {
    gramosAzucar: Number(gramos.toFixed(1)),
    co2Residual: Number(residual.toFixed(2)),
    gramosOnzas: `${gramos.toFixed(0)}g = ${onzas.toFixed(2)} oz`,
    recomendacion: rec,
    _insight,
    _chart,
  };
}
