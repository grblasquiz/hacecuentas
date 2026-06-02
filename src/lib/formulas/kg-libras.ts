/**
 * Conversor de kilogramos a libras y onzas
 * Modos: kg→lb, lb→kg, kg→oz, oz→kg
 */

export interface KgLibrasInputs {
  modo: string;
  peso: number;
}

export interface KgLibrasOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
  _insight?: any;
}

export function kgLibras(inputs: KgLibrasInputs): KgLibrasOutputs {
  const modo = inputs.modo || 'kg-a-lb';
  const peso = Number(inputs.peso);

  if (isNaN(peso)) throw new Error('Ingresá un valor de peso válido');
  if (peso < 0) throw new Error('El peso no puede ser negativo');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n);

  switch (modo) {
    case 'kg-a-lb': {
      const r = peso * 2.20462;
      return {
        resultado: `${fmt(r)} lb`,
        formula: `lb = kg × 2,20462 = ${fmt(peso)} × 2,20462 = ${fmt(r)}`,
        explicacion: `${fmt(peso)} kilogramos equivalen a **${fmt(r)} libras**. Una libra (pound) es la unidad de peso estándar en EE.UU. y otros países anglosajones. Para convertir rápido, multiplicá el peso en kg por 2,2.`,
        _insight: {
          title: 'Equivalencia',
          text: `**${fmt(peso)} kg** son **${fmt(r)} lb**. La regla mental rápida: multiplicá los kilos por 2,2 y tenés las libras casi exactas.`,
          tone: 'neutral',
          icon: '⚖️',
        },
      };
    }
    case 'lb-a-kg': {
      const r = peso / 2.20462;
      return {
        resultado: `${fmt(r)} kg`,
        formula: `kg = lb ÷ 2,20462 = ${fmt(peso)} ÷ 2,20462 = ${fmt(r)}`,
        explicacion: `${fmt(peso)} libras equivalen a **${fmt(r)} kilogramos**. Para una estimación rápida, dividí las libras por 2,2.`,
        _insight: {
          title: 'Equivalencia',
          text: `**${fmt(peso)} lb** son **${fmt(r)} kg**. Para calcularlo de memoria, dividí las libras por 2,2.`,
          tone: 'neutral',
          icon: '⚖️',
        },
      };
    }
    case 'kg-a-oz': {
      const r = peso * 35.274;
      return {
        resultado: `${fmt(r)} oz`,
        formula: `oz = kg × 35,274 = ${fmt(peso)} × 35,274 = ${fmt(r)}`,
        explicacion: `${fmt(peso)} kilogramos equivalen a **${fmt(r)} onzas**. Una onza (oz) equivale a 28,35 gramos. Se usa mucho en EE.UU. para pesar alimentos, metales preciosos y productos de consumo.`,
        _insight: {
          title: 'Equivalencia',
          text: `**${fmt(peso)} kg** equivalen a **${fmt(r)} oz**. Cada onza pesa 28,35 g, así que 1 kg ronda las 35 onzas.`,
          tone: 'neutral',
          icon: '⚖️',
        },
      };
    }
    case 'oz-a-kg': {
      const r = peso / 35.274;
      return {
        resultado: `${fmt(r)} kg`,
        formula: `kg = oz ÷ 35,274 = ${fmt(peso)} ÷ 35,274 = ${fmt(r)}`,
        explicacion: `${fmt(peso)} onzas equivalen a **${fmt(r)} kilogramos**. Cada onza pesa aproximadamente 28,35 gramos.`,
        _insight: {
          title: 'Equivalencia',
          text: `**${fmt(peso)} oz** son **${fmt(r)} kg**. Como cada onza pesa 28,35 g, dividí las onzas por 35,27 para pasar a kilos.`,
          tone: 'neutral',
          icon: '⚖️',
        },
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí kg→lb, lb→kg, kg→oz u oz→kg.');
  }
}
