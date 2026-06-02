export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoSuperarRupturaRelacionMeses(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const meses = Math.round(r * 10) / 10;
  const _insight = {
    title: 'Tiempo estimado de recuperación',
    text: meses <= 3
      ? `La estimación da unos **${meses} meses** para sentirte mejor: es un duelo corto, date permiso igual para procesarlo sin apuro.`
      : `La estimación ronda los **${meses} meses** para volver a sentirte bien. Es solo orientativo: cada duelo es distinto y apoyarte en gente de confianza acorta el camino.`,
    tone: 'neutral',
    icon: '💔',
  };
  const out: any = { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
  return out;
}
