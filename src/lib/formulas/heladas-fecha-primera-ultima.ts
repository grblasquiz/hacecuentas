/** Heladas: fecha probable por zona */
export interface Inputs { zona: string; }
export interface Outputs { primeraHelada: string; ultimaHelada: string; diasLibres: number; consejo: string; }

interface HeladaData { primera: string; ultima: string; libre: number; consejo: string; }
const ZONAS: Record<string, HeladaData> = {
  buenosaires: { primera: '~20 de mayo', ultima: '~10 de septiembre', libre: 250, consejo: 'Trasplantá tomates y pimientos recién desde mediados de octubre.' },
  rosario: { primera: '~15 de mayo', ultima: '~5 de septiembre', libre: 250, consejo: 'Zona templada-cálida. Heladas moderadas, rara vez bajo -5°C.' },
  cordoba: { primera: '~10 de mayo', ultima: '~15 de septiembre', libre: 235, consejo: 'Heladas más frecuentes que Buenos Aires. Usá tela antihelada para frutales.' },
  mendoza: { primera: '~1 de mayo', ultima: '~20 de septiembre', libre: 220, consejo: 'Heladas tardías peligrosas para frutales en flor. Gran amplitud térmica.' },
  tucuman: { primera: '~20 de mayo', ultima: '~20 de agosto', libre: 270, consejo: 'Inviernos suaves en el valle. Heladas solo en noches despejadas y secas.' },
  misiones: { primera: '~15 de junio', ultima: '~15 de julio', libre: 330, consejo: 'Heladas muy raras (0-5 por año). Prácticamente tropical para la huerta.' },
  neuquen: { primera: '~15 de abril', ultima: '~15 de octubre', libre: 180, consejo: 'Temporada corta. Priorizá cultivos de ciclo corto o usá invernadero.' },
  bariloche: { primera: '~1 de abril', ultima: '~15 de noviembre', libre: 135, consejo: 'Temporada muy corta. Invernadero casi obligatorio para tomate y pimiento.' },
  mardelplata: { primera: '~25 de mayo', ultima: '~15 de septiembre', libre: 250, consejo: 'Clima oceánico: heladas menos intensas pero viento fuerte. Protegé del viento.' },
  salta: { primera: '~15 de mayo', ultima: '~15 de agosto', libre: 270, consejo: 'Valles templados. Heladas leves en invierno. Cuidado con heladas tardías en agosto.' },
};

export function heladasFechaPrimeraUltima(i: Inputs): Outputs {
  const zona = String(i.zona || 'buenosaires');
  const data = ZONAS[zona];
  if (!data) throw new Error('Zona no encontrada');
  return {
    primeraHelada: data.primera,
    ultimaHelada: data.ultima,
    diasLibres: data.libre,
    consejo: data.consejo,
  };
}
