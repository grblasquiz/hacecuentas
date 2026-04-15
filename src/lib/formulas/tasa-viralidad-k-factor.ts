/** Coeficiente viral (K-Factor) */

export interface Inputs {
  invitacionesPorUsuario: number;
  tasaConversionInvitacion: number;
  usuariosActuales: number;
}

export interface Outputs {
  kFactor: number;
  esViral: string;
  usuariosGenerados: number;
  detalle: string;
}

export function tasaViralidadKFactor(i: Inputs): Outputs {
  const inv = Number(i.invitacionesPorUsuario);
  const tasa = Number(i.tasaConversionInvitacion);
  const usuarios = Number(i.usuariosActuales);

  if (isNaN(inv) || inv < 0) throw new Error('Ingresá las invitaciones promedio por usuario');
  if (isNaN(tasa) || tasa < 0 || tasa > 100) throw new Error('La tasa de conversión debe estar entre 0 y 100');
  if (isNaN(usuarios) || usuarios < 1) throw new Error('Ingresá los usuarios actuales');

  const kFactor = inv * (tasa / 100);
  const usuariosGenerados = Math.floor(usuarios * kFactor);

  let esViral: string;
  if (kFactor > 1) {
    esViral = 'Viral: crecimiento exponencial. Cada usuario trae más de 1 nuevo.';
  } else if (kFactor === 1) {
    esViral = 'Neutral: crecimiento lineal. Cada usuario trae exactamente 1 nuevo.';
  } else if (kFactor >= 0.5) {
    esViral = 'Sub-viral: ayuda al crecimiento pero no es autosuficiente. Necesitás otros canales.';
  } else if (kFactor > 0) {
    esViral = 'Baja viralidad: el boca a boca aporta poco. El crecimiento depende de paid/organic.';
  } else {
    esViral = 'Sin viralidad: los usuarios no invitan a nadie.';
  }

  // Project 5 cycles
  let totalAcum = usuarios;
  let nuevosEnCiclo = usuarios;
  const ciclos: string[] = [];
  for (let c = 1; c <= 5; c++) {
    nuevosEnCiclo = Math.floor(nuevosEnCiclo * kFactor);
    if (nuevosEnCiclo < 1) break;
    totalAcum += nuevosEnCiclo;
    ciclos.push(`Ciclo ${c}: +${nuevosEnCiclo}`);
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `${inv} invitaciones/usuario × ${tasa}% conversión = K-Factor ${kFactor.toFixed(2)}. ` +
    `Con ${fmt.format(usuarios)} usuarios actuales, el primer ciclo viral genera ${fmt.format(usuariosGenerados)} nuevos. ` +
    (ciclos.length > 0 ? `Proyección 5 ciclos: ${ciclos.join(', ')}. Total: ${fmt.format(totalAcum)}. ` : '') +
    esViral;

  return {
    kFactor: Number(kFactor.toFixed(2)),
    esViral,
    usuariosGenerados,
    detalle,
  };
}
