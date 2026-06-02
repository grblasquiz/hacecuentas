export interface FuenteDcWattsAmperajeInputs { v: number; cargas: number; factor?: number; __lang?: string; }
export interface FuenteDcWattsAmperajeOutputs { potencia: string; corriente: string; corrienteMinima: string; resumen: string; _insight?: any; _chart?: any; }
export function fuenteDcWattsAmperaje(i: FuenteDcWattsAmperajeInputs): FuenteDcWattsAmperajeOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v = Number(i.v); const p = Number(i.cargas); const f = Number(i.factor ?? 1.3);
  if (!v || v <= 0 || !p || p <= 0) throw new Error(__lang === 'en' ? 'Enter V and loads' : 'Ingresá V y cargas');
  const pRec = p * f; const iMin = p / v; const iRec = pRec / v;
  const margenW = pRec - p; const margenPct = (f - 1) * 100;
  const _insight = {
    title: __lang === 'en' ? 'Power supply sizing' : 'Dimensionado de la fuente',
    text: __lang === 'en'
      ? `Your loads draw **${p.toFixed(0)} W** (${iMin.toFixed(2)} A at ${v} V). Adding a **${margenPct.toFixed(0)}% margin**, pick a supply of at least **${iRec.toFixed(1)} A** (${pRec.toFixed(0)} W) so it never runs at full capacity.`
      : `Tus cargas consumen **${p.toFixed(0)} W** (${iMin.toFixed(2)} A a ${v} V). Sumando un **margen del ${margenPct.toFixed(0)}%**, elegí una fuente de al menos **${iRec.toFixed(1)} A** (${pRec.toFixed(0)} W) para que nunca trabaje al límite.`,
    tone: 'neutral',
    icon: '🔌',
  };
  const _chart = margenW > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Load' : 'Carga', value: Number(p.toFixed(1)) },
      { label: __lang === 'en' ? 'Safety margin' : 'Margen de seguridad', value: Number(margenW.toFixed(1)) },
    ],
    suffix: ' W',
    centerValue: pRec.toFixed(0) + ' W',
    centerLabel: __lang === 'en' ? 'Recommended' : 'Recomendada',
    ariaLabel: __lang === 'en'
      ? `Recommended power supply ${pRec.toFixed(0)} W: ${p.toFixed(0)} W load plus ${margenW.toFixed(0)} W margin`
      : `Fuente recomendada de ${pRec.toFixed(0)} W: ${p.toFixed(0)} W de carga más ${margenW.toFixed(0)} W de margen`,
  } : undefined;
  return {
    potencia: pRec.toFixed(1) + ' W',
    corriente: iRec.toFixed(2) + ' A',
    corrienteMinima: iMin.toFixed(2) + ' A',
    resumen: __lang === 'en'
      ? `Power supply ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) with ${((f-1)*100).toFixed(0)}% margin. Absolute minimum: ${iMin.toFixed(1)} A.`
      : `Fuente ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) con ${((f-1)*100).toFixed(0)}% de margen. Mínimo absoluto: ${iMin.toFixed(1)} A.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
