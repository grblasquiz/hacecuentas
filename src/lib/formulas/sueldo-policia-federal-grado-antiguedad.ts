export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoPoliciaFederalGradoAntiguedad(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  // Haber mensual de referencia por grado (PFA). Valores ORIENTATIVOS: el haber real
  // lo fija el decreto del PEN de actualización salarial vigente. Verificá la escala
  // oficial publicada por el Ministerio de Seguridad / PFA.
  const haberPorGrado: Record<string, number> = {
    agente: 1100000,
    cabo: 1180000,
    cabo1: 1250000,
    sargento: 1340000,
    subofsub: 1450000,
    ofasis: 1600000,
    ofprin: 1850000,
    subcomi: 2150000,
    comi: 2500000,
  };
  const grado = String(i.grado || 'agente');
  const basico = haberPorGrado[grado] ?? 1100000;
  const plusAntig=basico*0.02*antig;
  const bruto=basico+plusAntig;
  // Régimen previsional ESPECIAL: Caja de Retiros, Jubilaciones y Pensiones de la PFA
  // (Ley 21.965) + obra social OSFPF. El personal policial NO aporta a ANSES/SIPA ni a PAMI.
  // Alícuotas combinadas de referencia (verificar resolución vigente de la Caja y OSFPF).
  const cajaRetiros=bruto*0.13;
  const obraSocial=bruto*0.05;
  const neto=bruto-cajaRetiros-obraSocial;
  const sac=bruto/12;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Tu sueldo policial',
    text: `Como **${grado}** con **${antig} años** de antigüedad, el adicional suma **$${fmt(plusAntig)}** sobre el haber y cobrás bruto **$${fmt(bruto)}**. Tras los aportes a la Caja de Retiros PFA (~13%) y a la obra social OSFPF (~5%), de bolsillo te quedan **$${fmt(neto)}**. Valores de referencia: el haber real lo fija el decreto vigente.`,
    tone: 'neutral' as 'warn' | 'neutral',
    icon: '👮',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Caja Retiros PFA (~13%)', value: Math.round(cajaRetiros) },
      { label: 'OSFPF (~5%)', value: Math.round(obraSocial) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto más aportes a la Caja de Retiros PFA y obra social OSFPF.',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Haber orientativo (${grado}): $${basico.toLocaleString('es-AR')}. Con ${antig} años de antigüedad, neto estimado ~$${Math.round(neto).toLocaleString('es-AR')} (tras Caja de Retiros PFA + OSFPF).`,
    _insight: insight,
    _chart: chart
  };
}
