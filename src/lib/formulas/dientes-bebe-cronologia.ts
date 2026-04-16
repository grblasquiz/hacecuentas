/** Cronología de erupción de dientes de leche */
export interface Inputs { edadBebeDientes: number; }
export interface Outputs { dientesEsperados: string; cantidadDientes: string; proximosDientes: string; cuidados: string; }

const cronologia = [
  { mes: 6, diente: 'Incisivos centrales inferiores (2)', total: 2 },
  { mes: 8, diente: 'Incisivos centrales superiores (2)', total: 4 },
  { mes: 10, diente: 'Incisivos laterales superiores (2)', total: 6 },
  { mes: 12, diente: 'Incisivos laterales inferiores (2)', total: 8 },
  { mes: 14, diente: 'Primeros molares superiores (2)', total: 10 },
  { mes: 16, diente: 'Primeros molares inferiores (2)', total: 12 },
  { mes: 18, diente: 'Caninos superiores (2)', total: 14 },
  { mes: 20, diente: 'Caninos inferiores (2)', total: 16 },
  { mes: 24, diente: 'Segundos molares inferiores (2)', total: 18 },
  { mes: 30, diente: 'Segundos molares superiores (2)', total: 20 },
];

export function dientesBebe(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadBebeDientes));
  if (edad < 0 || edad > 36) throw new Error('Ingresá una edad entre 0 y 36 meses');

  const salidos = cronologia.filter(c => c.mes <= edad);
  const proximos = cronologia.filter(c => c.mes > edad).slice(0, 2);

  const total = salidos.length > 0 ? salidos[salidos.length - 1].total : 0;
  const aprox = Math.max(0, Math.min(20, edad - 6)); // regla edad-6

  let esperados = salidos.map(c => `${c.diente} (~${c.mes} meses)`).join('; ');
  if (!esperados) esperados = 'Todavía no se esperan dientes. Los primeros suelen salir entre los 6-10 meses.';

  let proxStr = proximos.map(c => `${c.diente} (~${c.mes} meses)`).join('; ');
  if (!proxStr) proxStr = '¡Dentición completa! Los 20 dientes de leche ya deberían estar.';

  let cuidados = '';
  if (edad < 6) cuidados = 'Limpiá las encías con gasa húmeda después de las tomas.';
  else if (edad < 24) cuidados = 'Cepillá los dientes con cepillo suave y agua. Primera visita al dentista antes del año.';
  else cuidados = 'Cepillado 2 veces al día con pasta con flúor (cantidad de un grano de arroz). Visitas al dentista cada 6 meses.';

  return {
    dientesEsperados: esperados,
    cantidadDientes: `~${total} dientes (regla práctica: edad en meses − 6 = ~${aprox})`,
    proximosDientes: proxStr,
    cuidados,
  };
}
