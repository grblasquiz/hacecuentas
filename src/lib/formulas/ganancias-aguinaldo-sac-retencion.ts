import { aplicarEscalaMensual, MNI_MENSUAL_BASE } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function gananciasAguinaldoSacRetencion(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0;
  const sac=s*0.5;
  // Remuneración bruta promedio mensual considerando el SAC (12 + 1 aguinaldo).
  const brutoMensualConSac=s*13/12;
  // Aportes ~17% → base imponible ≈ 0,83 del bruto; menos el MNI efectivo mensual
  // (GNI + deducción especial apt.1) de la fuente única _ganancias-escala.
  const baseMensual=Math.max(0, brutoMensualConSac*0.83 - MNI_MENSUAL_BASE);
  const gan=aplicarEscalaMensual(baseMensual).impuesto*12;
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
