export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function emisionesEnviarEmailAdjuntos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const e = Number(i.emailsPorDia) || 0; const p = Number(i.porcentajeConAdjunto) || 0;
  const sin = e * (1 - p/100) * 4;
  const con = e * (p/100) * 50;
  const gDia = sin + con; const kgAño = gDia * 365 / 1000;
  const resumen = __lang === 'en'
    ? `${e} emails/day (${p}% with attachments) = ${gDia.toFixed(0)}g/day = ${kgAño.toFixed(0)} kg/year.`
    : __lang === 'pt'
    ? `${e} e-mails/dia (${p}% com anexos) = ${gDia.toFixed(0)}g/dia = ${kgAño.toFixed(0)} kg/ano.`
    : `${e} emails/día (${p}% adjunto) = ${gDia.toFixed(0)}g/día = ${kgAño.toFixed(0)} kg/año.`;

  const L = ({
    es: { title: 'El peso de los adjuntos', text: `Mandás **${gDia.toFixed(0)} g de CO2 por día** (**${kgAño.toFixed(1)} kg al año**). Los mails con adjuntos son apenas el **${p}%** del volumen pero aportan **${gDia > 0 ? (con / gDia * 100).toFixed(0) : '0'}%** de la huella: cada adjunto pesa como ~12 mails sin archivo.`, sinLabel: 'Sin adjunto', conLabel: 'Con adjunto', center: 'por día', aria: (t: string) => `Reparto de ${t} de CO2 diario: emails sin adjunto vs. con adjunto.` },
    en: { title: 'The weight of attachments', text: `You send **${gDia.toFixed(0)} g of CO2 per day** (**${kgAño.toFixed(1)} kg a year**). Emails with attachments are just **${p}%** of the volume but drive **${gDia > 0 ? (con / gDia * 100).toFixed(0) : '0'}%** of the footprint: each attachment weighs like ~12 plain emails.`, sinLabel: 'No attachment', conLabel: 'With attachment', center: 'per day', aria: (t: string) => `Breakdown of ${t} of daily CO2: emails without attachment vs. with attachment.` },
    pt: { title: 'O peso dos anexos', text: `Você envia **${gDia.toFixed(0)} g de CO2 por dia** (**${kgAño.toFixed(1)} kg por ano**). E-mails com anexos são apenas **${p}%** do volume, mas geram **${gDia > 0 ? (con / gDia * 100).toFixed(0) : '0'}%** da pegada: cada anexo pesa como ~12 e-mails sem arquivo.`, sinLabel: 'Sem anexo', conLabel: 'Com anexo', center: 'por dia', aria: (t: string) => `Distribuição de ${t} de CO2 diário: e-mails sem anexo vs. com anexo.` },
  } as const)[__lang];

  const _insight = {
    title: L.title,
    text: L.text,
    tone: 'warn' as const,
    icon: '📎',
  };

  const _chart = gDia > 0 ? {
    type: 'doughnut',
    slices: [
      { label: L.sinLabel, value: Math.round(sin) },
      { label: L.conLabel, value: Math.round(con) },
    ],
    suffix: ' g',
    centerValue: `${gDia.toFixed(0)} g`,
    centerLabel: L.center,
    ariaLabel: L.aria(`${gDia.toFixed(0)} g`),
  } : undefined;

  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Año: kgAño.toFixed(1) + ' kg', resumen, _insight, _chart };
}
