/** Precio del m2 por zona */
export interface Inputs { zona: string; superficieM2: number; estado?: string; }
export interface Outputs { valorEstimado: string; precioM2: string; rangoValor: string; _insight?: any; }

export function precioM2Zona(i: Inputs): Outputs {
  const zona = i.zona || 'caballito-almagro';
  const m2 = Number(i.superficieM2);
  const estado = i.estado || 'bueno';
  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie en m2');

  const precios: Record<string, [number, number]> = {
    'puerto-madero': [3000, 4500],
    'palermo-belgrano': [2300, 3000],
    'recoleta-barrio-norte': [2000, 2800],
    'caballito-almagro': [1600, 2200],
    'villa-crespo-colegiales': [1800, 2500],
    'flores-floresta': [1300, 1800],
    'caba-sur': [1000, 1600],
    'gba-norte': [1800, 2500],
    'gba-oeste': [1200, 1600],
    'cordoba': [1000, 1500],
    'rosario': [1000, 1400],
    'mendoza': [900, 1300],
  };

  const [min, max] = precios[zona] || [1500, 2200];
  const promedio = (min + max) / 2;

  const ajuste: Record<string, number> = {
    'a-estrenar': 1.18, 'excelente': 1.08, 'bueno': 1, 'regular': 0.88, 'a-reciclar': 0.75,
  };
  const mult = ajuste[estado] || 1;
  const precioM2 = promedio * mult;
  const valorEst = m2 * precioM2;
  const valorMin = m2 * min * mult;
  const valorMax = m2 * max * mult;

  const fmt = (n: number) => `US$${Math.round(n).toLocaleString('es-AR')}`;

  const ajustePct = Math.round((mult - 1) * 100);
  let efectoEstado: string;
  if (ajustePct > 0) {
    efectoEstado = `El estado del inmueble suma **+${ajustePct}%** sobre la base de la zona.`;
  } else if (ajustePct < 0) {
    efectoEstado = `El estado castiga el valor en **${ajustePct}%** frente a una propiedad en buen estado.`;
  } else {
    efectoEstado = `Tomamos el estado como referencia (buen estado), sin premio ni castigo.`;
  }

  const _insight = {
    title: 'Cuánto vale aproximadamente',
    text: `A **${fmt(precioM2)}/m2** para esa zona y estado, los **${Math.round(m2)} m2** dan un valor estimado de **${fmt(valorEst)}** (rango ${fmt(valorMin)}–${fmt(valorMax)}). ${efectoEstado} Es una referencia de mercado, no una tasación.`,
    tone: 'neutral' as const,
    icon: '🏠',
  };

  return {
    valorEstimado: fmt(valorEst),
    precioM2: `US$${Math.round(precioM2).toLocaleString('es-AR')}/m2`,
    rangoValor: `${fmt(valorMin)} — ${fmt(valorMax)}`,
    _insight,
  };
}
