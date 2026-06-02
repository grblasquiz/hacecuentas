/** Conversor: cuadra ↔ metro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorCuadrasAMetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 100.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'cuadras'; toLabel = 'metros';
  } else {
    r = v / factor;
    fromLabel = 'metros'; toLabel = 'cuadras';
  }

  const cuadras = d === 'ida' ? v : r;
  const metros = d === 'ida' ? r : v;
  // Caminata a paso normal: ~5 km/h ≈ 83 m/min.
  const minutos = metros / 83;
  let caminata = '';
  if (minutos >= 1) {
    caminata = ' Caminando a paso normal son unos **' + minutos.toFixed(minutos < 10 ? 1 : 0).replace(/\.0$/, '') + ' minutos** a pie.';
  }
  const insight = {
    title: 'Cuánto es esta distancia',
    text: '**' + cuadras.toFixed(2).replace(/\.?0+$/, '') + ' cuadras** equivalen a **' + metros.toFixed(0) + ' m**, tomando la cuadra típica argentina de **100 m**.' + caminata,
    tone: 'neutral',
    icon: '🚶'
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
