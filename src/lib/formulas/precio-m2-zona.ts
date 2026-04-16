/** Precio del m2 por zona */
export interface Inputs { zona: string; superficieM2: number; estado?: string; }
export interface Outputs { valorEstimado: string; precioM2: string; rangoValor: string; }

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

  return {
    valorEstimado: fmt(valorEst),
    precioM2: `US$${Math.round(precioM2).toLocaleString('es-AR')}/m2`,
    rangoValor: `${fmt(valorMin)} — ${fmt(valorMax)}`,
  };
}
