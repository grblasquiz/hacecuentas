export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora: Presupuesto sugerido para regalo de aniversario de pareja
 *
 * Método: porcentaje del ingreso mensual neto escalado por años de relación
 * y tipo de aniversario (noviazgo / matrimonio). Basado en:
 * - AmourPrint Anniversary Gift Budget Guide 2026 (amourprint.com)
 * - Gilovich & Van Boven (Cornell/Colorado): experiencias > objetos materiales
 * - Guía financiera personal: el regalo no debe requerir deuda a largo plazo
 */

function getPorcentaje(anios: number, tipo: string): { min: number; max: number; label: string } {
  if (tipo === 'noviazgo') {
    if (anios < 1)  return { min: 0.8,  max: 1.5,  label: 'noviazgo reciente (<1 año)' };
    if (anios < 2)  return { min: 1.0,  max: 2.0,  label: 'primer aniversario de noviazgo' };
    if (anios < 4)  return { min: 1.5,  max: 2.5,  label: 'noviazgo consolidado (2-3 años)' };
    if (anios < 7)  return { min: 2.0,  max: 3.0,  label: 'noviazgo largo (4-6 años)' };
    return                { min: 2.5,  max: 3.5,  label: 'noviazgo muy largo (+7 años)' };
  } else {
    // matrimonio
    if (anios < 2)  return { min: 1.5,  max: 2.5,  label: 'primer aniversario de matrimonio' };
    if (anios < 6)  return { min: 2.0,  max: 3.0,  label: 'matrimonio temprano (2-5 años)' };
    if (anios < 11) return { min: 2.5,  max: 3.5,  label: 'matrimonio consolidado (6-10 años, bodas de estaño)' };
    if (anios < 16) return { min: 3.0,  max: 4.5,  label: 'matrimonio maduro (11-15 años, bodas de cristal)' };
    if (anios < 26) return { min: 3.5,  max: 5.0,  label: 'matrimonio largo (16-25 años, bodas de plata)' };
    if (anios < 51) return { min: 4.0,  max: 6.0,  label: 'matrimonio muy largo (26-50 años, bodas de oro)' };
    return                { min: 5.0,  max: 8.0,  label: 'hito excepcional (50+ años, bodas de diamante)' };
  }
}

function getNombreAniversario(anios: number, tipo: string): string {
  if (tipo === 'matrimonio') {
    const tabla: Record<number, string> = {
      1: 'Bodas de Papel', 2: 'Bodas de Algodón', 3: 'Bodas de Cuero',
      4: 'Bodas de Lino', 5: 'Bodas de Madera', 6: 'Bodas de Hierro',
      7: 'Bodas de Lana', 8: 'Bodas de Bronce', 9: 'Bodas de Cerámica',
      10: 'Bodas de Estaño', 11: 'Bodas de Acero', 12: 'Bodas de Seda',
      13: 'Bodas de Encaje', 14: 'Bodas de Marfil', 15: 'Bodas de Cristal',
      20: 'Bodas de Porcelana', 25: 'Bodas de Plata', 30: 'Bodas de Perla',
      35: 'Bodas de Coral', 40: 'Bodas de Rubí', 45: 'Bodas de Zafiro',
      50: 'Bodas de Oro', 55: 'Bodas de Esmeralda', 60: 'Bodas de Diamante',
      65: 'Bodas de Platino', 70: 'Bodas de Ónice',
    };
    if (tabla[anios]) return tabla[anios];
  }
  if (anios === 1) return tipo === 'noviazgo' ? 'Primer aniversario de noviazgo' : '';
  return '';
}

export function cuantoGastarRegaloNoviaAniversario(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';

  const ingresoMensual = Number(i.ingreso_mensual) || 0;
  const anios          = Number(i.anios_relacion)  || 0;
  const tipo           = (i.tipo_relacion as string) || 'noviazgo';

  // Validación básica
  if (ingresoMensual <= 0 || anios < 0) {
    const msgEs = 'Completá el ingreso mensual y los años de relación para obtener el presupuesto sugerido.';
    const msgEn = 'Enter your monthly net income and years together to get a suggested gift budget.';
    const _insight = {
      title: lang === 'en' ? 'Fill in the fields' : 'Completá los campos',
      text:  lang === 'en' ? msgEn : msgEs,
      tone:  'neutral',
      icon:  '🎁',
    };
    return {
      presupuesto_minimo:  '—',
      presupuesto_maximo:  '—',
      porcentaje_aplicado: '—',
      nombre_aniversario:  '—',
      _insight,
    };
  }

  const { min, max, label } = getPorcentaje(anios, tipo);
  const montoMin = Math.round(ingresoMensual * min / 100);
  const montoMax = Math.round(ingresoMensual * max / 100);
  const nombre   = getNombreAniversario(Math.round(anios), tipo);

  const fmt = (n: number) =>
    n.toLocaleString(lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 0 });

  const fmtPct = `${min}–${max}%`;

  // Etiquetas según idioma
  const labelEs = label;
  const labelEn = label
    .replace('noviazgo', 'dating').replace('matrimonio', 'marriage')
    .replace('reciente', 'early').replace('consolidado', 'established')
    .replace('largo', 'long').replace('muy', 'very')
    .replace('primer aniversario de', 'first anniversary:')
    .replace('temprano', 'early').replace('maduro', 'mature')
    .replace('excepcional', 'exceptional');

  const stageLabel = lang === 'en' ? labelEn : labelEs;

  // Insight
  let insightText: string;
  let insightTitle: string;
  let insightTone: string;

  if (lang === 'en') {
    insightTitle = `Gift budget: $${fmt(montoMin)}–$${fmt(montoMax)}`;
    insightText  = `For **${anios} year${anios !== 1 ? 's' : ''} together** (${stageLabel}), financial advisors suggest **${fmtPct} of monthly net income**. ` +
      `That puts your range at **$${fmt(montoMin)}–$${fmt(montoMax)}**. ` +
      `Remember: a thoughtful $50 gift outperforms a generic $500 one. ` +
      (nombre ? `This is your **${nombre}** — a special milestone. ` : '') +
      `Avoid financing the gift with high-interest credit.`;
    insightTone  = montoMax > ingresoMensual * 0.05 ? 'warning' : 'positive';
  } else {
    insightTitle = `Presupuesto sugerido: $${fmt(montoMin)}–$${fmt(montoMax)}`;
    insightText  = `Para **${anios} año${anios !== 1 ? 's' : ''} de relación** (${stageLabel}), la guía financiera sugiere **${fmtPct} del ingreso mensual neto**. ` +
      `Eso da un rango de **$${fmt(montoMin)}–$${fmt(montoMax)}**. ` +
      (nombre ? `Este es su **${nombre}** — un hito especial. ` : '') +
      `Un regalo pensado de $${fmt(montoMin)} supera a uno genérico de $${fmt(montoMax * 3)}. ` +
      `Nunca financiés el regalo con deuda de alto costo.`;
    insightTone  = montoMax > ingresoMensual * 0.05 ? 'warning' : 'positive';
  }

  const _insight = { title: insightTitle, text: insightText, tone: insightTone, icon: '💝' };

  return {
    presupuesto_minimo:  lang === 'en' ? `$${fmt(montoMin)}` : `$${fmt(montoMin)}`,
    presupuesto_maximo:  lang === 'en' ? `$${fmt(montoMax)}` : `$${fmt(montoMax)}`,
    porcentaje_aplicado: `${fmtPct} del ingreso`,
    nombre_aniversario:  nombre || (lang === 'en' ? `${Math.round(anios)}-year anniversary` : `Aniversario N° ${Math.round(anios)}`),
    _insight,
  };
}
