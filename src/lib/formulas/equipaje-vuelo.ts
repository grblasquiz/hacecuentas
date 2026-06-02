/** Equipaje: kg / lb conversión + límites aerolíneas */
export interface Inputs { pesoKg: number; tipoVuelo?: string; }
export interface Outputs {
  pesoKg: number;
  pesoLb: number;
  excedenteBajoCosto: number;
  excedenteTradicional: number;
  mensajeBajoCosto: string;
  mensajeTradicional: string;
  _insight?: any;
}

export function equipajeVuelo(i: Inputs): Outputs {
  const kg = Number(i.pesoKg);
  const tipo = String(i.tipoVuelo || 'internacional');
  if (!kg || kg < 0) throw new Error('Ingresá el peso en kg');

  const lb = kg * 2.20462;

  // Límites habituales
  const limBC = tipo === 'cabotaje' ? 8 : 10; // Flybondi/JetSmart mano
  const limTrad = tipo === 'cabotaje' ? 15 : 23; // Aerolíneas / LATAM bodega

  const excBC = Math.max(0, kg - limBC);
  const excTrad = Math.max(0, kg - limTrad);

  let msgBC = '';
  if (excBC <= 0) msgBC = `Dentro del límite de mano (${limBC} kg).`;
  else msgBC = `${excBC.toFixed(1)} kg por encima del límite de mano de low-cost (${limBC} kg).`;

  let msgTrad = '';
  if (excTrad <= 0) msgTrad = `Dentro del límite de bodega (${limTrad} kg).`;
  else msgTrad = `${excTrad.toFixed(1)} kg por encima del límite tradicional (${limTrad} kg).`;

  const _insight = {
    title: 'Tu valija de un vistazo',
    text: excTrad > 0
      ? `Tus **${kg.toFixed(1)} kg** (${lb.toFixed(1)} lb) superan en **${excTrad.toFixed(1)} kg** el límite de bodega tradicional (${limTrad} kg)${excBC > 0 ? ` y en ${excBC.toFixed(1)} kg el de mano low-cost (${limBC} kg)` : ''}. Sacá peso o pagá el exceso por kilo.`
      : excBC > 0
      ? `Tus **${kg.toFixed(1)} kg** (${lb.toFixed(1)} lb) entran en bodega (${limTrad} kg) pero pasan en **${excBC.toFixed(1)} kg** el límite de mano de low-cost (${limBC} kg): te conviene despacharla.`
      : `Tus **${kg.toFixed(1)} kg** (${lb.toFixed(1)} lb) entran tanto en mano (${limBC} kg) como en bodega (${limTrad} kg). Viajás sin pagar exceso.`,
    tone: excTrad > 0 ? 'warn' : excBC > 0 ? 'neutral' : 'good',
    icon: '🧳',
  };
  return {
    pesoKg: Number(kg.toFixed(2)),
    pesoLb: Number(lb.toFixed(2)),
    excedenteBajoCosto: Number(excBC.toFixed(2)),
    excedenteTradicional: Number(excTrad.toFixed(2)),
    mensajeBajoCosto: msgBC,
    mensajeTradicional: msgTrad,
    _insight,
  };
}
