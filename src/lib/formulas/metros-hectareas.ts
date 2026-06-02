/**
 * Conversor de metros cuadrados a hectáreas y acres
 * Modos: m²→ha, ha→m², m²→acres, acres→m²
 */

export interface MetrosHectareasInputs {
  modo: string;
  superficie: number;
}

export interface MetrosHectareasOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
  _insight?: any;
}

export function metrosHectareas(inputs: MetrosHectareasInputs): MetrosHectareasOutputs {
  const modo = inputs.modo || 'm2-a-ha';
  const valor = Number(inputs.superficie);

  if (isNaN(valor)) throw new Error('Ingresá un valor de superficie válido');
  if (valor < 0) throw new Error('La superficie no puede ser negativa');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n);
  const fmtInt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);

  switch (modo) {
    case 'm2-a-ha': {
      const r = valor / 10000;
      return {
        resultado: `${fmt(r)} ha`,
        formula: `ha = m² ÷ 10.000 = ${fmtInt(valor)} ÷ 10.000 = ${fmt(r)}`,
        explicacion: `${fmtInt(valor)} metros cuadrados equivalen a **${fmt(r)} hectáreas**. Una hectárea es un cuadrado de 100 m × 100 m, equivalente a una manzana grande de ciudad. Se usa para medir campos, terrenos rurales y lotes grandes.`,
        _insight: {
          title: 'De m² a hectáreas',
          text: `**${fmtInt(valor)} m²** son **${fmt(r)} ha**. Una hectárea equivale a 10.000 m² (un cuadrado de 100 × 100 m), la unidad estándar para campos y terrenos rurales.`,
          tone: 'neutral' as const,
          icon: '🌾',
        },
      };
    }
    case 'ha-a-m2': {
      const r = valor * 10000;
      return {
        resultado: `${fmtInt(r)} m²`,
        formula: `m² = ha × 10.000 = ${fmt(valor)} × 10.000 = ${fmtInt(r)}`,
        explicacion: `${fmt(valor)} hectáreas equivalen a **${fmtInt(r)} metros cuadrados**. Para tener una referencia, una cancha de fútbol profesional tiene entre 0,7 y 0,8 hectáreas.`,
        _insight: {
          title: 'De hectáreas a m²',
          text: `**${fmt(valor)} ha** equivalen a **${fmtInt(r)} m²**. Como referencia, una cancha de fútbol profesional ronda las 0,7-0,8 ha, así que tu superficie equivale a unas **${fmt(valor / 0.75)} canchas**.`,
          tone: 'neutral' as const,
          icon: '🌾',
        },
      };
    }
    case 'm2-a-acres': {
      const r = valor / 4046.8564224;
      return {
        resultado: `${fmt(r)} acres`,
        formula: `acres = m² ÷ 4.046,86 = ${fmtInt(valor)} ÷ 4.046,86 = ${fmt(r)}`,
        explicacion: `${fmtInt(valor)} metros cuadrados equivalen a **${fmt(r)} acres**. Un acre equivale a 4.046,86 m² y se usa principalmente en EE.UU., Reino Unido y otros países anglosajones para medir terrenos.`,
        _insight: {
          title: 'De m² a acres',
          text: `**${fmtInt(valor)} m²** son **${fmt(r)} acres**. El acre (4.046,86 m²) es la unidad de terreno típica en EE.UU. y Reino Unido; equivale a poco menos de media hectárea.`,
          tone: 'neutral' as const,
          icon: '🌾',
        },
      };
    }
    case 'acres-a-m2': {
      const r = valor * 4046.8564224;
      return {
        resultado: `${fmtInt(r)} m²`,
        formula: `m² = acres × 4.046,86 = ${fmt(valor)} × 4.046,86 = ${fmtInt(r)}`,
        explicacion: `${fmt(valor)} acres equivalen a **${fmtInt(r)} metros cuadrados** (${fmt(r / 10000)} hectáreas). El acre es una medida anglosajona de superficie que se usa mucho en el mercado inmobiliario de EE.UU.`,
        _insight: {
          title: 'De acres a m²',
          text: `**${fmt(valor)} acres** equivalen a **${fmtInt(r)} m²**, o sea **${fmt(r / 10000)} hectáreas**. Útil para comparar terrenos publicados en acres (EE.UU./UK) contra el sistema métrico.`,
          tone: 'neutral' as const,
          icon: '🌾',
        },
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí m²→ha, ha→m², m²→acres o acres→m².');
  }
}
