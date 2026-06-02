/**
 * Calculadora de Edad del Gato en Años Humanos
 * AAFP: Año 1 = 15, Año 2 = 24, después +4 por año
 */

export interface EdadGatoHumanoInputs {
  edadGato: number;
  tipoVida: string;
}

export interface EdadGatoHumanoOutputs {
  edadHumana: number;
  etapaVida: string;
  esperanzaVida: string;
  _insight?: any;
  _chart?: any;
}

export function edadGatoHumano(inputs: EdadGatoHumanoInputs): EdadGatoHumanoOutputs {
  const edadGato = Number(inputs.edadGato);
  const tipoVida = inputs.tipoVida || 'interior';

  if (!edadGato || edadGato <= 0) throw new Error('Ingresá la edad de tu gato');
  if (edadGato > 30) throw new Error('La edad máxima razonable para un gato es 30 años');

  let edadHumana: number;
  if (edadGato <= 1) {
    edadHumana = edadGato * 15;
  } else if (edadGato <= 2) {
    edadHumana = 15 + (edadGato - 1) * 9;
  } else {
    edadHumana = 24 + (edadGato - 2) * 4;
  }

  edadHumana = Math.round(edadHumana);

  let etapaVida: string;
  if (edadGato < 0.5) etapaVida = 'Gatito (kitten)';
  else if (edadGato < 2) etapaVida = 'Junior';
  else if (edadGato < 6) etapaVida = 'Adulto';
  else if (edadGato < 10) etapaVida = 'Adulto maduro';
  else if (edadGato < 14) etapaVida = 'Senior';
  else etapaVida = 'Geriátrico';

  const esperanza: Record<string, string> = {
    interior: '12-18 años',
    exterior: '5-10 años',
    mixto: '8-14 años',
  };

  const tono = edadGato >= 14 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Edad de tu gato',
    text: `Con **${edadGato} ${edadGato === 1 ? 'año' : 'años'}** felinos, tu gato equivale a unos **${edadHumana} años humanos** y está en etapa **${etapaVida}**.${edadGato >= 14 ? ' Es un gato geriátrico: conviene controles veterinarios más seguidos.' : edadGato >= 10 ? ' Ya es senior: chequeos anuales y atención a peso y riñón.' : ''}`,
    tone: tono,
    icon: '🐈',
  };

  const _chart = {
    type: 'scale',
    marker: edadGato,
    markerLabel: `${edadGato} ${edadGato === 1 ? 'año' : 'años'}`,
    min: 0,
    segments: [
      { nombre: 'Gatito', max: 0.5, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: 'Junior', max: 2, color: '#86efac', colorDark: '#166534' },
      { nombre: 'Adulto', max: 6, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: 'Adulto maduro', max: 10, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'Senior', max: 14, color: '#fdba74', colorDark: '#9a3412' },
      { nombre: 'Geriátrico', max: Math.max(20, edadGato + 1), color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: `Etapa de vida del gato: ${edadGato} años felinos, etapa ${etapaVida}.`,
  };

  return {
    edadHumana,
    etapaVida,
    esperanzaVida: `${esperanza[tipoVida] || '12-18 años'} (gato de ${tipoVida === 'interior' ? 'interior' : tipoVida === 'exterior' ? 'exterior' : 'vida mixta'})`,
    _insight,
    _chart,
  };
}
