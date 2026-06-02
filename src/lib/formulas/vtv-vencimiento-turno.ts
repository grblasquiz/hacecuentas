/** Calcula cuándo vence la VTV según antigüedad del vehículo y última revisión */
export interface Inputs {
  anoPatentamiento: number;
  mesUltimaVtv: number;
  anoUltimaVtv?: number;
}
export interface Outputs {
  antiguedadVehiculo: number;
  frecuenciaVtv: string;
  vencimientoEstimado: string;
  detalle: string;
  _insight?: any;
}

export function vtvVencimientoTurno(i: Inputs): Outputs {
  const anoActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;
  const anoPatent = Number(i.anoPatentamiento);
  const mesUltima = Number(i.mesUltimaVtv);
  const anoUltima = Number(i.anoUltimaVtv) || 0;

  if (!anoPatent || anoPatent < 1990 || anoPatent > anoActual) throw new Error('Ingresá un año de patentamiento válido');
  if (mesUltima < 0 || mesUltima > 12) throw new Error('El mes de última VTV debe ser entre 0 y 12');

  const antiguedad = anoActual - anoPatent;

  // Determinar frecuencia según antigüedad
  let frecuencia: string;
  let mesesEntre: number;
  if (antiguedad < 2) {
    frecuencia = 'Exento (menos de 2 años)';
    mesesEntre = 0;
  } else if (antiguedad <= 7) {
    frecuencia = 'Anual (cada 12 meses)';
    mesesEntre = 12;
  } else {
    frecuencia = 'Semestral (cada 6 meses)';
    mesesEntre = 6;
  }

  // Calcular vencimiento
  let vencimiento: string;
  if (mesesEntre === 0) {
    vencimiento = 'No requiere VTV todavía';
  } else if (mesUltima === 0 || anoUltima === 0) {
    vencimiento = '⚠️ Debés hacer la VTV lo antes posible (no tenés registro de VTV previa)';
  } else {
    let mesVenc = mesUltima + mesesEntre;
    let anoVenc = anoUltima;
    while (mesVenc > 12) {
      mesVenc -= 12;
      anoVenc++;
    }
    const meses = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    vencimiento = `${meses[mesVenc]} ${anoVenc}`;

    // Verificar si ya venció
    if (anoVenc < anoActual || (anoVenc === anoActual && mesVenc < mesActual)) {
      vencimiento += ' (⚠️ YA VENCIÓ — renová urgente)';
    } else if (anoVenc === anoActual && mesVenc === mesActual) {
      vencimiento += ' (⚠️ Vence ESTE MES)';
    } else if (anoVenc === anoActual && mesVenc <= mesActual + 2) {
      vencimiento += ' (sacá turno ya, vence pronto)';
    }
  }

  let detalleStr = `Tu vehículo tiene ${antiguedad} año(s) de antigüedad. Frecuencia de VTV: ${frecuencia}. `;
  if (mesesEntre === 0) {
    detalleStr += 'No necesitás VTV todavía.';
  } else if (mesUltima > 0 && anoUltima > 0) {
    detalleStr += `Próximo vencimiento estimado: ${vencimiento}.`;
  } else {
    detalleStr += 'No tenés registro de VTV previa — hacela cuanto antes.';
  }

  let insight;
  if (mesesEntre === 0) {
    insight = {
      title: 'Todavía exento',
      text: `Con **${antiguedad} año(s)** de antigüedad tu vehículo está **exento de VTV** hasta cumplir 2 años. Aprovechá para tener la documentación al día.`,
      tone: 'good',
      icon: '🚗',
    };
  } else if (mesUltima === 0 || anoUltima === 0) {
    insight = {
      title: 'Hacela cuanto antes',
      text: `Tu vehículo requiere VTV **${frecuencia.toLowerCase()}** pero no cargaste una revisión previa. **Sacá turno ya** para evitar circular vencido y arriesgar una multa.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (vencimiento.includes('YA VENCIÓ')) {
    insight = {
      title: 'VTV vencida',
      text: `La VTV venció en **${vencimiento.replace(' (⚠️ YA VENCIÓ — renová urgente)', '')}**. Circular sin VTV vigente te expone a **multa y retención del vehículo** — renová urgente.`,
      tone: 'warn',
      icon: '🚨',
    };
  } else if (vencimiento.includes('ESTE MES') || vencimiento.includes('vence pronto')) {
    insight = {
      title: 'Vence pronto',
      text: `Tu próxima VTV cae en **${vencimiento.replace(/ \(.*\)$/, '')}**. Los turnos suelen agotarse, así que **reservá con anticipación** para no quedar sin fecha disponible.`,
      tone: 'warn',
      icon: '📅',
    };
  } else {
    insight = {
      title: 'Al día por ahora',
      text: `Con frecuencia **${frecuencia.toLowerCase()}**, tu próxima VTV se estima para **${vencimiento}**. Anotá la fecha y sacá turno con unas semanas de margen.`,
      tone: 'good',
      icon: '✅',
    };
  }

  return {
    antiguedadVehiculo: antiguedad,
    frecuenciaVtv: frecuencia,
    vencimientoEstimado: vencimiento,
    detalle: detalleStr,
    _insight: insight,
  };
}
