/**
 * Calculadora de días laborables/hábiles entre dos fechas
 * Excluye fines de semana (domingos siempre, sábados opcionalmente)
 */

export interface DiasLaborablesInputs {
  fechaInicio: string;
  fechaFin: string;
  incluirSabados: string | boolean;
}

export interface DiasLaborablesOutputs {
  diasLaborables: string;
  diasTotales: string;
  finDeSemana: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function diasLaborablesEntreFechas(inputs: DiasLaborablesInputs): DiasLaborablesOutputs {
  const { fechaInicio, fechaFin } = inputs;
  const incluirSabados = inputs.incluirSabados === true || inputs.incluirSabados === 'true';

  if (!fechaInicio || !fechaFin) throw new Error('Ingresá ambas fechas');

  const partsI = String(fechaInicio || '').split('-').map(Number);
  const partsF = String(fechaFin || '').split('-').map(Number);
  if (partsI.length !== 3 || partsI.some(isNaN) || partsF.length !== 3 || partsF.some(isNaN)) {
    throw new Error('Fecha inválida');
  }
  const [yI, mI, dI] = partsI;
  const [yF, mF, dF] = partsF;
  const inicio = new Date(yI, mI - 1, dI);
  const fin = new Date(yF, mF - 1, dF);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) throw new Error('Fecha inválida');

  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  // Ensure inicio <= fin
  const [desde, hasta] = inicio <= fin ? [inicio, fin] : [fin, inicio];

  const msPerDay = 1000 * 60 * 60 * 24;
  const diasTotales = Math.round((hasta.getTime() - desde.getTime()) / msPerDay);

  let laborables = 0;
  let finDeSemana = 0;
  const current = new Date(inicio.getTime());

  for (let d = 0; d < diasTotales; d++) {
    const dia = current.getDay(); // 0=dom, 6=sab
    const esDomingo = dia === 0;
    const esSabado = dia === 6;

    if (esDomingo) {
      finDeSemana++;
    } else if (esSabado && !incluirSabados) {
      finDeSemana++;
    } else {
      laborables++;
    }

    current.setDate(current.getDate() + 1);
  }

  const formatFecha = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const sabadosTexto = incluirSabados ? 'Los sábados se cuentan como laborables.' : 'Los sábados se excluyen (fin de semana).';

  const pctHabiles = diasTotales > 0 ? Math.round((laborables / diasTotales) * 100) : 0;

  const out: DiasLaborablesOutputs = {
    diasLaborables: `${laborables} días hábiles`,
    diasTotales: `${diasTotales} días calendario`,
    finDeSemana: `${finDeSemana} días de fin de semana`,
    formula: `Días hábiles = Días totales (${diasTotales}) − Fines de semana (${finDeSemana}) = ${laborables}`,
    explicacion: `Entre el **${formatFecha(desde)}** y el **${formatFecha(hasta)}** hay **${diasTotales} días calendario**. Descontando ${finDeSemana} días de fin de semana, quedan **${laborables} días laborables/hábiles**. ${sabadosTexto} Nota: no se descuentan feriados nacionales porque varían según el país y el año.`,
    _insight: {
      title: 'Hábiles vs calendario',
      text: `De los **${diasTotales} días calendario** del período, **${laborables} son hábiles** (${pctHabiles}%) y ${finDeSemana} caen en fin de semana. ${incluirSabados ? 'Estás contando los sábados como laborables.' : 'Los sábados quedan afuera junto con los domingos.'}`,
      tone: 'neutral',
      icon: '🗓️',
    },
  };

  if (diasTotales > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Días hábiles', value: laborables },
        { label: 'Fin de semana', value: finDeSemana },
      ],
      prefix: '',
      centerValue: `${diasTotales}`,
      centerLabel: 'días totales',
      ariaLabel: `Composición del período: ${laborables} días hábiles y ${finDeSemana} días de fin de semana sobre ${diasTotales} totales`,
    };
  }

  return out;
}
