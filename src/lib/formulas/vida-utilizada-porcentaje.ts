/** Porcentaje de vida ya vivido según edad y esperanza de vida del país */
export interface Inputs {
  edad: number;
  pais?: string;
  sexo?: string;
}
export interface Outputs {
  porcentajeVivido: number;
  porcentajeRestante: number;
  esperanzaVida: number;
  anosRestantes: number;
  diasVividos: number;
  diasRestantes: number;
  semanasRestantes: number;
  finesSemanaRestantes: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

// Esperanza de vida por país (fuente: Banco Mundial 2024, OMS)
const ESPERANZA_VIDA: Record<string, { m: number; f: number }> = {
  'argentina': { m: 73.2, f: 79.7 },
  'chile': { m: 77.5, f: 82.8 },
  'españa': { m: 81.2, f: 86.3 },
  'mexico': { m: 73.1, f: 78.8 },
  'colombia': { m: 74.1, f: 80.3 },
  'uruguay': { m: 74.0, f: 81.3 },
  'peru': { m: 73.5, f: 78.5 },
  'brasil': { m: 73.2, f: 80.2 },
  'usa': { m: 76.3, f: 81.4 },
  'japon': { m: 81.5, f: 87.6 },
  'global': { m: 71.0, f: 76.0 },
};

export function vidaUtilizadaPorcentaje(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const pais = String(i.pais || 'argentina').toLowerCase();
  const sexo = String(i.sexo || 'f');

  if (!edad || edad < 0 || edad > 120) throw new Error('Ingresá una edad válida');

  const datos = ESPERANZA_VIDA[pais] || ESPERANZA_VIDA['global'];
  const esperanzaVida = sexo === 'm' ? datos.m : datos.f;

  const porcentajeVivido = Math.min(100, (edad / esperanzaVida) * 100);
  const porcentajeRestante = Math.max(0, 100 - porcentajeVivido);
  const anosRestantes = Math.max(0, esperanzaVida - edad);
  const diasVividos = Math.round(edad * 365.25);
  const diasRestantes = Math.round(anosRestantes * 365.25);
  const semanasRestantes = Math.round(anosRestantes * 52.18);
  const finesSemanaRestantes = Math.round(anosRestantes * 52);

  let mensaje = '';
  if (porcentajeVivido < 25) mensaje = 'Recién arrancaste. Tiempo de sobra para soñar y construir.';
  else if (porcentajeVivido < 50) mensaje = 'Estás en la etapa productiva. Aprovechá cada día.';
  else if (porcentajeVivido < 75) mensaje = 'Ya vivido más de la mitad. Foco en lo importante.';
  else mensaje = 'Cada día vale oro. Disfrutá lo que te queda.';

  const pctV = Number(porcentajeVivido.toFixed(1));
  const _insight = {
    title: 'Tu vida en perspectiva',
    text: `Llevás vivido el **${pctV}%** de una esperanza de vida de **${esperanzaVida.toFixed(1)} años**. Te quedarían ~**${Math.round(anosRestantes)} años** (${finesSemanaRestantes.toLocaleString('es-AR')} fines de semana). ${mensaje}`,
    tone: 'neutral',
    icon: '⏳',
  };
  const _chart = {
    type: 'scale' as const,
    marker: pctV,
    markerLabel: `${pctV}% vivido`,
    min: 0,
    segments: [
      { nombre: 'Juventud', max: 25, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Etapa productiva', max: 50, color: '#0891b2', colorDark: '#22d3ee' },
      { nombre: 'Madurez', max: 75, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Plenitud', max: 101, color: '#7c3aed', colorDark: '#a78bfa' },
    ],
    ariaLabel: `Porcentaje de vida vivido: ${pctV}% sobre una esperanza de ${esperanzaVida.toFixed(1)} años`,
  };

  return {
    porcentajeVivido: pctV,
    porcentajeRestante: Number(porcentajeRestante.toFixed(1)),
    esperanzaVida: Number(esperanzaVida.toFixed(1)),
    anosRestantes: Number(anosRestantes.toFixed(1)),
    diasVividos,
    diasRestantes,
    semanasRestantes,
    finesSemanaRestantes,
    resumen: `Llevás vivido el ${porcentajeVivido.toFixed(1)}% de tu vida esperada. Te quedan ~${Math.round(anosRestantes)} años (${finesSemanaRestantes} fines de semana). ${mensaje}`,
    _insight,
    _chart,
  };
}
