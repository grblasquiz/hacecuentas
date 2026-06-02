/** Heladas: fecha probable por zona */
export interface Inputs { zona: string; }
export interface Outputs { primeraHelada: string; ultimaHelada: string; diasLibres: number; consejo: string; _insight?: any; }

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

const NOMBRES: Record<string, string> = {
  buenosaires: 'Buenos Aires', rosario: 'Rosario', cordoba: 'Córdoba', mendoza: 'Mendoza',
  tucuman: 'Tucumán', misiones: 'Misiones', neuquen: 'Neuquén', bariloche: 'Bariloche',
  mardelplata: 'Mar del Plata', salta: 'Salta',
};

export function heladasFechaPrimeraUltima(i: Inputs): Outputs {
  const zona = String(i.zona || 'buenosaires');
  const data = ZONAS[zona];
  if (!data) throw new Error('Zona no encontrada');

  const nombre = NOMBRES[zona] || 'tu zona';
  let toneIns: 'good' | 'warn' | 'neutral';
  let calif: string;
  if (data.libre >= 270) { toneIns = 'good'; calif = 'una temporada de cultivo larga y holgada'; }
  else if (data.libre >= 200) { toneIns = 'neutral'; calif = 'una temporada de cultivo media'; }
  else { toneIns = 'warn'; calif = 'una temporada de cultivo corta — invernadero casi obligatorio'; }
  const _insight = {
    title: 'Tu ventana libre de heladas',
    text: `En **${nombre}** tenés ~**${data.libre} días** sin heladas (de la última ${data.ultima} a la primera ${data.primera}): ${calif}. Plantá los cultivos sensibles después de la última helada y cosechá los de ciclo largo antes de la primera.`,
    tone: toneIns,
    icon: '❄️',
  };

  return {
    primeraHelada: data.primera,
    ultimaHelada: data.ultima,
    diasLibres: data.libre,
    consejo: data.consejo,
    _insight,
  };
}
