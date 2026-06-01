/** Cronología de erupción de dientes de leche */
export interface Inputs { edadBebeDientes: number; __lang?: string; }
export interface Outputs { dientesEsperados: string; dientesDetalle: string; cantidadDientes: string; proximosDientes: string; cuidados: string; }

const cronologia = [
  { mes: 6,  diente: { es: 'Incisivos centrales inferiores (2)',  en: 'Lower central incisors (2)'  }, total: 2  },
  { mes: 8,  diente: { es: 'Incisivos centrales superiores (2)', en: 'Upper central incisors (2)'  }, total: 4  },
  { mes: 10, diente: { es: 'Incisivos laterales superiores (2)', en: 'Upper lateral incisors (2)'  }, total: 6  },
  { mes: 12, diente: { es: 'Incisivos laterales inferiores (2)', en: 'Lower lateral incisors (2)'  }, total: 8  },
  { mes: 14, diente: { es: 'Primeros molares superiores (2)',    en: 'Upper first molars (2)'      }, total: 10 },
  { mes: 16, diente: { es: 'Primeros molares inferiores (2)',    en: 'Lower first molars (2)'      }, total: 12 },
  { mes: 18, diente: { es: 'Caninos superiores (2)',             en: 'Upper canines (2)'            }, total: 14 },
  { mes: 20, diente: { es: 'Caninos inferiores (2)',             en: 'Lower canines (2)'            }, total: 16 },
  { mes: 24, diente: { es: 'Segundos molares inferiores (2)',    en: 'Lower second molars (2)'     }, total: 18 },
  { mes: 30, diente: { es: 'Segundos molares superiores (2)',    en: 'Upper second molars (2)'     }, total: 20 },
];

const T = {
  es: {
    error:          'Ingresá una edad entre 0 y 36 meses',
    noDetalle:      'Todavía no se esperan dientes. Los primeros suelen salir entre los 6-10 meses.',
    sinDientes:     'Todavía sin dientes',
    unDiente:       '1 diente ya salió',
    nDientes:       (n: number) => `${n} dientes ya salieron`,
    completo:       '¡Dentición completa! Los 20 dientes de leche ya deberían estar.',
    cuidados0:      'Limpiá las encías con gasa húmeda después de las tomas.',
    cuidados1:      'Cepillá los dientes con cepillo suave y agua. Primera visita al dentista antes del año.',
    cuidados2:      'Cepillado 2 veces al día con pasta con flúor (cantidad de un grano de arroz). Visitas al dentista cada 6 meses.',
    cantidad:       (total: number, aprox: number) => `~${total} dientes (regla práctica: edad en meses − 6 = ~${aprox})`,
  },
  en: {
    error:          'Enter an age between 0 and 36 months',
    noDetalle:      'No teeth are expected yet. The first ones usually appear between 6–10 months.',
    sinDientes:     'No teeth yet',
    unDiente:       '1 tooth has already come in',
    nDientes:       (n: number) => `${n} teeth have already come in`,
    completo:       'Full set! All 20 baby teeth should already be in.',
    cuidados0:      'Wipe the gums with a damp gauze pad after feedings.',
    cuidados1:      'Brush teeth with a soft toothbrush and water. First dentist visit before age 1.',
    cuidados2:      'Brush twice a day with a rice-grain-sized amount of fluoride toothpaste. Dental checkups every 6 months.',
    cantidad:       (total: number, aprox: number) => `~${total} teeth (rule of thumb: age in months − 6 = ~${aprox})`,
  },
} as const;

export function dientesBebe(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const L = T[__lang];

  const edad = Math.round(Number(i.edadBebeDientes));
  if (edad < 0 || edad > 36) throw new Error(L.error);

  const salidos = cronologia.filter(c => c.mes <= edad);
  const proximos = cronologia.filter(c => c.mes > edad).slice(0, 2);

  const total = salidos.length > 0 ? salidos[salidos.length - 1].total : 0;
  const aprox = Math.max(0, Math.min(20, edad - 6)); // regla edad-6

  const detalle = salidos.map(c => `${c.diente[__lang]} (~${c.mes} meses)`).join('; ');
  const dientesDetalle = detalle || L.noDetalle;

  // Titular corto: conteo de dientes ya salidos
  let esperados: string;
  if (total === 0) esperados = L.sinDientes;
  else if (total === 1) esperados = L.unDiente;
  else esperados = L.nDientes(total);

  let proxStr = proximos.map(c => `${c.diente[__lang]} (~${c.mes} meses)`).join('; ');
  if (!proxStr) proxStr = L.completo;

  let cuidados = '';
  if (edad < 6) cuidados = L.cuidados0;
  else if (edad < 24) cuidados = L.cuidados1;
  else cuidados = L.cuidados2;

  return {
    dientesEsperados: esperados,
    dientesDetalle,
    cantidadDientes: L.cantidad(total, aprox),
    proximosDientes: proxStr,
    cuidados,
  };
}
