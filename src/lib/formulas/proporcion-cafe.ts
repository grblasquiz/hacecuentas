/** Proporción de café y agua según método */
export interface Inputs { tazas: number; metodo?: string; }
export interface Outputs { gramosCafe: number; mlAgua: number; temperaturaAgua: string; tiempoExtraccion: string; detalle: string; }

export function proporcionCafe(i: Inputs): Outputs {
  const tazas = Number(i.tazas);
  const metodo = String(i.metodo || 'filtrado');

  if (!tazas || tazas <= 0) throw new Error('Ingresá la cantidad de tazas');

  // Configuración por método: [ratio (g cafe / ml agua), temp, tiempo, ml por taza]
  const metodos: Record<string, { ratio: number; temp: string; tiempo: string; mlPorTaza: number; nombre: string }> = {
    'filtrado': { ratio: 1/16, temp: '92-96°C', tiempo: '3-4 minutos', mlPorTaza: 250, nombre: 'filtrado' },
    'espresso': { ratio: 1/2, temp: '90-94°C', tiempo: '25-30 segundos', mlPorTaza: 36, nombre: 'espresso' },
    'prensa-francesa': { ratio: 1/15, temp: '93-96°C', tiempo: '4 minutos exactos', mlPorTaza: 250, nombre: 'prensa francesa' },
    'moka': { ratio: 1/10, temp: 'Fuego medio (vapor a ~100°C)', tiempo: '3-5 minutos', mlPorTaza: 150, nombre: 'moka (italiana)' },
    'cold-brew': { ratio: 1/8, temp: 'Fría o ambiente', tiempo: '12-24 horas en heladera', mlPorTaza: 250, nombre: 'cold brew' },
  };

  const m = metodos[metodo] || metodos.filtrado;
  const aguaTotal = tazas * m.mlPorTaza;
  const cafeTotal = Math.round(aguaTotal * m.ratio);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let extra = '';
  if (metodo === 'cold-brew') {
    extra = ' El resultado es concentrado; diluir 1:1 con agua o leche al servir.';
  }

  return {
    gramosCafe: cafeTotal,
    mlAgua: aguaTotal,
    temperaturaAgua: m.temp,
    tiempoExtraccion: m.tiempo,
    detalle: `${tazas} taza${tazas > 1 ? 's' : ''} de café ${m.nombre}: ${fmt.format(cafeTotal)} g de café + ${fmt.format(aguaTotal)} ml de agua a ${m.temp}. Tiempo: ${m.tiempo}.${extra}`,
  };
}
