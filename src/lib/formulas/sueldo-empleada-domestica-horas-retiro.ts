export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoEmpleadaDomesticaHorasRetiro(i: Inputs): Outputs {
  const cat = String(i.categoria || 'tareas-gen');
  const h = Number(i.horas) || 0;
  const r = String(i.conRetiro || 'si') === 'si';
  // Escala oficial CNTCP vigente JULIO 2026 — Res. CNTCP 4/2026, Anexo IV.
  // Caseros sin diferenciación con/sin retiro. A 31/08/2026 la reunión del
  // 21/08 todavía no produjo una nueva escala publicada.
  const escala: Record<string, { conRetiro: number; sinRetiro: number }> = {
    supervisor: { conRetiro: 4438.77, sinRetiro: 4829.13 },
    cocinera: { conRetiro: 4223.25, sinRetiro: 4597.18 }, // tareas específicas
    caseros: { conRetiro: 3996.45, sinRetiro: 3996.45 }, // sin diferenciación
    'cuidado-per': { conRetiro: 3996.45, sinRetiro: 4435.86 },
    'tareas-gen': { conRetiro: 3733.72, sinRetiro: 3996.45 },
  };
  const fila = escala[cat] || escala['tareas-gen'];
  const b = r ? fila.conRetiro : fila.sinRetiro;
  // Mensual = valor hora × horas semanales × 4.33 semanas promedio/mes.
  const mensual = b * h * 4.33;
  // Importe fijo obligatorio ARCA vigente julio 2026 para trabajador activo
  // mayor de 18 años: obra social + SIPA + ART, según horas semanales.
  const aportes = h < 12 ? 10088.64 : h < 16 ? 15857.96 : 43082.70;
  const costoTotal = mensual + aportes;
  const fmt = (n: number) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // Formato AR de un valor con 2 decimales (miles con punto, decimales con coma).
  const fmtHora = (n: number) => {
    const [ent, dec] = n.toFixed(2).split('.');
    return ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec;
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo de bolsillo', value: Math.round(mensual) },
      { label: 'Aportes, SIPA y ART', value: Math.round(aportes) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(costoTotal),
    centerLabel: 'Costo total/mes',
    ariaLabel: 'Costo mensual de la empleada doméstica: sueldo de bolsillo más aportes y cargas sociales.',
  };
  const insight = {
    title: 'Lo que realmente te cuesta por mes',
    text: `Pagás **$${fmt(mensual)}** de sueldo y **$${fmt(aportes)}** de aportes, SIPA y ART según el tramo de horas; el costo estimado es **$${fmt(costoTotal)}/mes**${r ? '' : ' (el valor sin retiro ya es más alto por escala)'}.`,
    tone: 'warn',
    icon: '🧹',
  };
  return {
    porHora: '$' + fmtHora(b),
    mensual: '$' + fmt(mensual),
    aportes: '$' + fmt(aportes),
    resumen: `${cat}: ${h}h/sem a $${fmtHora(b)}/h = $${fmt(mensual)}/mes (${r ? 'con' : 'sin'} retiro). Escala CNTCP vigente jul-2026; aportes ARCA jul-2026.`,
    _chart: chart,
    _insight: insight,
  };
}
