export interface Inputs {
  metros_lineales: number;
  unidad_ancho: 'cm' | 'm';
  ancho_rollo: number;
  tipo_material: string;
}

export interface Outputs {
  metros_cuadrados: number;
  metros_inversos: number;
  detalle_calculo: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const metrosLineales = Number(i.metros_lineales) || 0;
  const anchoRollo = Number(i.ancho_rollo) || 0;
  const unidadAncho = i.unidad_ancho || 'cm';

  if (metrosLineales <= 0 || anchoRollo <= 0) {
    return {
      metros_cuadrados: 0,
      metros_inversos: 0,
      detalle_calculo: 'Ingresa metros lineales y ancho del rollo mayores a 0.'
    };
  }

  // Convertir ancho a metros
  const anchoEnMetros = unidadAncho === 'cm' ? anchoRollo / 100 : anchoRollo;

  // Fórmula: m² = metros lineales × ancho (en metros)
  const metrosCuadrados = metrosLineales * anchoEnMetros;

  // Inverso: metros lineales necesarios por m²
  const metrosInversos = anchoEnMetros > 0 ? 1 / anchoEnMetros : 0;

  // Detalle
  const tipoMaterial = i.tipo_material || 'personalizado';
  let nombreMaterial = 'Material personalizado';
  if (tipoMaterial === 'papel_pared') nombreMaterial = 'Papel de Pared';
  else if (tipoMaterial === 'tela_estandar') nombreMaterial = 'Tela Estándar';
  else if (tipoMaterial === 'alfombra') nombreMaterial = 'Alfombra';
  else if (tipoMaterial === 'tarima_laminado') nombreMaterial = 'Tarima/Laminado';

  const detalle = `${nombreMaterial}: ${metrosLineales} m lineales × ${anchoEnMetros.toFixed(2)} m ancho = ${metrosCuadrados.toFixed(2)} m²`;

  const m2 = Math.round(metrosCuadrados * 100) / 100;
  const fmt2 = (n: number) => n.toFixed(2).replace('.', ',');
  const _insight = {
    title: 'Superficie del rollo',
    text: `**${fmt2(metrosLineales)} m lineales** de ${nombreMaterial.toLowerCase()} con **${fmt2(anchoEnMetros)} m de ancho** cubren **${fmt2(m2)} m²**. Sumá un 10% extra al comprar para cubrir cortes, recortes y posibles errores.`,
    tone: 'neutral' as const,
    icon: '🧵',
  };

  return {
    metros_cuadrados: m2,
    metros_inversos: Math.round(metrosInversos * 100) / 100,
    detalle_calculo: detalle,
    _insight
  };
}
