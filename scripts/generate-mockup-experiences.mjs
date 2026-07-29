import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const sourceDir = '/Users/marrod/Documents/Codex/2026-07-27/aga';
const targetDir = '/Users/marrod/hacecuentas/src/components/generated';
const entries = [
  ['consumo-auto-mockup.html', 'ConsumoAutoExperience', 'consumo-auto'],
  ['mantenimiento-auto-mockup.html', 'MantenimientoAutoExperience', 'mantenimiento-auto'],
  ['patente-auto-mockup.html', 'PatenteAutoExperience', 'patente-auto'],
  ['quimica-soluciones-mockup.html', 'QuimicaSolucionesExperience', 'quimica-soluciones'],
  ['chile-home-mockup.html', 'ChileHomeExperience', 'chile-home'],
  ['cuentas-casa-chile-mockup.html', 'CuentasCasaChileExperience', 'cuentas-casa-chile'],
  ['impuestos-negocio-colombia-mockup.html', 'ImpuestosNegocioColombiaExperience', 'impuestos-negocio-colombia'],
  ['horas-extras-colombia-mockup.html', 'HorasExtrasColombiaExperience', 'horas-extras-colombia'],
  ['sueldo-neto-colombia-mockup.html', 'SueldoNetoColombiaExperience', 'sueldo-neto-colombia'],
  ['hormigon-mockup.html', 'HormigonExperience', 'hormigon'],
  ['madera-mockup.html', 'MaderaExperience', 'madera'],
  ['dominicana-home-mockup.html', 'DominicanaHomeExperience', 'dominicana-home'],
  ['master-oficial-titulo-propio-mockup.html', 'MasterOficialTituloPropioExperience', 'master-oficial-titulo-propio'],
  ['monotributo-mockup.html', 'MonotributoExperience', 'monotributo'],
  ['presion-gases-mockup.html', 'PresionGasesExperience', 'presion-gases'],
  ['costo-empleado-mockup.html', 'CostoEmpleadoExperience', 'costo-empleado'],
  ['pintura-mockup.html', 'PinturaExperience', 'pintura'],
  ['pisos-mockup.html', 'PisosExperience', 'pisos'],
  ['cuanto-falta-recibirme-mockup.html', 'CuantoFaltaRecibirmeExperience', 'cuanto-falta-recibirme'],
  ['comida-evento-mockup.html', 'ComidaEventoExperience', 'comida-evento'],
  ['dolar-mockup.html', 'DolarExperience', 'dolar'],
  ['riesgo-cartera-mockup.html', 'RiesgoCarteraExperience', 'riesgo-cartera'],
  ['calorias-alimentos-mockup.html', 'CaloriasAlimentosExperience', 'calorias-alimentos'],
  ['instalacion-electrica-mockup.html', 'InstalacionElectricaExperience', 'instalacion-electrica'],
  ['aeropuerto-mockup.html', 'AeropuertoExperience', 'aeropuerto'],
  ['entrar-alquiler-mockup.html', 'EntrarAlquilerExperience', 'entrar-alquiler'],
  ['costo-anual-auto-mockup.html', 'CostoAnualAutoExperience', 'costo-anual-auto'],
  ['tramites-auto-mockup.html', 'TramitesAutoExperience', 'tramites-auto'],
  ['ladrillos-mockup.html', 'LadrillosExperience', 'ladrillos'],
  ['longitud-mockup.html', 'LongitudExperience', 'longitud'],
  ['gastos-del-mes-mockup.html', 'GastosDelMesExperience', 'gastos-del-mes'],
  ['edad-perro-mockup.html', 'EdadPerroExperience', 'edad-perro'],
  ['baterias-mockup.html', 'BateriasExperience', 'baterias'],
  ['equipaje-mockup.html', 'EquipajeExperience', 'equipaje'],
  ['hora-mundial-mockup.html', 'HoraMundialExperience', 'hora-mundial'],
  ['negocio-dgii-dominicana-mockup.html', 'NegocioDgiiDominicanaExperience', 'negocio-dgii-dominicana'],
  ['promedio-estudio-mockup.html', 'PromedioEstudioExperience', 'promedio-estudio'],
  ['asignaciones-anses-mockup.html', 'AsignacionesAnsesExperience', 'asignaciones-anses'],
  ['estadisticas-futbol-mockup.html', 'EstadisticasFutbolExperience', 'estadisticas-futbol'],
  ['mundial-2026-mockup.html', 'Mundial2026Experience', 'mundial-2026'],
  ['climatizacion-mockup.html', 'ClimatizacionExperience', 'climatizacion'],
  ['gas-agua-mockup.html', 'GasAguaExperience', 'gas-agua'],
  ['bienes-personales-mockup.html', 'BienesPersonalesExperience', 'bienes-personales'],
  ['acuario-mockup.html', 'AcuarioExperience', 'acuario'],
  ['gestacion-mascotas-mockup.html', 'GestacionMascotasExperience', 'gestacion-mascotas'],
  ['comisiones-plataforma-mockup.html', 'ComisionesPlataformaExperience', 'comisiones-plataforma'],
  ['paraguay-home-mockup.html', 'ParaguayHomeExperience', 'paraguay-home'],
  ['sueldo-neto-paraguay-mockup.html', 'SueldoNetoParaguayExperience', 'sueldo-neto-paraguay'],
  ['calorias-quemadas-mockup.html', 'CaloriasQuemadasExperience', 'calorias-quemadas'],
  ['ajustes-camara-mockup.html', 'AjustesCamaraExperience', 'ajustes-camara'],
  ['fotografia-mockup.html', 'FotografiaExperience', 'fotografia'],
  ['gaming-mockup.html', 'GamingExperience', 'gaming'],
  ['aguinaldo-mockup.html', 'AguinaldoExperience', 'aguinaldo'],
  ['sueldo-bruto-neto-mockup.html', 'SueldoBrutoNetoExperience', 'sueldo-bruto-neto'],
  ['sueldo-vs-inflacion-mockup.html', 'SueldoVsInflacionExperience', 'sueldo-vs-inflacion'],
  ['millas-mockup.html', 'MillasExperience', 'millas'],
  ['venezuela-home-mockup.html', 'VenezuelaHomeExperience', 'venezuela-home'],
  ['salario-diario-integrado-mexico-mockup.html', 'SalarioDiarioIntegradoMexicoExperience', 'salario-diario-integrado-mexico'],
  ['salario-minimo-portugal-hora-mockup.html', 'SalarioMinimoPortugalHoraExperience', 'salario-minimo-portugal-hora'],
  ['salir-de-deudas-mockup.html', 'SalirDeDeudasExperience', 'salir-de-deudas'],
  ['sueldo-neto-mexico-mockup.html', 'SueldoNetoMexicoExperience', 'sueldo-neto-mexico'],
  ['liquidacion-dominicana-mockup.html', 'LiquidacionDominicanaExperience', 'liquidacion-dominicana'],
  ['porcentajes-mockup.html', 'PorcentajesExperience', 'porcentajes'],
  ['talles-mockup.html', 'TallesExperience', 'talles'],
  ['sueldo-neto-dominicana-mockup.html', 'SueldoNetoDominicanaExperience', 'sueldo-neto-dominicana'],
  ['costo-empleado-mexico-mockup.html', 'CostoEmpleadoMexicoExperience', 'costo-empleado-mexico'],
  ['temperatura-horno-mockup.html', 'TemperaturaHornoExperience', 'temperatura-horno'],
  ['renta-personas-colombia-mockup.html', 'RentaPersonasColombiaExperience', 'renta-personas-colombia'],
  ['interes-compuesto-mockup.html', 'InteresCompuestoExperience', 'interes-compuesto'],
  ['habitos-salud-mockup.html', 'HabitosSaludExperience', 'habitos-salud'],
  ['seguro-desempleo-mockup.html', 'SeguroDesempleoExperience', 'seguro-desempleo'],
  ['liquidacion-laboral-colombia-mockup.html', 'LiquidacionLaboralColombiaExperience', 'liquidacion-laboral-colombia'],
  ['bebidas-evento-mockup.html', 'BebidasEventoExperience', 'bebidas-evento'],
  ['factura-luz-mockup.html', 'FacturaLuzExperience', 'factura-luz'],
  ['salud-home-mockup.html', 'SaludHomeExperience', 'salud-home'],
  ['numeros-a-letras-mockup.html', 'NumerosLetrasExperience', 'numeros-a-letras'],
  ['ingresos-plataforma-mockup.html', 'IngresosPlataformaExperience', 'ingresos-plataforma'],
  ['prestamo-mockup.html', 'PrestamoExperience', 'prestamo'],
  ['brasil-home-mockup.html', 'BrasilHomeExperience', 'brasil-home'],
  ['empleada-domestica-mockup.html', 'EmpleadaDomesticaExperience', 'empleada-domestica'],
  ['auto-o-uber-mockup.html', 'AutoUberExperience', 'auto-o-uber'],
  ['retencion-fuente-colombia-mockup.html', 'RetencionFuenteColombiaExperience', 'retencion-fuente-colombia'],
  ['costo-contratar-colombia-mockup.html', 'CostoContratarColombiaExperience', 'costo-contratar-colombia'],
  ['recibos-servicios-colombia-mockup.html', 'RecibosServiciosColombiaExperience', 'recibos-servicios-colombia'],
  ['comprar-vivienda-dominicana-mockup.html', 'ComprarViviendaDominicanaExperience', 'comprar-vivienda-dominicana'],
  ['impuestos-inmueble-ecuador-mockup.html', 'ImpuestosInmuebleEcuadorExperience', 'impuestos-inmueble-ecuador'],
  ['empanadas-guarniciones-mockup.html', 'EmpanadasGuarnicionesExperience', 'empanadas-guarniciones'],
  ['cedears-mockup.html', 'CedearsExperience', 'cedears'],
  ['edad-gato-mockup.html', 'EdadGatoExperience', 'edad-gato'],
  ['probabilidad-mockup.html', 'ProbabilidadExperience', 'probabilidad'],
  ['metricas-marketing-mockup.html', 'MetricasMarketingExperience', 'metricas-marketing'],
  ['sueldo-recargos-venezuela-mockup.html', 'SueldoRecargosVenezuelaExperience', 'sueldo-recargos-venezuela'],
  ['calendario-anses-agosto-2026-mockup.html', 'CalendarioAnsesAgostoExperience', 'calendario-anses-agosto'],
  ['dias-entre-dos-fechas-mockup.html', 'DiasEntreFechasExperience', 'dias-entre-fechas'],
  ['tabla-renta-colombia-2026-mockup.html', 'TablaRentaColombiaExperience', 'tabla-renta-colombia'],
  ['pregnancy-week-calculator-mockup.html', 'PregnancyWeekExperience', 'pregnancy-week'],
  ['honorarios-abogado-mockup.html', 'HonorariosAbogadoExperience', 'honorarios-abogado'],
  ['impuesto-renta-colombia-persona-natural-2026-mockup.html', 'ImpuestoRentaColombiaExperience', 'impuesto-renta-colombia'],
  ['validar-nit-colombia-mockup.html', 'ValidarNitColombiaExperience', 'validar-nit-colombia'],
  ['licencia-conducir-mexico-estado-mockup.html', 'LicenciaConducirMexicoExperience', 'licencia-conducir-mexico'],
];

const prefixCss = (css, scope) => {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map((selector) => {
      const cleaned = selector.trim();
      if (cleaned === 'body' || cleaned === 'html' || cleaned === ':root') return scope;
      if (cleaned.startsWith('body ')) return `${scope} ${cleaned.slice(5)}`;
      if (cleaned.startsWith('html ')) return `${scope} ${cleaned.slice(5)}`;
      return `${scope} ${cleaned}`;
    });
  });
  return root.toString();
};

const escapeTemplate = (value) => value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

fs.mkdirSync(targetDir, { recursive: true });

for (const [file, component, slug] of entries) {
  const html = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const replacements = [...html.matchAll(/document\.querySelector\("main"\)\.innerHTML=`([\s\S]*?)`;/g)];
  const markup = replacements.length
    ? replacements.at(-1)[1]
    : (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '');

  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .filter((script) => {
      if (!replacements.length) return true;
      return script.includes(replacements.at(-1)[0]) || html.indexOf(script) > replacements.at(-1).index;
    })
    .map((script) => script.replace(/document\.querySelector\("main"\)\.innerHTML=`[\s\S]*?`;/, ''))
    .filter((script) => script.trim())
    .map((script) => script
      .replaceAll('document.querySelectorAll(', 'root.querySelectorAll(')
      .replaceAll('document.querySelector(', 'root.querySelector(')
      .replaceAll('document.getElementById(', 'root.querySelector("#"+')
    );

  const scope = `.mockup-${slug}`;
  const scopedCss = prefixCss(styles, scope);
  const runtime = `<script is:inline>\n(()=>{const root=document.currentScript.previousElementSibling?.matches('${scope}')?document.currentScript.previousElementSibling:document.querySelector('${scope}');\n${scripts.join('\n')}\n})();\n</script>`;
  const output = `---\ninterface Props { data?: any }\nconst { data } = Astro.props;\n---\n<div class="mockup-${slug}" set:html={\`${escapeTemplate(markup)}\`} />\n${runtime}\n<style is:global>\n${scopedCss}\n${scope} { width:100%; overflow:hidden; }\n${scope} .top, ${scope} header.top { display:none !important; }\n${scope} .foot { display:none !important; }\n${scope} .support-real { width:min(1160px,calc(100% - 40px)); margin:auto; padding:64px 0; }\n${scope} .support-real-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:30px; }\n${scope} .support-real details { border-bottom:1px solid #dfe6ed; padding:14px 0; }\n${scope} .support-real summary { cursor:pointer; font-weight:750; }\n${scope} .support-real p { color:#687a8f; line-height:1.65; }\n@media(max-width:800px){${scope} .support-real-grid{grid-template-columns:1fr}}\n</style>\n{data && <section class="mockup-${slug} support-real"><div class="support-real-grid"><div><h2>Preguntas frecuentes</h2>{data.faq?.map((f:any,i:number)=><details open={i===0}><summary>{f.q}</summary><p set:html={f.a}/></details>)}</div><div><h2>Fuentes</h2>{data.sources?.map((s:any)=><a href={s.url} target="_blank" rel="nofollow noopener">{s.name}</a>)}</div></div></section>}\n`;
  fs.writeFileSync(path.join(targetDir, `${component}.astro`), output);
}

const pages = [
  ['src/pages/auto/consumo.astro', 'ConsumoAutoExperience', '../../components/generated/ConsumoAutoExperience.astro'],
  ['src/pages/auto/mantenimiento.astro', 'MantenimientoAutoExperience', '../../components/generated/MantenimientoAutoExperience.astro'],
  ['src/pages/auto/patente.astro', 'PatenteAutoExperience', '../../components/generated/PatenteAutoExperience.astro'],
  ['src/pages/ciencia/quimica-de-soluciones.astro', 'QuimicaSolucionesExperience', '../../components/generated/QuimicaSolucionesExperience.astro'],
  ['src/pages/cl/hogar/cuentas-de-la-casa.astro', 'CuentasCasaChileExperience', '../../../components/generated/CuentasCasaChileExperience.astro'],
  ['src/pages/co/impuestos/impuestos-de-mi-negocio.astro', 'ImpuestosNegocioColombiaExperience', '../../../components/generated/ImpuestosNegocioColombiaExperience.astro'],
  ['src/pages/co/trabajo/horas-extras-y-recargos.astro', 'HorasExtrasColombiaExperience', '../../../components/generated/HorasExtrasColombiaExperience.astro'],
  ['src/pages/co/trabajo/sueldo-neto.astro', 'SueldoNetoColombiaExperience', '../../../components/generated/SueldoNetoColombiaExperience.astro'],
  ['src/pages/construccion/hormigon.astro', 'HormigonExperience', '../../components/generated/HormigonExperience.astro'],
  ['src/pages/construccion/madera.astro', 'MaderaExperience', '../../components/generated/MaderaExperience.astro'],
  ['src/pages/es/educacion/cuanto-cuesta-estudiar.astro', 'MasterOficialTituloPropioExperience', '../../../components/generated/MasterOficialTituloPropioExperience.astro'],
  ['src/pages/impuestos/monotributo.astro', 'MonotributoExperience', '../../components/generated/MonotributoExperience.astro'],
  ['src/pages/ciencia/presion-y-gases.astro', 'PresionGasesExperience', '../../components/generated/PresionGasesExperience.astro'],
  ['src/pages/trabajo/costo-de-un-empleado.astro', 'CostoEmpleadoExperience', '../../components/generated/CostoEmpleadoExperience.astro'],
  ['src/pages/construccion/pintura.astro', 'PinturaExperience', '../../components/generated/PinturaExperience.astro'],
  ['src/pages/construccion/pisos.astro', 'PisosExperience', '../../components/generated/PisosExperience.astro'],
  ['src/pages/estudio/cuanto-falta-para-recibirme.astro', 'CuantoFaltaRecibirmeExperience', '../../components/generated/CuantoFaltaRecibirmeExperience.astro'],
  ['src/pages/eventos/comida.astro', 'ComidaEventoExperience', '../../components/generated/ComidaEventoExperience.astro'],
  ['src/pages/finanzas-personales/dolar.astro', 'DolarExperience', '../../components/generated/DolarExperience.astro'],
  ['src/pages/inversiones/riesgo-de-mi-cartera.astro', 'RiesgoCarteraExperience', '../../components/generated/RiesgoCarteraExperience.astro'],
  ['src/pages/salud/calorias-de-los-alimentos.astro', 'CaloriasAlimentosExperience', '../../components/generated/CaloriasAlimentosExperience.astro'],
  ['src/pages/tecnologia/instalacion-electrica.astro', 'InstalacionElectricaExperience', '../../components/generated/InstalacionElectricaExperience.astro'],
  ['src/pages/viajes/aeropuerto.astro', 'AeropuertoExperience', '../../components/generated/AeropuertoExperience.astro'],
  ['src/pages/alquiler/entrar-a-un-alquiler.astro', 'EntrarAlquilerExperience', '../../components/generated/EntrarAlquilerExperience.astro'],
  ['src/pages/auto/costo-anual.astro', 'CostoAnualAutoExperience', '../../components/generated/CostoAnualAutoExperience.astro'],
  ['src/pages/auto/tramites.astro', 'TramitesAutoExperience', '../../components/generated/TramitesAutoExperience.astro'],
  ['src/pages/construccion/ladrillos.astro', 'LadrillosExperience', '../../components/generated/LadrillosExperience.astro'],
  ['src/pages/conversores/longitud.astro', 'LongitudExperience', '../../components/generated/LongitudExperience.astro'],
  ['src/pages/finanzas-personales/gastos-del-mes.astro', 'GastosDelMesExperience', '../../components/generated/GastosDelMesExperience.astro'],
  ['src/pages/mascotas/edad-del-perro.astro', 'EdadPerroExperience', '../../components/generated/EdadPerroExperience.astro'],
  ['src/pages/tecnologia/baterias.astro', 'BateriasExperience', '../../components/generated/BateriasExperience.astro'],
  ['src/pages/viajes/equipaje.astro', 'EquipajeExperience', '../../components/generated/EquipajeExperience.astro'],
  ['src/pages/viajes/hora-mundial.astro', 'HoraMundialExperience', '../../components/generated/HoraMundialExperience.astro'],
  ['src/pages/do/impuestos/negocio-dgii.astro', 'NegocioDgiiDominicanaExperience', '../../../components/generated/NegocioDgiiDominicanaExperience.astro'],
  ['src/pages/estudio/promedio.astro', 'PromedioEstudioExperience', '../../components/generated/PromedioEstudioExperience.astro'],
  ['src/pages/familia/asignaciones-anses.astro', 'AsignacionesAnsesExperience', '../../components/generated/AsignacionesAnsesExperience.astro'],
  ['src/pages/futbol/estadisticas.astro', 'EstadisticasFutbolExperience', '../../components/generated/EstadisticasFutbolExperience.astro'],
  ['src/pages/futbol/mundial-2026.astro', 'Mundial2026Experience', '../../components/generated/Mundial2026Experience.astro'],
  ['src/pages/hogar/climatizacion.astro', 'ClimatizacionExperience', '../../components/generated/ClimatizacionExperience.astro'],
  ['src/pages/hogar/gas-y-agua.astro', 'GasAguaExperience', '../../components/generated/GasAguaExperience.astro'],
  ['src/pages/impuestos/bienes-personales.astro', 'BienesPersonalesExperience', '../../components/generated/BienesPersonalesExperience.astro'],
  ['src/pages/mascotas/acuario.astro', 'AcuarioExperience', '../../components/generated/AcuarioExperience.astro'],
  ['src/pages/mascotas/gestacion.astro', 'GestacionMascotasExperience', '../../components/generated/GestacionMascotasExperience.astro'],
  ['src/pages/negocios/comisiones-de-plataforma.astro', 'ComisionesPlataformaExperience', '../../components/generated/ComisionesPlataformaExperience.astro'],
  ['src/pages/py/trabajo/sueldo-neto.astro', 'SueldoNetoParaguayExperience', '../../../components/generated/SueldoNetoParaguayExperience.astro'],
  ['src/pages/salud/calorias-quemadas.astro', 'CaloriasQuemadasExperience', '../../components/generated/CaloriasQuemadasExperience.astro'],
  ['src/pages/tecnologia/ajustes-de-camara.astro', 'AjustesCamaraExperience', '../../components/generated/AjustesCamaraExperience.astro'],
  ['src/pages/tecnologia/fotografia.astro', 'FotografiaExperience', '../../components/generated/FotografiaExperience.astro'],
  ['src/pages/tecnologia/gaming.astro', 'GamingExperience', '../../components/generated/GamingExperience.astro'],
  ['src/pages/trabajo/aguinaldo.astro', 'AguinaldoExperience', '../../components/generated/AguinaldoExperience.astro'],
  ['src/pages/trabajo/sueldo-bruto-y-neto.astro', 'SueldoBrutoNetoExperience', '../../components/generated/SueldoBrutoNetoExperience.astro'],
  ['src/pages/trabajo/sueldo-vs-inflacion.astro', 'SueldoVsInflacionExperience', '../../components/generated/SueldoVsInflacionExperience.astro'],
  ['src/pages/viajes/millas.astro', 'MillasExperience', '../../components/generated/MillasExperience.astro'],
  ['src/pages/finanzas-personales/salir-de-deudas.astro', 'SalirDeDeudasExperience', '../../components/generated/SalirDeDeudasExperience.astro'],
  ['src/pages/mx/trabajo/sueldo-neto.astro', 'SueldoNetoMexicoExperience', '../../../components/generated/SueldoNetoMexicoExperience.astro'],
  ['src/pages/do/trabajo/liquidacion.astro', 'LiquidacionDominicanaExperience', '../../../components/generated/LiquidacionDominicanaExperience.astro'],
  ['src/pages/matematica/porcentajes.astro', 'PorcentajesExperience', '../../components/generated/PorcentajesExperience.astro'],
  ['src/pages/conversores/talles.astro', 'TallesExperience', '../../components/generated/TallesExperience.astro'],
  ['src/pages/do/trabajo/sueldo-neto.astro', 'SueldoNetoDominicanaExperience', '../../../components/generated/SueldoNetoDominicanaExperience.astro'],
  ['src/pages/mx/trabajo/costo-de-un-empleado.astro', 'CostoEmpleadoMexicoExperience', '../../../components/generated/CostoEmpleadoMexicoExperience.astro'],
  ['src/pages/cocina/temperatura-del-horno.astro', 'TemperaturaHornoExperience', '../../components/generated/TemperaturaHornoExperience.astro'],
  ['src/pages/co/impuestos/renta-personas.astro', 'RentaPersonasColombiaExperience', '../../../components/generated/RentaPersonasColombiaExperience.astro'],
  ['src/pages/inversiones/interes-compuesto.astro', 'InteresCompuestoExperience', '../../components/generated/InteresCompuestoExperience.astro'],
  ['src/pages/salud/habitos.astro', 'HabitosSaludExperience', '../../components/generated/HabitosSaludExperience.astro'],
  ['src/pages/trabajo/seguro-de-desempleo.astro', 'SeguroDesempleoExperience', '../../components/generated/SeguroDesempleoExperience.astro'],
  ['src/pages/co/trabajo/liquidacion-laboral.astro', 'LiquidacionLaboralColombiaExperience', '../../../components/generated/LiquidacionLaboralColombiaExperience.astro'],
  ['src/pages/eventos/bebidas.astro', 'BebidasEventoExperience', '../../components/generated/BebidasEventoExperience.astro'],
  ['src/pages/hogar/factura-de-luz.astro', 'FacturaLuzExperience', '../../components/generated/FacturaLuzExperience.astro'],
  ['src/pages/conversores/numeros-a-letras.astro', 'NumerosLetrasExperience', '../../components/generated/NumerosLetrasExperience.astro'],
  ['src/pages/negocios/ingresos-por-plataforma.astro', 'IngresosPlataformaExperience', '../../components/generated/IngresosPlataformaExperience.astro'],
  ['src/pages/finanzas-personales/prestamo.astro', 'PrestamoExperience', '../../components/generated/PrestamoExperience.astro'],
  ['src/pages/trabajo/empleada-domestica.astro', 'EmpleadaDomesticaExperience', '../../components/generated/EmpleadaDomesticaExperience.astro'],
  ['src/pages/auto/auto-o-uber.astro', 'AutoUberExperience', '../../components/generated/AutoUberExperience.astro'],
  ['src/pages/co/impuestos/retencion-en-la-fuente.astro', 'RetencionFuenteColombiaExperience', '../../../components/generated/RetencionFuenteColombiaExperience.astro'],
  ['src/pages/co/trabajo/costo-de-contratar.astro', 'CostoContratarColombiaExperience', '../../../components/generated/CostoContratarColombiaExperience.astro'],
  ['src/pages/co/vida/recibos-de-servicios.astro', 'RecibosServiciosColombiaExperience', '../../../components/generated/RecibosServiciosColombiaExperience.astro'],
  ['src/pages/do/impuestos/comprar-vivienda.astro', 'ComprarViviendaDominicanaExperience', '../../../components/generated/ComprarViviendaDominicanaExperience.astro'],
  ['src/pages/ec/impuestos/impuestos-del-inmueble.astro', 'ImpuestosInmuebleEcuadorExperience', '../../../components/generated/ImpuestosInmuebleEcuadorExperience.astro'],
  ['src/pages/eventos/empanadas-y-guarniciones.astro', 'EmpanadasGuarnicionesExperience', '../../components/generated/EmpanadasGuarnicionesExperience.astro'],
  ['src/pages/inversiones/cedears.astro', 'CedearsExperience', '../../components/generated/CedearsExperience.astro'],
  ['src/pages/mascotas/edad-del-gato.astro', 'EdadGatoExperience', '../../components/generated/EdadGatoExperience.astro'],
  ['src/pages/matematica/probabilidad.astro', 'ProbabilidadExperience', '../../components/generated/ProbabilidadExperience.astro'],
  ['src/pages/negocios/metricas-de-marketing.astro', 'MetricasMarketingExperience', '../../components/generated/MetricasMarketingExperience.astro'],
  ['src/pages/ve/trabajo/sueldo-y-recargos.astro', 'SueldoRecargosVenezuelaExperience', '../../../components/generated/SueldoRecargosVenezuelaExperience.astro'],
];

for (const [page, component, importPath] of pages) {
  const fullPath = path.join('/Users/marrod/hacecuentas', page);
  let source = fs.readFileSync(fullPath, 'utf8');
  source = source.replace(/import DecisionHub from ['"][^'"]+['"];/, `import ${component} from '${importPath}';`);
  source = source.replace(/<DecisionHub\s+data=\{([^}]+)\}\s*\/>/, `<${component} data={$1} />`);
  fs.writeFileSync(fullPath, source);
}

const countryHomes = [
  ['src/pages/py/index.astro', 'PillarHub', 'ParaguayHomeExperience', '../../components/generated/ParaguayHomeExperience.astro'],
  ['src/pages/ve/index.astro', 'PillarHub', 'VenezuelaHomeExperience', '../../components/generated/VenezuelaHomeExperience.astro'],
  ['src/pages/pt/index.astro', 'PillarHub', 'BrasilHomeExperience', '../../components/generated/BrasilHomeExperience.astro'],
  ['src/pages/salud/index.astro', 'SiloIndex', 'SaludHomeExperience', '../../components/generated/SaludHomeExperience.astro'],
];

for (const [page, previous, component, importPath] of countryHomes) {
  const fullPath = path.join('/Users/marrod/hacecuentas', page);
  let source = fs.readFileSync(fullPath, 'utf8');
  source = source.replace(
    new RegExp(`import ${previous} from ['"][^'"]+['"];`),
    `import ${component} from '${importPath}';`,
  );
  source = source.replace(new RegExp(`<${previous}[^>]*/>`), `<${component} />`);
  fs.writeFileSync(fullPath, source);
}

const standalonePages = [
  ['src/pages/calendario-pagos-anses-agosto-2026.astro', 'CalendarioAnsesAgostoExperience', 'Calendario de pagos ANSES agosto 2026', 'Consultá todas las fechas de cobro de ANSES de agosto de 2026.', 'AR', 'es', 'Calendario'],
  ['src/pages/co/validar-nit.astro', 'ValidarNitColombiaExperience', 'Validador de NIT Colombia', 'Validá un NIT colombiano y su dígito de verificación.', 'CO', 'es', 'Trámites'],
  ['src/pages/dias-entre-dos-fechas.astro', 'DiasEntreFechasExperience', 'Calculadora de días entre dos fechas', 'Calculá días corridos, semanas y días hábiles entre dos fechas.', 'AR', 'es', 'Fechas'],
  ['src/pages/co/calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026.astro', 'TablaRentaColombiaExperience', 'Tabla de impuesto de renta Colombia 2026', 'Calculá el impuesto de renta de personas naturales en Colombia para 2026.', 'CO', 'es', 'Impuestos'],
  ['src/pages/en/pregnancy-week-calculator.astro', 'PregnancyWeekExperience', 'Pregnancy week calculator', 'Calculate your current pregnancy week, trimester and estimated due date.', 'EN', 'en', 'Health'],
  ['src/pages/calculadora-honorarios-abogado.astro', 'HonorariosAbogadoExperience', 'Calculadora de honorarios de abogado', 'Estimá honorarios legales según el tipo y monto del asunto.', 'AR', 'es', 'Servicios'],
  ['src/pages/calculadora-impuesto-renta-colombia-persona-natural-2026.astro', 'ImpuestoRentaColombiaExperience', 'Impuesto de renta Colombia persona natural 2026', 'Estimá el impuesto de renta para una persona natural en Colombia.', 'CO', 'es', 'Impuestos'],
  ['src/pages/mx/calculadora-costo-licencia-conducir-mexico-por-estado.astro', 'LicenciaConducirMexicoExperience', 'Costo de licencia de conducir en México por estado', 'Compará el costo y vigencia de la licencia de conducir por estado.', 'MX', 'es', 'Trámites'],
];

for (const [page, component, title, description, audience, lang, section] of standalonePages) {
  const fullPath = path.join('/Users/marrod/hacecuentas', page);
  const pageDir = path.dirname(fullPath);
  const rel = (target) => {
    let value = path.relative(pageDir, path.join('/Users/marrod/hacecuentas', target)).replaceAll(path.sep, '/');
    return value.startsWith('.') ? value : `./${value}`;
  };
  const route = '/' + page.replace(/^src\/pages\//, '').replace(/\/index\.astro$/, '').replace(/\.astro$/, '');
  const canonical = `https://hacecuentas.com${route}`;
  const output = `---\nexport const prerender = true;\nimport Layout from '${rel('src/layouts/Layout.astro')}';\nimport Header from '${rel('src/components/Header.astro')}';\nimport Footer from '${rel('src/components/Footer.astro')}';\nimport ${component} from '${rel(`src/components/generated/${component}.astro`)}';\nconst canonical = '${canonical}';\nconst schema = {'@context':'https://schema.org','@type':'WebApplication',name:'${title.replaceAll("'", "\\'")}',url:canonical,applicationCategory:'FinanceApplication',operatingSystem:'Web'};\n---\n<Layout title="${title}" description="${description}" canonical={canonical} schema={schema} audience="${audience}" lang="${lang}" ogType="article" articleSection="${section}">\n  <Header />\n  <${component} />\n  <Footer />\n</Layout>\n`;
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, output);
}
