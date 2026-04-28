export interface Inputs {
  tipo_vehiculo: 'moto' | 'moto_grande' | 'auto_particular' | 'camioneta' | 'camion' | 'taxi' | 'taxi_colectivo' | 'bus' | 'remolque';
}

export interface Outputs {
  precio_anual: number;
  cobertura_muerte: number;
  cobertura_invalidez: number;
  cobertura_medicos: number;
  vigencia_desde: string;
  vigencia_hasta: string;
}

export function compute(i: Inputs): Outputs {
  // Precios SOAP 2026 en pesos chilenos
  // Fuente: CMF - Acto Administrativo SOAP 2026 (marzo 2026)
  const preciosPorTipo: Record<string, {precio: number, muerte_uta: number, invalidez_uta: number, medicos_uta: number}> = {
    'moto': { precio: 24200, muerte_uta: 500, invalidez_uta: 1000, medicos_uta: 250 },
    'moto_grande': { precio: 36300, muerte_uta: 500, invalidez_uta: 1000, medicos_uta: 250 },
    'auto_particular': { precio: 60500, muerte_uta: 2000, invalidez_uta: 4000, medicos_uta: 1000 },
    'camioneta': { precio: 72600, muerte_uta: 2000, invalidez_uta: 4000, medicos_uta: 1000 },
    'camion': { precio: 121000, muerte_uta: 4000, invalidez_uta: 8000, medicos_uta: 2000 },
    'taxi': { precio: 84700, muerte_uta: 2000, invalidez_uta: 4000, medicos_uta: 1000 },
    'taxi_colectivo': { precio: 145300, muerte_uta: 4000, invalidez_uta: 8000, medicos_uta: 2000 },
    'bus': { precio: 242000, muerte_uta: 4000, invalidez_uta: 8000, medicos_uta: 2000 },
    'remolque': { precio: 12100, muerte_uta: 500, invalidez_uta: 1000, medicos_uta: 250 }
  };

  // UTA 2026 enero = $60.590 (fuente: SII)
  const uta2026 = 60590;

  const datosVehiculo = preciosPorTipo[i.tipo_vehiculo] || preciosPorTipo['auto_particular'];

  const precioAnual = datosVehiculo.precio;
  const coberturasMuerte = Math.round(datosVehiculo.muerte_uta * uta2026);
  const coberturasInvalidez = Math.round(datosVehiculo.invalidez_uta * uta2026);
  const coberturasMedicos = Math.round(datosVehiculo.medicos_uta * uta2026);

  return {
    precio_anual: precioAnual,
    cobertura_muerte: coberturasMuerte,
    cobertura_invalidez: coberturasInvalidez,
    cobertura_medicos: coberturasMedicos,
    vigencia_desde: '1 de abril de 2026',
    vigencia_hasta: '31 de marzo de 2027'
  };
}
