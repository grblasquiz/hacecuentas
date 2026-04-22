/**
 * Calculadora de Indemnización por Despido Improcedente — España
 *
 * Regulación: Estatuto de los Trabajadores (ET) Art. 56, Disposición Transitoria 5ª.
 *
 * Escalado post reforma laboral 2012 (RDL 3/2012):
 *   - Antigüedad ANTES del 12/02/2012: 45 días por año, con tope 42 mensualidades.
 *   - Antigüedad DESDE el 12/02/2012: 33 días por año, con tope 24 mensualidades.
 *   - Para trabajadores con antigüedad anterior al 12/02/2012, el total de los dos
 *     periodos no puede superar 720 días, salvo que el periodo anterior por sí solo
 *     ya fuera mayor (en ese caso se aplica el tope de 42 mensualidades).
 *
 * La fracción menor al año se prorratea por meses completos.
 */

export interface DespidoImprocedenteInputs {
  salarioMensualBruto: number; // salario bruto mensual con prorrata de pagas extra
  aniosAntesReforma: number; // años trabajados antes del 12/02/2012
  mesesAntesReforma: number;
  aniosDespuesReforma: number; // años trabajados desde 12/02/2012
  mesesDespuesReforma: number;
}

export interface DespidoImprocedenteOutputs {
  indemnizacionTotal: string;
  diasIndemnizacion: string;
  indemnizacionPre2012: string;
  indemnizacionPost2012: string;
  topeAplicado: string;
  aniosTotales: string;
}

const fmtEUR = (n: number) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function indemnizacionDespidoImprocedenteEspana(
  i: DespidoImprocedenteInputs
): DespidoImprocedenteOutputs {
  const salario = Number(i.salarioMensualBruto);
  const aniosPre = Math.max(0, Number(i.aniosAntesReforma) || 0);
  const mesesPre = Math.max(0, Math.min(11, Number(i.mesesAntesReforma) || 0));
  const aniosPost = Math.max(0, Number(i.aniosDespuesReforma) || 0);
  const mesesPost = Math.max(0, Math.min(11, Number(i.mesesDespuesReforma) || 0));

  if (!salario || salario <= 0) {
    throw new Error('Ingresá tu salario mensual bruto (con prorrata de pagas extra)');
  }
  if (aniosPre + mesesPre + aniosPost + mesesPost === 0) {
    throw new Error('Ingresá al menos una antigüedad mayor a cero');
  }

  // Salario diario = salario mensual × 12 / 365
  const salarioDiario = (salario * 12) / 365;

  // Antigüedad pre-2012 en años (con meses prorrateados)
  const tiempoPre = aniosPre + mesesPre / 12;
  const tiempoPost = aniosPost + mesesPost / 12;

  // Indemnización pre-2012: 45 días por año
  const diasPreRaw = 45 * tiempoPre;
  // Indemnización post-2012: 33 días por año
  const diasPostRaw = 33 * tiempoPost;

  let diasPre = diasPreRaw;
  let diasPost = diasPostRaw;
  let topeInfo = 'No';

  // Regla de tope combinado (Disposición Transitoria 5ª ET):
  // Si hay periodo pre-2012, el total NO puede superar 720 días
  // salvo que el periodo pre-2012 por sí solo ya supere 720 días,
  // en cuyo caso se aplica el tope absoluto de 42 mensualidades (1260 días).
  if (tiempoPre > 0) {
    const topeAbsoluto42Meses = 42 * 30; // 1260 días
    const topeCombinado = 720;

    if (diasPre >= topeCombinado) {
      // El periodo pre-2012 ya supera 720 días: se aplica solo el pre, con tope 1260 días
      diasPost = 0;
      diasPre = Math.min(diasPre, topeAbsoluto42Meses);
      topeInfo = `Sí — el periodo pre-2012 excede 720 días. Se aplica solo ese periodo con tope 42 mensualidades (1.260 días).`;
    } else {
      // Suma pre+post con tope 720 días
      const total = diasPre + diasPost;
      if (total > topeCombinado) {
        diasPost = Math.max(0, topeCombinado - diasPre);
        topeInfo = `Sí — tope combinado de 720 días (24 mensualidades) aplicado al periodo post-2012.`;
      }
    }
  } else {
    // Solo periodo post-2012: tope 24 mensualidades (720 días)
    if (diasPost > 720) {
      diasPost = 720;
      topeInfo = `Sí — tope de 24 mensualidades (720 días) aplicado.`;
    }
  }

  const indemPre = salarioDiario * diasPre;
  const indemPost = salarioDiario * diasPost;
  const total = indemPre + indemPost;
  const totalDias = diasPre + diasPost;

  return {
    indemnizacionTotal: fmtEUR(total),
    diasIndemnizacion: `${totalDias.toFixed(2)} días de salario`,
    indemnizacionPre2012:
      tiempoPre > 0
        ? `${fmtEUR(indemPre)} (${diasPre.toFixed(2)} días × 45 días/año)`
        : 'No aplica (sin antigüedad pre-2012)',
    indemnizacionPost2012:
      tiempoPost > 0
        ? `${fmtEUR(indemPost)} (${diasPost.toFixed(2)} días × 33 días/año)`
        : 'No aplica (sin antigüedad post-2012)',
    topeAplicado: topeInfo,
    aniosTotales: `${(tiempoPre + tiempoPost).toFixed(2)} años totales (${tiempoPre.toFixed(2)} pre + ${tiempoPost.toFixed(2)} post-reforma 2012)`,
  };
}
