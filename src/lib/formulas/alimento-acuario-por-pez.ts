/** Alimento para acuario según cantidad y perfil de peces. */
export interface Inputs {
  cantidadPeces: number;
  perfil?: string;
  conCamarones?: boolean;
  estado?: string;
}
export interface Outputs {
  tomasDia: number;
  porcionGr: number;
  tipoAlimento: string;
  complementos: string;
  ayunoSugerido: string;
  _insight?: any;
}

export function alimentoAcuarioPorPez(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).conCamarones = (i as any).conCamarones === true || (i as any).conCamarones === 'true';
  const cant = Math.max(1, Math.round(Number(i.cantidadPeces ?? 1)));
  const perfil = String(i.perfil || 'comunitario');
  const conCam = i.conCamarones === true;
  const estado = String(i.estado || 'normal');

  if (estado === 'ayuno') {
    return {
      tomasDia: 0,
      porcionGr: 0,
      tipoAlimento: 'Sin comida — ayuno terapéutico (1 día/semana o hasta 3 días seguidos).',
      complementos: 'Mantené temperatura, filtro y luz normales.',
      ayunoSugerido: 'Este es el día de ayuno. Retomá alimentación normal mañana.',
      _insight: {
        title: 'Día de ayuno',
        text: 'Hoy **no des alimento**: el ayuno terapéutico ayuda a la digestión y mejora la calidad del agua. Retomá la alimentación normal mañana.',
        tone: 'neutral',
        icon: '🐟',
      },
    };
  }

  // Tomas por día base
  const tomasBase: Record<string, number> = {
    'nano': 2, 'comunitario': 2, 'fondo': 1, 'ciclidos': 2, 'carnivoros': 1,
  };
  let tomas = tomasBase[perfil] ?? 2;

  if (estado === 'cria') tomas = perfil === 'carnivoros' ? 2 : 4;

  // Porción por toma estimada (gramos totales)
  const porPezGr: Record<string, number> = {
    'nano': 0.015,
    'comunitario': 0.03,
    'fondo': 0.04,
    'ciclidos': 0.05,
    'carnivoros': 0.15,
  };
  let porcion = (porPezGr[perfil] ?? 0.03) * cant;
  if (conCam) porcion += 0.05;

  const tipo = perfil === 'nano' ? 'Escamas finas o micropellets flotantes.'
    : perfil === 'fondo' ? 'Pellets hundibles específicos y obleas vegetales al anochecer.'
    : perfil === 'carnivoros' ? 'Pellets grandes + mysis congelado + trozos de pescado blanco.'
    : perfil === 'ciclidos' ? 'Pellets o gránulos medianos + ocasional vegetal o congelado.'
    : 'Escamas o micropellets flotantes + pellets hundibles para fondo.';

  const complementos = conCam
    ? 'Larva roja o artemia congelada 1-2 veces por semana. Oblea vegetal para camarones 1x semana.'
    : 'Larva roja o artemia congelada 1-2 veces por semana. Vegetal (zucchini hervido) para plecos/otos.';

  const ayuno = estado === 'cria' ? 'Sin ayuno en alevines.' : '1 día de ayuno por semana para adultos sanos.';

  const porcionFinal = Math.round(porcion * 100) / 100;
  const _insight = {
    title: 'Tu ración diaria',
    text: `Para **${cant} ${cant === 1 ? 'pez' : 'peces'}** dales **${tomas} toma${tomas !== 1 ? 's' : ''} por día** de aprox. **${porcionFinal.toLocaleString('es-AR')} g** cada una. Ofrecé sólo lo que coman en **1-2 minutos**: de más comida ensucia el agua.`,
    tone: 'neutral',
    icon: '🐠',
  };

  return {
    tomasDia: tomas,
    porcionGr: porcionFinal,
    tipoAlimento: tipo,
    complementos,
    ayunoSugerido: ayuno,
    _insight,
  };
}
