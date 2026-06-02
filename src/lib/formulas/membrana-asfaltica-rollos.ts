export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function membranaAsfalticaRollos(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const rollos = Math.ceil((m * 1.1) / 10);
  const cubre = rollos * 10;
  const sobra = Math.round((cubre - m) * 10) / 10;
  const _insight = {
    title: 'Compra con margen',
    text: `Para impermeabilizar **${m} m²** necesitás **${rollos} rollos** (cada uno cubre 10 m²). Con el **10% de solape** entre tiras tenés cobertura para **${cubre} m²**, dejando **${sobra} m²** de reserva para cortes y remates.`,
    tone: 'neutral',
    icon: '🛠️',
  };
  return { rollos: rollos.toString(), resumen: `${rollos} rollos para ${m} m² (incluyendo 10% solape).`, _insight };
}
