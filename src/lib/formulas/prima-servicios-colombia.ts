/** Prima de servicios Colombia — Art. 306 CST
 *  Un mes de salario por año: mitad en junio, mitad en diciembre
 */
import { COLOMBIA_2026 } from '../data/colombia-2026';

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
  _insight?: any;
}

export function primaServiciosColombia(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const incluyeAuxilio = i.auxilioTransporte === 'si' || i.auxilioTransporte === 'true';
  const dias = Math.min(180, Math.max(1, Number(i.diasTrabajadosSemestre) || 180));
  const semestre = String(i.semestre || 'junio');

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual');

  // SMLMV 2026 (fuente única: src/lib/data/colombia-2026.ts)
  const SMLMV = COLOMBIA_2026.smlmv; // $1.750.905 (Decreto 1469/2025)
  // Auxilio de transporte 2026 estimado
  const AUXILIO_TRANSPORTE = COLOMBIA_2026.auxilioTransporte; // $249.095 (Decreto 1470/2025)

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

  const incluyoAuxilio = incluyeAuxilio && salario <= SMLMV * 2;
  const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = {
    title: 'Tu prima de servicios',
    text: `Por **${dias} días** trabajados en el ${semestre === 'junio' ? 'primer' : 'segundo'} semestre te corresponde una prima de **${cop(primaRedondeada)} COP**, calculada sobre una base de **${cop(baseLiquidacion)}**${incluyoAuxilio ? ` (incluye el auxilio de transporte de ${cop(AUXILIO_TRANSPORTE)})` : ''}. Se paga en los primeros 15 días de ${semestre === 'junio' ? 'julio' : 'diciembre'}.`,
    tone: 'good' as const,
    icon: '🇨🇴',
  };

  return {
    baseLiquidacion: Math.round(baseLiquidacion),
    primaBruta: Number(primaBruta.toFixed(2)),
    primaRedondeada,
    diasTrabajados: dias,
    formula,
    explicacion,
    _insight,
  };
}
