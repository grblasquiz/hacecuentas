export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ayudaEscolarAnualAsignacion(i: Inputs): Outputs {
  const h=Number(i.hijos)||0;
  const perHijo=85000; // $85.000 por hijo, vigente todo 2026 (ANSES). Antes: 65.000, dato viejo sin fuente.
  const total=h*perHijo;
  const insightText = h <= 0
    ? `Ingresá la cantidad de hijos escolarizados para estimar la **Ayuda Escolar Anual** de ANSES: se paga **$${perHijo.toLocaleString('es-AR')} por hijo**, en un solo pago al inicio del ciclo lectivo.`
    : `Por tus **${h} hijo${h===1?'':'s'}** te corresponden **$${total.toLocaleString('es-AR')}** de Ayuda Escolar Anual ($${perHijo.toLocaleString('es-AR')} c/u). Es un pago **único anual** de ANSES y requiere presentar el certificado de alumno regular.`;
  return {
    monto:'$'+total.toLocaleString('es-AR'),
    porHijo:'$'+perHijo.toLocaleString('es-AR'),
    resumen:`${h} hijos × $${perHijo.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')} único anual.`,
    _insight: {
      title: 'Tu ayuda escolar',
      text: insightText,
      tone: h > 0 ? 'good' : 'neutral',
      icon: '🎒',
    },
  };
}
