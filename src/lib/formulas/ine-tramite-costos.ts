/**
 * Información sobre costos y requisitos de trámite INE México
 * Todos los trámites de credencial INE son GRATUITOS
 */

export interface Inputs {
  tipoTramite: 'nueva' | 'renovacion' | 'reposicion' | 'cambio-domicilio';
}

export interface Outputs {
  costo: number;
  documentos: string[];
  duracion: string;
  tipoAplicado: string;
  mensaje: string;
}

export function ineTramiteCostos(i: Inputs): Outputs {
  const tipo = i.tipoTramite;

  if (!tipo) throw new Error('Ingresá el tipo de trámite');
  if (!['nueva', 'renovacion', 'reposicion', 'cambio-domicilio'].includes(tipo)) {
    throw new Error('Tipo de trámite inválido');
  }

  let documentos: string[] = [];
  let duracion = '';
  let tipoLabel = '';

  switch (tipo) {
    case 'nueva':
      documentos = ['Acta de nacimiento original', 'Identificación con fotografía', 'Comprobante de domicilio (<3 meses)', 'CURP'];
      duracion = '20 a 30 días hábiles';
      tipoLabel = 'Credencial nueva (primera vez)';
      break;
    case 'renovacion':
      documentos = ['Credencial anterior vigente o vencida', 'Comprobante de domicilio (<3 meses)'];
      duracion = '15 a 25 días hábiles';
      tipoLabel = 'Renovación';
      break;
    case 'reposicion':
      documentos = ['Acta de nacimiento', 'Identificación alterna', 'Comprobante de domicilio (<3 meses)', 'Denuncia de robo/extravío (opcional)'];
      duracion = '20 a 30 días hábiles';
      tipoLabel = 'Reposición por robo/extravío';
      break;
    case 'cambio-domicilio':
      documentos = ['Credencial vigente', 'Comprobante del nuevo domicilio (<3 meses)'];
      duracion = '15 a 20 días hábiles';
      tipoLabel = 'Cambio de domicilio';
      break;
  }

  return {
    costo: 0,
    documentos,
    duracion,
    tipoAplicado: tipoLabel,
    mensaje: `El trámite ${tipoLabel.toLowerCase()} es gratuito. Entrega estimada: ${duracion}.`,
  };
}
