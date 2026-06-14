export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoEmpleadaDomesticaHorasRetiro(i: Inputs): Outputs {
  const cat = String(i.categoria || 'tareas-gen');
  const h = Number(i.horas) || 0;
  const r = String(i.conRetiro || 'si') === 'si';
  // Escala oficial CNTCP vigente JUNIO 2026 — valor hora por categoría.
  // Acuerdo abril-julio 2026 (Resolución CNTCP, publicada en Boletín Oficial),
  // tramo de junio. Caseros sin diferenciación con/sin retiro.
  // Fuentes: Infobae/Perfil/iProfesional jun-2026.
  const escala: Record<string, { conRetiro: number; sinRetiro: number }> = {
    supervisor: { conRetiro: 4297.33, sinRetiro: 4683.64 },
    cocinera: { conRetiro: 4223.25, sinRetiro: 4597.18 }, // tareas específicas
    caseros: { conRetiro: 3996.45, sinRetiro: 3996.45 }, // sin diferenciación
    'cuidado-per': { conRetiro: 3862.18, sinRetiro: 4295.26 },
    'tareas-gen': { conRetiro: 3600.66, sinRetiro: 3862.18 },
  };
  const fila = escala[cat] || escala['tareas-gen'];
  const b = r ? fila.conRetiro : fila.sinRetiro;
  // Mensual = valor hora × horas semanales × 4.33 semanas promedio/mes.
  const mensual = b * h * 4.33;
  // Aportes/cargas del empleador (estimado ~17%: jubilación, OS y ART).
  const aportes = mensual * 0.17;
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
      { label: 'Aportes y cargas (17%)', value: Math.round(aportes) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(costoTotal),
    centerLabel: 'Costo total/mes',
    ariaLabel: 'Costo mensual de la empleada doméstica: sueldo de bolsillo más aportes y cargas sociales.',
  };
  const insight = {
    title: 'Lo que realmente te cuesta por mes',
    text: `Pagás **$${fmt(mensual)}** de sueldo, pero con los aportes (17%) el costo real es **$${fmt(costoTotal)}/mes**. Tené en cuenta esos **$${fmt(aportes)}** extra antes de cerrar las horas${r ? '' : ' (el valor sin retiro ya es más alto por escala)'}.`,
    tone: 'warn',
    icon: '🧹',
  };
  return {
    porHora: '$' + fmtHora(b),
    mensual: '$' + fmt(mensual),
    aportes: '$' + fmt(aportes),
    resumen: `${cat}: ${h}h/sem a $${fmtHora(b)}/h = $${fmt(mensual)}/mes (${r ? 'con' : 'sin'} retiro). Escala CNTCP vigente jun-2026.`,
    _chart: chart,
    _insight: insight,
  };
}
