/**
 * Calculadora de propinas completa — multi-país.
 * Calcula la propina sobre el total de la cuenta y la divide entre los comensales,
 * contemplando que la propina la deje una sola persona o varias.
 * Soporta redondeo de la parte de cada uno a múltiplos ($100/$500/$1.000) para
 * que sea fácil de transferir; el excedente del redondeo queda como propina extra.
 *
 * Localiza moneda y gramática por i.__country (lo inyecta el front desde el path:
 * /mx/, /co/, /cl/, /es/, /pe/, …). Ausencia/'ar' = comportamiento histórico AR.
 */
export interface Inputs {
  totalCuenta: number;
  propinaPct: number;
  personas: number;
  redondeo?: string; // 'no' | múltiplo numérico ('10','100','1000'…) definido por el JSON del país
  __country?: string;
}
export interface Outputs {
  porPersona: number;
  propinaTotal: number;
  totalConPropina: number;
  propinaPorPersona: number;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

// Moneda, locale de formato y costumbre local por país.
const PAIS: Record<string, { sym: string; loc: string; nombre: string; habitual: string }> = {
  ar: { sym: '$',   loc: 'es-AR', nombre: 'Argentina',             habitual: 'dejar 10 % en restaurantes' },
  mx: { sym: '$',   loc: 'es-MX', nombre: 'México',                habitual: 'dejar 10 % a 15 %' },
  co: { sym: '$',   loc: 'es-CO', nombre: 'Colombia',              habitual: 'el 10 % de propina voluntaria' },
  cl: { sym: '$',   loc: 'es-CL', nombre: 'Chile',                 habitual: 'el 10 % sugerido' },
  es: { sym: '€',   loc: 'es-ES', nombre: 'España',                habitual: 'redondear o dejar un 5-10 % si el servicio fue muy bueno' },
  pe: { sym: 'S/ ', loc: 'es-PE', nombre: 'Perú',                  habitual: 'dejar alrededor del 10 %' },
  uy: { sym: '$',   loc: 'es-UY', nombre: 'Uruguay',               habitual: 'dejar 10 %' },
  py: { sym: '₲ ',  loc: 'es-PY', nombre: 'Paraguay',              habitual: 'dejar 10 %' },
  ec: { sym: '$',   loc: 'es-EC', nombre: 'Ecuador',               habitual: 'dejar 10 %' },
  ve: { sym: '$',   loc: 'es-VE', nombre: 'Venezuela',             habitual: 'dejar 10 %' },
  do: { sym: 'RD$ ', loc: 'es-DO', nombre: 'República Dominicana', habitual: 'sumar propina al 10 % de ley' },
};

export function propinasCompleta(i: Inputs): Outputs {
  const c = String(i.__country || 'ar').toLowerCase();
  const p = PAIS[c] || PAIS.ar;
  const voseo = c === 'ar' || c === 'uy' || c === 'py';
  const fmt = (n: number) => p.sym + Math.round(n).toLocaleString(p.loc);
  // Verbos con/sin voseo (AR/UY/PY vosean; el resto usa forma neutra).
  const vIngresa = voseo ? 'Ingresá' : 'Ingresa';
  const vPagas = voseo ? 'pagás' : 'pagas';
  const vDejas = voseo ? 'dejás' : 'dejas';

  const total = Number(i.totalCuenta);
  if (!total || total <= 0) throw new Error(`${vIngresa} el total de la cuenta`);

  const pct = Number.isFinite(Number(i.propinaPct)) ? Number(i.propinaPct) : 10;
  if (pct < 0) throw new Error('El porcentaje de propina no puede ser negativo');

  const personas = Math.max(1, Math.floor(Number(i.personas) || 1));
  const modo = String(i.redondeo || 'no');
  // El JSON de cada país define los múltiplos apropiados a su moneda (ej. 10/50/100
  // en MXN, 1/5/10 en EUR, 500/1000/5000 en COP). 'no'/vacío = sin redondeo.
  const paso = modo === 'no' || modo === '' ? 0 : Math.max(0, Number(modo) || 0);

  const propinaTotal = Math.round(total * pct / 100);
  const totalConPropina = total + propinaTotal;
  const brutoPorPersona = totalConPropina / personas;

  // Redondeo hacia arriba de la parte de cada uno (nunca falta plata en la mesa).
  const porPersona = paso > 0
    ? Math.ceil(brutoPorPersona / paso) * paso
    : Math.ceil(brutoPorPersona);

  const recaudado = porPersona * personas;
  const sobrante = Math.max(0, recaudado - totalConPropina); // excedente del redondeo → propina extra
  const propinaPorPersona = Math.round((propinaTotal + sobrante) / personas);

  // Gráfico: composición de lo que se paga (cuenta + propina) + sobrante si lo hay.
  const slices = [
    { label: 'Cuenta', value: Math.round(total) },
    { label: 'Propina', value: propinaTotal },
  ];
  if (sobrante > 0) slices.push({ label: 'Redondeo', value: sobrante });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: p.sym,
    centerValue: fmt(recaudado),
    centerLabel: personas > 1 ? 'Total a juntar' : 'Total',
    ariaLabel: 'Composición de lo que se paga: cuenta, propina y redondeo',
  };

  // Insight contextual.
  let text: string;
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  const icon = '🧾';
  if (pct === 0) {
    tone = 'warn';
    text = `No hay propina (0 %). ${personas > 1 ? `Entre ${personas}, cada uno paga ${fmt(porPersona)}.` : `${vPagas.charAt(0).toUpperCase() + vPagas.slice(1)} ${fmt(porPersona)}.`} En ${p.nombre} lo habitual es ${p.habitual}.`;
  } else if (personas > 1) {
    text = `Entre **${personas} personas**, cada una pone **${fmt(porPersona)}** con el ${pct}% de propina ya incluido. ` +
      `La propina total es de ${fmt(propinaTotal)} (unos ${fmt(propinaPorPersona)} por cabeza).`;
    if (sobrante > 0) {
      tone = 'good';
      text += ` Al redondear cada parte, sobran **${fmt(sobrante)}** que suman como propina extra para el personal.`;
    }
  } else {
    text = `Sobre una cuenta de ${fmt(total)}, el ${pct}% de propina son **${fmt(propinaTotal)}**, así que ${vPagas} **${fmt(porPersona)}** en total.`;
    if (sobrante > 0) {
      tone = 'good';
      text += ` Redondeando, ${vDejas} ${fmt(sobrante)} extra de propina.`;
    }
  }

  const _insight = { title: personas > 1 ? 'Cuánto pone cada uno' : `Cuánto ${vPagas}`, text, tone, icon };

  const resumenDiv = personas > 1 ? ` Entre ${personas}: ${fmt(porPersona)} cada uno.` : '';
  return {
    porPersona,
    propinaTotal,
    totalConPropina,
    propinaPorPersona,
    mensaje: `Cuenta ${fmt(total)} + ${pct}% propina (${fmt(propinaTotal)}) = ${fmt(totalConPropina)}.${resumenDiv}`,
    _chart: chart,
    _insight,
  };
}
