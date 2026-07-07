export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function contratoLocacionEnDolaresUsdPesificacion(i: Inputs): Outputs {
  const u=Number(i.alquilerUsd)||0; const c=String(i.dolar||'mep');
  const cotiz: Record<string,number> = { of:1400, mep:1450, blue:1500 };
  const tasa=cotiz[c]||1450;
  const v=u*tasa;
  const pesosFmt='$'+v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const nombreDolar: Record<string,string> = { of:'oficial', mep:'MEP', blue:'blue' };
  const _insight = {
    title: 'Pesificación de tu alquiler en USD',
    text: u>0
      ? `Un alquiler de **USD ${u}** equivale hoy a **${pesosFmt}** al dólar ${nombreDolar[c]||c} (${tasa.toLocaleString('es-AR')} $/USD). Si cobrás en pesos, esa cuota **sube cada mes** que se devalúe el peso.`
      : 'Ingresá el **monto del alquiler en USD** para ver cuánto pagarías hoy en pesos.',
    tone: 'warn',
    icon: '🏠',
  };
  return { enPesos:pesosFmt, pros:'Protección vs inflación AR', contras:'Sueldo ARS: riesgo devaluación', resumen:`USD ${u} @ ${c}: $${v.toFixed(0)}.`, _insight };
}
