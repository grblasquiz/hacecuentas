/** Kg de compost generado por mes a partir de residuos orgánicos */
export interface Inputs { personas: number; kgOrganicoDiario: number; }
export interface Outputs { kgOrganicoMes: number; kgCompostMes: number; litrosCompostMes: number; kgDesviadosRelleno: number; detalle: string; _insight?: any; _chart?: any; }

export function compostajeResiduosOrganicos(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const kgDia = Number(i.kgOrganicoDiario);

  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (!kgDia || kgDia <= 0) throw new Error('Ingresá los kg de residuos orgánicos por día');

  const factorReduccion = 0.35;
  const densidadCompost = 0.6;

  const kgOrganicoMes = kgDia * 30;
  const kgCompostMes = kgOrganicoMes * factorReduccion;
  const litrosCompostMes = kgCompostMes / densidadCompost;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  const kgPerdida = kgOrganicoMes - kgCompostMes;
  const kgAnual = kgOrganicoMes * 12;
  const _insight = {
    title: `${fmt.format(kgCompostMes)} kg de compost por mes`,
    text: `Entre ${personas} persona${personas === 1 ? '' : 's'} generás **${fmt.format(kgOrganicoMes)} kg de orgánicos al mes**, que rinden **${fmt.format(kgCompostMes)} kg de compost** (~${fmt.format(litrosCompostMes)} litros). Así desviás **${fmt.format(kgAnual)} kg al año** del relleno sanitario.`,
    tone: 'good',
    icon: '♻️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Compost final', value: Number(kgCompostMes.toFixed(1)) },
      { label: 'Agua y CO₂ liberados', value: Number(kgPerdida.toFixed(1)) },
    ],
    prefix: '',
    centerValue: `${fmt.format(kgOrganicoMes)} kg`,
    centerLabel: 'Orgánicos/mes',
    ariaLabel: `De ${fmt.format(kgOrganicoMes)} kg de orgánicos, ${fmt.format(kgCompostMes)} kg se vuelven compost`,
  };

  return {
    kgOrganicoMes: Number(kgOrganicoMes.toFixed(1)),
    kgCompostMes: Number(kgCompostMes.toFixed(1)),
    litrosCompostMes: Number(litrosCompostMes.toFixed(0)),
    kgDesviadosRelleno: Number(kgOrganicoMes.toFixed(1)),
    detalle: `${fmt.format(kgDia)} kg/día × 30 = ${fmt.format(kgOrganicoMes)} kg orgánicos/mes × 0,35 = ${fmt.format(kgCompostMes)} kg compost (${fmt.format(litrosCompostMes)} litros). Desviás ${fmt.format(kgOrganicoMes)} kg del relleno sanitario.`,
    _insight,
    _chart,
  };
}
