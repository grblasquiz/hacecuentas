/** Gate de consistencia para datos vigentes de alto impacto (Argentina). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ANSES_2026 } from '../src/lib/data/anses-2026.ts';
import {
  APORTE_OBRA_SOCIAL, APORTE_SIPA, CATEGORIAS, CUOTA_BIENES, CUOTA_SERVICIOS,
  IMPUESTO_BIENES, IMPUESTO_SERVICIOS, META as MONO_META,
} from '../src/lib/data/monotributo-2026.ts';
import { GANANCIAS_2026, GANANCIAS_2026_DEDUCCIONES } from '../src/lib/data/ganancias-2026.ts';
import { BASE_IMPONIBLE_MAXIMA_APORTES } from '../src/lib/formulas/sueldo-ar.ts';
import { MNI_MENSUAL_BASE } from '../src/lib/formulas/_ganancias-escala.ts';
import { DESEMPLEO_PISO, DESEMPLEO_TECHO, SMVM_MENSUAL } from '../src/lib/data/smvm-ar-2026.ts';
import { BIENES_PERSONALES_2025 } from '../src/lib/data/bienes-personales-2025.ts';
import { ASIGNACIONES_ANSES_AGO_2026 } from '../src/lib/data/argentina-2026.ts';
import { sueldoEmpleadosComercioCct13075 } from '../src/lib/formulas/sueldo-empleados-comercio-cct-130-75.ts';
import { gananciasRG830 } from '../src/lib/formulas/ganancias-rg830.ts';

const root = process.cwd();
const errors: string[] = [];
const close = (a: number, b: number) => Math.abs(a - b) < 0.011;
const assert = (ok: boolean, msg: string) => { if (!ok) errors.push(msg); };

assert(close(ANSES_2026.puam, ANSES_2026.haberMinimo * 0.8), 'PUAM no equivale al 80% del haber mínimo');
assert(close(BASE_IMPONIBLE_MAXIMA_APORTES, ANSES_2026.baseImponibleMaxima), 'tope SIPA diverge de la fuente ANSES central');
assert(close(DESEMPLEO_PISO, SMVM_MENSUAL * 0.5) && close(DESEMPLEO_TECHO, SMVM_MENSUAL), 'topes de desempleo no siguen 50%/100% del SMVM');

const gd = GANANCIAS_2026_DEDUCCIONES.second;
assert(close(MNI_MENSUAL_BASE, (gd.gni + gd.especialEmpleados) / 12), 'MNI mensual diverge de deducciones ARCA');
assert(GANANCIAS_2026.second.length === 9, 'la escala de Ganancias vigente no tiene 9 tramos');
assert(BIENES_PERSONALES_2025.minimoNoImponible === 384_728_044.57 && BIENES_PERSONALES_2025.escala.length === 3, 'Bienes Personales no coincide con tabla fiscal 2025 de ARCA');
assert(ASIGNACIONES_ANSES_AGO_2026.auhGeneral === 150_848, 'AUH no coincide con Anexo V Res. 233/2026');
assert(ASIGNACIONES_ANSES_AGO_2026.ayudaEscolar === 55_672, 'Ayuda escolar no coincide con Anexos I/V Res. 233/2026');
assert(ASIGNACIONES_ANSES_AGO_2026.suaf.tramos[0].asignacion === 75_433 && ASIGNACIONES_ANSES_AGO_2026.suaf.topeIgf === 6_184_406, 'SUAF no coincide con Anexo I Res. 233/2026');

const comercioAgosto = sueldoEmpleadosComercioCct13075({ categoria: 'administ-a', antiguedad: 0, presentismo: 'no' });
assert(comercioAgosto.basico === '$1.172.965', 'Comercio Administrativo A no coincide con escala agosto 2026');
assert(/120\.000 no remunerativos/.test(String(comercioAgosto.resumen)) && /25\.000 extraordinarios/.test(String(comercioAgosto.resumen)), 'Comercio no separa suma no remunerativa y bono agosto');

const rg830Juridica = gananciasRG830({ concepto: 'locacion-obras-servicios', condicion: 'no-inscripto', tipoBeneficiario: 'otro-sujeto', montoPago: 100_000, pagosAnteriores: 0, retencionesAnteriores: 0 });
assert(rg830Juridica.alicuotaAplicada.startsWith('25%'), 'RG 830 no aplica 25% a otro sujeto no inscripto');

for (const cat of CATEGORIAS) {
  assert(close(CUOTA_SERVICIOS[cat], IMPUESTO_SERVICIOS[cat] + APORTE_SIPA[cat] + APORTE_OBRA_SOCIAL[cat]), `Monotributo ${cat} servicios no suma`);
  assert(close(CUOTA_BIENES[cat], IMPUESTO_BIENES[cat] + APORTE_SIPA[cat] + APORTE_OBRA_SOCIAL[cat]), `Monotributo ${cat} bienes no suma`);
}
assert(MONO_META.vigencia === '2026-08-01', 'Monotributo no declara vigencia agosto 2026');

const snap = JSON.parse(readFileSync(join(root, 'db/data-sources/arca-ganancias-jul-dic-2026.json'), 'utf8'));
assert(close(snap.deducciones_anual.mni, gd.gni), 'snapshot ARCA y GNI local divergen');
assert(close(snap.deducciones_anual.deduccion_especial_apartado_2, gd.especialEmpleados), 'snapshot ARCA y deducción empleados divergen');
snap.escala_anual.forEach((r: any, i: number) => {
  const local = GANANCIAS_2026.second[i];
  assert(Boolean(local) && close(r.desde, local[0]) && close(r.monto_fijo, local[2]) && close(r.porcentaje / 100, local[3]), `snapshot ARCA y tramo ${i + 1} divergen`);
});

const forbidden: Array<[string, RegExp, string]> = [
  ['src/components/GananciasCuartaExperience.astro', /4\.414\.652|2\.490\.038|404\.330|203\.905/, 'Ganancias/SIPA conserva literal anterior'],
  ['src/components/generated/DatosGananciasExperience.astro', /enero.{0,3}junio 2026|primer semestre 2026|4\.509\.567/, 'panel Ganancias conserva período anterior'],
  ['src/pages/inflacion-argentina.astro', /IPC julio 2026: todavía no fue publicado|se publica el jueves 13 de agosto/, 'IPC conserva anuncio vencido'],
  ['src/components/generated/ImpuestosHomeExperience.astro', /En (?:7|22) días|<b>(?:05|20|31)<\/b><span>AGO/, 'calendario impositivo conserva cuenta regresiva vencida'],
  ['src/lib/formulas/impuesto-bienes-personales-2026-cripto-cedears.ts', /292_994_964|704_387_911|8_777_848_920/, 'Bienes Personales conserva escala fiscal anterior'],
  ['src/lib/formulas/asignacion-universal-hijo-auh-2026-monto.ts', /150861|952110|BONO_REFUERZO_VALOR/, 'AUH conserva valor, tope o bono inexistente'],
  ['src/lib/formulas/asignacion-familiar-anses-2026-tramos-ingreso.ts', /1122074|5941936|85000|144562/, 'SUAF conserva tabla anterior'],
  ['src/components/generated/AsignacionesAnsesExperience.astro', /150861|1122074|5941936|SCHOOL=85000|members\*952110/, 'experiencia ANSES conserva valores anteriores'],
  ['src/components/generated/AsignacionesAnsesExperience.astro', /LECHE=\d+|Complemento Leche",money\(/, 'experiencia ANSES inventa monto de Complemento Leche'],
  ['src/lib/formulas/quita-jubilatoria-bono-refuerzo-anses-2026.ts', /bono:\s*25000|haberMinimo:\s*75000/, 'bono previsional incluye AUH/AUE sin norma'],
  ['src/lib/hubs/prestamo-anses.ts', /BONO_AUH|cuánto me presta ANSES|crédito pre-aprobado/i, 'hub de Créditos ANSES ofrece altas inexistentes'],
  ['src/content/blog/planificar-jubilacion-anses-2026.json', /créditos para jubilados, pensionados y titulares de AUH tienen|haber más bono menos cuota/i, 'blog conserva oferta falsa de Créditos ANSES'],
  ['src/lib/hubs/sueldos-por-convenio.ts', /uocra:[\s\S]{0,220}vigencia:\s*'julio 2026'|comercio:[\s\S]{0,220}vigencia:\s*'julio 2026'|Desde julio 2026 las sumas fijas/, 'hub de convenios conserva UOCRA o Comercio anterior'],
  ['src/components/SueldosConvenioExperience.astro', /sc-art-date">julio 2026|sc-date">julio 2026|value="150\.000"/, 'experiencia de convenios conserva fecha o suma precargada anterior'],
];
for (const [file, pattern, msg] of forbidden) {
  const text = readFileSync(join(root, file), 'utf8');
  assert(!pattern.test(text), `${msg}: ${file}`);
}

const rg830 = readFileSync(join(root, 'src/lib/formulas/ganancias-rg830.ts'), 'utf8');
assert(/A8_RG5740\.pdf/.test(rg830), 'RG 830 no cita el Anexo VIII vigente de la RG 5740/2025');
assert(!/Anexo VIII NO se actualizan desde|RG 5423\/2023 sigue vigente/.test(rg830), 'RG 830 conserva una afirmación de vigencia obsoleta');

if (errors.length) {
  console.error(`current-data audit: ${errors.length} error(es)`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('current-data audit: OK — Ganancias/RG830, Monotributo, ANSES/SIPA, asignaciones, Créditos ANSES, Comercio, Bienes Personales e IPC consistentes');
