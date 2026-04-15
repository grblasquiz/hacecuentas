/** Cantidad de tejas (francesas, coloniales, etc.) por m² de techo */
export interface Inputs {
  m2: number;
  tipoTeja?: string;
  pendiente?: number; // en %
  desperdicio?: number;
}
export interface Outputs {
  tejas: number;
  tejasPorM2: number;
  m2Reales: number;
  cumbreras: number;
  listonesMlineales: number;
  tipo: string;
  resumen: string;
}

const TIPOS: Record<string, { nombre: string; porM2: number }> = {
  francesa: { nombre: 'Teja francesa (plana mecanizada)', porM2: 14 },
  colonial: { nombre: 'Teja colonial (criolla)', porM2: 30 },
  romana: { nombre: 'Teja romana', porM2: 12 },
  portuguesa: { nombre: 'Teja portuguesa', porM2: 15 },
  espanola: { nombre: 'Teja española', porM2: 12 },
  shingle: { nombre: 'Teja asfáltica / shingle (por pieza 30×100 cm)', porM2: 3.3 },
  cemento: { nombre: 'Teja de cemento (tipo Tegola)', porM2: 10 },
};

export function techosTejas(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const tipo = String(i.tipoTeja || 'francesa');
  const pend = Number(i.pendiente) || 30; // 30% default
  const desp = Number(i.desperdicio) || 10;
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m² de techo en planta');
  if (!TIPOS[tipo]) throw new Error('Tipo de teja no válido');

  const t = TIPOS[tipo];
  // Ajuste por pendiente: la superficie real del techo inclinado es mayor que la proyección horizontal
  // área_real = m²_planta * √(1 + (pendiente/100)²)
  const factorPendiente = Math.sqrt(1 + Math.pow(pend / 100, 2));
  const m2Reales = m2 * factorPendiente;

  const base = m2Reales * t.porM2;
  const conDesp = base * (1 + desp / 100);

  // Cumbreras: aproximadamente 1 por cada 3.3 m de cumbrera; estimamos 1 cumbrera por cada 15 m² (promedio)
  const cumbreras = Math.ceil(m2Reales / 15);

  // Listones/tirantes: ~3 metros lineales por m² de techo
  const listonesMlineales = Math.ceil(m2Reales * 3);

  return {
    tejas: Math.ceil(conDesp),
    tejasPorM2: t.porM2,
    m2Reales: Number(m2Reales.toFixed(2)),
    cumbreras,
    listonesMlineales,
    tipo: t.nombre,
    resumen: `Necesitás ${Math.ceil(conDesp)} ${t.nombre.toLowerCase()} para un techo de ${m2} m² (pendiente ${pend}%).`,
  };
}
