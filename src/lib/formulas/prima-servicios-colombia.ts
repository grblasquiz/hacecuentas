/** Prima de servicios Colombia — Art. 306 CST
 *  Un mes de salario por año: mitad en junio, mitad en diciembre
 */

export interface Inputs {
  salarioMensual: number;
  auxilioTransporte: string;
  diasTrabajadosSemestre: number;
  semestre: string;
}

export interface Outputs {
  baseLiquidacion: number;
  primaBruta: number;
  primaRedondeada: number;
  diasTrabajados: number;
  formula: string;
  explicacion: string;
}

export function primaServiciosColombia(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const incluyeAuxilio = i.auxilioTransporte === 'si' || i.auxilioTransporte === 'true';
  const dias = Math.min(180, Math.max(1, Number(i.diasTrabajadosSemestre) || 180));
  const semestre = String(i.semestre || 'junio');

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual');

  // SMLMV 2026 estimado
  const SMLMV = 1_423_500;
  // Auxilio de transporte 2026 estimado
  const AUXILIO_TRANSPORTE = 200_000;

  // Auxilio de transporte aplica si gana hasta 2 SMLMV
  let baseLiquidacion = salario;
  if (incluyeAuxilio && salario <= SMLMV * 2) {
    baseLiquidacion = salario + AUXILIO_TRANSPORTE;
  }

  // Prima = (salario base × días trabajados) / 360
  const primaBruta = (baseLiquidacion * dias) / 360;
  const primaRedondeada = Math.round(primaBruta);

  const semestreStr = semestre === 'junio' ? 'primer semestre (junio)' : 'segundo semestre (diciembre)';
  const formula = `Prima = ($${baseLiquidacion.toLocaleString()} × ${dias}) / 360 = $${primaRedondeada.toLocaleString()}`;
  const explicacion = `Prima de servicios del ${semestreStr}: con salario base de $${baseLiquidacion.toLocaleString()} COP${incluyeAuxilio && salario <= SMLMV * 2 ? ` (incluye auxilio de transporte $${AUXILIO_TRANSPORTE.toLocaleString()})` : ''} y ${dias} días trabajados en el semestre, tu prima es $${primaRedondeada.toLocaleString()} COP. Se paga en los primeros 15 días de ${semestre === 'junio' ? 'julio' : 'diciembre'}.`;

  return {
    baseLiquidacion: Math.round(baseLiquidacion),
    primaBruta: Number(primaBruta.toFixed(2)),
    primaRedondeada,
    diasTrabajados: dias,
    formula,
    explicacion,
  };
}
