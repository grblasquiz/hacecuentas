/** Tamaño de carrier/transportadora según medidas de la mascota */
export interface Inputs {
  largoMascota: number;
  alturaMascota: number;
  anchoHombros: number;
  pesoMascota: number;
  tipoViaje?: string;
}
export interface Outputs {
  largoCarrier: number;
  anchoCarrier: number;
  altoCarrier: number;
  tipoRecomendado: string;
  aptoCabina: string;
  detalle: string;
}

export function transportadoraTamanoMascotaViaje(i: Inputs): Outputs {
  const largo = Number(i.largoMascota);
  const alto = Number(i.alturaMascota);
  const ancho = Number(i.anchoHombros);
  const peso = Number(i.pesoMascota);
  const viaje = String(i.tipoViaje || 'general');

  if (!largo || largo < 10 || largo > 150) throw new Error('Ingresá el largo de la mascota (10-150 cm)');
  if (!alto || alto < 10 || alto > 100) throw new Error('Ingresá la altura de la mascota (10-100 cm)');
  if (!ancho || ancho < 5 || ancho > 60) throw new Error('Ingresá el ancho de hombros (5-60 cm)');
  if (!peso || peso <= 0 || peso > 80) throw new Error('Ingresá el peso de la mascota (0,5-80 kg)');

  // Fórmula IATA
  const largoCarrier = Math.ceil(largo + alto / 2);
  const anchoCarrier = Math.ceil(ancho * 2);
  const altoCarrier = Math.ceil(alto + 5);

  // Tipo recomendado según viaje y peso
  let tipoRecomendado = '';
  if (viaje === 'bodega') {
    tipoRecomendado = 'Kennel rígido homologado IATA (plástico, puerta metálica, tornillos de seguridad).';
  } else if (viaje === 'cabina') {
    tipoRecomendado = peso <= 8
      ? 'Bolso blando flexible con ventilación (debe caber bajo el asiento delantero).'
      : 'Tu mascota es demasiado pesada para cabina. Necesitás kennel rígido para bodega.';
  } else if (viaje === 'auto') {
    tipoRecomendado = peso <= 10
      ? 'Carrier rígido mediano atado con cinturón en asiento trasero.'
      : 'Kennel rígido grande en piso trasero o área de carga, o arnés de seguridad homologado.';
  } else {
    tipoRecomendado = peso <= 8
      ? 'Carrier rígido mediano o bolso blando con ventilación.'
      : 'Kennel rígido del tamaño calculado.';
  }

  // Check cabina: peso total (mascota + carrier ~1.5kg) <= 10 kg, dimensiones bolso <= ~45×35×20
  const pesoTotal = peso + 1.5;
  let aptoCabina = '';
  if (pesoTotal <= 10 && largoCarrier <= 55 && anchoCarrier <= 40) {
    aptoCabina = `Sí, probablemente apto para cabina (peso total ~${pesoTotal.toFixed(1)} kg). Verificá medidas exactas con tu aerolínea — el bolso blando se comprime.`;
  } else if (pesoTotal > 10) {
    aptoCabina = `No apto para cabina: peso total ~${pesoTotal.toFixed(1)} kg excede el límite (7-10 kg). Debe viajar en bodega con kennel IATA.`;
  } else {
    aptoCabina = `Límite: las dimensiones son grandes para cabina. Verificá con tu aerolínea. Con bolso blando flexible podría entrar.`;
  }

  return {
    largoCarrier,
    anchoCarrier,
    altoCarrier,
    tipoRecomendado,
    aptoCabina,
    detalle: `Carrier mínimo: ${largoCarrier}×${anchoCarrier}×${altoCarrier} cm (largo×ancho×alto). Peso mascota: ${peso} kg. ${tipoRecomendado} ${aptoCabina}`,
  };
}
