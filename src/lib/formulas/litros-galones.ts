/**
 * Conversor de litros a galones y mililitros/onzas
 * Modos: L→gal, gal→L, mL→oz fl, oz fl→mL
 */

export interface LitrosGalonesInputs {
  modo: string;
  volumen: number;
}

export interface LitrosGalonesOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
  _insight?: any;
}

export function litrosGalones(inputs: LitrosGalonesInputs): LitrosGalonesOutputs {
  const modo = inputs.modo || 'l-a-gal';
  const valor = Number(inputs.volumen);

  if (isNaN(valor)) throw new Error('Ingresá un valor de volumen válido');
  if (valor < 0) throw new Error('El volumen no puede ser negativo');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n);

  switch (modo) {
    case 'l-a-gal': {
      const r = valor / 3.78541;
      return {
        resultado: `${fmt(r)} gal (US)`,
        formula: `gal = L ÷ 3,78541 = ${fmt(valor)} ÷ 3,78541 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} litros equivalen a **${fmt(r)} galones estadounidenses**. El galón US (3,785 L) es la unidad de volumen más usada en EE.UU. para líquidos: nafta, leche, agua. No confundir con el galón imperial británico (4,546 L).`,
        _insight: {
          title: 'Conversión a galones US',
          text: `**${fmt(valor)} L** equivalen a **${fmt(r)} galones US**. Si fuera galón imperial británico (4,546 L) darían sólo **${fmt(valor / 4.54609)} gal**.`,
          tone: 'neutral',
          icon: '⛽',
        },
      };
    }
    case 'gal-a-l': {
      const r = valor * 3.78541;
      return {
        resultado: `${fmt(r)} L`,
        formula: `L = gal × 3,78541 = ${fmt(valor)} × 3,78541 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} galones US equivalen a **${fmt(r)} litros**. Un galón equivale aproximadamente a 3,8 litros, o sea unas 4 botellas grandes de gaseosa.`,
        _insight: {
          title: 'Conversión a litros',
          text: `**${fmt(valor)} galones US** son **${fmt(r)} litros**, equivalente a unas **${fmt(r / 1.5)}** botellas de 1,5 L de gaseosa.`,
          tone: 'neutral',
          icon: '⛽',
        },
      };
    }
    case 'ml-a-oz': {
      const r = valor / 29.5735;
      return {
        resultado: `${fmt(r)} oz fl`,
        formula: `oz fl = mL ÷ 29,5735 = ${fmt(valor)} ÷ 29,5735 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} mililitros equivalen a **${fmt(r)} onzas líquidas** (fluid ounces). La onza líquida US mide exactamente 29,5735 mL y se usa en recetas, bebidas y productos cosméticos en EE.UU.`,
        _insight: {
          title: 'Conversión a onzas líquidas',
          text: `**${fmt(valor)} mL** son **${fmt(r)} oz fl** (US). Como referencia, una lata estándar de 355 mL equivale a 12 oz fl.`,
          tone: 'neutral',
          icon: '🥤',
        },
      };
    }
    case 'oz-a-ml': {
      const r = valor * 29.5735;
      return {
        resultado: `${fmt(r)} mL`,
        formula: `mL = oz fl × 29,5735 = ${fmt(valor)} × 29,5735 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} onzas líquidas equivalen a **${fmt(r)} mililitros**. Para referencia: una lata de gaseosa estándar en EE.UU. tiene 12 oz fl (355 mL).`,
        _insight: {
          title: 'Conversión a mililitros',
          text: `**${fmt(valor)} oz fl** (US) son **${fmt(r)} mL**, equivalente a unas **${fmt(r / 355)}** latas estándar de 355 mL.`,
          tone: 'neutral',
          icon: '🥤',
        },
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí L→gal, gal→L, mL→oz fl u oz fl→mL.');
  }
}
