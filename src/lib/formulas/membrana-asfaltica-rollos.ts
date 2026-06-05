export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function membranaAsfalticaRollos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const rollos = Math.ceil((m * 1.1) / 10);
  const cubre = rollos * 10;
  const sobra = Math.round((cubre - m) * 10) / 10;

  const resumen = __lang === 'en'
    ? `${rollos} rolls for ${m} m² (10% overlap included).`
    : `${rollos} rollos para ${m} m² (incluyendo 10% solape).`;

  const insightTitle = __lang === 'en' ? 'Buy with margin' : 'Compra con margen';
  const insightText = __lang === 'en'
    ? `To waterproof **${m} m²** you need **${rollos} rolls** (each covers 10 m² gross). With the **10% overlap** between strips you have coverage for **${cubre} m²**, leaving **${sobra} m²** of reserve for cuts and finishing.`
    : `Para impermeabilizar **${m} m²** necesitás **${rollos} rollos** (cada uno cubre 10 m²). Con el **10% de solape** entre tiras tenés cobertura para **${cubre} m²**, dejando **${sobra} m²** de reserva para cortes y remates.`;

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'neutral',
    icon: '🛠️',
  };
  return { rollos: rollos.toString(), resumen, _insight };
}
