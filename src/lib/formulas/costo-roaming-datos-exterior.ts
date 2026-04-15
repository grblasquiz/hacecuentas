/** Costo de roaming y datos en el exterior: comparativa */
export interface CostoRoamingInputs {
  dias: number;
  destino?: string;
  usoGbDia?: number;
}
export interface CostoRoamingOutputs {
  costoRoaming: number;
  costoEsim: number;
  costoChipLocal: number;
  detalle: string;
}

interface PrecioRegion {
  roamingDia: number;
  esim15d: number;
  chipLocal: number;
  nombre: string;
}

const REGIONES: Record<string, PrecioRegion> = {
  europa: { roamingDia: 20, esim15d: 40, chipLocal: 20, nombre: 'Europa' },
  eeuu: { roamingDia: 22, esim15d: 40, chipLocal: 25, nombre: 'EE.UU./Canadá' },
  latam: { roamingDia: 15, esim15d: 30, chipLocal: 15, nombre: 'Latinoamérica' },
  asia: { roamingDia: 22, esim15d: 35, chipLocal: 12, nombre: 'Asia' },
  mundial: { roamingDia: 25, esim15d: 50, chipLocal: 25, nombre: 'Otros/Mundial' },
};

export function costoRoamingDatosExterior(inputs: CostoRoamingInputs): CostoRoamingOutputs {
  const dias = Number(inputs.dias);
  const destino = String(inputs.destino || 'europa');
  const usoGb = Number(inputs.usoGbDia) || 1;

  if (!dias || dias <= 0) throw new Error('Ingresá los días de viaje');
  if (!REGIONES[destino]) throw new Error('Destino no válido');

  const region = REGIONES[destino];

  // Roaming: costo por día
  const costoRoaming = Number((dias * region.roamingDia).toFixed(0));

  // eSIM: precio base para 15 días, escalado
  const factorDias = dias <= 7 ? 0.6 : dias <= 15 ? 1.0 : dias <= 30 ? 1.5 : 2.0;
  const factorUso = usoGb > 2 ? 1.3 : usoGb > 1 ? 1.1 : 1.0;
  const costoEsim = Number((region.esim15d * factorDias * factorUso).toFixed(0));

  // Chip local: precio base, escalado por días
  const factorDiasChip = dias <= 7 ? 0.8 : dias <= 15 ? 1.0 : dias <= 30 ? 1.3 : 1.8;
  const costoChipLocal = Number((region.chipLocal * factorDiasChip).toFixed(0));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const masBarato = Math.min(costoRoaming, costoEsim, costoChipLocal);
  let recomendacion: string;
  if (masBarato === costoChipLocal) {
    recomendacion = 'Chip local es lo más barato, pero necesitás comprarlo al llegar.';
  } else if (masBarato === costoEsim) {
    recomendacion = 'eSIM internacional es la mejor relación precio-comodidad.';
  } else {
    recomendacion = 'Roaming es la opción más conveniente para viajes muy cortos.';
  }

  const ahorro = costoRoaming - Math.min(costoEsim, costoChipLocal);

  return {
    costoRoaming,
    costoEsim,
    costoChipLocal,
    detalle: `${dias} días en ${region.nombre} (~${fmt.format(usoGb)} GB/día): Roaming ~USD ${fmt.format(costoRoaming)} | eSIM ~USD ${fmt.format(costoEsim)} | Chip local ~USD ${fmt.format(costoChipLocal)}. ${recomendacion} Ahorro vs roaming: ~USD ${fmt.format(ahorro)}.`,
  };
}
