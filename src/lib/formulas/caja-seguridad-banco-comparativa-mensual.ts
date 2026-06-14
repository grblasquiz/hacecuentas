export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cajaSeguridadBancoComparativaMensual(i: Inputs): Outputs {
  const t=String(i.tamano||'mediana'); const b=String(i.banco||'privado_ar');
  // ⚠️ NO hay tarifa oficial única: cada banco fija su precio. Estos son valores de
  // REFERENCIA orientativos basados en el alquiler ANUAL de mercado (sin impuestos)
  // relevado a 2026 (BBVA, Santander, Galicia, Macro, ICBC e Infobae abr-2026).
  // El costo real puede variar 2x-3x según sucursal, promociones y modalidad de pago.
  const baseAnual:Record<string,number>={'chica':700000,'mediana':1100000,'grande':1700000,'premium':2600000};
  const mult:Record<string,number>={'publico':0.65,'privado_ar':1,'privado_internacional':1.25};
  const ca=(baseAnual[t]||1100000)*(mult[b]||1); const cm=ca/12;
  const cmF = Math.round(cm).toLocaleString('es-AR');
  const caF = Math.round(ca).toLocaleString('es-AR');
  const _insight = {
    title: 'Lo que te cuesta al año (referencia)',
    text: `Una caja **${t}** en banco **${b.replace(/_/g,' ')}** ronda los **$${caF} al año** (≈$${cmF}/mes) según el mercado 2026, sin impuestos. Es un valor de referencia: cada banco fija su propia tarifa, suele cobrarse por adelantado y se ajusta por inflación. Pedí el precio exacto a tu banco antes de contratar.`,
    tone: 'warn',
    icon: '🔒',
  };
  return { costoAnual:`$${caF}`, costoMensual:`$${cmF}`, interpretacion:`Caja ${t} en banco ${b.replace(/_/g,' ')}: ~$${caF}/año de referencia (verificá con el banco).`, _insight };
}
