export interface Inputs {
  combustible: 'gasolina' | 'diesel' | 'hibrido_enchufable' | 'glp' | 'gnc' | 'electrico' | 'hidrogeno' | 'gasolina_gas' | 'diesel_gas';
  ano_matricula: number;
}

export interface Outputs {
  etiqueta: string;
  color_etiqueta: string;
  restriccion_zbe_madrid: string;
  restriccion_zbe_barcelona: string;
  detalles_restricciones: string;
  beneficios_incentivos: string;
}

export function compute(i: Inputs): Outputs {
  // Validación básica
  if (!i.combustible || i.ano_matricula < 1990 || i.ano_matricula > 2026) {
    return {
      etiqueta: 'Error: datos inválidos',
      color_etiqueta: 'N/A',
      restriccion_zbe_madrid: 'N/A',
      restriccion_zbe_barcelona: 'N/A',
      detalles_restricciones: 'Verifica año y combustible',
      beneficios_incentivos: 'N/A'
    };
  }

  let etiqueta: string;
  let color_etiqueta: string;

  // Clasificación según DGT: Real Decreto 1428/2003 (vigente 2026)
  // Fuente: https://www.dgt.gob.es

  if (
    i.combustible === 'electrico' ||
    i.combustible === 'hidrogeno'
  ) {
    // Etiqueta Cero: vehículos con cero emisiones
    etiqueta = 'Cero';
    color_etiqueta = 'Verde oscuro + blanco';
  } else if (
    i.combustible === 'hibrido_enchufable' ||
    i.combustible === 'glp' ||
    i.combustible === 'gnc' ||
    i.combustible === 'gasolina_gas' ||
    i.combustible === 'diesel_gas'
  ) {
    // Etiqueta Eco: híbridos enchufables, GLP, GNC, bicombustible
    etiqueta = 'Eco';
    color_etiqueta = 'Amarillo + verde';
  } else if (i.combustible === 'gasolina') {
    // Gasolina: fecha corte 01/01/2006
    if (i.ano_matricula >= 2006) {
      etiqueta = 'C';
      color_etiqueta = 'Rojo + amarillo';
    } else if (i.ano_matricula >= 2000 && i.ano_matricula < 2006) {
      etiqueta = 'B';
      color_etiqueta = 'Azul oscuro + blanco';
    } else {
      etiqueta = 'Sin etiqueta';
      color_etiqueta = 'No clasificado';
    }
  } else if (i.combustible === 'diesel') {
    // Diésel: fecha corte C es 01/01/2014, B es 01/01/2006
    if (i.ano_matricula >= 2014) {
      etiqueta = 'C';
      color_etiqueta = 'Rojo + amarillo';
    } else if (i.ano_matricula >= 2006 && i.ano_matricula < 2014) {
      etiqueta = 'B';
      color_etiqueta = 'Azul oscuro + blanco';
    } else {
      etiqueta = 'Sin etiqueta';
      color_etiqueta = 'No clasificado';
    }
  } else {
    etiqueta = 'Desconocida';
    color_etiqueta = 'No determinado';
  }

  // Restricciones ZBE Madrid (dentro M-30) - 2026
  // Fuente: Ayuntamiento Madrid plan movilidad sostenible
  let restriccion_zbe_madrid: string;

  if (etiqueta === 'Cero') {
    restriccion_zbe_madrid = '✓ Circulación sin restricciones. Acceso total a ZBE Madrid.';
  } else if (etiqueta === 'Eco') {
    restriccion_zbe_madrid = '✓ Circulación sin restricciones (2026). Acceso prioritario a ZBE.';
  } else if (etiqueta === 'C') {
    restriccion_zbe_madrid = '⚠ Restricciones con limitaciones horarias. Consulta plan municipal 2026 para horarios exactos. Posible prohibición progresiva.';
  } else if (etiqueta === 'B') {
    restriccion_zbe_madrid = '✗ PROHIBIDO circular en ZBE Madrid desde 2024. Excepciones: residentes (con autorización), servicios esenciales, personas con discapacidad.';
  } else {
    restriccion_zbe_madrid = '✗ PROHIBIDO total en ZBE Madrid. Sin etiqueta: acceso solo con autorización especial (emergencias, minusvalía).';
  }

  // Restricciones ZBE Barcelona (Eixample, Ciutat Vella, etc.) - 2026
  // Fuente: Ajuntament de Barcelona
  let restriccion_zbe_barcelona: string;

  if (etiqueta === 'Cero') {
    restriccion_zbe_barcelona = '✓ Circulación sin restricciones. Acceso total a ZBE Barcelona.';
  } else if (etiqueta === 'Eco') {
    restriccion_zbe_barcelona = '✓ Circulación sin restricciones. Acceso prioritario a ZBE Barcelona.';
  } else if (etiqueta === 'C') {
    restriccion_zbe_barcelona = '⚠ Restricciones en fases normativas. Consulta Ajuntament Barcelona para horarios y fases activas 2026.';
  } else if (etiqueta === 'B') {
    restriccion_zbe_barcelona = '✗ PROHIBIDO en ZBE Barcelona (desde 2024). Excepciones: residentes empadronados (autorización temporal), servicios esenciales, personas con minusvalía certificada.';
  } else {
    restriccion_zbe_barcelona = '✗ PROHIBIDO total en ZBE Barcelona. Sin etiqueta: acceso denegado salvo autorización especial (emergencias, discapacidad reconocida).';
  }

  // Detalles y excepciones generales
  let detalles_restricciones: string;

  if (etiqueta === 'Cero') {
    detalles_restricciones = 'Vehículo de cero emisiones. Cumple estrictamente normativa ZBE 2026. Excepto en casos de circulación prohibida municipal, acceso total a todas las zonas.';
  } else if (etiqueta === 'Eco') {
    detalles_restricciones = 'Vehículo con bajas emisiones. Clasificación más favorable tras Cero. Acceso preferente a zonas ambientales. Puede estar sujeto a restricciones futuras si normativa europea endurece.';
  } else if (etiqueta === 'C') {
    detalles_restricciones = 'Cumple norma Euro 4 (gasolina 2006+) o Euro 5 (diésel 2014+). Sujeto a restricciones progresivas en ZBE Madrid y Barcelona durante 2026-2028. Recomendable consultar plan municipal actualizado.';
  } else if (etiqueta === 'B') {
    detalles_restricciones = 'Cumple norma Euro 3-4. PROHIBIDO en ZBE principales desde 2024. Solo circula con autorización en Madrid/Barcelona si eres residente registrado o tienes servicio esencial certificado. Considera cambio de vehículo para 2027.';
  } else {
    detalles_restricciones = 'Vehículo anterior a normas Euro 3 (Euro 1-2). PROHIBIDO en todas las ZBE activas (Madrid, Barcelona, Valencia, Bilbao, Sevilla, Zaragoza). Acceso solo emergencias y personas con discapacidad. Retira circulación en ciudades o sustituye vehículo.';
  }

  // Beneficios e incentivos según clasificación
  let beneficios_incentivos: string;

  if (etiqueta === 'Cero') {
    beneficios_incentivos = '💰 Incentivos Cero (eléctrico/hidrógeno): Descuento matriculación (0 % IVA reducido), subvención MOVES IV hasta 5.000 € (particulares), exención impuesto circulación en comunidades autónomas participantes, aparcamiento municipal gratuito, carga eléctrica pública subsidiada en muchas ciudades.';
  } else if (etiqueta === 'Eco') {
    beneficios_incentivos = '💰 Beneficios Eco (PHEV/GLP/GNC): Posible descuento parcial matriculación según CCAA, aparcamiento municipal con tarifa reducida, prioridad recarga en algunos municipios, acceso a carril VAO durante transición. Consulta CCAA de matriculación.';
  } else if (etiqueta === 'C') {
    beneficios_incentivos = '⚠ Sin incentivos activos para C. Posible aceso a programas de renaturalización (Plan MOVES retira antiguos, financia eléctricos). Investiga bonificación municipal local (descuento IBI, IC según Ayuntamiento).';
  } else if (etiqueta === 'B') {
    beneficios_incentivos = '❌ Sin incentivos. Plan de renovación de vehículos (MOVES) financia sustitución por eléctrico/híbrido. Considera cambio: venta para exportación + compra Cero/Eco para mantener mobilidad urbana.';
  } else {
    beneficios_incentivos = '❌ Sin incentivos. Vehículo no elegible para ZBE. Opción: exportación (Europa del Este, Magreb) o desguace. Accede a MOVES IV para sustitución por Cero (subvención hasta 7.000 € si ingresos reducidos).';
  }

  return {
    etiqueta: etiqueta,
    color_etiqueta: color_etiqueta,
    restriccion_zbe_madrid: restriccion_zbe_madrid,
    restriccion_zbe_barcelona: restriccion_zbe_barcelona,
    detalles_restricciones: detalles_restricciones,
    beneficios_incentivos: beneficios_incentivos
  };
}
