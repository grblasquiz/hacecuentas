/** Cielorraso de placas de yeso: placas, perfiles, tornillos, masilla y cinta */
export interface YesoCielorrasoInputs {
  superficieM2: number;
  desperdicio?: number;
}
export interface YesoCielorrasoOutputs {
  placas: number;
  perfilesOmegaMl: number;
  tornillos: number;
  masillaKg: number;
  cintaMl: number;
  detalle: string;
  _insight?: any;
}

const M2_POR_PLACA = 2.88; // 1,20 × 2,40 m
const PERFILES_ML_POR_M2 = 3;
const TORNILLOS_POR_M2 = 15;
const MASILLA_KG_POR_M2 = 0.3;
const CINTA_ML_POR_M2 = 1.5;

export function yesoCielorrasoPlacasM2(inputs: YesoCielorrasoInputs): YesoCielorrasoOutputs {
  const superficie = Number(inputs.superficieM2);
  const desperdicio = Number(inputs.desperdicio ?? 10);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (desperdicio < 0 || desperdicio > 30) throw new Error('El desperdicio debe estar entre 0% y 30%');

  const factor = 1 + desperdicio / 100;
  const supConDesp = superficie * factor;

  const placas = Math.ceil(supConDesp / M2_POR_PLACA);
  const perfiles = Number((superficie * PERFILES_ML_POR_M2).toFixed(1));
  const tornillos = Math.ceil(superficie * TORNILLOS_POR_M2);
  const masilla = Number((superficie * MASILLA_KG_POR_M2).toFixed(1));
  const cinta = Number((superficie * CINTA_ML_POR_M2).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  const placasJustas = superficie / M2_POR_PLACA;
  const extra = placas - Math.ceil(placasJustas);
  return {
    placas,
    perfilesOmegaMl: perfiles,
    tornillos,
    masillaKg: masilla,
    cintaMl: cinta,
    detalle: `Para ${fmt.format(superficie)} m² de cielorraso (${desperdicio}% desperdicio): ${placas} placas de 1,20×2,40 m, ${fmt.format(perfiles)} ml de perfil omega, ${tornillos} tornillos, ${fmt.format(masilla)} kg de masilla y ${fmt.format(cinta)} m de cinta.`,
    _insight: {
      title: 'Tu lista de materiales',
      text: `Para **${fmt.format(superficie)} m²** comprá **${placas} placas** de 1,20×2,40 m (cada una cubre 2,88 m²), más ${fmt.format(perfiles)} m de perfil omega, ${tornillos} tornillos, ${fmt.format(masilla)} kg de masilla y ${fmt.format(cinta)} m de cinta. El **${desperdicio}% de desperdicio** ya está incluido en las placas${extra > 0 ? `, así que llevás ${extra} placa(s) de más para cortes y roturas` : ''}.`,
      tone: 'neutral',
      icon: '🪵',
    },
  };
}
