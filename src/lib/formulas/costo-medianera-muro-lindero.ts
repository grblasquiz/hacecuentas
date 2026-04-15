/** Costo de medianera / muro lindero */
export interface CostoMedianeraInputs {
  largoM: number;
  alturaM?: number;
  tipoMuro?: string;
  costoM2?: number;
}
export interface CostoMedianeraOutputs {
  costoTotal: number;
  costoVecino: number;
  superficieM2: number;
  detalle: string;
}

const COSTOS_REF: Record<string, { nombre: string; costoM2: number }> = {
  ladrilloHueco: { nombre: 'Ladrillo hueco 18 cm + revoque', costoM2: 100000 },
  ladrilloComun: { nombre: 'Ladrillo común 15 cm + revoque', costoM2: 85000 },
  bloqueHormigon: { nombre: 'Bloque hormigón 20 cm', costoM2: 110000 },
};

export function costoMedianeraMuroLindero(inputs: CostoMedianeraInputs): CostoMedianeraOutputs {
  const largo = Number(inputs.largoM);
  const altura = Number(inputs.alturaM) || 3;
  const tipo = String(inputs.tipoMuro || 'ladrilloHueco');
  const costoManual = Number(inputs.costoM2) || 0;

  if (!largo || largo <= 0) throw new Error('Ingresá el largo de la medianera');
  if (altura <= 0 || altura > 10) throw new Error('La altura debe estar entre 1 y 10 metros');
  if (!COSTOS_REF[tipo]) throw new Error('Tipo de muro no válido');

  const superficie = Number((largo * altura).toFixed(2));
  const costoM2 = costoManual > 0 ? costoManual : COSTOS_REF[tipo].costoM2;
  const costoTotal = Math.round(superficie * costoM2);
  const costoVecino = Math.round(costoTotal / 2);

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const fmtN = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    costoTotal,
    costoVecino,
    superficieM2: superficie,
    detalle: `Medianera de ${fmtN.format(largo)} m × ${fmtN.format(altura)} m = ${fmtN.format(superficie)} m² en ${COSTOS_REF[tipo].nombre}. Costo total: ${fmt.format(costoTotal)}. Tu parte (50%): ${fmt.format(costoVecino)}. Parte del vecino: ${fmt.format(costoVecino)}.`,
  };
}
