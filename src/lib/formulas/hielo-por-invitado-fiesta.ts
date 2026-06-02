/**
 * Calculadora de Hielo por Invitado - Fiesta.
 */
export interface HieloPorInvitadoFiestaInputs { invitados:number; horas:number; clima:string; usoTragos:string; }
export interface HieloPorInvitadoFiestaOutputs { kgHielo:number; bolsas3kg:number; bolsas5kg:number; gramosPorPersona:number; _insight?:any; _chart?:any; }
export function hieloPorInvitadoFiesta(inputs: HieloPorInvitadoFiestaInputs): HieloPorInvitadoFiestaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const clima = inputs.clima;
  const uso = inputs.usoTragos;
  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');
  let gramos = uso === 'si' ? 400 : 200;
  if (clima === 'verano') gramos *= 2;
  else if (clima === 'invierno') gramos *= 0.6;
  if (horas >= 5) gramos *= 1.15;
  const kgHielo = (gramos * invitados) / 1000;
  const kgHieloR = Number(kgHielo.toFixed(1));
  const gPersona = Math.round(gramos);
  const bolsas5 = Math.ceil(kgHielo / 5);

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (gPersona >= 600) {
    insightText = `Demanda alta (${gPersona} g por persona): para ${invitados} invitados necesitás **${kgHieloR} kg de hielo** (${bolsas5} bolsas de 5 kg). Comprá con margen y sumá una conservadora extra, el hielo se derrite rápido.`;
    insightTone = 'warn';
  } else if (gPersona >= 300) {
    insightText = `Para ${invitados} invitados calculá **${kgHieloR} kg de hielo** (${bolsas5} bolsas de 5 kg), unos ${gPersona} g por cabeza. Mejor que sobre un poco a quedarte sin.`;
    insightTone = 'neutral';
  } else {
    insightText = `Evento liviano (${gPersona} g por persona): con **${kgHieloR} kg de hielo** (${bolsas5} bolsas de 5 kg) cubrís a tus ${invitados} invitados sin gastar de más.`;
    insightTone = 'good';
  }

  return {
    kgHielo: kgHieloR,
    bolsas3kg: Math.ceil(kgHielo / 3),
    bolsas5kg: bolsas5,
    gramosPorPersona: gPersona,
    _insight: {
      title: 'Tu compra de hielo',
      text: insightText,
      tone: insightTone,
      icon: '🧊',
    },
    _chart: {
      type: 'scale',
      marker: Math.min(gPersona, 1000),
      markerLabel: `${gPersona} g/persona`,
      min: 0,
      segments: [
        { nombre: 'Liviano', max: 300, color: '#bae6fd', colorDark: '#0369a1' },
        { nombre: 'Estándar', max: 600, color: '#38bdf8', colorDark: '#0284c7' },
        { nombre: 'Alto', max: 1000, color: '#0ea5e9', colorDark: '#075985' },
      ],
      ariaLabel: 'Hielo por persona según el tipo de evento',
    },
  };
}
