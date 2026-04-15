/** Rango de peso para pipeta/comprimido antiparasitario */
export interface Inputs {
  tipoMascota?: string;
  pesoMascota: number;
}
export interface Outputs {
  rangoPipeta: string;
  frecuenciaMeses: string;
  advertencia: string;
  detalle: string;
}

export function dosisAntiparasitario(i: Inputs): Outputs {
  const tipo = String(i.tipoMascota || 'perro');
  const peso = Number(i.pesoMascota);

  if (!peso || peso <= 0) throw new Error('Ingresá el peso de tu mascota');

  let rango = '';
  let advertencia = '';

  if (tipo === 'gato') {
    if (peso < 2.5) {
      rango = 'Gatito / Cachorro (0,5-2,5 kg)';
    } else if (peso <= 7.5) {
      rango = 'Gato adulto (2,5-7,5 kg)';
    } else {
      rango = 'Gato grande (7,5+ kg) — consultá con tu veterinario';
    }
    advertencia = '⚠️ NUNCA uses antiparasitario de perro en tu gato. La permetrina es tóxica y potencialmente mortal para gatos. Usá solo productos específicos para felinos.';
  } else {
    // Perro
    if (peso < 2) {
      rango = 'Perro miniatura (<2 kg) — consultá con tu veterinario';
      advertencia = '⚠️ Perros muy pequeños requieren productos específicos. No dividir pipetas. Consultá al veterinario.';
    } else if (peso <= 4.5) {
      rango = 'XS (2-4,5 kg)';
    } else if (peso <= 10) {
      rango = 'S (4,5-10 kg)';
    } else if (peso <= 20) {
      rango = 'M (10-20 kg)';
    } else if (peso <= 40) {
      rango = 'L (20-40 kg)';
    } else if (peso <= 60) {
      rango = 'XL (40-60 kg)';
    } else {
      rango = 'XXL (60+ kg) — puede requerir combinación. Consultá con tu veterinario.';
    }

    if (!advertencia) {
      advertencia = 'Si tu mascota está justo en el límite entre dos rangos, elegí el rango superior. No dividas pipetas.';
    }
  }

  const frecuencia = 'Cada 30 días (pipetas estándar). Comprimidos como Bravecto: cada 12 semanas.';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    rangoPipeta: rango,
    frecuenciaMeses: frecuencia,
    advertencia,
    detalle: `${tipo === 'gato' ? 'Gato' : 'Perro'} de ${fmt.format(peso)} kg → pipeta rango: ${rango}. ${frecuencia}`,
  };
}
