export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

function nivelPPM(ppm: number): { nivel: string; rango: string; tone: 'positive' | 'neutral' | 'warning' } {
  if (ppm < 100) return { nivel: 'Muy lento', rango: '< 100 PPM', tone: 'warning' };
  if (ppm < 150) return { nivel: 'Lento', rango: '100–150 PPM', tone: 'warning' };
  if (ppm < 200) return { nivel: 'Por debajo del promedio', rango: '150–200 PPM', tone: 'neutral' };
  if (ppm <= 250) return { nivel: 'Promedio adulto', rango: '200–250 PPM', tone: 'neutral' };
  if (ppm < 300) return { nivel: 'Sobre el promedio', rango: '250–300 PPM', tone: 'positive' };
  if (ppm < 400) return { nivel: 'Bueno', rango: '300–400 PPM', tone: 'positive' };
  if (ppm < 600) return { nivel: 'Muy bueno', rango: '400–600 PPM', tone: 'positive' };
  if (ppm <= 1000) return { nivel: 'Lector veloz', rango: '600–1000 PPM', tone: 'warning' };
  return { nivel: 'Cuestionable ("speed reading")', rango: '> 1000 PPM', tone: 'warning' };
}

function fmt(n: number): string {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function lecturaVelocidadPalabrasMinutoTest(i: Inputs): Outputs {
  const palabras = Number(i.v1) || 0;
  const minutos = Number(i.v2) || 0;

  if (palabras <= 0 || minutos <= 0) {
    return {
      resultado: '0',
      resumen: 'Ingresá cuántas palabras leíste y el tiempo en minutos para calcular tu velocidad de lectura.',
      _insight: {
        title: 'Datos incompletos',
        text: 'Necesitás indicar la **cantidad de palabras** y el **tiempo en minutos** (por ejemplo, 1 min 48 s = 1,8 min).',
        tone: 'neutral',
        icon: '📖',
      },
    };
  }

  const ppm = palabras / minutos;
  const ppmRedondeado = Math.round(ppm);
  const { nivel, rango, tone } = nivelPPM(ppm);

  // Tiempos estimados para textos de referencia, a esta velocidad
  const minLibro = Math.round(80000 / ppm); // libro promedio ~80.000 palabras
  const horasLibro = (80000 / ppm / 60);

  const resumen = `Leés a ${fmt(ppmRedondeado)} palabras por minuto (PPM): nivel ${nivel} (${rango}). A este ritmo, un libro promedio de 80.000 palabras te lleva unas ${horasLibro.toFixed(1)} h de lectura neta.`;

  const text = `Leíste **${fmt(palabras)} palabras** en **${minutos.toLocaleString('es-AR', { maximumFractionDigits: 2 })} min**, así que tu velocidad es **${fmt(ppmRedondeado)} PPM**. Eso te ubica en el nivel **${nivel}** (${rango}). A esta velocidad terminás un libro promedio (80.000 palabras) en aproximadamente **${fmt(minLibro)} minutos** (${horasLibro.toFixed(1)} h).`;

  return {
    resultado: `${fmt(ppmRedondeado)} PPM`,
    resumen,
    _insight: {
      title: `${fmt(ppmRedondeado)} PPM — ${nivel}`,
      text,
      tone,
      icon: '📖',
    },
  };
}
