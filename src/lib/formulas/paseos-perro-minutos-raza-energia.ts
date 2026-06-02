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
  __lang?: string;
}

export interface Outputs {
  minutosDia: number;
  paseosDia: number;
  duracionPorPaseo: number;
  intensidad: string;
  resumen: string;
  advertencia: string;
  _insight?: any;
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
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const T = ({
    es: {
      errEnergia: 'Seleccioná un nivel de energía válido',
      errTamano: 'Seleccioná un tamaño válido',
      errEdad: 'Seleccioná una edad válida',
      intensidadAlta: 'Alta: combinar caminata rápida, trote y juegos activos (correr, fetch). Necesitan descarga mental además de física.',
      intensidadBaja: 'Baja-moderada: paso cómodo en terreno plano, paradas frecuentes para olfatear.',
      intensidadMedia: 'Moderada: caminata con ritmo, algún tramo de trote. Olfatear es parte del ejercicio.',
      advBraqui: 'Raza braquicéfala (cara chata): evitar calor >25°C y esfuerzo intenso — dificultad respiratoria. ',
      advCachorro: 'Regla AKC para cachorros: 5 min de ejercicio estructurado × cada mes de edad, repartido en 2-3 sesiones. No correr en superficies duras hasta cerrar placas de crecimiento. ',
      advSenior: 'Senior: priorizá paseos más cortos y frecuentes. Consultá con veterinario si hay artrosis o problemas cardíacos. ',
      sinAdvertencias: 'Sin advertencias específicas — ajustá según el clima y el estado del perro.',
      insTitle: 'Tu rutina de paseo',
      insAlta: 'Necesita **{min} min/día** repartidos en **{paseos} salidas** de ~{dur} min: una raza activa que sin descarga suficiente puede volverse destructiva o ansiosa.',
      insBaja: 'Con **{min} min/día** en **{paseos} salidas** de ~{dur} min alcanza: priorizá paseos tranquilos sobre intensidad. Vigilá el calor y el sobrepeso.',
      insMedia: 'Apuntá a **{min} min/día** en **{paseos} salidas** de ~{dur} min: ritmo cómodo con algún trote, y dejá que olfatee como parte del ejercicio.',
    },
    en: {
      errEnergia: 'Select a valid energy level',
      errTamano: 'Select a valid size',
      errEdad: 'Select a valid age',
      intensidadAlta: 'High: combine brisk walking, trotting, and active play (running, fetch). They need mental stimulation as well as physical exercise.',
      intensidadBaja: 'Low-moderate: comfortable pace on flat terrain, frequent stops to sniff.',
      intensidadMedia: 'Moderate: brisk walk with some trotting. Sniffing counts as exercise.',
      advBraqui: 'Brachycephalic breed (flat face): avoid heat >25°C and intense exertion — breathing difficulties. ',
      advCachorro: 'AKC puppy rule: 5 min of structured exercise × each month of age, split into 2-3 sessions. Avoid running on hard surfaces until growth plates close. ',
      advSenior: 'Senior: prioritize shorter, more frequent walks. Consult a vet if arthritis or heart conditions are present. ',
      sinAdvertencias: 'No specific warnings — adjust based on weather and the dog\'s condition.',
      insTitle: 'Your walking routine',
      insAlta: 'Needs **{min} min/day** split into **{paseos} outings** of ~{dur} min: an active breed that can turn destructive or anxious without enough release.',
      insBaja: '**{min} min/day** across **{paseos} outings** of ~{dur} min is enough: favor calm walks over intensity. Watch for heat and excess weight.',
      insMedia: 'Aim for **{min} min/day** in **{paseos} outings** of ~{dur} min: a comfortable pace with some trotting, letting sniffing count as exercise.',
    },
    pt: {
      errEnergia: 'Selecione um nível de energia válido',
      errTamano: 'Selecione um tamanho válido',
      errEdad: 'Selecione uma idade válida',
      intensidadAlta: 'Alta: combine caminhada rápida, trote e brincadeiras ativas (corrida, buscar). Precisam de estimulação mental além da física.',
      intensidadBaja: 'Baixa-moderada: ritmo confortável em terreno plano, paradas frequentes para farejar.',
      intensidadMedia: 'Moderada: caminhada em ritmo animado com algum trecho de trote. Farejar também conta como exercício.',
      advBraqui: 'Raça braquicéfala (focinho achatado): evite calor >25°C e esforço intenso — dificuldade respiratória. ',
      advCachorro: 'Regra AKC para filhotes: 5 min de exercício estruturado × cada mês de idade, divididos em 2-3 sessões. Evite corrida em superfícies duras até o fechamento das placas de crescimento. ',
      advSenior: 'Sênior: prefira passeios mais curtos e frequentes. Consulte o veterinário se houver artrose ou problemas cardíacos. ',
      sinAdvertencias: 'Sem advertências específicas — ajuste conforme o clima e o estado do cão.',
      insTitle: 'Sua rotina de passeio',
      insAlta: 'Precisa de **{min} min/dia** divididos em **{paseos} saídas** de ~{dur} min: uma raça ativa que sem descarga suficiente pode ficar destrutiva ou ansiosa.',
      insBaja: 'Com **{min} min/dia** em **{paseos} saídas** de ~{dur} min já basta: priorize passeios tranquilos em vez de intensidade. Cuidado com o calor e o sobrepeso.',
      insMedia: 'Mire em **{min} min/dia** em **{paseos} saídas** de ~{dur} min: ritmo confortável com algum trote, deixando o farejar contar como exercício.',
    },
  } as const)[__lang];

  const energia = String(i.energia || 'media').toLowerCase();
  const tamano = String(i.tamano || 'mediano').toLowerCase();
  const edad = String(i.edad || 'adulto').toLowerCase();
  const braqui =
    i.braquicefalo === true || i.braquicefalo === 'true' || i.braquicefalo === 'si';

  const baseEnergia = BASE[energia];
  if (!baseEnergia) throw new Error(T.errEnergia);
  const baseMin = baseEnergia[tamano];
  if (!baseMin) throw new Error(T.errTamano);
  const factor = FACTOR_EDAD[edad];
  if (!factor) throw new Error(T.errEdad);

  const minutosDia = Math.max(15, Math.round(baseMin * factor));

  // Paseos por día: cachorro/senior → más frecuentes y cortos; adulto → 1-2.
  const paseosDia = edad === 'cachorro' ? 3 : edad === 'senior' ? 3 : 2;
  const duracionPorPaseo = Math.round(minutosDia / paseosDia);

  let intensidad: string;
  if (energia === 'alta' && edad === 'adulto') {
    intensidad = T.intensidadAlta;
  } else if (energia === 'baja' || edad === 'senior') {
    intensidad = T.intensidadBaja;
  } else {
    intensidad = T.intensidadMedia;
  }

  let advertencia = '';
  if (braqui) {
    advertencia += T.advBraqui;
  }
  if (edad === 'cachorro') {
    advertencia += T.advCachorro;
  }
  if (edad === 'senior') {
    advertencia += T.advSenior;
  }

  const resumen = __lang === 'en'
    ? `Your dog needs ~${minutosDia} min/day of walking, split into ${paseosDia} outings of ~${duracionPorPaseo} min. ${intensidad}`
    : __lang === 'pt'
    ? `Seu cão precisa de ~${minutosDia} min/dia de passeio, divididos em ${paseosDia} saídas de ~${duracionPorPaseo} min. ${intensidad}`
    : `Tu perro necesita ~${minutosDia} min/día de paseo, repartidos en ${paseosDia} salidas de ~${duracionPorPaseo} min. ${intensidad}`;

  const insTpl =
    energia === 'alta' ? T.insAlta : energia === 'baja' ? T.insBaja : T.insMedia;
  const insText = insTpl
    .replace('{min}', String(minutosDia))
    .replace('{paseos}', String(paseosDia))
    .replace('{dur}', String(duracionPorPaseo));
  const insTone = braqui ? 'warn' : energia === 'alta' && edad === 'adulto' ? 'good' : 'neutral';
  const insIcon = braqui ? '🌡️' : energia === 'alta' ? '🐕‍🦺' : '🐾';

  const _insight = {
    title: T.insTitle,
    text: insText,
    tone: insTone,
    icon: insIcon,
  };

  return {
    minutosDia,
    paseosDia,
    duracionPorPaseo,
    intensidad,
    resumen,
    advertencia: advertencia.trim() || T.sinAdvertencias,
    _insight,
  };
}
