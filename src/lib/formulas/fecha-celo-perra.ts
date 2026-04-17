/**
 * Calculadora del Próximo Celo de Perra
 * Ciclo estral: cada 4-12 meses según raza/tamaño
 */
export interface FechaCeloInputs { fechaUltimoCelo: string; cicloMeses: number; }
export interface FechaCeloOutputs { fechaProximoCelo: string; rangoInicio: string; diasFaltantes: string; duracionCelo: string; }

function fmtDate(d: Date): string {
  const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`;
}

export function fechaCeloPerra(inputs: FechaCeloInputs): FechaCeloOutputs {
  const fecha = new Date(inputs.fechaUltimoCelo + 'T00:00:00');
  if (isNaN(fecha.getTime())) throw new Error('Ingresá la fecha del último celo');
  const ciclo = Number(inputs.cicloMeses) || 6;

  const proximoCelo = new Date(fecha + 'T00:00:00');
  proximoCelo.setMonth(proximoCelo.getMonth() + ciclo);

  const rangoMin = new Date(proximoCelo);
  rangoMin.setDate(rangoMin.getDate() - 15);
  const rangoMax = new Date(proximoCelo);
  rangoMax.setDate(rangoMax.getDate() + 15);

  const hoy = new Date();
  const diffDias = Math.ceil((proximoCelo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  return {
    fechaProximoCelo: fmtDate(proximoCelo),
    rangoInicio: `Entre ${fmtDate(rangoMin)} y ${fmtDate(rangoMax)}`,
    diasFaltantes: diffDias > 0 ? `${diffDias} días` : diffDias === 0 ? '¡Hoy!' : `Hace ${Math.abs(diffDias)} días (ya podría haber empezado)`,
    duracionCelo: '2-4 semanas (fase fértil: días 9-14)',
  };
}
