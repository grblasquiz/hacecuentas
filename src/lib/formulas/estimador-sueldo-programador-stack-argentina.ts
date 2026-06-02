export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function estimadorSueldoProgramadorStackArgentina(i: Inputs): Outputs {
  const s=String(i.seniority||'semisenior'); const st=String(i.stack||'fullstack');
  const base={'junior':1200000,'semisenior':2400000,'senior':4000000,'tech_lead':6500000,'staff':10000000}[s];
  const mult={'frontend_react':1,'backend_node':1.05,'fullstack':1.1,'devops':1.25,'data_ml':1.3,'mobile':1.1,'blockchain':1.4}[st];
  const ars=Math.round(base*mult);
  const usd=Math.round(ars/1200*1.5); // remote paga más
  const stackLabel:Record<string,string>={'frontend_react':'Frontend React','backend_node':'Backend Node','fullstack':'Fullstack','devops':'DevOps','data_ml':'Data/ML','mobile':'Mobile','blockchain':'Blockchain'};
  const premium = mult >= 1.25;
  const insightText = premium
    ? `Tu stack **${stackLabel[st]||st}** suma un plus por demanda: el techo local ronda **$${ars.toLocaleString('es-AR')}/mes**, y pasando a remote internacional podés apuntar a **USD ${usd.toLocaleString('en-US')}+** cobrando en dólares.`
    : `Como **${s}** en **${stackLabel[st]||st}** el techo local ronda **$${ars.toLocaleString('es-AR')}/mes**; el salto fuerte está en remote internacional, donde el mismo perfil apunta a **USD ${usd.toLocaleString('en-US')}** (40-80% más).`;
  return { sueldoArs:`$${Math.round(ars*0.85).toLocaleString('es-AR')}-${ars.toLocaleString('es-AR')}`, sueldoUsd:`USD ${Math.round(usd*0.8).toLocaleString('en-US')}-${usd.toLocaleString('en-US')}`, observacion:`${s} ${st} en AR. Remote internacional paga 40-80% más.`,
    _insight: {
      title: 'Dónde está la plata',
      text: insightText,
      tone: 'neutral',
      icon: '💻',
    } };
}
