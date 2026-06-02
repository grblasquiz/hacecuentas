/** Rate hora redactor copywriter freelance */
export interface Inputs { anosExperiencia: number; paisCliente: string; especializado: string; }
export interface Outputs { rateHora: number; rateMin: number; rateMax: number; rateProyecto: number; _insight?: any; }
export function costoHoraRedactorCopywriter(i: Inputs): Outputs {
  const anos = Number(i.anosExperiencia);
  const pais = String(i.paisCliente || 'latam');
  const esp = String(i.especializado || 'no');
  if (anos < 0) throw new Error('Años inválidos');
  const baseRate = 60;
  let byExp;
  if (anos < 2) byExp = baseRate * 0.5;
  else if (anos < 5) byExp = baseRate * 0.8;
  else if (anos < 10) byExp = baseRate * 1.2;
  else byExp = baseRate * 1.7;
  const mkts: Record<string, number> = { usa: 1.5, europa: 1.3, latam: 0.7, asia: 0.6 };
  const mult = mkts[pais] || 1.0;
  const espMult = esp === 'si' ? 1.35 : 1.0;
  const rate = byExp * mult * espMult;
  const rateHora = Math.round(rate);
  const rateMin = Math.round(rate * 0.8);
  const rateMax = Math.round(rate * 1.3);
  const nivel = anos < 2 ? 'junior' : anos < 5 ? 'semi-senior' : anos < 10 ? 'senior' : 'experto';
  const mercado = pais === 'usa' ? 'Estados Unidos' : pais === 'europa' ? 'Europa' : pais === 'asia' ? 'Asia' : 'Latinoamérica';
  const tono = mult >= 1.3 ? 'good' : mult <= 0.7 ? 'warn' : 'neutral';
  const txtMercado = mult >= 1.3
    ? `escribir para clientes de **${mercado}** te sube la tarifa frente a la base.`
    : mult <= 0.7
      ? `el mercado **${mercado}** paga por debajo de la media: apuntá a clientes de USA/Europa para subir el rate.`
      : `estás en un mercado de tarifa media.`;
  return {
    rateHora,
    rateMin,
    rateMax,
    rateProyecto: Math.round(rate * 40),
    _insight: {
      title: 'Tu tarifa de referencia',
      text: `Con perfil **${nivel}** podés cobrar entre **US$${rateMin}** y **US$${rateMax}/hora** (referencia US$${rateHora}). Para ${mercado}, ${txtMercado}`,
      tone: tono,
      icon: '✍️',
    },
  };
}
