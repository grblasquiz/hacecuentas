/**
 * Información sobre costos y requisitos de trámite INE México
 * El trámite INE en sí es GRATUITO; sólo cuesta emitir acta/comprobante si no los tenés
 */

export type TipoTramiteIne =
  | 'primera-vez'
  | 'renovacion'
  | 'cambio-domicilio'
  | 'reposicion-extravio'
  | 'correccion'
  // backward-compat con otros slugs
  | 'nueva'
  | 'reposicion';

export interface Inputs {
  tipoTramite: TipoTramiteIne;
  tieneActa?: 'si' | 'no';
  tieneComprobante?: 'si' | 'no';
  estadoActaNac?: 'cdmx' | 'edomex' | 'jalisco' | 'nuevoleon' | 'otros';
}

export interface Outputs {
  costoTotal: number;
  costoIne: number;
  costoActa: number;
  costoComprobante: number;
  documentos: string[];
  duracion: string;
  tipoAplicado: string;
  mensaje: string;
}

const COSTO_ACTA: Record<string, number> = {
  cdmx: 77,
  edomex: 227,
  jalisco: 200,
  nuevoleon: 130,
  otros: 200,
};

export function ineTramiteCostos(i: Inputs): Outputs {
  const tipo = i.tipoTramite;
  if (!tipo) throw new Error('Ingresá el tipo de trámite');

  let documentos: string[] = [];
  let duracion = '';
  let tipoLabel = '';

  switch (tipo) {
    case 'primera-vez':
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
    case 'reposicion-extravio':
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
    case 'correccion':
      documentos = ['Credencial vigente', 'Documento oficial con dato correcto', 'Comprobante de domicilio'];
      duracion = '20 a 30 días hábiles';
      tipoLabel = 'Corrección de datos';
      break;
    default:
      throw new Error('Tipo de trámite inválido');
  }

  const costoIne = 0;
  const estado = i.estadoActaNac ?? 'cdmx';
  const costoActa = i.tieneActa === 'no' ? (COSTO_ACTA[estado] ?? 200) : 0;
  const costoComprobante = i.tieneComprobante === 'no' ? 150 : 0; // estimado emisión copia certificada
  const costoTotal = costoIne + costoActa + costoComprobante;

  return {
    costoTotal,
    costoIne,
    costoActa,
    costoComprobante,
    documentos,
    duracion,
    tipoAplicado: tipoLabel,
    mensaje: `${tipoLabel}: trámite INE $0. Costo total (docs): $${costoTotal}. Entrega: ${duracion}.`,
  };
}
