export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dniPasaporteCostoTramiteArgentina(i: Inputs): Outputs {
  const t=String(i.tipo||'dni-renov');
  // Tarifario RENAPER vigente desde el 6/3/2026 (fuente: argentina.gob.ar/interior/renaper/tarifario-de-tramites-de-renaper)
  const tar: Record<string,[number,string]> = {
    'dni-0-5':[0,'15 días hábiles'], 'dni-renov':[10000,'15 días hábiles'], 'dni-duplic':[10000,'15 días hábiles'],
    'pas-com':[100000,'15 días hábiles'], 'pas-ex':[200000,'96 horas hábiles']
  };
  const nombre: Record<string,string> = {
    'dni-0-5':'DNI de 0 a 5 años', 'dni-renov':'renovación de DNI', 'dni-duplic':'duplicado de DNI',
    'pas-com':'pasaporte común', 'pas-ex':'pasaporte exprés'
  };
  const [c,t1]=tar[t]||tar['dni-renov'];
  const nom = nombre[t] || nombre['dni-renov'];
  const _insight = {
    title: 'Tu trámite',
    text: c === 0
      ? `El **${nom}** es **gratuito**: $0 de arancel, con entrega estimada en **${t1}**.`
      : `El **${nom}** cuesta **$${c.toLocaleString('es-AR')}** y se entrega en **${t1}**.${t === 'pas-ex' ? ' El exprés sale más caro pero te lo dan en menos días.' : ''}`,
    tone: c === 0 ? 'good' : (c >= 95000 ? 'warn' : 'neutral'),
    icon: t.startsWith('pas') ? '🛂' : '🪪',
  };
  return { costo:'$'+c.toLocaleString('es-AR'), tiempo:t1, resumen:`${t}: $${c.toLocaleString('es-AR')}, entrega ${t1}.`, _insight };
}
