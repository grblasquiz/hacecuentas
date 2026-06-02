import { aplicarEscalaMensual, MNI_MENSUAL_BASE, INCREMENTO_HIJO_MENSUAL, INCREMENTO_CONYUGE_MENSUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }
export function sueldoDocenteArgentinaCargoAntiguedad(i: Inputs): Outputs {
  const antig = Number(i.antiguedad) || 0;
  const cargas = Number(i.cargas) || 0;
  const conyuge = Number(i.conyuge) || 0;
  // Piso nacional docente 2026 — $500.000 (Decreto marzo 2026, maestro de grado
  // jornada simple sin antigüedad). Fuente: lanacion.com.ar/politica/el-gobierno-fijo-el-nuevo-salario-minimo-docente
  // Básicos provinciales pueden ser mayores (ej. BsAs ~$900k+).
  const basico = 500_000;
  const plusAntig = basico * 0.1 * antig;
  const bruto = basico + plusAntig;
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const baseGanancias = Math.max(0, bruto - jubilacion - obraSocial - pami - MNI_MENSUAL_BASE - cargas * INCREMENTO_HIJO_MENSUAL - conyuge * INCREMENTO_CONYUGE_MENSUAL);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const descTotal = jubilacion + obraSocial + pami + ganancias;
  const pctDesc = bruto > 0 ? (descTotal / bruto) * 100 : 0;
  const fmtAr = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Sueldo docente nacional',
    text: `Partiendo del piso nacional, el bruto da **${fmtAr(bruto)}** y cobrás **${fmtAr(neto)}** netos tras **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) de descuentos. ${ganancias > 0 ? `Pagás **${fmtAr(ganancias)}** de Ganancias por mes.` : 'No pagás Ganancias: tu sueldo queda por debajo del mínimo no imponible.'} Los básicos provinciales suelen ser más altos que este piso.`,
    tone: 'neutral' as const,
    icon: '📚',
  };
  return {
    basico: '$' + basico.toLocaleString('es-AR'),
    bruto: '$' + bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    neto: '$' + neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    sac: '$' + sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años: neto ~$${neto.toFixed(0)}.`,
    _chart: chart,
    _insight: insight,
  };
}
