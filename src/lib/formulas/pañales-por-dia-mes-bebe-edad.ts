export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
export function pañalesPorDiaMesBebeEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=Number(i.mes)||0;
  let d:number; let t:string;
  if (m<=2) { d=11; t='RN/T1'; }
  else if (m<=6) { d=8; t='T2/T3'; }
  else if (m<=12) { d=6; t='T3/T4'; }
  else if (m<=24) { d=5; t='T4/T5'; }
  else { d=4; t='T5/T6'; }
  const diarios = __lang === 'en' ? `${d}/day` : __lang === 'pt' ? `${d}/dia` : `${d}/día`;
  const mensuales = __lang === 'en' ? `~${d*30}/month` : __lang === 'pt' ? `~${d*30}/mês` : `~${d*30}/mes`;
  const resumen = __lang === 'en'
    ? `At ${m} months: ${d} diapers/day (~${d*30}/month), size ${t}.`
    : __lang === 'pt'
    ? `Com ${m} meses: ${d} fraldas/dia (~${d*30}/mês), tamanho ${t}.`
    : `A los ${m} meses: ${d} pañales/día (~${d*30}/mes), talle ${t}.`;
  const insight = {
    title: __lang === 'en' ? 'What to expect at this age' : __lang === 'pt' ? 'O que esperar nesta idade' : 'Qué esperar a esta edad',
    text: __lang === 'en'
      ? `At **${m} months** a baby goes through about **${d} diapers a day** (**~${d*30}/month**), size **${t}**. Newborns use the most and the count drops steadily as they grow.`
      : __lang === 'pt'
      ? `Aos **${m} meses** um bebê usa cerca de **${d} fraldas por dia** (**~${d*30}/mês**), tamanho **${t}**. Recém-nascidos usam mais e o número cai conforme crescem.`
      : `A los **${m} meses** un bebé usa unos **${d} pañales por día** (**~${d*30}/mes**), talle **${t}**. Los recién nacidos usan más y el número va bajando a medida que crecen.`,
    tone: 'neutral',
    icon: '🍼',
  };
  return { diarios, mensuales, tamano:t, resumen, _insight: insight };
}
