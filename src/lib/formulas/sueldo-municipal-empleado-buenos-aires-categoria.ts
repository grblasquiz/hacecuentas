export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoMunicipalEmpleadoBuenosAiresCategoria(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  // Valor de referencia del básico categoría 1 (piso paritario SUM-FEMA, orientativo).
  // Las paritarias municipales bonaerenses NO publican una grilla única: cada municipio
  // mejora el piso provincial. Verificá el acta paritaria SUM vigente de tu distrito.
  const BASICO_CAT1 = 950000;
  // Coeficiente relativo aproximado por categoría SUM (1 a 14). Orientativo.
  const coef: Record<string, number> = {
    cat1: 1.00, cat4: 1.30, cat7: 1.65, cat10: 2.05, cat12: 2.40,
  };
  const cat = String(i.categoria || 'cat1');
  const factor = coef[cat] ?? 1.00;
  const basico = Math.round(BASICO_CAT1 * factor);
  const plusAntig=basico*0.01*antig;
  const bruto=basico+plusAntig;
  // Régimen previsional bonaerense (NO nacional): IPS Decreto-Ley 9650/80.
  // Aporte personal del trabajador: 14% (Art. 22). Obra social IOMA (Ley 6982): ~4,8% del trabajador.
  // Los municipales NO aportan a ANSES/PAMI: tienen IPS + IOMA.
  const ips=bruto*0.14;
  const ioma=bruto*0.048;
  const neto=bruto-ips-ioma;
  const sac=bruto/12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'IPS (14%)', value: Math.round(ips) },
      { label: 'IOMA (4,8%)', value: Math.round(ioma) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto más aportes previsionales (IPS) y de obra social (IOMA).',
  };
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico orientativo categoría ${cat.replace('cat','')}: $${basico.toLocaleString('es-AR')}. Con ${antig} años de antigüedad, neto estimado ~$${Math.round(neto).toLocaleString('es-AR')} (tras IPS 14% + IOMA 4,8%).`,
    _insight: {
      title: 'Tu sueldo municipal en mano',
      text: `Con **${antig} años** de antigüedad, el plus suma **${fmt(plusAntig)}** y tu bruto llega a **${fmt(bruto)}**. En mano te quedan **${fmt(neto)}** tras los aportes al IPS (14%) y a IOMA (4,8%). Valores de referencia: el básico real lo fija la paritaria SUM de tu municipio.`,
      tone: 'neutral',
      icon: '🏛️',
    },
    _chart: chart
  };
}
