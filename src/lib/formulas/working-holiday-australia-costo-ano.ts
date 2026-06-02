export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function workingHolidayAustraliaCostoAno(i: Inputs): Outputs {
  const m=Number(i.mesesPlan)||12;
  const visa=500; const savings=5000; const boletoVuelta=1500;
  const viviendaInicial=2000;
  const tot=visa+savings+boletoVuelta+viviendaInicial;

  const _insight = {
    title: 'Cuánto necesitás para arrancar',
    text: `Para una Working Holiday de **${m} meses** en Australia conviene llegar con unos **AUD ${tot.toLocaleString('en-US')}**: visa (AUD 500), fondos mínimos exigidos (~AUD 5.000), pasaje de vuelta (AUD 1.500) y vivienda inicial (AUD 2.000). Sumá **AUD 3.000-5.000 de colchón** por imprevistos hasta conseguir tu primer sueldo.`,
    tone: 'warn' as const,
    icon: '🦘',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fondos exigidos', value: savings },
      { label: 'Vivienda inicial', value: viviendaInicial },
      { label: 'Pasaje de vuelta', value: boletoVuelta },
      { label: 'Visa', value: visa },
    ],
    prefix: 'AUD ',
    centerValue: `AUD ${tot.toLocaleString('en-US')}`,
    centerLabel: 'Costo inicial',
    ariaLabel: `Desglose del costo inicial de AUD ${tot.toLocaleString('en-US')}: AUD ${savings} de fondos exigidos, AUD ${viviendaInicial} de vivienda inicial, AUD ${boletoVuelta} de pasaje de vuelta y AUD ${visa} de visa.`,
  };

  return { costoInicial:`AUD ${tot.toLocaleString('en-US')}`, visaAud:`AUD 500`, buffer:`AUD 3000-5000 adicional recomendado por contingencias.`, _insight, _chart };
}
