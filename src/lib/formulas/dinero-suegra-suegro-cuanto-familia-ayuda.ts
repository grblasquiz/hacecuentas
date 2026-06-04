export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function dineroSuegraSuegroCuantoFamiliaAyuda(i: Inputs): Outputs {
  const ingreso_neto = Number(i.ingreso_neto) || 0;
  const aporte_mensual = Number(i.aporte_mensual) || 0;
  const aportantes = Math.max(1, Math.round(Number(i.aportantes) || 1));

  if (ingreso_neto <= 0 || aporte_mensual < 0) {
    return {
      porcentaje_ingreso: '0.00',
      proyeccion_anual: '0',
      aporte_por_persona: '0',
      zona_riesgo: 'Completá los campos para ver el análisis',
      _insight: {
        title: 'Ayuda económica a familia',
        text: 'Ingresá tu ingreso neto y el monto mensual que aportás para ver el porcentaje y la proyección anual.',
        tone: 'neutral',
        icon: '👵',
      },
    };
  }

  // Core formula: percentage of net income going to family support
  const porcentaje = (aporte_mensual / ingreso_neto) * 100;

  // Annual projection
  const anual = aporte_mensual * 12;

  // Per-person contribution (if multiple siblings/in-law family share the load)
  const aporte_per_persona = aporte_mensual / aportantes;

  // Risk zone classification based on Pew Research / AARP research:
  // <5% = sporadic/occasional support
  // 5–15% = healthy range for regular support
  // 15–20% = attention zone, review savings
  // >20% = risk zone, can compromise own retirement/children education
  let zona: string;
  let tone: string;
  let zonaEmoji: string;
  if (porcentaje < 5) {
    zona = 'Apoyo ocasional (< 5%) — zona cómoda';
    tone = 'positive';
    zonaEmoji = '✅';
  } else if (porcentaje < 15) {
    zona = `Apoyo regular (${porcentaje.toFixed(1)}%) — zona saludable`;
    tone = 'positive';
    zonaEmoji = '✅';
  } else if (porcentaje <= 20) {
    zona = `Zona de atención (${porcentaje.toFixed(1)}%) — revisá tu ahorro propio`;
    tone = 'warning';
    zonaEmoji = '⚠️';
  } else {
    zona = `Zona de riesgo (${porcentaje.toFixed(1)}%) — puede comprometer tu jubilación y ahorro`;
    tone = 'alert';
    zonaEmoji = '🔴';
  }

  const insightText =
    aportantes > 1
      ? `El aporte mensual de **$${aporte_mensual.toLocaleString('es-AR')}** representa el **${porcentaje.toFixed(1)}%** de tu ingreso neto. Con ${aportantes} aportante${aportantes > 1 ? 's' : ''}, cada uno pone **$${Math.round(aporte_per_persona).toLocaleString('es-AR')}/mes** ($${Math.round(anual / aportantes).toLocaleString('es-AR')}/año). Total anual: **$${anual.toLocaleString('es-AR')}**. ${zonaEmoji} ${zona}.`
      : `El aporte mensual de **$${aporte_mensual.toLocaleString('es-AR')}** representa el **${porcentaje.toFixed(1)}%** de tu ingreso neto. Proyección anual: **$${anual.toLocaleString('es-AR')}**. ${zonaEmoji} ${zona}.`;

  const insight = {
    title: 'Tu análisis de ayuda familiar',
    text: insightText,
    tone,
    icon: '👵',
  };

  return {
    porcentaje_ingreso: porcentaje.toFixed(2),
    proyeccion_anual: Math.round(anual).toLocaleString('es-AR'),
    aporte_por_persona: Math.round(aporte_per_persona).toLocaleString('es-AR'),
    zona_riesgo: zona,
    _insight: insight,
  };
}
