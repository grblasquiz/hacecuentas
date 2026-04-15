/** Visa y requisitos para pasaporte argentino */
export interface VisaRequisitosInputs {
  destino?: string;
  diasEstadia: number;
  motivoViaje?: string;
}
export interface VisaRequisitosOutputs {
  necesitaVisa: string;
  costoEstimado: string;
  tiempoTramite: string;
  detalle: string;
}

interface InfoVisa {
  necesita: boolean;
  tipo: string;
  costo: string;
  tiempo: string;
  maxDias: number;
  notas: string;
}

const PAISES: Record<string, InfoVisa> = {
  eeuu: { necesita: true, tipo: 'Visa B1/B2', costo: 'USD 185', tiempo: '2-8 semanas', maxDias: 180, notas: 'Entrevista presencial en Embajada Buenos Aires. Vigencia hasta 10 años.' },
  canada: { necesita: true, tipo: 'eTA (Electronic Travel Authorization)', costo: 'CAD 7', tiempo: '72 hs online', maxDias: 180, notas: 'Trámite online. Vigencia 5 años.' },
  europa: { necesita: false, tipo: 'ETIAS (autorización electrónica)', costo: 'EUR 7', tiempo: 'Minutos a 72 hs', maxDias: 90, notas: 'Sin visa. ETIAS obligatorio desde 2025. 90 días cada 180 en zona Schengen.' },
  reinoUnido: { necesita: false, tipo: 'Sin visa', costo: 'Gratis', tiempo: 'Sin trámite', maxDias: 180, notas: 'Hasta 6 meses como turista. Sin visa ni autorización electrónica.' },
  brasil: { necesita: false, tipo: 'Sin visa (DNI o pasaporte)', costo: 'Gratis', tiempo: 'Sin trámite', maxDias: 90, notas: 'Se puede entrar con DNI tarjeta. Acuerdo Mercosur.' },
  australia: { necesita: true, tipo: 'eVisitor (subclass 651)', costo: 'Gratis', tiempo: '1-4 semanas', maxDias: 90, notas: 'Trámite online gratuito. Hasta 90 días por visita.' },
  japon: { necesita: false, tipo: 'Sin visa', costo: 'Gratis', tiempo: 'Sin trámite', maxDias: 90, notas: 'Hasta 90 días como turista. Pasaporte vigente requerido.' },
  india: { necesita: true, tipo: 'e-Visa', costo: 'USD 25', tiempo: '72 hs online', maxDias: 60, notas: 'Trámite online. Visa electrónica de turismo de 30 o 60 días.' },
  china: { necesita: true, tipo: 'Visa L (turismo)', costo: 'USD 140', tiempo: '1-2 semanas', maxDias: 30, notas: 'Presencial en consulado. Requiere itinerario y reserva de hotel.' },
  rusia: { necesita: true, tipo: 'e-Visa', costo: 'Gratis', tiempo: '4 días online', maxDias: 16, notas: 'Visa electrónica gratuita para hasta 16 días. Online.' },
  turquia: { necesita: false, tipo: 'Sin visa', costo: 'Gratis', tiempo: 'Sin trámite', maxDias: 90, notas: 'Hasta 90 días como turista sin visa.' },
  tailandia: { necesita: false, tipo: 'Sin visa (visa on arrival)', costo: 'Gratis', tiempo: 'En el aeropuerto', maxDias: 30, notas: 'Hasta 30 días sin visa. Extensible a 60 días en oficina de inmigración.' },
};

export function visaRequisitosPasaporteArgentino(inputs: VisaRequisitosInputs): VisaRequisitosOutputs {
  const destino = String(inputs.destino || 'eeuu');
  const dias = Number(inputs.diasEstadia);
  const motivo = String(inputs.motivoViaje || 'turismo');

  if (!dias || dias <= 0) throw new Error('Ingresá los días de estadía');
  if (!PAISES[destino]) throw new Error('Destino no disponible');

  const info = PAISES[destino];
  const excedeDias = dias > info.maxDias;

  let necesitaVisa: string;
  if (info.necesita) {
    necesitaVisa = `SÍ — ${info.tipo}`;
  } else {
    necesitaVisa = `NO — ${info.tipo}`;
  }

  if (excedeDias) {
    necesitaVisa += ` ⚠️ Tu estadía de ${dias} días excede el máximo de ${info.maxDias} días. Podrías necesitar visa especial.`;
  }

  if (motivo === 'estudio') {
    necesitaVisa += ' (Para estudio prolongado se requiere visa de estudiante aparte)';
  }

  return {
    necesitaVisa,
    costoEstimado: info.costo,
    tiempoTramite: info.tiempo,
    detalle: `${info.notas} Máximo ${info.maxDias} días como turista. ${excedeDias ? `Tu estadía de ${dias} días supera el límite — consultá requisitos de visa extendida.` : `Tu estadía de ${dias} días está dentro del límite.`}`,
  };
}
