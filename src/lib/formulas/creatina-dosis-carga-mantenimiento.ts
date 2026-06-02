/** Calculadora de dosis de creatina */
export interface Inputs {
  peso: number;
  protocolo: string;
}
export interface Outputs {
  dosisMantenimiento: number;
  dosisCargaDiaria: number;
  dosisCargaPorToma: number;
  diasCarga: number;
  poteDuracion: number;
  mensaje: string;
  _insight?: any;
}

export function creatinaDosisarga(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const protocolo = String(i.protocolo || 'carga');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // ISSN guidelines: carga 0.3 g/kg/día por 5-7 días, mantenimiento 0.03-0.1 g/kg/día
  const dosisCargaDiaria = Number((peso * 0.3).toFixed(1));
  const dosisCargaPorToma = Number((dosisCargaDiaria / 4).toFixed(1));
  const diasCarga = protocolo === 'carga' ? 5 : 0;

  // Mantenimiento: 0.07 g/kg pero mínimo 3g, máximo 10g
  let dosisMantenimiento = Number((peso * 0.07).toFixed(1));
  if (dosisMantenimiento < 3) dosisMantenimiento = 3;
  if (dosisMantenimiento > 10) dosisMantenimiento = 10;

  const poteDuracion = Math.floor(300 / dosisMantenimiento);

  let mensaje: string;
  if (protocolo === 'carga') {
    mensaje = `Carga: ${dosisCargaDiaria}g/día (${dosisCargaPorToma}g x 4 tomas) durante 5 días. Después mantenimiento: ${dosisMantenimiento}g/día.`;
  } else {
    mensaje = `Directo a mantenimiento: ${dosisMantenimiento}g/día. Saturación completa en ~28 días.`;
  }

  let _insight: any;
  if (protocolo === 'carga') {
    _insight = {
      title: 'Tu protocolo con carga',
      text: `Arrancá con **${dosisCargaDiaria} g/día** (${dosisCargaPorToma} g × 4 tomas) durante 5 días para saturar rápido, y después bajá a **${dosisMantenimiento} g/día**. Un pote de 300 g te dura unos **${poteDuracion} días** en mantenimiento.`,
      tone: 'neutral',
      icon: '💪',
    };
  } else {
    _insight = {
      title: 'Directo a mantenimiento',
      text: `Sin carga, tomás **${dosisMantenimiento} g/día** desde el día 1: llegás a la saturación completa en **~28 días**. Un pote de 300 g te rinde unos **${poteDuracion} días**.`,
      tone: 'good',
      icon: '💪',
    };
  }
  return { dosisMantenimiento, dosisCargaDiaria, dosisCargaPorToma, diasCarga, poteDuracion, mensaje, _insight };
}