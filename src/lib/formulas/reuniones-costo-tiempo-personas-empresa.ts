export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function reunionesCostoTiempoPersonasEmpresa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      porPersonaH: '/persona/h',
      caro: 'Caro — evalúa si async puede reemplazar.',
      razonable: 'Razonable',
    },
    en: {
      porPersonaH: '/person/h',
      caro: 'Expensive — consider whether async can replace this.',
      razonable: 'Reasonable',
    },
  } as const)[__lang];
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const p=Number(i.personas)||0; const d=Number(i.duracionMin)||0; const s=Number(i.sueldoPromedioMes)||0;
  const sHora=s/176;
  const horas=d/60;
  const costo=p*horas*sHora;
  return { costoReunion:`$${Math.round(costo).toLocaleString(locale)}`, porHora:`$${Math.round(sHora).toLocaleString(locale)}${T.porPersonaH}`, observacion:costo>50000?T.caro:T.razonable };
}
