export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function darTiempoRelacionAntesVivirJuntos(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const meses=r;
  const tone = meses<6 ? 'warn' : meses<=18 ? 'good' : 'neutral';
  const lectura = meses<6
    ? `**${meses.toFixed(1)} meses** es un plazo corto: muchos terapeutas sugieren convivir recién cuando ya conociste a la otra persona en varias estaciones y situaciones de estrés.`
    : meses<=18
      ? `**${meses.toFixed(1)} meses** cae en la franja que la mayoría considera saludable para dar el paso de convivir sin apurarse ni estancarse.`
      : `**${meses.toFixed(1)} meses** es un plazo holgado: ya tendrías tiempo de sobra para conocerse; el límite suele ser más emocional que cronológico.`;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`,
    _insight: {
      title: 'Tu plazo sugerido',
      text: lectura,
      tone,
      icon: '💞',
    },
  };
}
