/**
 * Costo de la licencia de conducir en México — proyección permanente vs por vigencia.
 * El costo del trámite lo pone cada estado (varía mucho): se ingresa como dato editable
 * y la calculadora proyecta el costo por año y a lo largo de tu vida como conductor,
 * para comparar una licencia permanente contra renovar una temporal. Sin constantes fiscales.
 */
export interface Inputs {
  costoLicencia: number;                 // costo del trámite en tu estado ($), editable
  tipoVigencia: 'permanente' | 'temporal';
  aniosVigencia: number;                 // años de vigencia si es temporal
  aniosManejo: number;                   // años que planeás seguir manejando
  costoExamenMedico: number;             // examen médico/toxicológico si tu estado lo exige ($)
  costoTramiteExtra: number;             // fotografía, reposición u otros extras ($)
}

export interface Outputs {
  costoTotalTramite: number;
  costoAnual: number;
  renovacionesProyectadas: number;
  costoProyectado: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const base = Math.max(0, Number(i.costoLicencia) || 0);
  const examen = Math.max(0, Number(i.costoExamenMedico) || 0);
  const extra = Math.max(0, Number(i.costoTramiteExtra) || 0);
  const esPermanente = i.tipoVigencia === 'permanente';
  const aniosVig = Math.max(1, Math.round(Number(i.aniosVigencia) || 1));
  const aniosManejo = Math.max(1, Math.round(Number(i.aniosManejo) || 1));

  const costoTotalTramite = base + examen + extra;

  let renovacionesProyectadas: number;
  let costoProyectado: number;
  let costoAnual: number;

  if (esPermanente) {
    renovacionesProyectadas = 1;
    costoProyectado = costoTotalTramite;              // se paga una sola vez
    costoAnual = costoTotalTramite / aniosManejo;
  } else {
    renovacionesProyectadas = Math.ceil(aniosManejo / aniosVig);
    costoProyectado = costoTotalTramite * renovacionesProyectadas;
    costoAnual = costoTotalTramite / aniosVig;
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const money = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');

  const resumen = esPermanente
    ? `Licencia permanente: ${money(costoTotalTramite)} una sola vez. En ${aniosManejo} años de manejo equivale a ${money(costoAnual)} por año.`
    : `Licencia temporal (${aniosVig} años): ${money(costoTotalTramite)} por trámite. En ${aniosManejo} años vas a renovar ${renovacionesProyectadas} veces, ${money(costoProyectado)} en total (${money(costoAnual)} por año).`;

  const _insight = {
    title: esPermanente ? 'Costo de tu licencia permanente' : 'Costo proyectado de renovar',
    text: esPermanente
      ? `Pagás **${money(costoTotalTramite)}** una vez. Repartido en **${aniosManejo}** años de manejo son **${money(costoAnual)}** por año: si tu estado ofrece permanente, casi siempre sale más barata que renovar.`
      : `Cada trámite cuesta **${money(costoTotalTramite)}** y dura **${aniosVig}** años. En **${aniosManejo}** años vas a pagar **${renovacionesProyectadas}** veces, **${money(costoProyectado)}** en total. Compará contra la permanente de tu estado.`,
    tone: 'neutral',
    icon: '🚗',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Costo por trámite', `Proyectado (${aniosManejo} años)`],
    values: [Math.round(costoTotalTramite), Math.round(costoProyectado)],
    prefix: '$',
    ariaLabel: `Costo por trámite ${money(costoTotalTramite)} frente a costo proyectado ${money(costoProyectado)} en ${aniosManejo} años.`,
  };

  return {
    costoTotalTramite: round2(costoTotalTramite),
    costoAnual: round2(costoAnual),
    renovacionesProyectadas,
    costoProyectado: round2(costoProyectado),
    resumen,
    _insight,
    _chart,
  };
}
