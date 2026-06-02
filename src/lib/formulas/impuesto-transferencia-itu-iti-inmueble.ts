export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoTransferenciaItuItiInmueble(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const u=String(i.viviendaUnica||'no');
  const exento=u==='reemplazo';
  const iti=exento?0:v*0.015;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight = exento
    ? {
        title: 'Estás exento del ITI',
        text: `Por tratarse de **reemplazo de vivienda única**, no pagás ITI sobre la venta de **${fmt(v)}**. Tené a mano el certificado de no retención de AFIP.`,
        tone: 'good',
        icon: '🏡'
      }
    : {
        title: 'Vas a pagar ITI',
        text: `Sobre una venta de **${fmt(v)}** pagás **${fmt(iti)}** de ITI (la alícuota fija del **1,5%**). El escribano lo retiene al momento de la escritura.`,
        tone: 'warn',
        icon: '🧾'
      };
  return { iti:'$'+iti.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), exento:exento?'Sí (reemplazo único)':'No', resumen:`Venta $${v.toLocaleString('es-AR')}: ITI ${exento?'exento':'$'+iti.toFixed(0)}.`, _insight };
}
