export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }

export function jardineraTierraM3PorSuperficie(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const largo      = Math.max(0, Number(i.largo)      || 0);
  const ancho      = Math.max(0, Number(i.ancho)      || 0);
  const profundidad = Math.max(0, Number(i.profundidad) || 0);

  // Core formula: Volume (m³) = Length × Width × Depth
  const volumen = largo * ancho * profundidad;

  // Derived values
  const litros  = Math.round(volumen * 1000);
  // +15 % compaction/settling factor recommended by INTA / standard horticulture practice
  const conAsentamiento = +(volumen * 1.15).toFixed(2);
  const litrosConAsentamiento = Math.round(conAsentamiento * 1000);
  const bolsas50L  = Math.ceil(litrosConAsentamiento / 50);
  const bolsas80L  = Math.ceil(litrosConAsentamiento / 80);

  const resultadoFormatted = volumen.toFixed(3);

  // Insight text
  const insight = __lang === 'en'
    ? {
        title: 'Soil volume needed',
        text: volumen === 0
          ? 'Enter your garden bed dimensions to calculate the soil needed.'
          : `You need **${resultadoFormatted} m³** (${litros.toLocaleString('en')} L) of soil. Adding the recommended 15 % settling allowance → **${conAsentamiento} m³** (${litrosConAsentamiento.toLocaleString('en')} L). That is roughly **${bolsas50L} bags of 50 L** or **${bolsas80L} bags of 80 L**. For volumes over 0.5 m³, buying in bulk at a garden supply yard is usually 30–50 % cheaper than bagged soil.`,
        tone: 'neutral' as const,
        icon: '🪴',
      }
    : {
        title: 'Tierra que necesitás',
        text: volumen === 0
          ? 'Ingresá las dimensiones de tu cantero o jardinera para calcular la tierra necesaria.'
          : `Necesitás **${resultadoFormatted} m³** (${litros.toLocaleString('es-AR')} L) de tierra. Con el margen de asentamiento del 15 % recomendado por el INTA → **${conAsentamiento} m³** (${litrosConAsentamiento.toLocaleString('es-AR')} L). Eso equivale a unas **${bolsas50L} bolsas de 50 L** o **${bolsas80L} bolsas de 80 L**. Para más de 0,5 m³ conviene comprar a granel en corralón: suele ser entre un 30 % y un 50 % más barato que en bolsas de vivero.`,
        tone: 'neutral' as const,
        icon: '🪴',
      };

  const resumen = __lang === 'en'
    ? `${largo} m × ${ancho} m × ${profundidad} m = ${resultadoFormatted} m³ (${litros.toLocaleString('en')} L). With 15% settling: ${conAsentamiento} m³.`
    : `${largo} m × ${ancho} m × ${profundidad} m = ${resultadoFormatted} m³ (${litros.toLocaleString('es-AR')} L). Con asentamiento del 15 %: ${conAsentamiento} m³.`;

  return {
    resultado: resultadoFormatted,
    resumen,
    _insight: insight,
  };
}
