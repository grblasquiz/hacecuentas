/**
 * Calculadora del Próximo Celo de Perra
 * Ciclo estral: cada 4-12 meses según raza/tamaño
 */
export interface FechaCeloInputs { fechaUltimoCelo: string; cicloMeses: number; }
export interface FechaCeloOutputs { fechaProximoCelo: string; rangoInicio: string; diasFaltantes: string; duracionCelo: string; _insight?: any; }

function fmtDate(d: Date): string {
  const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`;
}

export function fechaCeloPerra(inputs: FechaCeloInputs): FechaCeloOutputs {
  const parts = String(inputs.fechaUltimoCelo || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá la fecha del último celo');
  const [yy, mm, dd] = parts;
  const fecha = new Date(yy, mm - 1, dd);
  if (isNaN(fecha.getTime())) throw new Error('Ingresá la fecha del último celo');
  const ciclo = Number(inputs.cicloMeses) || 6;

  const proximoCelo = new Date(fecha.getTime());
  proximoCelo.setMonth(proximoCelo.getMonth() + ciclo);

  const rangoMin = new Date(proximoCelo);
  rangoMin.setDate(rangoMin.getDate() - 15);
  const rangoMax = new Date(proximoCelo);
  rangoMax.setDate(rangoMax.getDate() + 15);

  const hoy = new Date();
  const diffDias = Math.ceil((proximoCelo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const yaPaso = diffDias < 0;
  const inminente = diffDias >= 0 && diffDias <= 15;
  let _insight;
  if (yaPaso) {
    _insight = {
      title: 'El celo ya podría haber empezado',
      text: `La fecha estimada (**${fmtDate(proximoCelo)}**) quedó **hace ${Math.abs(diffDias)} días**. Si no la viste en celo, vigilá señales —vulva inflamada, sangrado— y extremá cuidados para evitar montas no deseadas.`,
      tone: 'warn',
      icon: '🐶',
    };
  } else if (inminente) {
    _insight = {
      title: `Celo inminente: faltan ${diffDias} días`,
      text: `El próximo celo se estima para el **${fmtDate(proximoCelo)}** (en **${diffDias} días**). Estás dentro de la ventana de ±15 días, así que prepará los cuidados: la fase fértil cae alrededor de los **días 9-14**.`,
      tone: 'warn',
      icon: '🐶',
    };
  } else {
    _insight = {
      title: `Próximo celo en ${diffDias} días`,
      text: `Con un ciclo de **${ciclo} meses**, el próximo celo se estima para el **${fmtDate(proximoCelo)}**. Tenés margen: marcá el rango **${fmtDate(rangoMin)} a ${fmtDate(rangoMax)}** para no llevarte sorpresas.`,
      tone: 'neutral',
      icon: '🐶',
    };
  }

  return {
    fechaProximoCelo: fmtDate(proximoCelo),
    rangoInicio: `Entre ${fmtDate(rangoMin)} y ${fmtDate(rangoMax)}`,
    diasFaltantes: diffDias > 0 ? `${diffDias} días` : diffDias === 0 ? '¡Hoy!' : `Hace ${Math.abs(diffDias)} días (ya podría haber empezado)`,
    duracionCelo: '2-4 semanas (fase fértil: días 9-14)',
    _insight,
  };
}
