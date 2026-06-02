export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoSocialBeneficioExencion(i: Inputs): Outputs {
  const c=String(i.consulta||'req');
  const info: Record<string,string> = {
    req:'Cooperativas, emprendedores sociales, beneficiarios planes, ingreso ≤SMVM',
    cuota:'~$12.000/mes (50% categoría A + aportes SIPA + obra social)',
    benef:'Obra social, jubilación mínima, posibilidad facturar legalmente'
  };
  const titulos: Record<string,string> = {
    req: 'Quiénes pueden adherir',
    cuota: 'Cuánto se paga',
    benef: 'Qué beneficios incluye',
  };
  const _insight = {
    title: titulos[c] || 'Monotributo social',
    text: `**${titulos[c] || 'Monotributo social'}:** ${info[c] || '—'}. Es un régimen con cuota reducida pensado para emprendedores de bajos ingresos.`,
    tone: 'neutral',
    icon: 'ℹ️',
  };
  return { info:info[c]||'', resumen:`Monotributo social ${c}: ${info[c]||'—'}.`, _insight };
}
