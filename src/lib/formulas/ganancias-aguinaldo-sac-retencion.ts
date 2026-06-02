export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function gananciasAguinaldoSacRetencion(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0;
  const sac=s*0.5;
  const anualSinSac=s*13;
  const base=anualSinSac*0.85;
  const gan=Math.max(0,(base-21000000)*0.27);
  const miles=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const _insight = gan>0
    ? {
        title: 'Aguinaldo y Ganancias',
        text: `Tu medio aguinaldo (SAC) es de **$${miles(sac)}** cada semestre. Sobre el año, Ganancias te retiene aproximadamente **$${miles(gan)}**, parte de la cual sale del propio aguinaldo.`,
        tone: 'warn',
        icon: '🎁',
      }
    : {
        title: 'Aguinaldo sin retención',
        text: `Tu medio aguinaldo (SAC) es de **$${miles(sac)}** cada semestre y, con un bruto de **$${miles(s)}/mes**, no llegás al piso de Ganancias: tu aguinaldo se cobra **completo**.`,
        tone: 'good',
        icon: '🎁',
      };
  return { sacSemestral:'$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retencionAnual:'$'+gan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Bruto $${s}: SAC $${sac.toFixed(0)} c/u, Ganancias anuales ~$${gan.toFixed(0)}.`, _insight };
}
