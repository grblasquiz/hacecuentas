export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function kilosEquipajeViajeBebeDias(i: Inputs): Outputs {
  const d=Number(i.dias)||0; const m=Number(i.edadMes)||0;
  const base=5; const porDia=m<12?1.5:1;
  const kg=base+d*porDia;
  const text = m<12
    ? `Para **${d} día${d===1?'':'s'}** con un bebé de **${m} mes${m===1?'':'es'}** calculá unos **${kg.toFixed(0)} kg**. Antes del año pesa más porque cargás pañales y fórmula a razón de 1,5 kg por día.`
    : `Para **${d} día${d===1?'':'s'}** con un peque de **${m} meses** calculá unos **${kg.toFixed(0)} kg**, sobre una base fija de 5 kg (cochecito y silla) más 1 kg por día.`;
  return {
    kg:`${kg.toFixed(1)} kg`,
    items:'Pañales, ropa, fórmula, cochecito, silla auto',
    resumen:`${d} días con bebé ${m}m: ~${kg.toFixed(0)}kg.`,
    _insight: {
      title: 'Cuánto vas a cargar',
      text,
      tone: 'neutral',
      icon: '🧳',
    },
  };
}
