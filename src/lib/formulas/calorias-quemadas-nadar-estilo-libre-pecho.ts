/** Calorías quemadas nadando según peso, estilo y duración (crol vs pecho) */
export interface Inputs {
  peso: number; // kg
  estilo?: string; // crol_moderado | crol_rapido | pecho_suave | pecho_vigoroso | espalda | mariposa
  minutos: number;
  agua?: string; // 'climatizada' | 'fria'
}
export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  estiloMostrado: string;
  metUsado: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

interface DatoEstilo {
  nombre: string;
  met: number;
}

// MET por estilo e intensidad — Compendium of Physical Activities (Ainsworth).
const ESTILOS: Record<string, DatoEstilo> = {
  crol_moderado: { nombre: 'Crol (estilo libre) moderado', met: 5.8 },
  crol_rapido: { nombre: 'Crol (estilo libre) rápido', met: 9.8 },
  pecho_suave: { nombre: 'Pecho suave', met: 5.3 },
  pecho_vigoroso: { nombre: 'Pecho vigoroso', met: 10.3 },
  espalda: { nombre: 'Espalda', met: 9.5 },
  mariposa: { nombre: 'Mariposa', met: 13.8 },
};

// Orden de menor a mayor demanda, para la comparación visual entre estilos.
const ORDEN = ['pecho_suave', 'crol_moderado', 'espalda', 'crol_rapido', 'pecho_vigoroso', 'mariposa'];

export function caloriasQuemadasNadarEstiloLibrePecho(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const minutos = Number(i.minutos);
  const estilo = ESTILOS[String(i.estilo || 'crol_moderado')] || ESTILOS['crol_moderado'];
  const aguaFria = String(i.agua || 'climatizada') === 'fria';

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!minutos || minutos <= 0) throw new Error('Ingresá los minutos nadados');

  // Calorías = MET × peso (kg) × tiempo (horas). Agua fría suma ~10% por termorregulación.
  const horas = minutos / 60;
  const aguaMult = aguaFria ? 1.1 : 1.0;
  const total = estilo.met * peso * horas * aguaMult;
  const totalR = Math.round(total);
  const kcalMin = total / minutos;

  const fmtN = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Comparación entre estilos para el mismo peso y duración
  const labels: string[] = [];
  const data: number[] = [];
  for (const k of ORDEN) {
    const e = ESTILOS[k];
    labels.push(e.nombre.replace(' (estilo libre)', ''));
    data.push(Math.round(e.met * peso * horas * aguaMult));
  }

  // Equivalencia tangible: 1 alfajor de maicena ~250 kcal
  const alfajores = total / 250;
  const equiv =
    alfajores >= 1
      ? `${alfajores.toFixed(1)} alfajor${alfajores >= 2 ? 'es' : ''} de maicena`
      : `media porción de pizza (~${totalR} kcal)`;

  const vigoroso = estilo.met >= 9.5;
  const insText = `${minutos} min de **${estilo.nombre}**${aguaFria ? ' en agua fría' : ''} queman **${fmtN.format(totalR)} kcal** (${kcalMin.toFixed(1)} kcal/min), equivalente a ${equiv}. ${vigoroso ? 'Es un estilo de alta demanda: gran gasto calórico por minuto.' : 'Un ritmo sostenible que igual suma buen gasto cardiovascular.'}`;

  return {
    caloriasTotal: totalR,
    caloriasPorMinuto: Number(kcalMin.toFixed(1)),
    estiloMostrado: `${estilo.nombre} (MET ${estilo.met})`,
    metUsado: estilo.met,
    resumen: `Nadando **${estilo.nombre}** ${minutos} min${aguaFria ? ' en agua fría' : ''} quemás **${fmtN.format(totalR)} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${estilo.met}).`,
    _insight: {
      title: 'Lo que quemaste en la pileta',
      text: insText,
      tone: 'good',
      icon: '🏊',
    },
    _chart: {
      type: 'bar',
      ariaLabel: `Comparación de calorías quemadas en ${minutos} min según estilo de nado para ${peso} kg. La mariposa es la más demandante; el pecho suave y el crol moderado, los menos.`,
      data: {
        labels,
        datasets: [{ label: `kcal en ${minutos} min`, data, suffix: ' kcal' }],
      },
    },
  };
}
