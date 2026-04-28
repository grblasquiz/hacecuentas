export interface Inputs {
  situacion_legal: 'convivencia_informal' | 'auc_formalizado' | 'matrimonio' | 'separacion_de_hecho';
  antiguedad_relacion: number;
  tiene_hijos: 'no' | 'si_biologicos' | 'si_un_progenitor' | 'si_adoptados';
  num_hijos_menores: number;
  ingreso_mensual_bruto: number;
  tiene_isapre: 'fonasa' | 'isapre' | 'ninguno';
  estado_laboral: 'dependiente' | 'independiente' | 'pensionado' | 'desempleado';
  pacto_auc_vigente: 'si' | 'en_tramite' | 'no';
  fecha_auc?: string;
}

export interface Outputs {
  puede_reclamar_asignacion_familiar: boolean;
  monto_asignacion_familiar_anual: number;
  tope_ingreso_asignacion: number;
  derechos_herencia_auc: string;
  hereda_porcentaje: number;
  derechos_salud_dependientes: string;
  pension_sobrevivencia_aplica: boolean;
  comparativa_matrimonio: string;
  pasos_formalizacion: string;
  documentos_requeridos: string;
  estado_actual_derechos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile
  const UTM_2026 = 66500; // UTM abril 2026 (CLP)
  const UF_2026 = 36500; // UF abril 2026 (CLP, estimada)
  const TOPE_INGRESO_ASIGNACION = UTM_2026 * 2.75; // ~$182.875
  const MONTO_BASE_ASIGNACION_HIJO = UTM_2026 * 0.75; // ~$49.875 por hijo
  const IVA_CHILE = 0.19; // IVA estándar
  
  // Lógica de elegibilidad
  let puede_reclamar = false;
  let monto_asignacion = 0;
  let hereda_pct = 0;
  let pension_sobrev = false;
  
  // Validar formalización legal
  const es_formalizado = i.situacion_legal === 'auc_formalizado' || i.situacion_legal === 'matrimonio';
  
  // 1. Asignación familiar
  if (es_formalizado && i.estado_laboral !== 'desempleado') {
    if (i.ingreso_mensual_bruto <= TOPE_INGRESO_ASIGNACION && i.num_hijos_menores > 0) {
      puede_reclamar = true;
      // Ajuste por tramo de ingreso (coeficiente disminuye si ingreso sube)
      const ratio_ingreso = i.ingreso_mensual_bruto / TOPE_INGRESO_ASIGNACION;
      const coeficiente = Math.max(0.5, 1 - ratio_ingreso * 0.5); // Mínimo 50%
      monto_asignacion = i.num_hijos_menores * MONTO_BASE_ASIGNACION_HIJO * coeficiente * 12;
    }
  }
  
  // 2. Derechos de herencia (sucesión intestada)
  if (i.situacion_legal === 'convivencia_informal') {
    hereda_pct = 0; // Sin derechos legales
  } else if (es_formalizado) {
    if (i.num_hijos_menores > 0) {
      hereda_pct = 0.25; // Viudo(a): 25% con hijos
    } else if (i.tiene_hijos === 'no') {
      hereda_pct = 0.5; // Viudo(a) sin hijos: 50%
    }
  }
  
  // 3. Pensión de sobrevivencia
  pension_sobrev = es_formalizado; // Aplica con AUC o matrimonio
  
  // Construir textos descriptivos
  let herencia_texto = '';
  if (i.situacion_legal === 'convivencia_informal') {
    herencia_texto = 'Sin formalización legal: pareja NO hereda. Solo heredan hijos biológicos reconocidos legalmente.';
  } else if (es_formalizado) {
    if (i.num_hijos_menores > 0) {
      herencia_texto = `Con AUC/matrimonio + ${i.num_hijos_menores} hijo(s): pareja hereda 25% de la masa hereditaria. Hijos heredan 75% en partes iguales. Viudo(a) puede heredar más si no hay testamento contrario.`;
    } else {
      herencia_texto = 'Con AUC/matrimonio sin hijos: pareja hereda 50% (mitad ganancial). Resto va a padres o colaterales según sucesión intestada.';
    }
  }
  
  // Derechos de salud
  let salud_texto = '';
  if (i.tiene_isapre === 'fonasa') {
    if (es_formalizado) {
      salud_texto = `Pareja e hijos son cargas familiares en Fonasa. Descuento en cotización base (7%). Acceso a prestaciones estatal + complementario.`;
    } else {
      salud_texto = `Sin formalización: pareja NO es carga familiar. Debe cotizar independientemente (7%). Hijos pueden ser cargas si están reconocidos.`;
    }
  } else if (i.tiene_isapre === 'isapre') {
    if (es_formalizado) {
      salud_texto = `Pareja e hijos (menores 25 años) son cargas familiares en Isapre. Beneficiarios con derecho a prestaciones. Cotización compartida según plan.`;
    } else {
      salud_texto = `Sin formalización: pareja es "beneficiario voluntario" en Isapre (paga cotización completa 7% + comisión). Hijos menores son cargas si están reconocidos.`;
    }
  }
  
  // Comparativa con matrimonio
  let comparativa = '';
  if (i.situacion_legal === 'auc_formalizado') {
    comparativa = `
**AUC vs. Matrimonio - Principales diferencias:**

| Aspecto | AUC | Matrimonio |
|--------|-----|----------|
| Asignación familiar | ✓ Igual | ✓ Igual |
| Herencia | ✓ Igual | ✓ Igual |
| Pensión sobrevivencia | ✓ Sí | ✓ Sí |
| Salud (cargas) | ✓ Sí | ✓ Sí |
| Impedimentos | ✓ Menos (LGBTIQ+) | Restricciones |
| Disolución | Notarial simple | Divorcio judicial |
| Apellido común | ✗ No | ✓ Sí (opcional) |
| Régimen patrimonial | Negociable | Comunidad ley (defecto) |

**Ventajas AUC:** Sin restricciones género, disolución más simple, régimen patrimonial flexible.
**Ventajas Matrimonio:** Reconocimiento social, apellido común, procedimiento más estandarizado.`;
  } else if (i.situacion_legal === 'convivencia_informal') {
    comparativa = `
**Convivencia informal vs. Formalización (AUC/Matrimonio):**

Sin AUC/matrimonio, pierdes:
- Asignación familiar: ~$${(monto_asignacion).toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}/año
- Derechos de herencia: 25% de patrimonio
- Pensión de sobrevivencia: $0 al fallecer pareja
- Deducción dependiente en impuestos: ~$500.000+/año en beneficios
- Status de cónyuge en Fonasa/Isapre

**Recomendación:** Formalizar AUC cuesta ~$300.000, pero recuperas inversión en ~1 año de asignación familiar.`;
  }
  
  // Pasos de formalización
  let pasos = '';
  if (i.situacion_legal === 'convivencia_informal' || i.pacto_auc_vigente === 'no') {
    pasos = `
**Pasos para formalizar AUC en Chile:**

1. **Preparar documentación:**
   - Carnet identidad ambos (vigente)
   - Comprobante domicilio (boleta servicios últimos 2 meses)
   - Certificado nulidad (si fue casado antes)
   - Fotocopia de RUT
   - Fotos carnet 4×4 (para Registro Civil)

2. **Ir a notaría** (cualquiera):
   - Llevar documentos originales
   - Arancel: ~$300.000 (varía)
   - Duración: 15-30 minutos
   - Notario redacta acta AUC simple o con pactos (ej: exclusión bienes)

3. **Inscribir en Registro Civil** (dentro 30 días):
   - Llevar acta notariada original
   - Ambos deben asistir o con poder notarial
   - Costo inscripción: ~$40.000
   - Plazo: 10 minutos a 2 horas
   - **Recibes certificado inscripción** (documento oficial)

4. **Actualizar registros:**
   - Informar al empleador (para asignación familiar)
   - Notificar isapre/Fonasa (para cargas)
   - Actualizar datos en SII (RUT)

**Total inversión:** ~$350.000 y 1-2 semanas.`;
  } else if (i.pacto_auc_vigente === 'si') {
    pasos = `AUC ya formalizado desde ${i.fecha_auc || 'fecha no especificada'}. Derechos están vigentes. Para actualizar cargas familiares o pactos, requiere nuevo acta notariada (disolución + nuevo AUC).`;
  } else {
    pasos = 'AUC en trámite. Dentro 30 días de firma notariada, debe inscribirse en Registro Civil. Una vez inscrito, derechos se activan.';
  }
  
  // Documentos requeridos
  const documentos = `
**Documentación necesaria para AUC:**

*Para ambos cónyuges:*
- Carnet identidad original (vigente)
- Fotocopia carnet por lado (5 copias)
- Fotocopia RUT (5 copias)
- Comprobante domicilio actual (boleta agua/luz últimos 2 meses)
- Certificado nulidad matrimonios anteriores (si aplica)
- Fotos carnet 4×4 blanco/negro (4 unidades por persona)

*Opcional según pactos:*
- Listado de bienes (si pactan exclusión)
- Documento acuerdo sobre hijos (si los hay)

*Tras inscripción Registro Civil:*
- Certificado de AUC (válido para trámites)
- Acta de matrimonio civil (tipo AUC)
- Certificado de vigencia (para pensiones, herencias)

**Chequea con tu notaría local**, pues pueden pedir documentación adicional según región.`;
  
  // Estado actual de derechos
  let estado = '';
  if (i.situacion_legal === 'convivencia_informal') {
    estado = `
**ESTADO ACTUAL: SIN DERECHOS FORMALES**

✗ Asignación familiar: NO (convivencia no reconocida)
✗ Herencia legal: NO (pareja no hereda)
✗ Pensión sobrevivencia: NO
✗ Cargas familiares en salud: NO (pareja no aparece)
✗ Deducción impuestos: NO

⚠️ **RIESGOS:** Si pareja fallece, no heredas nada. Gastos de salud sin cobertura. Sin asignación familiar, pierdes ~$${Math.round((MONTO_BASE_ASIGNACION_HIJO * 12 * Math.max(1, i.num_hijos_menores))).toLocaleString('es-CL')}/año.

✅ **RECOMENDACIÓN:** Formalizar AUC **inmediatamente** si tienen hijos o patrimonio común.`;
  } else if (i.situacion_legal === 'auc_formalizado' || i.situacion_legal === 'matrimonio') {
    estado = `
**ESTADO ACTUAL: DERECHOS FORMALES VIGENTES**

✓ Asignación familiar: ${puede_reclamar ? `SÍ (hasta $${Math.round(monto_asignacion).toLocaleString('es-CL')}/año)` : 'NO (ingresos superan tope o sin hijos)'}
✓ Herencia legal: SÍ (${Math.round(hereda_pct * 100)}% sin testamento)
✓ Pensión sobrevivencia: SÍ
✓ Cargas familiares en salud: SÍ (${i.tiene_isapre === 'isapre' ? 'Isapre' : 'Fonasa'} reconoce)
✓ Deducción impuestos: SÍ (consulta SII para monto exacto)

💰 **BENEFICIOS VIGENTES:**
- Ingresos mensuales: $${i.ingreso_mensual_bruto.toLocaleString('es-CL')}
- Tope asignación familiar: $${Math.round(TOPE_INGRESO_ASIGNACION).toLocaleString('es-CL')}
- Monto estimado anual: $${Math.round(monto_asignacion).toLocaleString('es-CL')}
- Herencia sin testamento: ${Math.round(hereda_pct * 100)}%`;
    if (i.pacto_auc_vigente === 'en_tramite') {
      estado += `\n\n⏳ **EN TRÁMITE:** AUC debe inscribirse en Registro Civil dentro 30 días de firma notariada. Una vez inscrito, derechos se retroactivan a fecha firma.`;
    }
  }
  
  return {
    puede_reclamar_asignacion_familiar: puede_reclamar,
    monto_asignacion_familiar_anual: Math.round(monto_asignacion),
    tope_ingreso_asignacion: Math.round(TOPE_INGRESO_ASIGNACION),
    derechos_herencia_auc: herencia_texto,
    hereda_porcentaje: Math.round(hereda_pct * 100),
    derechos_salud_dependientes: salud_texto,
    pension_sobrevivencia_aplica: pension_sobrev,
    comparativa_matrimonio: comparativa,
    pasos_formalizacion: pasos,
    documentos_requeridos: documentos,
    estado_actual_derechos: estado
  };
}
