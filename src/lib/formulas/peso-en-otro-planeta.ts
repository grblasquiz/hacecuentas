/** Calculadora Peso en Otro Planeta */
export interface Inputs { pesoTierra: number; __lang?: string; }
export interface Outputs { resultado: string; pesoLuna: number; pesoMarte: number; pesoJupiter: number; pesoTodos: string; }

export function pesoEnOtroPlaneta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'El peso debe ser mayor a 0',
    },
    en: {
      errorPeso: 'Weight must be greater than 0',
    },
  } as const)[__lang];

  const peso = Number(i.pesoTierra);
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  const gTierra = 9.81;
  const masa = peso; // In everyday terms, "peso en kg" = masa

  // Gravedad superficial relativa a la Tierra
  const planetas: { nombre: string; label: string; labelEn: string; gRel: number }[] = [
    { nombre: 'Mercurio', label: 'Mercurio', labelEn: 'Mercury', gRel: 0.377 },
    { nombre: 'Venus', label: 'Venus', labelEn: 'Venus', gRel: 0.905 },
    { nombre: 'Luna', label: 'Luna', labelEn: 'Moon', gRel: 0.165 },
    { nombre: 'Marte', label: 'Marte', labelEn: 'Mars', gRel: 0.379 },
    { nombre: 'Júpiter', label: 'Júpiter', labelEn: 'Jupiter', gRel: 2.528 },
    { nombre: 'Saturno', label: 'Saturno', labelEn: 'Saturn', gRel: 1.065 },
    { nombre: 'Urano', label: 'Urano', labelEn: 'Uranus', gRel: 0.886 },
    { nombre: 'Neptuno', label: 'Neptuno', labelEn: 'Neptune', gRel: 1.137 },
    { nombre: 'Plutón', label: 'Plutón', labelEn: 'Pluto', gRel: 0.063 },
  ];

  const pesos = planetas.map(p => ({ ...p, peso: Number((masa * p.gRel).toFixed(1)) }));
  const luna = pesos.find(p => p.nombre === 'Luna')!.peso;
  const marte = pesos.find(p => p.nombre === 'Marte')!.peso;
  const jupiter = pesos.find(p => p.nombre === 'Júpiter')!.peso;

  const todos = pesos.map(p => `${__lang === 'en' ? p.labelEn : p.label}: ${p.peso} kg`).join(' | ');

  return {
    resultado: __lang === 'en'
      ? `Moon ${luna} kg · Mars ${marte} kg`
      : `Luna ${luna} kg · Marte ${marte} kg`,
    pesoLuna: luna,
    pesoMarte: marte,
    pesoJupiter: jupiter,
    pesoTodos: todos,
  };
}
