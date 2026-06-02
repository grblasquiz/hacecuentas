export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function emigrarEspanaPresupuestoInicial6meses(i: Inputs): Outputs {
  const c=String(i.ciudad||'madrid');
  const alquiler=({'madrid':1400,'barcelona':1500,'valencia':900,'sevilla':800,'otras':750} as Record<string, number>)[c] ?? 750;
  const comida=400; const transporte=60;
  const otros=300;
  const mensual=alquiler+comida+transporte+otros;
  const buffer=2500;
  const sixMonths=mensual*6+buffer; // buffer
  const ciudadNombre=({'madrid':'Madrid','barcelona':'Barcelona','valencia':'Valencia','sevilla':'Sevilla','otras':'otras ciudades'} as Record<string, string>)[c] ?? 'Madrid';
  const eur=(n: number)=>`EUR ${Math.round(n).toLocaleString('en-US')}`;
  const _insight = {
    title: 'Lo que necesitás para arrancar',
    text: `Para instalarte en **${ciudadNombre}** con 6 meses cubiertos calculá unos **${eur(sixMonths)}**: cubre **${eur(mensual)}/mes** de vida (el alquiler de ~**${eur(alquiler)}** es el grueso) más un colchón de **${eur(buffer)}** para depósito, mudanza y gastos del arranque.`,
    tone: 'warn' as const,
    icon: '🛫',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Alquiler (6m)', value: alquiler*6 },
      { label: 'Comida (6m)', value: comida*6 },
      { label: 'Transporte (6m)', value: transporte*6 },
      { label: 'Otros gastos (6m)', value: otros*6 },
      { label: 'Colchón inicial', value: buffer },
    ],
    prefix: 'EUR ',
    centerValue: eur(sixMonths),
    centerLabel: 'Total 6 meses',
    ariaLabel: `Presupuesto inicial de ${eur(sixMonths)} para 6 meses en ${ciudadNombre}: alquiler, comida, transporte, otros gastos y un colchón inicial de ${eur(buffer)}.`,
  };
  return { costoInicial:`EUR ${Math.round(sixMonths).toLocaleString('en-US')}`, alquilerMes:`EUR ${alquiler}/mes (1 bedroom)`, observaciones:`Gastos mensuales ~EUR ${mensual}. Buffer 6 meses.`, _insight, _chart };
}
