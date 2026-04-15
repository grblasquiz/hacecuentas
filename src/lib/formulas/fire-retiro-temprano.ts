/** FIRE — Financial Independence, Retire Early. Regla del 4% / 25× gastos anuales */
export interface Inputs {
  gastosMensuales: number;
  patrimonioActual?: number;
  aporteMensual?: number;
  rendimientoAnual?: number; // %
  tasaRetiroPorcentaje?: number; // default 4%
}
export interface Outputs {
  numeroFire: number;
  gastosAnuales: number;
  faltaAhorrar: number;
  aniosHastaFire: number;
  rentaMensualFire: number;
  progreso: number; // %
  resumen: string;
  _chart?: any;
}

export function fireRetiroTemprano(i: Inputs): Outputs {
  const gastosMes = Number(i.gastosMensuales);
  const patrimonio = Number(i.patrimonioActual) || 0;
  const aporte = Number(i.aporteMensual) || 0;
  const rend = Number(i.rendimientoAnual) || 7;
  const tasaRetiro = Number(i.tasaRetiroPorcentaje) || 4;

  if (!gastosMes || gastosMes <= 0) throw new Error('Ingresá tus gastos mensuales');
  if (patrimonio < 0) throw new Error('El patrimonio no puede ser negativo');
  if (tasaRetiro <= 0 || tasaRetiro > 10) throw new Error('La tasa de retiro debe estar entre 1% y 10%');

  const gastosAnuales = gastosMes * 12;
  const multiplicador = 100 / tasaRetiro; // regla del 4% = 25×
  const numeroFire = gastosAnuales * multiplicador;
  const falta = Math.max(numeroFire - patrimonio, 0);

  // Años para alcanzar FIRE con aportes mensuales y rendimiento compuesto
  const r = rend / 100 / 12;
  let aniosHastaFire = 0;
  if (falta > 0 && aporte > 0) {
    // Resolver: patrimonio*(1+r)^n + aporte*((1+r)^n -1)/r = numeroFire
    // Búsqueda binaria sobre meses
    let lo = 0;
    let hi = 1200; // 100 años max
    for (let k = 0; k < 80; k++) {
      const mid = (lo + hi) / 2;
      const factor = Math.pow(1 + r, mid);
      const vf = patrimonio * factor + (r > 0 ? aporte * ((factor - 1) / r) : aporte * mid);
      if (vf < numeroFire) lo = mid; else hi = mid;
    }
    aniosHastaFire = ((lo + hi) / 2) / 12;
  }

  const rentaMensualFire = (numeroFire * tasaRetiro / 100) / 12;
  const progreso = Math.min((patrimonio / numeroFire) * 100, 100);

  const resumen = patrimonio >= numeroFire
    ? `Ya llegaste a FIRE. Tu patrimonio cubre tus gastos actuales a perpetuidad (${tasaRetiro}% anual).`
    : `Necesitás ${numeroFire.toLocaleString()} para alcanzar la independencia financiera (regla del ${tasaRetiro}%). ${aniosHastaFire > 0 ? `A tu ritmo actual llegarías en ${aniosHastaFire.toFixed(1)} años.` : ''}`;

  // Proyección de net worth año a año hasta alcanzar FIRE (o 40 años máximo)
  const horizonte = aniosHastaFire > 0
    ? Math.min(40, Math.ceil(aniosHastaFire) + 2)
    : Math.min(40, 20);
  const labels: string[] = [];
  const proyeccion: number[] = [];
  const metaFire: number[] = [];
  for (let year = 0; year <= horizonte; year++) {
    labels.push(`Año ${year}`);
    const months = year * 12;
    const factor = Math.pow(1 + r, months);
    const vf = patrimonio * factor + (r > 0 ? aporte * ((factor - 1) / r) : aporte * months);
    proyeccion.push(Math.round(vf));
    metaFire.push(Math.round(numeroFire));
  }

  const chart = {
    type: 'line' as const,
    ariaLabel: `Proyección de patrimonio neto: desde ${Math.round(patrimonio).toLocaleString('es-AR')} iniciales hasta ${Math.round(proyeccion[horizonte]).toLocaleString('es-AR')} en ${horizonte} años. Meta FIRE: ${Math.round(numeroFire).toLocaleString('es-AR')}.`,
    data: {
      labels,
      datasets: [
        {
          label: 'Net worth proyectado',
          data: proyeccion,
          fill: true,
          tension: 0.2,
        },
        {
          label: 'Meta FIRE',
          data: metaFire,
          fill: false,
          dashed: true,
          color: 'muted',
          tension: 0,
        },
      ],
    },
  };

  return {
    numeroFire: Math.round(numeroFire),
    gastosAnuales: Math.round(gastosAnuales),
    faltaAhorrar: Math.round(falta),
    aniosHastaFire: Number(aniosHastaFire.toFixed(1)),
    rentaMensualFire: Math.round(rentaMensualFire),
    progreso: Number(progreso.toFixed(1)),
    resumen,
    _chart: chart,
  };
}
