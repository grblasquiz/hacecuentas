/** Espresso TDS yield */
export interface Inputs { dosisIn: number; yieldOut: number; tiempoExtraccion: number; tdsMedido?: number; }
export interface Outputs { ratio: string; tipoEspresso: string; extractionYield: number; evaluacion: string; recomendacion: string; _insight?: any; _chart?: any; }

export function espressoTdsYield(i: Inputs): Outputs {
  const d = Number(i.dosisIn);
  const y = Number(i.yieldOut);
  const t = Number(i.tiempoExtraccion);
  const tds = Number(i.tdsMedido) || 0;
  if (!d || d <= 0) throw new Error('Ingresá dosis');
  if (!y || y <= 0) throw new Error('Ingresá yield');
  if (!t) throw new Error('Ingresá tiempo');

  const ratio = y / d;
  const ratioStr = `1:${ratio.toFixed(2)}`;

  let tipo = '';
  if (ratio < 1.2) tipo = 'Ristretto intenso';
  else if (ratio < 1.6) tipo = 'Ristretto';
  else if (ratio < 2.3) tipo = 'Normale / Espresso estándar';
  else if (ratio < 3.2) tipo = 'Lungo';
  else tipo = 'Americano-like';

  const ey = tds > 0 ? (tds * y / d) : 0;

  let eval_ = '';
  if (t < 20) eval_ = 'Sub-extracción por tiempo';
  else if (t > 35) eval_ = 'Sobre-extracción por tiempo';
  else eval_ = 'Tiempo en rango ideal';

  let rec = '';
  if (ey > 0) {
    if (ey < 18) rec = 'EY bajo — moler más fino o aumentar dosis.';
    else if (ey > 22) rec = 'EY alto — moler más grueso o bajar temperatura.';
    else rec = 'EY en rango ideal SCA (18-22%).';
  } else if (t < 22) {
    rec = 'Tiempo rápido — moler más fino.';
  } else if (t > 32) {
    rec = 'Tiempo lento — moler más grueso.';
  } else {
    rec = 'Parámetros balanceados. Probá distintos ratios para ajustar al gusto.';
  }

  const eyR = Number(ey.toFixed(1));

  let _insight: any;
  if (ey > 0) {
    const enRango = ey >= 18 && ey <= 22;
    _insight = {
      title: enRango ? 'Extracción en rango SCA' : (ey < 18 ? 'Sub-extracción' : 'Sobre-extracción'),
      text: `Ratio **${ratioStr}** (${tipo}) con un extraction yield de **${eyR}%**. ${enRango ? 'Caés dentro de la ventana ideal SCA (**18-22%**): tasa, dulzor y cuerpo balanceados.' : (ey < 18 ? 'Estás por debajo del **18%** ideal: la taza tiende a ácida y sub-desarrollada. Mové la molienda más fina o subí la dosis.' : 'Estás por encima del **22%** ideal: aparecen notas amargas y astringentes. Mové la molienda más gruesa o bajá la temperatura.')}`,
      tone: enRango ? 'good' : 'warn',
      icon: '☕',
    };
  } else {
    const tiempoOk = t >= 20 && t <= 35;
    _insight = {
      title: `Espresso ${ratioStr} — ${tipo}`,
      text: `Con **${d}** g de dosis y **${y}** g en taza obtenés un ratio **${ratioStr}** (${tipo}) en **${t}** s. ${tiempoOk ? 'El tiempo está en rango ideal (**20-35 s**).' : (t < 20 ? 'El tiempo es corto (**<20 s**), señal de molienda gruesa o sub-extracción.' : 'El tiempo es largo (**>35 s**), señal de molienda fina o sobre-extracción.')} Ingresá el TDS medido para estimar el extraction yield.`,
      tone: tiempoOk ? 'good' : 'warn',
      icon: '☕',
    };
  }

  const out: Outputs = {
    ratio: ratioStr,
    tipoEspresso: tipo,
    extractionYield: eyR,
    evaluacion: eval_,
    recomendacion: rec,
    _insight,
  };

  if (ey > 0) {
    out._chart = {
      type: 'scale',
      marker: eyR,
      markerLabel: `${eyR}%`,
      min: 14,
      segments: [
        { nombre: 'Sub-extraído', max: 18, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Ideal SCA', max: 22, color: '#16a34a', colorDark: '#15803d' },
        { nombre: 'Sobre-extraído', max: Math.max(26, Math.ceil(eyR) + 1), color: '#dc2626', colorDark: '#b91c1c' },
      ],
      ariaLabel: `Extraction yield de ${eyR}% en la escala SCA (ideal 18-22%)`,
    };
  }

  return out;
}
