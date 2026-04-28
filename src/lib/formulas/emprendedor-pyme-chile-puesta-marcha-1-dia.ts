export interface Inputs {
  tipo_sociedad: 'eirl' | 'spa' | 'ltda' | 'sa';
  capital_inicial: number; // en pesos chilenos
  requiere_asesoria: boolean;
  numero_socios: number;
  incluye_inscripcion_sii: boolean;
}

export interface Outputs {
  costo_total: number;
  costo_sii: number;
  costo_notaria: number;
  costo_registro: number;
  costo_asesoria: number;
  plazo_dias: number;
  pasos_resumen: string;
  requisitos_documentos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 SII + Registro Mercantil
  const ARANCEL_SII_EIRL = 0; // Gratis En Un Día
  const ARANCEL_SII_SPA = 0; // Gratis En Un Día
  const ARANCEL_SII_LTDA = 100000; // ~$100K promedio
  const ARANCEL_SII_SA = 300000; // ~$300K promedio

  // Notaría: % del capital, aprox 1.5–2.5%
  const TARIFA_NOTARIA_BAJA = 0.015; // 1.5%
  const TARIFA_NOTARIA_ALTA = 0.025; // 2.5%
  const MINIMO_NOTARIA = 150000; // Mínimo garantizado

  // Registro Mercantil: fijo o % según tipo
  const ARANCEL_REGISTRO_EIRL = 0;
  const ARANCEL_REGISTRO_SPA = 30000; // ~$30K
  const ARANCEL_REGISTRO_LTDA = 80000; // ~$80K
  const ARANCEL_REGISTRO_SA = 150000; // ~$150K

  // Asesoría legal (si aplica)
  const ASESORIA_BASE = 500000; // $500K mínimo
  const ASESORIA_POR_SOCIO_EXTRA = 100000; // +$100K por socio >1

  // Cálculo SII
  let costoSii = 0;
  switch (i.tipo_sociedad) {
    case 'eirl':
      costoSii = ARANCEL_SII_EIRL;
      break;
    case 'spa':
      costoSii = ARANCEL_SII_SPA;
      break;
    case 'ltda':
      costoSii = ARANCEL_SII_LTDA;
      break;
    case 'sa':
      costoSii = ARANCEL_SII_SA;
      break;
  }

  // Cálculo Notaría
  let costoNotaria = 0;
  if (i.tipo_sociedad === 'eirl') {
    // EIRL online: sin notaría presencial
    costoNotaria = 0;
  } else {
    // SpA, Ltda, SA: requieren notaría
    const porcentajeNotaria = i.tipo_sociedad === 'spa' ? TARIFA_NOTARIA_BAJA : TARIFA_NOTARIA_ALTA;
    costoNotaria = Math.max(
      i.capital_inicial * porcentajeNotaria,
      MINIMO_NOTARIA
    );
  }

  // Cálculo Registro Mercantil
  let costoRegistro = 0;
  switch (i.tipo_sociedad) {
    case 'eirl':
      costoRegistro = ARANCEL_REGISTRO_EIRL;
      break;
    case 'spa':
      costoRegistro = ARANCEL_REGISTRO_SPA;
      break;
    case 'ltda':
      costoRegistro = ARANCEL_REGISTRO_LTDA;
      break;
    case 'sa':
      costoRegistro = ARANCEL_REGISTRO_SA;
      break;
  }

  // Cálculo Asesoría
  let costoAsesoria = 0;
  if (i.requiere_asesoria) {
    costoAsesoria = ASESORIA_BASE + (Math.max(i.numero_socios - 1, 0) * ASESORIA_POR_SOCIO_EXTRA);
  }

  // Total
  const costoTotal = costoSii + costoNotaria + costoRegistro + costoAsesoria;

  // Plazo en días hábiles
  let plazoDias = 0;
  switch (i.tipo_sociedad) {
    case 'eirl':
      plazoDias = 1; // 1 día hábil
      break;
    case 'spa':
      plazoDias = i.requiere_asesoria ? 3 : 2; // 2–3 días
      break;
    case 'ltda':
      plazoDias = i.requiere_asesoria ? 7 : 5; // 5–7 días
      break;
    case 'sa':
      plazoDias = i.requiere_asesoria ? 15 : 10; // 10–15 días
      break;
  }

  // Pasos a seguir
  const pasos = [
    "1. Obtener firma digital (si no tienes) → 1–2 días, $5K–15K",
    "2. Registrarte en Mi SII → 5 min, gratis",
    "3. Completar formulario En Un Día → 20 min, gratis",
    "4. Recibir RUT provisional → 1 hora a 1 día",
    i.tipo_sociedad !== 'eirl' ? "5. Ir a notaría para escritura → 1–2 días, $" + costoNotaria : null,
    i.tipo_sociedad !== 'eirl' ? "6. Inscribir en Registro Mercantil → 1 día, $" + costoRegistro : null,
    "7. Actualizar SII con datos completos → 24 hrs, gratis",
    i.requiere_asesoria ? "8. Asesoría legal: consultas + revisión documentos → $" + costoAsesoria : null
  ].filter(Boolean).join("\n");

  // Requisitos/documentos
  const requisitos = [
    "- Cédula de identidad vigente o pasaporte",
    "- Firma digital (obtenida en BancoEstado o Biometría)",
    "- Domicilio comercial (o domicilio personal para EIRL)",
    i.numero_socios > 1 ? "- Datos de todos los socios (RUT, nombres, dirección)" : null,
    i.tipo_sociedad !== 'eirl' ? "- Estatutos sociales (plantilla SII)" : null,
    i.tipo_sociedad !== 'eirl' ? "- Acta de constitución firmada en notaría" : null,
    "- Comprobante de domicilio (boleta servicios, contrato arriendo)",
    "- Depósito capital inicial en banco a nombre de la empresa (Ltda/SA)"
  ].filter(Boolean).join("\n");

  return {
    costo_total: Math.round(costoTotal),
    costo_sii: Math.round(costoSii),
    costo_notaria: Math.round(costoNotaria),
    costo_registro: Math.round(costoRegistro),
    costo_asesoria: Math.round(costoAsesoria),
    plazo_dias: plazoDias,
    pasos_resumen: pasos,
    requisitos_documentos: requisitos
  };
}
