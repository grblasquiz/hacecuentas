/**
 * Minutos de paseo diario recomendados según nivel de energía, tamaño y edad.
 * Basado en guías AKC / The Kennel Club: razas de alta energía (Border Collie,
 * Labrador, Dálmata) 60–120 min; energía media (Beagle, Golden) 45–75 min;
 * energía baja (Bulldog, Shih Tzu) 20–40 min.
 *
 * Ajustes:
 *   - Cachorro (<1 año): 5 min por mes de vida × 2 paseos (regla de AKC).
 *     Acá simplificamos: 60% del valor adulto, mínimo 15 min.
 *   - Senior (≥8 años): 70% del valor adulto, paseos más cortos y frecuentes.
 *   - Raza braquicéfala (bulldog, pug, boxer): NO se usa directamente porque
 *     "energía baja" ya captura la restricción respiratoria. Warning adicional.
 */

export interface Inputs {
  energia: string;        // 'baja' | 'media' | 'alta'
  tamano: string;         // 'chico' | 'mediano' | 'grande' | 'gigante'
  edad: string;           // 'cachorro' | 'adulto' | 'senior'
  braquicefalo?: boolean | string; // perros chatos: bulldog, pug, boxer
}

export interface Outputs {
  minutosDia: number;
  paseosDia: number;
  duracionPorPaseo: number;
  intensidad: string;
  resumen: string;
  advertencia: string;
}

// Base en minutos/día para adulto sano, según energía × tamaño.
const BASE: Record<string, Record<string, number>> = {
  baja:  { chico: 25, mediano: 30, grande: 35, gigante: 40 },
  media: { chico: 40, mediano: 55, grande: 70, gigante: 75 },
  alta:  { chico: 60, mediano: 80, grande: 100, gigante: 110 },
};

// Ajuste por edad (multiplicador sobre base adulta)
const FACTOR_EDAD: Record<string, number> = {
  cachorro: 0.6,
  adulto: 1.0,
  senior: 0.7,
};

export function paseosPerroMinutosRazaEnergia(i: Inputs): Outputs {
  const energia = String(i.energia || 'media').toLowerCase();
  const tamano = String(i.tamano || 'mediano').toLowerCase();
  const edad = String(i.edad || 'adulto').toLowerCase();
  const braqui =
    i.braquicefalo === true || i.braquicefalo === 'true' || i.braquicefalo === 'si';

  const baseEnergia = BASE[energia];
  if (!baseEnergia) throw new Error('Seleccioná un nivel de energía válido');
  const baseMin = baseEnergia[tamano];
  if (!baseMin) throw new Error('Seleccioná un tamaño válido');
  const factor = FACTOR_EDAD[edad];
  if (!factor) throw new Error('Seleccioná una edad válida');

  const minutosDia = Math.max(15, Math.round(baseMin * factor));

  // Paseos por día: cachorro/senior → más frecuentes y cortos; adulto → 1-2.
  const paseosDia = edad === 'cachorro' ? 3 : edad === 'senior' ? 3 : 2;
  const duracionPorPaseo = Math.round(minutosDia / paseosDia);

  let intensidad: string;
  if (energia === 'alta' && edad === 'adulto') {
    intensidad = 'Alta: combinar caminata rápida, trote y juegos activos (correr, fetch). Necesitan descarga mental además de física.';
  } else if (energia === 'baja' || edad === 'senior') {
    intensidad = 'Baja-moderada: paso cómodo en terreno plano, paradas frecuentes para olfatear.';
  } else {
    intensidad = 'Moderada: caminata con ritmo, algún tramo de trote. Olfatear es parte del ejercicio.';
  }

  let advertencia = '';
  if (braqui) {
    advertencia +=
      'Raza braquicéfala (cara chata): evitar calor >25°C y esfuerzo intenso — dificultad respiratoria. ';
  }
  if (edad === 'cachorro') {
    advertencia +=
      'Regla AKC para cachorros: 5 min de ejercicio estructurado × cada mes de edad, repartido en 2-3 sesiones. No correr en superficies duras hasta cerrar placas de crecimiento. ';
  }
  if (edad === 'senior') {
    advertencia +=
      'Senior: priorizá paseos más cortos y frecuentes. Consultá con veterinario si hay artrosis o problemas cardíacos. ';
  }

  const resumen = `Tu perro necesita ~${minutosDia} min/día de paseo, repartidos en ${paseosDia} salidas de ~${duracionPorPaseo} min. ${intensidad}`;

  return {
    minutosDia,
    paseosDia,
    duracionPorPaseo,
    intensidad,
    resumen,
    advertencia: advertencia.trim() || 'Sin advertencias específicas — ajustá según el clima y el estado del perro.',
  };
}
