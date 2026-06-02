/**
 * Selenio RDA.
 */

export interface SelenioDiarioOxidativoInputs {
  edad: number;
  estado: string;
}

export interface SelenioDiarioOxidativoOutputs {
  selenioMcg: number;
  nuecesBrasil: number;
  resumen: string;
  _insight?: any;
}

export function selenioDiarioOxidativo(inputs: SelenioDiarioOxidativoInputs): SelenioDiarioOxidativoOutputs {
  const edad = Number(inputs.edad);
  const est = inputs.estado || 'normal';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let se: number;
  if (est === 'embarazo') se = 60;
  else if (est === 'lactancia') se = 70;
  else if (edad < 4) se = 20;
  else if (edad < 9) se = 30;
  else if (edad < 14) se = 40;
  else se = 55;
  const nueces = Math.max(1, Math.round(se / 90));
  const motivo = est === 'embarazo' ? ' La RDA sube en el **embarazo** para cubrir el desarrollo del bebé.' : est === 'lactancia' ? ' La **lactancia** eleva la RDA por el selenio que pasa a la leche materna.' : '';
  const insight = {
    title: 'Tu selenio diario',
    text: `Necesitás unos **${se} mcg de selenio al día**, que cubrís con apenas **${nueces} ${nueces === 1 ? 'nuez' : 'nueces'} de Brasil**.${motivo} Ojo: las nueces de Brasil son tan ricas en selenio que comer un puñado todos los días puede acercarte al límite tóxico (400 mcg/día), así que no abuses.`,
    tone: 'neutral',
    icon: '🥜',
  };
  return {
    selenioMcg: se,
    nuecesBrasil: nueces,
    resumen: `Tu RDA: ${se} mcg selenio/día ≈ ${nueces} nuez Brasil.`,
    _insight: insight,
  };
}
