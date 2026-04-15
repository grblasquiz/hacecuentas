/** Calendario de vacunación según edad del gato */
export interface Inputs {
  edadSemanas?: number;
  edadMeses?: number;
  saleAfuera?: boolean;
  yaVacunado?: boolean;
}
export interface Outputs {
  edadMeses: number;
  proximaVacuna: string;
  calendario: { edad: string; vacuna: string; descripcion: string }[];
  alerta: string;
  necesitaFeLV: string;
  detalle: string;
}

export function vacunasGatoCalendarioGatito(i: Inputs): Outputs {
  let em = Number(i.edadMeses);
  const semanas = Number(i.edadSemanas);
  if (!em && semanas) em = semanas / 4.345;
  if (!em || em <= 0) throw new Error('Ingresá la edad en semanas o meses');

  const saleAfuera = i.saleAfuera === true;
  const yaVacunado = i.yaVacunado === true;

  const calendario = [
    { edad: '8-9 semanas (2 meses)', vacuna: '1° Triple Felina (FVRCP)', descripcion: 'Panleucopenia, calicivirus, herpesvirus. Primera dosis.' },
    { edad: '12 semanas (3 meses)', vacuna: '2° Triple Felina' + (saleAfuera ? ' + 1° FeLV' : ''), descripcion: 'Refuerzo triple.' + (saleAfuera ? ' Primera dosis leucemia felina.' : '') },
    { edad: '16 semanas (4 meses)', vacuna: '3° Triple Felina + Antirrábica' + (saleAfuera ? ' + 2° FeLV' : ''), descripcion: 'Última triple del esquema gatito + antirrábica obligatoria.' + (saleAfuera ? ' Segunda dosis FeLV.' : '') },
    { edad: '1 año', vacuna: 'Refuerzo Triple + Antirrábica' + (saleAfuera ? ' + FeLV' : ''), descripcion: 'Primer refuerzo anual adulto.' },
    { edad: 'Anual de por vida', vacuna: 'Antirrábica (obligatoria) + Triple cada 1-3 años', descripcion: 'Refuerzo según protocolo veterinario.' },
  ];

  let proxima = '';
  let alerta = '';

  if (em < 2) {
    proxima = 'A las 8-9 semanas: 1° Triple Felina (FVRCP).';
    if (!yaVacunado) {
      alerta = 'Tu gatito aún no tiene edad para vacunarse. Mantenelo indoor y sin contacto con gatos de origen desconocido.';
    }
  } else if (em < 3) {
    proxima = yaVacunado
      ? 'A las 12 semanas: 2° Triple Felina' + (saleAfuera ? ' + 1° FeLV.' : '.')
      : '1° Triple Felina (FVRCP) — debería haberse puesto a las 8-9 semanas. Aplicar ahora.';
  } else if (em < 4) {
    proxima = 'A las 16 semanas: 3° Triple Felina + Antirrábica obligatoria' + (saleAfuera ? ' + 2° FeLV.' : '.');
  } else if (em < 12) {
    proxima = 'Al año de vida: refuerzo anual (Triple + Antirrábica' + (saleAfuera ? ' + FeLV).' : ').');
  } else {
    proxima = 'Refuerzo anual: Antirrábica (obligatoria) + Triple felina (cada 1-3 años según protocolo).';
  }

  if (em > 6 && !yaVacunado) {
    alerta = 'Tu gato no está vacunado. Consultá al veterinario para un esquema acelerado: 1° Triple + Antirrábica ahora, 2° Triple en 3-4 semanas. Si sale afuera, hacer test FeLV/FIV antes de vacunar FeLV.';
  }

  const necesitaFeLV = saleAfuera
    ? 'Sí — tu gato sale afuera o tiene contacto con otros gatos. Necesita vacuna FeLV (2 dosis + refuerzo anual). Hacer test FeLV/FIV antes de vacunar.'
    : 'No — tu gato es 100% indoor sin contacto con gatos externos. La vacuna FeLV no es necesaria.';

  return {
    edadMeses: Number(em.toFixed(1)),
    proximaVacuna: proxima,
    calendario,
    alerta,
    necesitaFeLV,
    detalle: `Tu gato tiene ${em.toFixed(1)} meses. Próxima vacuna: ${proxima}${alerta ? ' ' + alerta : ''}`,
  };
}
