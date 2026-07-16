/**
 * Pico y placa "hoy" — Bogotá, Medellín y Cali.
 * Dado el último dígito de la placa, la ciudad y el día, indica si el vehículo
 * puede circular y en qué horario rige la restricción.
 *
 * ⚠️ ESQUEMA DE REFERENCIA 2026. La asignación dígito→día ROTA cada semestre
 * (a veces cada mes) por decisión de cada Secretaría de Movilidad. Los horarios
 * y los pares de dígitos de abajo son un patrón de referencia frecuente, NO el
 * calendario vigente garantizado: verificá siempre la fuente oficial de tu ciudad.
 * VERIFICADO contra el módulo: la multa por transitar en restricción es una
 * infracción tipo C (COLOMBIA_2026.multasTransito.C). Fines de semana y festivos
 * nacionales: sin pico y placa (correcto y estable).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

const CIUDAD_NOMBRE: Record<string, string> = { bogota: 'Bogotá', medellin: 'Medellín', cali: 'Cali' };
const DIA_NOMBRE: Record<string, string> = {
  lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves',
  viernes: 'viernes', sabado: 'sábado', domingo: 'domingo',
};
const HORARIOS: Record<string, string> = {
  bogota: '6:00 a. m. a 9:00 p. m.',
  medellin: '5:00 a. m. a 8:00 p. m.',
  cali: '6:00 a. m. a 7:00 p. m.',
};
// Pares de dígitos restringidos por día (esquema de referencia 2026 — verificar oficial).
const RESTRICCION: Record<string, Record<string, number[]>> = {
  bogota: { lunes: [1, 2], martes: [3, 4], miercoles: [5, 6], jueves: [7, 8], viernes: [9, 0] },
  medellin: { lunes: [6, 9], martes: [5, 7], miercoles: [1, 8], jueves: [0, 2], viernes: [3, 4] },
  cali: { lunes: [1, 2], martes: [3, 4], miercoles: [5, 6], jueves: [7, 8], viernes: [9, 0] },
};

export interface Inputs {
  ciudad?: string;        // 'bogota' | 'medellin' | 'cali'
  ultimoDigito: string;   // '0'..'9' — último número de la placa
  dia?: string;           // 'lunes'..'domingo'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ciudad = ['bogota', 'medellin', 'cali'].includes(String(i.ciudad || 'bogota'))
    ? String(i.ciudad || 'bogota') : 'bogota';
  const dia = Object.keys(DIA_NOMBRE).includes(String(i.dia || 'lunes').toLowerCase())
    ? String(i.dia || 'lunes').toLowerCase() : 'lunes';

  const rawDigito = i.ultimoDigito;
  if (rawDigito === undefined || rawDigito === null || String(rawDigito).trim() === '') {
    throw new Error('Elegí el último dígito de tu placa (0 a 9)');
  }
  const digito = Math.trunc(Number(rawDigito));
  if (!Number.isFinite(digito) || digito < 0 || digito > 9) {
    throw new Error('El último dígito de la placa debe ser un número de 0 a 9');
  }

  const ciudadTxt = CIUDAD_NOMBRE[ciudad];
  const diaTxt = DIA_NOMBRE[dia];
  const horario = HORARIOS[ciudad];

  // Fines de semana: sin pico y placa (igual que festivos nacionales).
  if (dia === 'sabado' || dia === 'domingo') {
    return {
      puedeCircular: 'Sí, circula sin restricción',
      digitosRestringidos: 'Ninguno (fin de semana)',
      horarioRestriccion: 'No aplica los sábados ni domingos',
      motivo: `El pico y placa en ${ciudadTxt} rige de lunes a viernes. Los fines de semana —igual que los festivos nacionales— no hay restricción, así que tu placa terminada en ${digito} puede circular todo el día.`,
      detalle: `${ciudadTxt}, ${diaTxt}: sin pico y placa. Circulación libre para todos los dígitos. Esquema de referencia — confirmá el calendario oficial vigente de tu ciudad.`,
      _insight: {
        title: 'Hoy podés salir tranquilo',
        text: `**${diaTxt.charAt(0).toUpperCase() + diaTxt.slice(1)} en ${ciudadTxt}**: el pico y placa solo aplica de lunes a viernes. Tu placa terminada en **${digito}** circula sin restricción de horario.`,
        tone: 'good',
        icon: '🚗',
      },
    };
  }

  const restringidos = RESTRICCION[ciudad][dia];
  const tieneRestriccion = restringidos.includes(digito);
  const parDigitos = `${restringidos[0]} y ${restringidos[1]}`;
  const multa = fmtCOP(COLOMBIA_2026.multasTransito.C); // infracción tipo C (VERIFICADO módulo)

  const puedeCircular = tieneRestriccion ? 'No, tiene pico y placa hoy' : 'Sí, puede circular hoy';
  const horarioRestriccion = tieneRestriccion
    ? `${horario} — no podés circular en ese horario`
    : `${horario} (rige para las placas en ${parDigitos}, no para la tuya)`;
  const motivo = tieneRestriccion
    ? `El ${diaTxt} en ${ciudadTxt} el pico y placa restringe las placas terminadas en ${parDigitos}. Tu placa termina en ${digito}: no podés circular durante el horario de restricción (${horario}). Hacerlo es una infracción de tránsito tipo C (alrededor de ${multa} en 2026) y puede implicar la inmovilización del vehículo.`
    : `El ${diaTxt} en ${ciudadTxt} solo tienen pico y placa las placas terminadas en ${parDigitos}. Tu placa termina en ${digito}: hoy podés circular sin restricción de horario.`;
  const detalle = `${ciudadTxt} · ${diaTxt} · placa en ${digito}: ${tieneRestriccion ? 'CON' : 'SIN'} pico y placa. Dígitos restringidos hoy: ${parDigitos}. Horario de restricción en ${ciudadTxt}: ${horario} (esquema de referencia — verificá el calendario oficial vigente de la Secretaría de Movilidad).`;

  return {
    puedeCircular,
    digitosRestringidos: `Placas terminadas en ${parDigitos}`,
    horarioRestriccion,
    motivo,
    detalle,
    _insight: {
      title: tieneRestriccion ? `Hoy tu placa NO circula` : `Hoy tu placa SÍ circula`,
      text: tieneRestriccion
        ? `**${diaTxt.charAt(0).toUpperCase() + diaTxt.slice(1)} en ${ciudadTxt}** rige el pico y placa para las placas en **${parDigitos}**. La tuya termina en **${digito}**: quedate fuera de vía en el horario de restricción (**${horario}**). La multa por incumplir es una infracción tipo C, cerca de **${multa}** en 2026.`
        : `**${diaTxt.charAt(0).toUpperCase() + diaTxt.slice(1)} en ${ciudadTxt}** el pico y placa toca a las placas en **${parDigitos}**. La tuya termina en **${digito}**: podés circular sin restricción de horario.`,
      tone: tieneRestriccion ? 'warn' : 'good',
      icon: tieneRestriccion ? '🚫' : '🚗',
    },
  };
}
