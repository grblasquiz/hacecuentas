#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');

const sources = {
  openstaxMath: ['https://openstax.org/subjects/math', 'colección de Matemática de OpenStax', 'los conceptos y procedimientos matemáticos'],
  openstaxCalculus: ['https://openstax.org/k12/calculus', 'manuales de Cálculo de OpenStax', 'la secuencia de funciones, límites, derivadas e integrales'],
  openstaxStats: ['https://openstax.org/books/introductory-statistics/pages/preface', 'Estadística introductoria de OpenStax', 'las definiciones de estadística, probabilidad y análisis de datos'],
  openstaxPhysics: ['https://openstax.org/books/physics/pages/preface', 'manual de Física de OpenStax', 'las magnitudes, leyes y relaciones físicas usadas en los ejemplos'],
  openstaxChemistry: ['https://openstax.org/books/chemistry-2e/pages/1-1-chemistry-in-context', 'Química 2e de OpenStax', 'las unidades, proporciones y principios químicos del recorrido'],
  nist: ['https://www.nist.gov/pml/owm/metric-si/si-units', 'guía del Sistema Internacional de NIST', 'las unidades, símbolos y conversiones de magnitudes'],
  food: ['https://www.anmat.gob.ar/Alimentos/Consejos_utiles_manipulacion_alimentos.pdf', 'recomendaciones de manipulación de alimentos de ANMAT', 'los criterios de compra, conservación y preparación segura'],
  energy: ['https://www.argentina.gob.ar/economia/energia/eficiencia-energetica/eficiencia-energetica-en-edificaciones', 'programa oficial de eficiencia energética residencial', 'los criterios de consumo, envolvente y eficiencia de la vivienda'],
  thermal: ['https://www.argentina.gob.ar/economia/energia/eficiencia-energetica/cuidemos-la-energia-en-nuestro-hogar/aislamiento-termico', 'guía oficial de aislamiento térmico', 'la relación entre materiales, aislación, confort y consumo'],
  labor: ['https://www.argentina.gob.ar/normativa/nacional/25552/actualizacion', 'Ley de Contrato de Trabajo actualizada', 'el marco general de recibos, renuncia y extinción laboral'],
  dismissal: ['https://www.argentina.gob.ar/justicia/derechofacil/leysimple/despido', 'guía oficial sobre despido', 'los conceptos generales que pueden integrar una desvinculación'],
  bcraEducation: ['https://www.bcra.gob.ar/archivos/Pdfs/BCRAyVos/Educ.%20Financiera_agosto_2023.pdf', 'manual de Educación Financiera del BCRA', 'los criterios de presupuesto, tasas, ahorro, crédito e inversión'],
  bcraVariables: ['https://www.bcra.gob.ar/principales-variables/', 'series oficiales del BCRA', 'la consulta de tasas, inflación y otras variables que cambian con el tiempo'],
  cnv: ['https://www.argentina.gob.ar/cnv/proteccion-al-inversor', 'portal de Protección al Inversor de la CNV', 'los principios de información, diversificación y evaluación de riesgo'],
  anses: ['https://www.anses.gob.ar/jubilaciones-y-pensiones', 'información oficial de jubilaciones y pensiones de ANSES', 'los requisitos y trámites previsionales generales'],
  arca: ['https://www.arca.gob.ar/monotributo/', 'portal oficial de Monotributo de ARCA', 'las obligaciones fiscales básicas de quienes facturan por cuenta propia'],
  migration: ['https://www.argentina.gob.ar/node/488501', 'requisitos de viaje de la Dirección Nacional de Migraciones', 'la documentación general para salir de la Argentina'],
  pregnancy: ['https://www.argentina.gob.ar/salud/1000dias/corresponsabilidad-en-la-crianza-y-los-cuidados/cuidado-integral-durante-el-embarazo', 'guía de cuidado integral durante el embarazo del Ministerio de Salud', 'los controles y cuidados generales durante el embarazo'],
  physical: ['https://www.who.int/publications/i/item/9789240015128', 'directrices de actividad física de la OMS', 'las recomendaciones generales de frecuencia, intensidad y duración de actividad'],
  diet: ['https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 'ficha de alimentación saludable de la OMS', 'los criterios generales de energía, variedad y calidad de la alimentación'],
  sleep: ['https://www.cdc.gov/sleep/about/index.html', 'orientación sobre sueño de los CDC', 'los criterios generales de duración y hábitos de sueño'],
  health: ['https://www.argentina.gob.ar/salud', 'portal oficial del Ministerio de Salud', 'la orientación sanitaria general y la necesidad de consulta profesional'],
  pets: ['https://wsava.org/global-guidelines/global-nutrition-guidelines/', 'guías globales de nutrición de WSAVA', 'los criterios generales de cuidado, peso y alimentación de perros y gatos'],
  college: ['https://openstax.org/books/college-success/pages/preface', 'manual College Success de OpenStax', 'la planificación de tiempo, estudio y bienestar durante la vida universitaria'],
  garden: ['https://www.argentina.gob.ar/inta/servicio-de-atencion-ciudadana/huertas', 'materiales de huerta familiar del INTA', 'los criterios generales para planificar una huerta familiar'],
  civilCode: ['https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion', 'Código Civil y Comercial actualizado', 'el marco civil general aplicable a familia, vivienda y obligaciones'],
  holidays: ['https://www.argentina.gob.ar/sites/default/files/ley_27399_publicada_18-10_0.pdf', 'Ley 27.399 de feriados nacionales', 'las fechas nacionales que intervienen al contar plazos'],
  electrical: ['https://www.argentina.gob.ar/enre/uso-eficiente-y-seguro', 'recomendaciones del ENRE para el uso seguro y eficiente de la electricidad', 'las pautas generales de seguridad y consumo eléctrico domiciliario'],
};

const groups = {
  openstaxMath: ['algebra-y-aritmetica-tarea-resuelta-2026', 'geometria-figuras-y-cuerpos-paso-a-paso-2026'],
  openstaxCalculus: ['analisis-matematico-primer-parcial-2026'],
  openstaxStats: ['estadistica-y-probabilidad-sin-vueltas-2026', 'futbol-con-numeros-guia-2026'],
  openstaxPhysics: ['fisica-aplicada-sin-trauma-2026', 'numeros-de-fotografia-y-video-2026'],
  openstaxChemistry: ['quimica-y-cielo-para-estudiantes-2026', 'ciencia-en-la-cocina-2026'],
  nist: ['convertir-unidades-sin-errores-2026', 'medir-bien-en-la-cocina-2026', 'terminaciones-y-muebles-calculos-2026'],
  food: ['asado-para-muchos-sin-que-falte-2026', 'finde-asado-22-julio-2026', 'finde-reposteria-13-agosto-2026', 'organizar-una-fiesta-grande-2026'],
  energy: ['bajar-facturas-luz-gas-eficiencia-2026', 'mantenimiento-hogar-cuentas-mensuales-2026'],
  thermal: ['alquilar-comprar-construir-cuentas-vivienda-2026', 'calcular-materiales-obra-gruesa-2026'],
  garden: ['armar-huerta-jardin-desde-cero-2026'],
  labor: ['derechos-recibo-de-sueldo-2026', 'imprevistos-laborales-plan-b-2026', 'cuanto-queda-del-sueldo-impuestos-ahorro-2026'],
  dismissal: ['te-echaron-o-renunciaste-guia-numeros-2026'],
  bcraEducation: ['comprar-auto-usado-guia-decisiones-2026', 'cuanto-cuesta-mantener-un-auto-2026', 'cuentas-de-todos-los-dias-guia-rapida-2026', 'ordenar-la-plata-del-mes-2026', 'salir-de-deudas-plan-completo-2026', 'plata-para-mudarse-alquilar-o-comprar-2026', 'poner-precio-negocio-servicios-2026', 'tablero-control-pyme-caja-marketing-2026', 'gaming-hobbies-en-numeros-2026'],
  bcraVariables: ['inflacion-julio-2026-cuanto-perdiste'],
  cnv: ['empezar-a-invertir-cuentas-basicas-2026', 'medir-riesgo-antes-de-invertir-2026'],
  anses: ['planificar-jubilacion-anses-2026'],
  arca: ['impuestos-del-que-factura-guia-2026', 'impuestos-personales-patrimonio-compras-2026', 'vivir-de-crear-contenido-numeros-2026'],
  migration: ['finde-escapada-auto-27-julio-2026', 'millas-escalas-y-horarios-de-vuelo-2026', 'planificar-viaje-al-exterior-checklist-2026'],
  pregnancy: ['esperando-un-bebe-cuentas-clave-2026'],
  physical: ['entrenar-para-una-carrera-con-numeros-2026', 'ganar-musculo-con-numeros-2026'],
  diet: ['cuantas-calorias-comer-y-como-repartirlas-2026'],
  sleep: ['dormir-mejor-y-habitos-saludables-2026'],
  health: ['controles-de-salud-numeros-familia-2026'],
  college: ['sobrevivir-la-facultad-con-numeros-2026'],
  pets: ['antes-de-adoptar-mascota-cuentas-2026', 'cuidar-bien-perro-gato-numeros-2026'],
  civilCode: ['numeros-legales-de-la-familia-2026'],
  holidays: ['contar-dias-plazos-feriados-2026'],
  electrical: ['cuentas-de-tu-setup-tech-2026', 'electricidad-hogar-conectado-2026'],
};

const special = {
  'idiomas-y-lectura-cuentas-reales-2026': ['https://cvc.cervantes.es/ensenanza/biblioteca_ele/marco/', 'Marco común europeo publicado por el Instituto Cervantes', 'las escalas usadas para ordenar objetivos y progreso en idiomas'],
};

const slugToSource = new Map();
for (const [key, slugs] of Object.entries(groups)) {
  for (const slug of slugs) slugToSource.set(slug, sources[key]);
}
for (const [slug, source] of Object.entries(special)) slugToSource.set(slug, source);

let changed = 0;
const missingFiles = [];
for (const [slug, [url, label, scope]] of slugToSource) {
  const file = path.join(BLOG_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) {
    missingFiles.push(slug);
    continue;
  }
  const post = JSON.parse(fs.readFileSync(file, 'utf8'));
  const section = `<h2 id="fuente-y-alcance">Fuente y alcance</h2><p>Para revisar ${scope} de esta guía sobre ${post.title.toLowerCase()}, consultá <a href="${url}" rel="noopener noreferrer">${label}</a>. La referencia respalda ese criterio general; precios, fechas, requisitos y circunstancias particulares deben verificarse al momento de hacer la cuenta.</p>`;
  const currentSection = /<h2 id="fuente-y-alcance">Fuente y alcance<\/h2><p>.*?<\/p>$/;
  if (currentSection.test(post.content)) {
    if (post.content.endsWith(section)) continue;
    post.content = post.content.replace(currentSection, section);
  } else if (/href=["']https?:\/\//i.test(post.content)) {
    continue;
  } else {
    post.content += section;
  }
  post.updatedDate = '2026-08-16';
  fs.writeFileSync(file, `${JSON.stringify(post, null, 2)}\n`);
  changed += 1;
}

console.log(JSON.stringify({ mapped: slugToSource.size, changed, missingFiles }, null, 2));
if (missingFiles.length) process.exitCode = 1;
