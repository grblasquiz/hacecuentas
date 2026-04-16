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

  return {
    edadHumana,
    etapaVida,
    esperanzaVida: `${esperanza[tipoVida] || '12-18 años'} (gato de ${tipoVida === 'interior' ? 'interior' : tipoVida === 'exterior' ? 'exterior' : 'vida mixta'})`,
  };
}
