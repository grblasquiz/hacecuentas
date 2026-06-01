export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }
export function sueldoMunicipalEmpleadoBuenosAiresCategoria(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico=1050000;
  const plusAntig=basico*0.01*antig;
  const bruto=basico+plusAntig;
  const jubilacion=bruto*0.11;
  const obraSocial=bruto*0.03;
  const pami=bruto*0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Jubilación (11%)', value: Math.round(jubilacion) },
      { label: 'Obra social (3%)', value: Math.round(obraSocial) },
      { label: 'PAMI (3%)', value: Math.round(pami) },
      ...(ganancias > 0 ? [{ label: 'Ganancias', value: Math.round(ganancias) }] : []),
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto más aportes (jubilación, obra social, PAMI) y Ganancias.',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años y cargas: neto ~$${neto.toFixed(0)}.`,
    _chart: chart
  };
}
