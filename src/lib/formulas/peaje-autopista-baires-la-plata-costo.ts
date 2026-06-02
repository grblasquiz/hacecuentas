export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function peajeAutopistaBairesLaPlataCosto(i: Inputs): Outputs {
  const r=String(i.ruta||'panamericana'); const h=String(i.horario||'valle');
  const base={'panamericana':400,'accesso_oeste':350,'autopista_la_plata':600,'acceso_norte':300,'25_de_mayo':250}[r];
  const mult={'pico':1.25,'valle':1,'noche':0.8}[h];
  const total=base*mult; const tele=total*0.9;
  const ahorro = total - tele;
  const horarioLabel: Record<string,string> = { pico:'hora pico', valle:'horario normal', noche:'horario nocturno' };
  const out: Outputs = { peajeTotal:`$${Math.round(total).toLocaleString('es-AR')}`, descuentoTelepase:`$${Math.round(tele).toLocaleString('es-AR')}`, frecuencia:'Por tramo/estación' };
  if (Number.isFinite(total)) {
    out._insight = {
      title: 'Pagá menos con Telepase',
      text: `Por este tramo en **${horarioLabel[h] || h}** el peaje sale **$${Math.round(total).toLocaleString('es-AR')}** en efectivo, pero con **Telepase** son **$${Math.round(tele).toLocaleString('es-AR')}**: te ahorrás **$${Math.round(ahorro).toLocaleString('es-AR')}** por paso (10%). Si pasás seguido, ese 10% se acumula rápido.`,
      tone: 'good',
      icon: '🚗',
    };
  }
  return out;
}
