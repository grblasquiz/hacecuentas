/** Calculadora Peso en Otro Planeta */
export interface Inputs { pesoTierra: number; }
export interface Outputs { resultado: string; pesoLuna: number; pesoMarte: number; pesoJupiter: number; pesoTodos: string; }

export function pesoEnOtroPlaneta(i: Inputs): Outputs {
  const peso = Number(i.pesoTierra);
  if (!peso || peso <= 0) throw new Error('El peso debe ser mayor a 0');

  const gTierra = 9.81;
  const masa = peso; // In everyday terms, "peso en kg" = masa

  // Gravedad superficial relativa a la Tierra
  const planetas: { nombre: string; gRel: number }[] = [
    { nombre: 'Mercurio', gRel: 0.377 },
    { nombre: 'Venus', gRel: 0.905 },
    { nombre: 'Luna', gRel: 0.165 },
    { nombre: 'Marte', gRel: 0.379 },
    { nombre: 'Júpiter', gRel: 2.528 },
    { nombre: 'Saturno', gRel: 1.065 },
    { nombre: 'Urano', gRel: 0.886 },
    { nombre: 'Neptuno', gRel: 1.137 },
    { nombre: 'Plutón', gRel: 0.063 },
  ];

  const pesos = planetas.map(p => ({ ...p, peso: Number((masa * p.gRel).toFixed(1)) }));
  const luna = pesos.find(p => p.nombre === 'Luna')!.peso;
  const marte = pesos.find(p => p.nombre === 'Marte')!.peso;
  const jupiter = pesos.find(p => p.nombre === 'Júpiter')!.peso;

  const todos = pesos.map(p => `${p.nombre}: ${p.peso} kg`).join(' | ');

  return {
    resultado: `En la Luna: ${luna} kg. En Marte: ${marte} kg. En Júpiter: ${jupiter} kg.`,
    pesoLuna: luna,
    pesoMarte: marte,
    pesoJupiter: jupiter,
    pesoTodos: todos,
  };
}
