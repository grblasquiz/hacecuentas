/** Calculadora de hidratación durante ejercicio */
export interface Inputs {
  peso: number;
  duracion: number;
  intensidad: string;
  clima: string;
}
export interface Outputs {
  mlPorHora: number;
  totalSesion: number;
  cadaCuanto: string;
  electrolitos: string;
  mensaje: string;
}

export function hidratacionEjercicioMl(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const duracion = Number(i.duracion) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // Base sweat rate ml/hr per kg
  let sudorBase: number;
  if (intensidad === 'baja') sudorBase = 6;
  else if (intensidad === 'moderada') sudorBase = 10;
  else sudorBase = 15; // alta

  // Climate factor
  let factorClima = 1.0;
  if (clima === 'frio') factorClima = 0.7;
  else if (clima === 'caluroso') factorClima = 1.3;
  else if (clima === 'humedo') factorClima = 1.5;

  let mlPorHora = Math.round(peso * sudorBase * factorClima);
  // Clamp to ACSM range
  if (mlPorHora < 300) mlPorHora = 300;
  if (mlPorHora > 1200) mlPorHora = 1200;

  const totalSesion = Math.round(mlPorHora * (duracion / 60));
  const cadaCuanto = `${Math.round(mlPorHora / 4)}-\${Math.round(mlPorHora / 3)} ml cada 15-20 min`;

  let electrolitos: string;
  if (duracion > 60 || (clima === 'caluroso' || clima === 'humedo')) {
    electrolitos = 'Sí — sumá electrolitos: 500-700 mg sodio/litro. Gatorade, sales de rehidratación o casero (1/4 cta sal + miel en 1L agua).';
  } else {
    electrolitos = 'No indispensable con menos de 60 min a intensidad moderada. Agua sola alcanza.';
  }

  return {
    mlPorHora,
    totalSesion,
    cadaCuanto,
    electrolitos,
    mensaje: `Tomá ~\${mlPorHora} ml/hora (\${totalSesion} ml total). \${duracion > 60 ? 'Sumá electrolitos.' : 'Agua sola alcanza.'}`
  };
}