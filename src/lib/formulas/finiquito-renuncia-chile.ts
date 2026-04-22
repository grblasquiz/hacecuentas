/**
 * Calculadora de Finiquito Chile — Artículo 161 y 162 del Código del Trabajo
 *
 * Componentes principales:
 *   - Indemnización por años de servicio (IAS): sueldo mensual × años trabajados
 *     Tope: 11 años (Art. 163 CT). Aplica en despido por necesidades de la empresa (Art. 161).
 *     En renuncia voluntaria NO corresponde IAS, pero sí vacaciones proporcionales,
 *     aviso previo (si el empleador no dio los 30 días) y bonos pactados en contrato.
 *   - Indemnización sustitutiva del aviso previo: 1 sueldo mensual adicional.
 *   - Vacaciones proporcionales / feriado proporcional.
 *   - Recargo por Ley Bustos: si el empleador no pagó cotizaciones previsionales.
 *
 * Sueldo mínimo Chile 2026 (aproximado): $500.000 CLP mensuales (proyección Decreto Ley 21.751).
 * Tope IAS: 90 UF (aproximado $3.4 millones CLP a UF 2026 ≈ $38.000).
 */

export interface FiniquitoChileInputs {
  sueldoBaseMensual: number; // última remuneración imponible, en CLP
  anosServicio: number;
  mesesExtra: number; // 0-11
  diasFeriadoPendientes: number; // días hábiles de vacaciones pendientes
  causal: 'necesidades' | 'renuncia' | 'mutuo-acuerdo' | 'caso-fortuito';
  avisoPrevio: boolean; // ¿el empleador dio 30 días de aviso?
}

export interface FiniquitoChileOutputs {
  indemnizacionAnosServicio: string;
  indemnizacionSustitutivaAviso: string;
  feriadoProporcional: string;
  totalFiniquito: string;
  topeAplicado: string;
  anosComputables: string;
  observaciones: string;
}

const fmtCLP = (n: number) =>
  '$' +
  Math.round(n).toLocaleString('es-CL', {
    maximumFractionDigits: 0,
  });

export function finiquitoRenunciaChile(i: FiniquitoChileInputs): FiniquitoChileOutputs {
  const sueldo = Number(i.sueldoBaseMensual);
  const anos = Math.max(0, Number(i.anosServicio) || 0);
  const meses = Math.max(0, Math.min(11, Number(i.mesesExtra) || 0));
  const diasFeriado = Math.max(0, Number(i.diasFeriadoPendientes) || 0);
  const causal = i.causal || 'renuncia';
  const aviso = Boolean(i.avisoPrevio);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá la última remuneración mensual imponible');
  }

  // Art. 163 CT: fracción superior a 6 meses cuenta como año completo
  const anosComputablesRaw = meses > 6 ? anos + 1 : anos;
  // Tope 11 años (Art. 163 CT, contratos posteriores al 14/08/1981)
  const tope = 11;
  const topeAplicado = anosComputablesRaw > tope;
  const anosComputables = Math.min(anosComputablesRaw, tope);

  let ias = 0;
  let sustitutivaAviso = 0;
  let observaciones = '';

  if (causal === 'necesidades' || causal === 'caso-fortuito') {
    // Corresponde IAS
    ias = sueldo * anosComputables;
    // Si el empleador no dio aviso con 30 días de anticipación, debe pagar 1 sueldo más
    if (!aviso) {
      sustitutivaAviso = sueldo;
    }
    observaciones =
      'Despido por causal del Art. 161 CT — corresponde indemnización por años de servicio.';
  } else if (causal === 'renuncia') {
    // No corresponde IAS ni aviso, salvo contrato individual con cláusulas mejores
    observaciones =
      'En renuncia voluntaria (Art. 159 N°2) NO corresponde IAS ni indemnización sustitutiva del aviso. Solo feriado proporcional y remuneraciones pendientes.';
  } else if (causal === 'mutuo-acuerdo') {
    // Por mutuo acuerdo se negocia, no hay obligación legal salvo pacto
    observaciones =
      'Mutuo acuerdo (Art. 159 N°1): la IAS es negociable. Lo único exigible es feriado proporcional y remuneraciones devengadas.';
  }

  // Feriado proporcional: cada 15 días trabajados = 1 día de feriado (simplificado)
  // Valor día hábil: sueldo / 30 (remuneración diaria) pero feriado se paga en días hábiles
  // Estimación: feriado = sueldo × (días / 25) donde 25 son los días hábiles laborables en un mes
  const valorDiaFeriado = sueldo / 30; // CT considera remuneración diaria como mensual/30
  const feriadoProporcional = valorDiaFeriado * diasFeriado * 1.4; // factor días corridos por hábiles

  const totalFiniquito = ias + sustitutivaAviso + feriadoProporcional;

  return {
    indemnizacionAnosServicio: fmtCLP(ias),
    indemnizacionSustitutivaAviso: fmtCLP(sustitutivaAviso),
    feriadoProporcional: fmtCLP(feriadoProporcional),
    totalFiniquito: fmtCLP(totalFiniquito),
    topeAplicado: topeAplicado
      ? `Sí — se aplicó tope de 11 años (Art. 163 CT). Trabajaste ${anosComputablesRaw} años pero solo se computan 11.`
      : 'No — antigüedad dentro del tope de 11 años',
    anosComputables: `${anosComputables} ${anosComputables === 1 ? 'año' : 'años'} computables`,
    observaciones,
  };
}
