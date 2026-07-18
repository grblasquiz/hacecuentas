/**
 * Costo del pasaporte ordinario electrónico — Ecuador (Registro Civil / DIGERCIC).
 *
 * Devuelve el costo según el solicitante. Adulto (18+) $90 con 10 años de vigencia; menor $80 con
 * hasta 5 años; tercera edad (65+) 50% de descuento → $45; discapacidad ≥30% exonerada. La
 * renovación cuesta lo mismo que la primera emisión. No hay recargo por trámite urgente: en las
 * oficinas principales (Quito Matriz, Guayaquil, Cuenca) la entrega es el mismo día sin costo extra.
 *
 * Tarifas importadas de la data país (NO hardcodear).
 */
import { PASAPORTE_EC_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  solicitante?: string;    // 'adulto' | 'menor' | 'tercera_edad' | 'discapacidad'
  incluyeCedula?: string;  // 'si' suma el costo de renovar la cédula ($15), requisito previo
}
export interface Outputs { [k: string]: any; _insight?: any; }

const CEDULA = 15; // costo de la cédula (requisito para tramitar el pasaporte)

const LABELS: Record<string, string> = {
  adulto: 'Adulto (18 años o más)',
  menor: 'Menor de 18 años',
  tercera_edad: 'Adulto mayor (65+, 50% descuento)',
  discapacidad: 'Persona con discapacidad ≥30% (exonerado)',
};

export function compute(i: Inputs): Outputs {
  const P = PASAPORTE_EC_2026;
  const key = (i.solicitante && ['adulto', 'menor', 'tercera_edad', 'discapacidad'].includes(i.solicitante))
    ? i.solicitante
    : 'adulto';

  const costoPasaporte =
    key === 'menor' ? P.menor :
    key === 'tercera_edad' ? P.terceraEdad :
    key === 'discapacidad' ? P.discapacidad :
    P.adulto;

  const vigencia = key === 'menor' ? P.vigenciaMenor : P.vigenciaAdulto;

  const sumaCedula = (i.incluyeCedula ?? 'no') === 'si';
  const cedula = sumaCedula ? CEDULA : 0;
  const total = costoPasaporte + cedula;

  const exonerado = key === 'discapacidad';

  const _insight = {
    title: exonerado ? 'Pasaporte exonerado' : `Pasaporte: ${fmtUSDec(costoPasaporte)}`,
    text: exonerado
      ? `Las personas con **discapacidad del 30% o más** están **exoneradas** del costo del pasaporte ordinario ($90). Solo pagarías la cédula si necesitás renovarla (${fmtUSDec(CEDULA)}). El pasaporte tiene una vigencia de ${vigencia} años.`
      : `El pasaporte ordinario electrónico para "${LABELS[key]}" cuesta **${fmtUSDec(costoPasaporte)}** y vale **${vigencia} años**${key === 'tercera_edad' ? ' (los adultos mayores tienen 50% de descuento sobre los $90)' : ''}. La renovación cuesta lo mismo que la primera vez.${sumaCedula ? ` Sumando la renovación de la cédula (${fmtUSDec(CEDULA)}), el trámite completo sale **${fmtUSDec(total)}**.` : ''} No hay recargo por urgencia: en Quito Matriz, Guayaquil y Cuenca se entrega el mismo día.`,
    tone: 'neutral',
    icon: '🛂',
  };

  return {
    total: fmtUSDec(total),
    costoPasaporte: fmtUSDec(costoPasaporte),
    costoCedula: fmtUSDec(cedula),
    vigencia: `${vigencia} años`,
    detalle: `${LABELS[key]}: pasaporte ${fmtUSDec(costoPasaporte)}${sumaCedula ? ` + cédula ${fmtUSDec(CEDULA)} = ${fmtUSDec(total)}` : ''} · vigencia ${vigencia} años.`,
    _insight,
  };
}
