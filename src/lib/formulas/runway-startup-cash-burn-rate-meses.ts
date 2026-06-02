export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; _chart?: any; }
export function runwayStartupCashBurnRateMeses(i: Inputs): Outputs {
  const c=Number(i.cashDisponible)||0; const b=Number(i.burnMensual)||1;
  const m=c/b;
  const fechaDias=m*30;
  const fecha=new Date(Date.now()+fechaDias*86400000);
  let rec='';
  if(m>18) rec='Cómodo. Enfocate en ejecución.';
  else if(m>12) rec='OK. Planifica próxima ronda en 6 meses.';
  else if(m>6) rec='Empieza fundraising YA o reducir burn.';
  else rec='CRÍTICO. Layoffs, pivot o cerrar.';

  const mF = m.toFixed(1);
  const insight = {
    title:
      m > 18 ? 'Runway cómodo' :
      m > 12 ? 'Runway saludable' :
      m > 6 ? 'Empezá a levantar capital' : 'Runway crítico',
    text:
      m > 18
        ? `Con el burn actual tenés **${mF} meses** de pista (caja agotada el **${fecha.toISOString().slice(0,10)}**). Sobra margen: enfocate en crecer y ejecutar.`
        : m > 12
        ? `Tenés **${mF} meses** de runway (caja a cero el **${fecha.toISOString().slice(0,10)}**). Suficiente, pero arrancá a planificar la próxima ronda en ~6 meses.`
        : m > 6
        ? `Solo **${mF} meses** de pista (caja agotada el **${fecha.toISOString().slice(0,10)}**). Levantá capital YA o recortá burn: una ronda tarda meses en cerrar.`
        : `Apenas **${mF} meses** de caja (a cero el **${fecha.toISOString().slice(0,10)}**). Situación crítica: recortes, pivot o cierre antes de quedarte sin efectivo.`,
    tone: m > 12 ? 'good' : 'warn',
    icon: m > 12 ? '🛫' : '🔥',
  };

  // Gauge: meses de runway por zona de urgencia
  const chart = {
    type: 'scale' as const,
    marker: Number(m.toFixed(1)),
    markerLabel: `${mF} meses`,
    min: 0,
    unit: ' m',
    segments: [
      { nombre: 'Crítico', max: 6, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Levantar capital', max: 12, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Saludable', max: 18, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Cómodo', max: Math.max(24, Math.ceil(m) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de meses de runway: crítico, levantar capital, saludable, cómodo.',
  };

  return { runwayMeses:`${mF} meses`, fechaLimite:fecha.toISOString().slice(0,10), recomendacion:rec, _insight: insight, _chart: chart };
}
