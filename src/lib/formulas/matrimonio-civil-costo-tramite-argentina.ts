export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function matrimonioCivilCostoTramiteArgentina(i: Inputs): Outputs {
  const p=String(i.provincia||'caba'); const s=String(i.sede||'ofic');
  const c=s==='ofic'?0:(p==='caba'?250000:200000);
  const insight = c===0
    ? {
        title: 'Casarte sale gratis',
        text: `El matrimonio civil **en la oficina del Registro Civil no tiene costo**. Solo necesitás DNI, partidas, **2 testigos** y sacar turno con anticipación.`,
        tone: 'good',
        icon: '💍',
      }
    : {
        title: 'Costo de la ceremonia',
        text: `Casarte **a domicilio o fuera de horario** cuesta unos **$${c.toLocaleString('es-AR')}** en ${p.toUpperCase()}. Si lo hacés en la oficina del Registro Civil, el trámite es gratuito.`,
        tone: 'warn',
        icon: '💍',
      };
  return { costo:c===0?'Gratuito':'$'+c.toLocaleString('es-AR'), documentos:'DNI + partida + 2 testigos + turno', resumen:`Matrimonio ${p} ${s}: ${c===0?'gratuito':'$'+c.toLocaleString('es-AR')}.`, _insight: insight };
}
