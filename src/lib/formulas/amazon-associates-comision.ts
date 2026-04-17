/** Amazon Associates */
export interface Inputs { categoria: string; ventasMensuales: number; pais: string; }
export interface Outputs { tasaComision: string; comisionMensual: string; comisionAnual: string; nota: string; }

export function amazonAssociatesComision(i: Inputs): Outputs {
  const cat = String(i.categoria);
  const v = Number(i.ventasMensuales) || 0;
  const p = String(i.pais);
  if (!cat || !p) throw new Error('Seleccioná categoría y país');
  const tasas: Record<string, number> = {
    'Lujo (jewelry, luxury beauty)': 0.10,
    'Fashion / accesorios': 0.10,
    'Kindle books / audiolibros': 0.04,
    'Casa y cocina': 0.03,
    'Deportes': 0.045,
    'Electrónica': 0.01,
    'Pantallas y TV': 0.02,
    'Videojuegos': 0.01,
    'Amazon Fresh / groceries': 0.03,
    'Amazon Prime memberships': 0.10,
  };
  let tasa = tasas[cat] || 0.03;
  // Ajuste por país (España/México dan un poquito más en varias cats)
  if (p === 'Amazon.es' || p === 'Amazon.com.mx') tasa *= 1.2;
  const mensual = v * tasa;
  const anual = mensual * 12;
  return {
    tasaComision: `${(tasa * 100).toFixed(1)}% (categoría ${cat})`,
    comisionMensual: `$${mensual.toFixed(2)} USD/mes`,
    comisionAnual: `$${anual.toFixed(2)} USD/año`,
    nota: cat === 'Amazon Prime memberships' ? 'Prime memberships pagan flat fee $3-10 por signup según país' : 'Tasa aplica al carrito completo (no sólo al producto linkeado), con cookie de 24 hs',
  };
}
