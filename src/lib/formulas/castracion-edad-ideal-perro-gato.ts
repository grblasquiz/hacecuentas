/** Edad ideal para castrar perro o gato según especie, sexo y tamaño */
export interface Inputs {
  especie: string;
  sexo: string;
  tamanoRaza?: string;
  edadActualMeses?: number;
}
export interface Outputs {
  edadIdeal: string;
  ventana: string;
  costoEstimado: string;
  detalle: string;
}

interface Recomendacion {
  ideal: string;
  ventana: string;
  costoMin: number;
  costoMax: number;
  mesesMin: number;
  mesesMax: number;
}

const RECS: Record<string, Recomendacion> = {
  'gato_macho': { ideal: '4-5 meses', ventana: '4-6 meses (antes de que empiece a marcar)', costoMin: 50000, costoMax: 70000, mesesMin: 4, mesesMax: 6 },
  'gato_hembra': { ideal: '4-5 meses', ventana: '4-6 meses (antes del primer celo)', costoMin: 60000, costoMax: 90000, mesesMin: 4, mesesMax: 6 },
  'perro_mini_macho': { ideal: '6-9 meses', ventana: '6-9 meses', costoMin: 60000, costoMax: 80000, mesesMin: 6, mesesMax: 9 },
  'perro_mini_hembra': { ideal: '5-6 meses', ventana: '5-6 meses (antes del primer celo)', costoMin: 80000, costoMax: 110000, mesesMin: 5, mesesMax: 6 },
  'perro_chico_macho': { ideal: '6-9 meses', ventana: '6-9 meses', costoMin: 60000, costoMax: 80000, mesesMin: 6, mesesMax: 9 },
  'perro_chico_hembra': { ideal: '5-6 meses', ventana: '5-6 meses (antes del primer celo)', costoMin: 80000, costoMax: 110000, mesesMin: 5, mesesMax: 6 },
  'perro_mediano_macho': { ideal: '6-9 meses', ventana: '6-9 meses', costoMin: 60000, costoMax: 90000, mesesMin: 6, mesesMax: 9 },
  'perro_mediano_hembra': { ideal: '5-6 meses o después del primer celo', ventana: '5-6 meses o 8-12 meses (post primer celo)', costoMin: 80000, costoMax: 120000, mesesMin: 5, mesesMax: 12 },
  'perro_grande_macho': { ideal: '12-18 meses', ventana: '12-18 meses (esperar desarrollo óseo)', costoMin: 80000, costoMax: 120000, mesesMin: 12, mesesMax: 18 },
  'perro_grande_hembra': { ideal: 'Después del primer celo (10-14 meses)', ventana: '10-14 meses (2-3 meses post primer celo)', costoMin: 100000, costoMax: 150000, mesesMin: 10, mesesMax: 14 },
  'perro_gigante_macho': { ideal: '18-24 meses', ventana: '18-24 meses (esperar cierre de placas óseas)', costoMin: 100000, costoMax: 150000, mesesMin: 18, mesesMax: 24 },
  'perro_gigante_hembra': { ideal: 'Después del primer celo (12-18 meses)', ventana: '12-18 meses (post primer celo + 2-3 meses)', costoMin: 120000, costoMax: 180000, mesesMin: 12, mesesMax: 18 },
};

export function castracionEdadIdealPerroGato(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const sexo = String(i.sexo || 'macho');
  const tamano = String(i.tamanoRaza || 'mediano');
  const edadActual = i.edadActualMeses ? Number(i.edadActualMeses) : null;

  let clave: string;
  if (especie === 'gato') {
    clave = `gato_${sexo}`;
  } else {
    clave = `perro_${tamano}_${sexo}`;
  }

  const rec = RECS[clave];
  if (!rec) throw new Error('Combinación no válida. Revisá especie, sexo y tamaño.');

  const costoStr = `$${rec.costoMin.toLocaleString('es-AR')} - $${rec.costoMax.toLocaleString('es-AR')} (CABA 2026)`;

  let estadoActual = '';
  if (edadActual) {
    if (edadActual < rec.mesesMin) {
      const falta = rec.mesesMin - edadActual;
      estadoActual = ` Tu mascota tiene ${edadActual} meses — faltan ~${falta} meses para la ventana ideal.`;
    } else if (edadActual <= rec.mesesMax) {
      estadoActual = ` Tu mascota tiene ${edadActual} meses — ¡está dentro de la ventana ideal! Consultá al veterinario para programar.`;
    } else {
      estadoActual = ` Tu mascota tiene ${edadActual} meses — ya pasó la ventana ideal, pero aún se puede castrar con beneficios. Consultá al veterinario.`;
    }
  }

  const especieLabel = especie === 'gato' ? 'gato' : `perro (raza ${tamano})`;
  const sexoLabel = sexo === 'macho' ? 'macho' : 'hembra';

  return {
    edadIdeal: rec.ideal,
    ventana: rec.ventana,
    costoEstimado: costoStr,
    detalle: `Para ${especieLabel} ${sexoLabel}: edad ideal ${rec.ideal}. Ventana: ${rec.ventana}. Costo: ${costoStr}.${estadoActual}`,
  };
}
