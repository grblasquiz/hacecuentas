"""Batch Prop200 P1 — 100 calcs (Fase 1 Finanzas AR + Cripto + Fase 2 Salud + Fitness)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _helper import spec

SPECS = []

def T(fn, body):
    return f"""export interface Inputs {{ [k: string]: number | string; }}
export interface Outputs {{ [k: string]: string | number; }}
export function {fn}(i: Inputs): Outputs {{
{body}
}}
"""

def tc(s):
    p = s.split('-'); return p[0] + ''.join(x[:1].upper() + x[1:] for x in p[1:])

def M(slug, cat, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, cat, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))

# ============================================================
# FINANZAS AR 2026 (30)
# ============================================================

M("ganancias-4ta-categoria-2026", "finanzas", "📊", "Ganancias 4ta categoría 2026",
  "Impuesto a las ganancias para empleados en relación de dependencia (escala 2026).",
  "escala progresiva 5-35%",
  [("sueldoBruto","Sueldo bruto mensual","number",1500000),("cargasFamiliares","Cargas de familia","number",0)],
  [("impuestoMensual","Impuesto mensual",None),("alicuotaEfectiva","Alícuota efectiva",None),("sueldoNeto","Sueldo neto estimado",None)],
  ["Bruto $1.500.000","Impuesto ~$95.000"],"Alícuota efectiva 6.3%",
  [("¿Quién paga?","Empleados cuyo sueldo bruto supera el mínimo no imponible (MNI 2026 ~$1.800.000 anual deducible)."),
   ("¿Deducciones?","MNI general, cargas de familia (cónyuge, hijos), obra social, gastos médicos, intereses hipoteca hasta el tope."),
   ("¿Escala?","5 tramos progresivos 5%, 9%, 12%, 15%, 19%, 23%, 27%, 31% y 35% según tramo."),
   ("¿Aguinaldo tributa?","Sí, proporcionalmente en junio y diciembre."),
   ("¿Retención mensual?","Se adelanta cada mes y en marzo del año siguiente se hace liquidación final."),
   ("¿Autónomos?","Aplica distinto. Esta calc es solo para dependencia."),
   ("¿Cambia con paritarias?","Sí, los tramos y MNI suelen actualizarse por RIPTE.")],
  """  const b=Number(i.sueldoBruto)||0; const cf=Number(i.cargasFamiliares)||0;
  const aportes=b*0.17; const neto=b-aportes;
  const ingresoAnual=neto*13; const mni=1800000; const cargaFam=cf*900000;
  const baseImponible=Math.max(0, ingresoAnual-mni-cargaFam);
  let imp=0;
  const tramos=[[1000000,0.05],[2000000,0.09],[3000000,0.12],[5000000,0.15],[8000000,0.19],[12000000,0.23],[20000000,0.27],[40000000,0.31],[Infinity,0.35]];
  let restante=baseImponible; let ant=0;
  for (const [tope,tasa] of tramos){ const seg=Math.min(restante, (tope as number)-ant); if (seg<=0) break; imp+=seg*(tasa as number); restante-=seg; ant=tope as number; if(restante<=0) break; }
  const impMensual=Math.round(imp/13);
  const alicEf=ingresoAnual>0?(imp/ingresoAnual*100).toFixed(2):'0';
  return { impuestoMensual:`$${impMensual.toLocaleString('es-AR')}`, alicuotaEfectiva:`${alicEf}%`, sueldoNeto:`$${Math.round(neto-impMensual).toLocaleString('es-AR')}` };""")

M("bonos-globales-al30-gd30-rendimiento", "finanzas", "📈", "Bonos AL30 y GD30",
  "Rendimiento anual estimado de bonos Bonares (AL30) y Globales (GD30).",
  "TIR bono",
  [("precioCompra","Precio de compra USD","number",62),("cuponAnual","Cupón anual USD","number",1.5),("anosRestantes","Años restantes","number",5)],
  [("tirAproximada","TIR aproximada",None),("ingresoCuponAnual","Ingreso por cupones/año",None),("interpretacion","Interpretación",None)],
  ["Precio 62, cupón 1.5, 5 años","TIR ~16%"],"Rendimiento bruto",
  [("¿AL30 vs GD30?","AL30 es Bonar (ley argentina), GD30 es Global (ley Nueva York). GD suele cotizar más caro por menor riesgo legal."),
   ("¿TIR?","Tasa interna de retorno: qué % rinde bruto si lo mantenés hasta vencimiento."),
   ("¿Paridad?","Precio / valor nominal al vencimiento (100). Paridad 62% = se compra a 62%."),
   ("¿Riesgo?","Soberano argentino. Puede haber default o reestructuración."),
   ("¿Cupón?","Step-up: va subiendo. AL30 paga 0.75%, 1.75%, 4.25%, 5% según año."),
   ("¿Amortiza?","Sí, el capital se paga en cuotas semestrales desde 2027."),
   ("¿Dónde comprar?","Broker o banco con cuenta comitente (IOL, PPI, Cocos, Balanz).")],
  """  const p=Number(i.precioCompra)||0; const c=Number(i.cuponAnual)||0; const n=Number(i.anosRestantes)||1;
  const tir=p>0?(((100/p)**(1/n)-1)*100+c/p*100):0;
  return { tirAproximada:`${tir.toFixed(1)}%`, ingresoCuponAnual:`USD ${c.toFixed(2)}`, interpretacion:`Si mantenés ${n} años y no hay default, rinde ~${tir.toFixed(1)}% anual en USD.` };""")

M("ripte-actualizacion-jubilatoria-sueldo", "finanzas", "📉", "RIPTE actualización jubilatoria",
  "Actualización de sueldos/jubilaciones por RIPTE (Remuneración Imponible Promedio).",
  "valor × (RIPTE actual / RIPTE histórico)",
  [("sueldoViejo","Sueldo histórico $","number",100000),("ripteViejo","RIPTE mes histórico","number",100000),("ripteActual","RIPTE mes actual","number",500000)],
  [("sueldoActualizado","Sueldo actualizado",None),("factorMultiplicador","Factor multiplicador",None),("interpretacion","Interpretación",None)],
  ["$100k, RIPTE 100k→500k","$500k"],"Factor 5x",
  [("¿RIPTE?","Remuneración Imponible Promedio de Trabajadores Estables. Publicado por ANSES."),
   ("¿Para qué?","Actualiza haberes jubilatorios, sueldos históricos, indemnizaciones."),
   ("¿Publicación?","Mensual en boletín oficial con 2 meses de rezago."),
   ("¿Vs CER?","RIPTE mide salarios, CER mide inflación. Suelen ser similares en períodos estables."),
   ("¿Reemplaza inflación?","No exactamente, pero se acerca en contextos salariales."),
   ("¿Jurisprudencia?","Fallos Elliff y Badaro establecieron uso de RIPTE para movilidad previsional."),
   ("¿Si mi empleador no usa RIPTE?","Es opcional para empleadores pero obligatorio para ANSES.")],
  """  const s=Number(i.sueldoViejo)||0; const rv=Number(i.ripteViejo)||1; const ra=Number(i.ripteActual)||0;
  const factor=ra/rv; const act=s*factor;
  return { sueldoActualizado:`$${Math.round(act).toLocaleString('es-AR')}`, factorMultiplicador:`${factor.toFixed(2)}x`, interpretacion:`Multiplicá el sueldo histórico por ${factor.toFixed(2)} para tenerlo a valor actual.` };""")

M("cedear-dividend-yield-2026", "finanzas", "💵", "CEDEAR dividend yield",
  "Dividend yield de CEDEARs con dividendos en USD.",
  "dividendo/precio × 100",
  [("precioCedear","Precio CEDEAR $","number",5000),("ratioConversion","Ratio conversión","number",10),("dividendoAnualUsd","Dividendo anual USD","number",0.5),("cotizacionDolar","Cotización dólar CCL","number",1200)],
  [("dividendYield","Dividend yield anual",None),("ingresoEn100","Ingreso con 100 CEDEARs/año",None),("interpretacion","Interpretación",None)],
  ["Precio $5000, ratio 10, div 0.5","DY ~12%"],"Ingreso $6.000/año con 100 CEDEARs",
  [("¿CEDEAR?","Certificado de Depósito Argentino: representa fracción de acción del exterior."),
   ("¿Ratio?","Cuántos CEDEARs equivalen a 1 acción real. AAPL ratio 10: 10 CEDEARs = 1 Apple."),
   ("¿Dividendos?","Se pagan en USD y luego se pesifican a tipo MEP habitualmente."),
   ("¿Impuestos?","15% cedular sobre dividendos en USD (personas humanas)."),
   ("¿Retención?","Puede haber retención en origen (30% EEUU si no hay W8-BEN)."),
   ("¿Reinvertir?","Útil para compound growth. Muchos brokers lo hacen automático."),
   ("¿Yield vs stock growth?","El yield mide dividendos, no apreciación del precio.")],
  """  const p=Number(i.precioCedear)||0; const r=Number(i.ratioConversion)||1;
  const d=Number(i.dividendoAnualUsd)||0; const c=Number(i.cotizacionDolar)||1;
  const divPorCedear=d/r*c; const dy=p>0?(divPorCedear/p*100):0; const ing100=divPorCedear*100;
  return { dividendYield:`${dy.toFixed(2)}%`, ingresoEn100:`$${Math.round(ing100).toLocaleString('es-AR')}`, interpretacion:`Rinde ~${dy.toFixed(1)}% anual en dividendos. Con 100 CEDEARs: $${Math.round(ing100).toLocaleString('es-AR')}/año.` };""")

M("dolar-soja-exportador-diferencia", "finanzas", "🌾", "Dólar soja/exportador",
  "Beneficio del esquema de dólar diferencial para exportadores agropecuarios.",
  "valor USD × (tipo exportador - oficial)",
  [("usdExportado","USD a liquidar","number",100000),("dolarOficial","Dólar oficial","number",1000),("dolarExportador","Dólar exportador (blend)","number",1100)],
  [("pesosOficial","Pesos a oficial",None),("pesosExportador","Pesos a exportador",None),("diferencial","Beneficio adicional",None)],
  ["USD 100k, oficial 1000, blend 1100","$10M extra"],"Diferencia 10%",
  [("¿Blend dólar?","Esquema que mezcla % oficial + % CCL para exportadores."),
   ("¿Quién cobra?","Agroexportadores según normativa específica vigente."),
   ("¿Temporario?","Sí, se activa/desactiva según política económica."),
   ("¿Impacto fiscal?","Aumenta oferta de dólares al BCRA."),
   ("¿Retenciones?","Además, productor paga retenciones (soja ~33%)."),
   ("¿Mejora competitividad?","Sí, acerca el tipo de cambio efectivo al real."),
   ("¿Para otros sectores?","Se ha implementado también para economías regionales.")],
  """  const u=Number(i.usdExportado)||0; const dof=Number(i.dolarOficial)||0; const dex=Number(i.dolarExportador)||0;
  const pof=u*dof; const pex=u*dex; const dif=pex-pof;
  return { pesosOficial:`$${Math.round(pof).toLocaleString('es-AR')}`, pesosExportador:`$${Math.round(pex).toLocaleString('es-AR')}`, diferencial:`+$${Math.round(dif).toLocaleString('es-AR')} (${((dex/dof-1)*100).toFixed(1)}%)` };""")

M("leliq-lebac-rendimiento-bcra", "finanzas", "🏦", "LELIQ y pases BCRA",
  "Rendimiento estimado de LELIQ y pases pasivos BCRA.",
  "capital × TNA × días/365",
  [("capital","Capital $","number",1000000),("tnaPorcentaje","TNA %","number",40),("dias","Días","number",28)],
  [("rendimiento","Rendimiento $",None),("monto","Monto final",None),("tea","TEA equivalente",None)],
  ["$1M al 40% TNA 28d","$30k gana"],"TEA ~48%",
  [("¿LELIQ?","Letras de liquidez del BCRA. Instrumento para regular liquidez bancaria."),
   ("¿Pases?","Operación similar, a menor plazo (1 día)."),
   ("¿Yo puedo invertir?","No directamente. Bancos invierten ahí y pagan parte al plazo fijo."),
   ("¿Afecta plazo fijo?","Sí, la tasa LELIQ es el piso indirecto del rendimiento en plazos fijos."),
   ("¿Publicación?","Diaria, en sitio BCRA comunicados."),
   ("¿TEA?","Tasa efectiva anual: capitalizando la TNA, siempre mayor."),
   ("¿Reformulación 2024?","Se reemplazaron LELIQ por pases + NOCOM según contexto.")],
  """  const c=Number(i.capital)||0; const t=Number(i.tnaPorcentaje)||0; const d=Number(i.dias)||0;
  const r=c*t/100*d/365; const m=c+r; const tea=((1+t/100*d/365)**(365/d)-1)*100;
  return { rendimiento:`$${Math.round(r).toLocaleString('es-AR')}`, monto:`$${Math.round(m).toLocaleString('es-AR')}`, tea:`${tea.toFixed(2)}%` };""")

M("salario-minimo-2026-comparativa", "finanzas", "💰", "Salario mínimo vital y móvil 2026",
  "Compará tu sueldo contra el salario mínimo vigente.",
  "sueldo / smvm",
  [("tuSueldo","Tu sueldo neto","number",800000),("smvm","SMVM vigente","number",300000)],
  [("multiplo","Cuántos SMVM ganás",None),("diferencia","Diferencia","currency"),("percentil","Comparado con mínimo",None)],
  ["Sueldo $800k, SMVM $300k","2.67x"],"+167% más",
  [("¿Qué es el SMVM?","Salario Mínimo Vital y Móvil, fijado por Consejo del Salario."),
   ("¿Actualiza cuánto?","Cambia varias veces al año según paritaria del Consejo."),
   ("¿Usos?","Referencia para indemnizaciones, beneficios sociales, límites legales."),
   ("¿Hora mínima?","Derivada del SMVM / jornada mensual (180-200 horas)."),
   ("¿Monotributistas?","No aplica directamente (es para empleados en relación de dependencia)."),
   ("¿Tope indemnización?","El tope Vizzoti se calcula vs SMVM × 3 × convenio."),
   ("¿Fuente?","Ministerio de Capital Humano / Consejo del Salario Mínimo.")],
  """  const s=Number(i.tuSueldo)||0; const smvm=Number(i.smvm)||1;
  const m=s/smvm; const d=s-smvm; const pct=smvm>0?((s/smvm-1)*100):0;
  return { multiplo:`${m.toFixed(2)}x`, diferencia:Math.round(d), percentil:d>=0?`+${pct.toFixed(0)}% sobre el mínimo`:`${pct.toFixed(0)}% bajo el mínimo` };""")

M("asignacion-familiar-hijo-anses-tramo", "finanzas", "👶", "Asignación familiar por hijo ANSES",
  "Monto de asignación familiar por hijo según tramo de ingreso.",
  "tabla tramo-monto ANSES",
  [("ingresoGrupoFamiliar","Ingreso grupo familiar $","number",800000),("cantidadHijos","Cantidad de hijos","number",2),("hijoDiscapacitado","Hijos con discapacidad","number",0)],
  [("asignacionPorHijo","Asignación por hijo",None),("totalMensual","Total mensual",None),("tramo","Tramo",None)],
  ["$800k ingreso, 2 hijos","~$35k por hijo"],"Total ~$70k/mes",
  [("¿Quién cobra?","Empleados y jubilados con ingresos debajo de topes."),
   ("¿Tramos?","Ingreso grupo familiar ≤ tope A (mayor monto), B (menor), C (mínimo), D (no cobra)."),
   ("¿Hijo discapacitado?","Asignación especial sin tope de ingresos."),
   ("¿Edad?","Hasta 18 años (o sin límite si discapacidad)."),
   ("¿AUH?","Para quienes no están en relación de dependencia formal."),
   ("¿Tarjeta Alimentar?","Adicional por hijo ≤14 años, según beneficiario."),
   ("¿Cuándo se cobra?","Mensual junto al sueldo o haber jubilatorio.")],
  """  const ig=Number(i.ingresoGrupoFamiliar)||0; const h=Number(i.cantidadHijos)||0; const hd=Number(i.hijoDiscapacitado)||0;
  let porHijo=0, tramo='';
  if (ig<1000000){ porHijo=55000; tramo='A (mayor asignación)'; }
  else if (ig<1500000){ porHijo=37000; tramo='B'; }
  else if (ig<2000000){ porHijo=22000; tramo='C'; }
  else { porHijo=0; tramo='D (sin derecho a asignación general)'; }
  const porDisc=120000;
  const total=h*porHijo+hd*porDisc;
  return { asignacionPorHijo:`$${porHijo.toLocaleString('es-AR')}`, totalMensual:`$${total.toLocaleString('es-AR')}`, tramo:tramo };""")

M("reintegro-iva-compras-tarjeta-debito", "finanzas", "💳", "Reintegro IVA tarjeta débito",
  "Reintegro del IVA en compras con tarjeta de débito (consumidor final).",
  "consumo × 21% × porcentaje reintegro",
  [("compraBruta","Compra total con IVA $","number",100000),("porcentajeReintegro","Porcentaje reintegro %","number",10)],
  [("reintegro","Reintegro estimado",None),("netoFinal","Neto efectivo pagado",None),("interpretacion","Interpretación",None)],
  ["Compra $100k, reintegro 10%","$1.735"],"Pagaste efectivo $98.265",
  [("¿Cómo funciona?","Algunos bancos devuelven % del IVA en compras con débito."),
   ("¿Tope mensual?","Sí, depende del banco (suele ser $5k-$30k/mes)."),
   ("¿Qué compras?","Supermercados, farmacias, combustibles típicamente."),
   ("¿Acumula Cuenta DNI?","Sí, programas provinciales (PBA, CABA) se suman al reintegro del banco."),
   ("¿Impuestos sobre el reintegro?","No en general, pero verificar si supera umbral."),
   ("¿Cuándo acreditan?","Al cierre del resumen mensual."),
   ("¿Vale la pena?","Sí, sobre todo para gastos recurrentes.")],
  """  const cb=Number(i.compraBruta)||0; const pr=Number(i.porcentajeReintegro)||0;
  const ivaContenido=cb-(cb/1.21); const reint=ivaContenido*(pr/100); const neto=cb-reint;
  return { reintegro:`$${Math.round(reint).toLocaleString('es-AR')}`, netoFinal:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`Reintegro estimado ${pr}% del IVA contenido. Ahorrás ${(reint/cb*100).toFixed(1)}% del total.` };""")

M("cft-prestamo-personal-comparativa", "finanzas", "🏛️", "CFT préstamo personal",
  "CFT: costo financiero total de un préstamo (TNA + IVA + comisiones).",
  "TNA × 1.21 + comisiones + seguros",
  [("montoPrestamo","Monto préstamo","number",1000000),("tnaPorcentaje","TNA %","number",120),("plazoMeses","Plazo meses","number",12),("comisionesYSeguros","Comisiones + seguros/mes $","number",5000)],
  [("cft","CFT estimado",None),("cuotaMensual","Cuota mensual",None),("totalPagado","Total pagado",None)],
  ["$1M, TNA 120%, 12m, comi $5k","CFT 180%"],"Cuota ~$160k",
  [("¿CFT vs TNA?","TNA es solo la tasa. CFT agrega IVA sobre intereses (21%), comisiones, seguros."),
   ("¿Obligatorio?","Sí, BCRA obliga a informar CFT por Ley 25.065 y comunicaciones."),
   ("¿Es mejor CFT bajo?","Sí siempre, es lo que realmente pagás."),
   ("¿Cambio IVA?","IVA 21% sobre intereses. Si sos responsable inscripto, deducible."),
   ("¿Seguros obligatorios?","Vida (suele ser obligatorio) y desempleo (opcional)."),
   ("¿Precancelación?","Normalmente sí con comisión. Verifica cláusulas."),
   ("¿Subsidios tasa?","Algunos créditos ANSES/bancos oficiales tienen tasa bonificada.")],
  """  const m=Number(i.montoPrestamo)||0; const t=Number(i.tnaPorcentaje)||0; const n=Number(i.plazoMeses)||1; const com=Number(i.comisionesYSeguros)||0;
  const iMen=t/100/12; const cuotaBase=m*iMen*((1+iMen)**n)/((1+iMen)**n-1);
  const cuota=cuotaBase+com; const total=cuota*n;
  const cft=((total/m)**(12/n)-1)*100;
  return { cft:`${cft.toFixed(0)}% aprox`, cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, totalPagado:`$${Math.round(total).toLocaleString('es-AR')}` };""")

M("uva-hipoteca-vs-inflacion-riesgo", "finanzas", "🏠", "Hipoteca UVA vs inflación",
  "Evolución de cuota UVA vs inflación proyectada.",
  "cuota × (UVA final / UVA inicial)",
  [("cuotaInicial","Cuota inicial $","number",300000),("inflacionAnual","Inflación proyectada anual %","number",30),("anos","Años a proyectar","number",5)],
  [("cuotaFinal","Cuota final proyectada",None),("multiplicador","Multiplicador cuota",None),("interpretacion","Interpretación",None)],
  ["$300k, 30% infl, 5 años","$1.114k"],"Cuota se multiplica 3.7x",
  [("¿Cuotas UVA?","Ajustan por CER (inflación). En inflación alta, suben mucho."),
   ("¿Mi sueldo también sube?","Si tu sueldo ajusta por paritaria similar, el peso cuota/sueldo se mantiene."),
   ("¿Cláusula de gatillo?","Algunas UVA tienen cláusula que suspende el ajuste si CER supera mucho a paritarias."),
   ("¿Vs tasa fija?","Tasa fija es más alta en mes 1 pero no se ajusta. UVA arranca más baja pero sube."),
   ("¿Cuándo conviene UVA?","Si esperás desinflación y/o sueldo indexado a inflación."),
   ("¿Refinanciación?","Posible, pero con costos de escrituración."),
   ("¿Dónde?","Nación, Ciudad, Hipotecario, ICBC, Santander retomaron créditos 2024.")],
  """  const c=Number(i.cuotaInicial)||0; const inf=Number(i.inflacionAnual)||0; const a=Number(i.anos)||0;
  const mult=(1+inf/100)**a; const cf=c*mult;
  return { cuotaFinal:`$${Math.round(cf).toLocaleString('es-AR')}`, multiplicador:`${mult.toFixed(2)}x`, interpretacion:`Con ${inf}% inflación anual durante ${a} años, tu cuota UVA se multiplica por ${mult.toFixed(1)}.` };""")

M("tasa-politica-monetaria-tpm-rendimiento", "finanzas", "📊", "Tasa política monetaria BCRA",
  "Rendimiento estimado con la tasa de política monetaria BCRA.",
  "capital × TPM × plazo/365",
  [("capital","Capital $","number",1000000),("tpmPorcentaje","TPM %","number",60),("dias","Días","number",30)],
  [("rendimiento","Rendimiento",None),("tea","TEA equivalente",None),("interpretacion","Interpretación",None)],
  ["$1M, TPM 60%, 30d","$49k gana"],"TEA ~81%",
  [("¿TPM?","Tasa de referencia del BCRA. Define el costo del dinero en la economía."),
   ("¿Cambios?","Reunión mensual del directorio. Comunicado oficial."),
   ("¿Afecta plazo fijo?","Sí, las tasas de plazo fijo suelen estar 2-5 puntos bajo la TPM."),
   ("¿Antes LELIQ?","La TPM reemplazó informalmente el rol de la LELIQ."),
   ("¿Influye el dólar?","Sí. TPM baja → pesos bajan valor → dólar sube."),
   ("¿Cómo invertir?","Vía fondos money market, plazo fijo, o caución."),
   ("¿Histórico?","BCRA publica serie histórica diaria.")],
  """  const c=Number(i.capital)||0; const t=Number(i.tpmPorcentaje)||0; const d=Number(i.dias)||0;
  const r=c*t/100*d/365; const tea=((1+t/100*d/365)**(365/d)-1)*100;
  return { rendimiento:`$${Math.round(r).toLocaleString('es-AR')}`, tea:`${tea.toFixed(2)}%`, interpretacion:`A TPM ${t}% durante ${d} días: ganás $${Math.round(r).toLocaleString('es-AR')} (TEA ${tea.toFixed(0)}%).` };""")

M("impuesto-pais-percepcion-dolar-tarjeta", "finanzas", "🧾", "Impuesto PAIS + percepción",
  "Cuánto pagás por impuesto PAIS + percepciones sobre consumos en USD.",
  "usd × (1 + PAIS + percepcion)",
  [("consumoUsd","Consumo USD","number",500),("impuestoPais","Impuesto PAIS %","number",30),("percepcionGanancias","Percepción Ganancias %","number",45),("cotizacionOficial","Dólar oficial","number",1000)],
  [("costoTotalPesos","Costo total en pesos",None),("dolarEfectivo","Tu dólar efectivo",None),("brecha","Brecha vs oficial",None)],
  ["USD 500, 30%+45%, $1000","$875.000"],"Dólar efectivo $1750",
  [("¿Impuesto PAIS?","Ley 27.541. Grava compra de USD y consumos con tarjeta en moneda extranjera."),
   ("¿Percepción Ganancias?","45% sobre dólar oficial (salvo exceptuados), cuenta a cuenta de Ganancias/Bienes Personales."),
   ("¿Recupero la percepción?","Sí, al presentar DDJJ de Ganancias/Bienes Personales al año siguiente."),
   ("¿Monotributistas?","También recupera vía régimen simplificado."),
   ("¿Excepciones?","Servicios de salud, educación, Netflix/Spotify según normativa vigente."),
   ("¿Cambia seguido?","Sí, PAIS ha variado entre 7.5%, 17.5%, 30%, 17.5%."),
   ("¿Compra de USD billete?","También aplica al cambio oficial (cuando está permitido).")],
  """  const u=Number(i.consumoUsd)||0; const pais=Number(i.impuestoPais)||0; const per=Number(i.percepcionGanancias)||0; const cot=Number(i.cotizacionOficial)||0;
  const subtotal=u*cot; const total=subtotal*(1+pais/100+per/100);
  const def_=total/u; const brecha=cot>0?((def_/cot-1)*100):0;
  return { costoTotalPesos:`$${Math.round(total).toLocaleString('es-AR')}`, dolarEfectivo:`$${Math.round(def_).toLocaleString('es-AR')}`, brecha:`+${brecha.toFixed(0)}% sobre oficial` };""")

M("bienes-personales-minimo-no-imponible-2026", "finanzas", "💼", "Bienes personales 2026",
  "Impuesto a los bienes personales según patrimonio 2026.",
  "(patrimonio - MNI) × alícuota",
  [("patrimonio","Patrimonio total $","number",500000000),("mni","Mínimo no imponible $","number",350000000),("aliVivienda","Patrimonio en vivienda","number",0)],
  [("impuesto","Impuesto anual",None),("alicuota","Alícuota efectiva",None),("interpretacion","Interpretación",None)],
  ["Patrim $500M, MNI $350M","Impuesto ~$1.5M"],"Alícuota efectiva 0.3%",
  [("¿MNI?","Mínimo no imponible. No se paga por debajo de ese monto."),
   ("¿Vivienda única?","Exenta hasta tope adicional."),
   ("¿Alícuota progresiva?","Sí, escala 0.5%, 0.75%, 1%, 1.25% según excedente sobre MNI."),
   ("¿Bienes exterior?","Diferente alícuota (mayor) salvo repatriación."),
   ("¿Cuentas bancarias?","Sí entran, al valor al 31/12."),
   ("¿Cripto?","Sí, al valor al 31/12 según exchange de referencia."),
   ("¿Plazo pago?","Junio-agosto según terminación CUIT."),
   ("¿Anticipos?","5 anticipos durante el año siguiente.")],
  """  const p=Number(i.patrimonio)||0; const m=Number(i.mni)||0; const v=Number(i.aliVivienda)||0;
  const baseImponible=Math.max(0, p-m-v);
  let imp=0; let ant=0;
  const tramos=[[250000000,0.005],[500000000,0.0075],[1000000000,0.01],[2000000000,0.0125],[Infinity,0.0175]];
  let r=baseImponible;
  for (const [tope,tasa] of tramos){ const seg=Math.min(r,(tope as number)-ant); if(seg<=0) break; imp+=seg*(tasa as number); r-=seg; ant=tope as number; if(r<=0) break; }
  const alic=p>0?(imp/p*100):0;
  return { impuesto:`$${Math.round(imp).toLocaleString('es-AR')}`, alicuota:`${alic.toFixed(2)}%`, interpretacion:`Con patrimonio $${(p/1e6).toFixed(0)}M y MNI $${(m/1e6).toFixed(0)}M: impuesto anual ~$${(imp/1e6).toFixed(2)}M.` };""")

M("autonomos-categorias-2026-aportes", "finanzas", "👔", "Autónomos AFIP categorías 2026",
  "Aporte mensual de autónomos según categoría AFIP/ARCA.",
  "tabla categorías",
  [("categoria","Categoría","select",["I","II","III","IV","V","I'","II'","III'","IV'","V'"])],
  [("aporteMensual","Aporte mensual",None),("descripcion","Descripción",None)],
  ["Categoría III","$~280k"],"Profesional intermedio",
  [("¿Quién paga autónomos?","Profesionales independientes, socios SRL/SA, directores de SA."),
   ("¿Categoría?","Depende de ingresos anuales y profesión."),
   ("¿Incluye obra social?","No. Obra social es aporte separado (monotributistas sí incluyen)."),
   ("¿Monotributo vs Autónomo?","Monotributo es más simple y barato si facturás poco. Autónomo para ingresos altos."),
   ("¿Cuándo paga?","Mensual, el 3 del mes siguiente."),
   ("¿Aumenta?","Sí, se ajusta semestralmente por movilidad."),
   ("¿Aporta a jubilación?","Sí, 27% de la renta de referencia.")],
  """  const c=String(i.categoria||'III');
  const tab:Record<string,number>={'I':180000,'II':230000,'III':280000,'IV':340000,'V':400000,'I\\'':220000,'II\\'':280000,'III\\'':340000,'IV\\'':410000,'V\\'':480000};
  const a=tab[c]||280000;
  return { aporteMensual:`$${a.toLocaleString('es-AR')}`, descripcion:`Categoría ${c}: aporte estimado ${a.toLocaleString('es-AR')}/mes.` };""")

M("haber-minimo-jubilatorio-2026-bono-total", "finanzas", "👴", "Haber mínimo jubilatorio + bono",
  "Haber mínimo de ANSES + bono complementario si corresponde.",
  "mínimo + bono según escala",
  [("haberBase","Haber base mensual","number",300000),("tieneBono","Recibe bono","select",["si","no"])],
  [("total","Total cobrado",None),("bono","Bono aplicado",None),("interpretacion","Interpretación",None)],
  ["Mínimo $300k + bono","$370k"],"Con bono",
  [("¿Mínimo 2026?","Según movilidad IPC mensual, ronda valores actualizados."),
   ("¿Bono complementario?","Monto fijo que se suma si haber está por debajo de umbral."),
   ("¿Aumenta?","Sí, vía movilidad por IPC mensual desde 2024."),
   ("¿Cobra todos?","El bono es para quienes cobran cerca del mínimo."),
   ("¿Aguinaldo?","Sí, medio haber en junio y diciembre."),
   ("¿PUAM?","Pensión Universal: 80% de jubilación mínima para 65+ sin aportes."),
   ("¿Cobertura médica?","PAMI automático para jubilados.")],
  """  const h=Number(i.haberBase)||0; const tb=String(i.tieneBono||'no');
  const bono=tb==='si'?70000:0; const t=h+bono;
  return { total:`$${t.toLocaleString('es-AR')}`, bono:bono>0?`+$${bono.toLocaleString('es-AR')}`:'No aplica', interpretacion:tb==='si'?`Haber base $${h.toLocaleString('es-AR')} + bono $${bono.toLocaleString('es-AR')} = $${t.toLocaleString('es-AR')}.`:`Haber sin bono: $${t.toLocaleString('es-AR')}.` };""")

M("bonus-anual-marco-fiscal-neto", "finanzas", "🎁", "Bonus anual neto",
  "Bonus anual: cálculo de retención de Ganancias sobre premio.",
  "bonus × (1 - alícuota)",
  [("bonusBruto","Bonus bruto","number",2000000),("alicuotaGanancias","Alícuota Ganancias %","number",27)],
  [("retencion","Retención Ganancias",None),("bonusNeto","Bonus neto",None),("interpretacion","Interpretación",None)],
  ["$2M al 27%","$540k retenido"],"Neto $1.46M",
  [("¿Bonus tributa?","Sí, como renta de 4ta categoría."),
   ("¿Alícuota?","Depende del escalón de ingresos anuales total."),
   ("¿Aportes?","Sí, jubilación (11%), OS (3%), PAMI (3%) sobre el bonus."),
   ("¿Mismo día?","Retención se practica al pagar."),
   ("¿Mejor cobrar junio o diciembre?","Depende de tu proyección anual: si supera el tope, pagás más."),
   ("¿Diferido?","A veces empresas pagan parte en enero siguiente para 'partir' el impacto fiscal."),
   ("¿Ajuste final?","En marzo siguiente se hace liquidación anual ajustando.")],
  """  const b=Number(i.bonusBruto)||0; const a=Number(i.alicuotaGanancias)||0;
  const aportes=b*0.17; const netoAportes=b-aportes; const ret=netoAportes*a/100; const neto=netoAportes-ret;
  return { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, bonusNeto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`Bruto $${b.toLocaleString('es-AR')} - aportes 17% - Ganancias ${a}% = Neto $${Math.round(neto).toLocaleString('es-AR')} (${(neto/b*100).toFixed(0)}% del bruto).` };""")

M("costo-laboral-total-empleador-cargas", "finanzas", "🏢", "Costo laboral total empleador",
  "Cuánto gasta realmente un empleador por cada empleado.",
  "sueldo × (1 + cargas)",
  [("sueldoBruto","Sueldo bruto empleado","number",1000000),("cargasSociales","Cargas sociales empleador %","number",25),("art","ART %","number",5),("seguros","Seguros y varios %","number",3)],
  [("costoTotal","Costo total mensual",None),("costoAnual","Costo anual (13 sueldos)",None),("porcentajeCargas","% cargas sobre bruto",None)],
  ["Bruto $1M + cargas","$1.33M costo total"],"33% más",
  [("¿Cargas sociales?","Aportes patronales: jubilación, obra social, PAMI, ANSES. ~17-25% según régimen."),
   ("¿ART?","Aseguradora de Riesgos del Trabajo. Alícuota según actividad 0.5-12%."),
   ("¿Incluye SAC?","Sí. Por eso se multiplica por 13 para el anual (12 + 1 aguinaldo)."),
   ("¿Vacaciones?","Costo adicional si se toman en el año, pero ya está en costo proporcional."),
   ("¿Indemnización potencial?","No se suma en este cálculo; es un costo contingente."),
   ("¿Sueldo en negro?","No hay cargas, pero riesgo legal altísimo."),
   ("¿Empleado efectivo?","Contratos directos tienen más cargas que monotributistas (que facturan).")],
  """  const s=Number(i.sueldoBruto)||0; const cs=Number(i.cargasSociales)||0; const art=Number(i.art)||0; const seg=Number(i.seguros)||0;
  const total=s*(1+(cs+art+seg)/100); const anual=total*13; const pct=((total/s-1)*100);
  return { costoTotal:`$${Math.round(total).toLocaleString('es-AR')}`, costoAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, porcentajeCargas:`+${pct.toFixed(1)}%` };""")

M("iibb-convenio-multilateral-coeficientes", "finanzas", "🧮", "IIBB Convenio Multilateral",
  "Distribución de ingresos brutos entre jurisdicciones.",
  "coef ingresos × % jurisdicción",
  [("ingresosJurA","Ingresos en jurisdicción A $","number",2000000),("ingresosJurB","Ingresos en jurisdicción B $","number",1000000),("gastosJurA","Gastos en A $","number",1200000),("gastosJurB","Gastos en B $","number",300000)],
  [("coefJurA","Coeficiente Jur A",None),("coefJurB","Coeficiente Jur B",None),("interpretacion","Interpretación",None)],
  ["A:2M/1.2M, B:1M/0.3M","60% / 40%"],"Mayor parte en A",
  [("¿Convenio multilateral?","Régimen cuando una empresa factura en varias provincias."),
   ("¿Coeficiente?","50% ingresos + 50% gastos en esa jurisdicción."),
   ("¿Evitar?","Si facturás solo en una provincia, usás régimen local sin convenio."),
   ("¿Declaración?","Anual el coeficiente, mensual el impuesto por cada jurisdicción."),
   ("¿Alícuotas?","Cada provincia tiene la suya. CABA 2-4%, PBA 3-5%, según actividad."),
   ("¿SIRCREB?","Sistema de retenciones bancarias. Se aplica según provincia."),
   ("¿Monotributo?","Alternativa para no hacer convenio multilateral si facturás poco.")],
  """  const ia=Number(i.ingresosJurA)||0; const ib=Number(i.ingresosJurB)||0;
  const ga=Number(i.gastosJurA)||0; const gb=Number(i.gastosJurB)||0;
  const totI=ia+ib; const totG=ga+gb;
  const cia=totI>0?ia/totI:0.5; const cib=totI>0?ib/totI:0.5;
  const cga=totG>0?ga/totG:0.5; const cgb=totG>0?gb/totG:0.5;
  const coefA=(cia+cga)/2*100; const coefB=(cib+cgb)/2*100;
  return { coefJurA:`${coefA.toFixed(1)}%`, coefJurB:`${coefB.toFixed(1)}%`, interpretacion:`Distribuí la base imponible: ${coefA.toFixed(0)}% a Jur A y ${coefB.toFixed(0)}% a Jur B.` };""")

M("renta-financiera-cedular-personas", "finanzas", "📊", "Renta financiera cedular",
  "Impuesto cedular sobre rentas financieras (15%).",
  "ganancia × 15%",
  [("gananciaRealizada","Ganancia realizada USD","number",1000),("alicuota","Alícuota %","number",15)],
  [("impuesto","Impuesto",None),("gananciaNeta","Ganancia neta",None),("interpretacion","Interpretación",None)],
  ["USD 1000 al 15%","USD 150 impuesto"],"Neto USD 850",
  [("¿Alcanza?","Personas humanas y sucesiones indivisas por dividendos, intereses, ganancias de capital."),
   ("¿Plazo fijo pesos?","Exento si es en pesos (Ley 27.430)."),
   ("¿Dividendos CEDEAR?","Alcanzados por el 15% cedular."),
   ("¿Bonos globales USD?","Cupones gravados al 15%; ganancia de capital en moneda extranjera también."),
   ("¿Cripto?","Alcanzado al 15% sobre ganancia realizada en USD."),
   ("¿Compensar pérdidas?","Se pueden compensar ganancias y pérdidas dentro del mismo cedular."),
   ("¿Declaración?","Anual en DDJJ Ganancias personas humanas.")],
  """  const g=Number(i.gananciaRealizada)||0; const a=Number(i.alicuota)||15;
  const imp=g*a/100; const neto=g-imp;
  return { impuesto:`USD ${imp.toFixed(2)}`, gananciaNeta:`USD ${neto.toFixed(2)}`, interpretacion:`Sobre ganancia USD ${g}: impuesto ${a}% = USD ${imp.toFixed(2)}. Neto USD ${neto.toFixed(2)}.` };""")

M("arba-sellos-inmobiliarios-pba-compraventa", "finanzas", "🏡", "Sellos ARBA PBA",
  "Impuesto de sellos sobre compraventa inmobiliaria en PBA.",
  "valor × 3.6% (comprador+vendedor)",
  [("valorPropiedad","Valor propiedad $","number",80000000),("unicaVivienda","¿Única vivienda?","select",["si","no"])],
  [("sellos","Impuesto sellos total",None),("porParte","Por parte (c/u)",None),("interpretacion","Interpretación",None)],
  ["$80M, no única","$2.88M total"],"Cada parte $1.44M",
  [("¿Alícuota?","3.6% en PBA (1.8% comprador + 1.8% vendedor). CABA también 3.6%."),
   ("¿Única vivienda?","Descuento o exención hasta cierto monto."),
   ("¿Quién paga?","Ambas partes por mitades salvo pacto distinto."),
   ("¿Cuándo?","Al firmar la escritura. El escribano retiene."),
   ("¿Honorarios?","Adicional 2-3% + IVA del escribano, no incluido acá."),
   ("¿Otros costos?","Certificados (~0.5-1%), impuestos transferencia."),
   ("¿Se evita?","No legalmente. Parte del costo de operar propiedades.")],
  """  const v=Number(i.valorPropiedad)||0; const u=String(i.unicaVivienda||'no');
  const aliq=u==='si'&&v<50000000?0.018:0.036;
  const total=v*aliq; const porParte=total/2;
  return { sellos:`$${Math.round(total).toLocaleString('es-AR')}`, porParte:`$${Math.round(porParte).toLocaleString('es-AR')}`, interpretacion:`Sellos ${(aliq*100).toFixed(1)}% = $${Math.round(total).toLocaleString('es-AR')}. Paga mitad cada parte.` };""")

M("retencion-afip-cuit-regimen-general", "finanzas", "🧾", "Retención AFIP CUIT",
  "Retención de Ganancias (régimen general RG 830) sobre facturación.",
  "monto × % según régimen",
  [("importe","Importe bruto $","number",500000),("regimen","Régimen","select",["inscripto_ganancias_2%","no_inscripto_ganancias_28%","profesional_liberal_10%","alquiler_inmueble_6%"])],
  [("retencion","Retención",None),("neto","Neto a cobrar",None),("interpretacion","Interpretación",None)],
  ["$500k, inscripto 2%","$10k retenido"],"Neto $490k",
  [("¿Qué es RG 830?","Régimen de retención de Ganancias por servicios, honorarios, alquileres."),
   ("¿Obligado?","Pagador que supere mínimos mensuales de retención."),
   ("¿Monotributista?","No se le retiene (es monotributo)."),
   ("¿Certificado?","El retenido recibe constancia SIRE. Deduce en DDJJ anual."),
   ("¿Mínimos no retenibles?","Sí, cada régimen tiene piso: el importe debajo del cual no se retiene."),
   ("¿Profesional liberal?","Abogados, contadores, arquitectos, etc: 10%."),
   ("¿Alquiler?","6% sobre lo que supere mínimo.")],
  """  const imp=Number(i.importe)||0; const r=String(i.regimen||'inscripto_ganancias_2%');
  const rates:Record<string,number>={'inscripto_ganancias_2%':0.02,'no_inscripto_ganancias_28%':0.28,'profesional_liberal_10%':0.10,'alquiler_inmueble_6%':0.06};
  const tasa=rates[r]||0.02; const ret=imp*tasa; const neto=imp-ret;
  return { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, neto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`${(tasa*100).toFixed(0)}% sobre $${imp.toLocaleString('es-AR')} = retención $${Math.round(ret).toLocaleString('es-AR')}. Cobrás $${Math.round(neto).toLocaleString('es-AR')}.` };""")

M("caja-seguridad-banco-comparativa-mensual", "finanzas", "🗝️", "Caja seguridad comparativa",
  "Costo anual caja de seguridad por tamaño y banco.",
  "costo mensual × 12",
  [("tamano","Tamaño","select",["chica","mediana","grande","premium"]),("banco","Banco tipo","select",["publico","privado_ar","privado_internacional"])],
  [("costoAnual","Costo anual estimado",None),("costoMensual","Costo mensual",None),("interpretacion","Interpretación",None)],
  ["Mediana, privado AR","$~800k/año"],"~$67k/mes",
  [("¿Vale la pena?","Para USD cash o joyas sí. Costos anuales entre $300k-1.5M según tamaño."),
   ("¿Banco público barato?","Sí, Nación/Provincia tienen tarifas reguladas más bajas."),
   ("¿Incluye seguro?","Limitado. Para alto valor, considerar seguro adicional."),
   ("¿Acceso?","Horario bancario. Algunos bancos 24/7 con cita."),
   ("¿Impositivo?","El contenido no se informa al fisco por lo general, pero hay inventario."),
   ("¿Cambio del monto tras corralito?","Hubo casos judiciales. Lo recomendable: inventario certificado periódico."),
   ("¿Alternativas?","Cajas propias, cofres acorazados privados, trust en el exterior.")],
  """  const t=String(i.tamano||'mediana'); const b=String(i.banco||'privado_ar');
  const base:Record<string,number>={'chica':40000,'mediana':67000,'grande':110000,'premium':180000};
  const mult:Record<string,number>={'publico':0.6,'privado_ar':1,'privado_internacional':1.4};
  const cm=(base[t]||67000)*(mult[b]||1); const ca=cm*12;
  return { costoAnual:`$${Math.round(ca).toLocaleString('es-AR')}`, costoMensual:`$${Math.round(cm).toLocaleString('es-AR')}`, interpretacion:`Caja ${t} en banco ${b}: ~$${Math.round(cm).toLocaleString('es-AR')}/mes.` };""")

M("fondo-desempleo-anses-monto-tiempo", "finanzas", "⏸️", "Fondo desempleo ANSES",
  "Seguro de desempleo: cuánto cobro y por cuánto tiempo.",
  "proporcional al sueldo previo",
  [("sueldoPromedio","Sueldo promedio 6 meses previos $","number",800000),("mesesTrabajados","Meses aportados últimos 3 años","number",24)],
  [("montoMensual","Monto mensual",None),("duracion","Duración cobro",None),("interpretacion","Interpretación",None)],
  ["Sueldo $800k, 24m","$~340k"],"Duración 8 meses",
  [("¿Quién cobra?","Empleados despedidos sin causa. No renuncia voluntaria ni despido con justa causa."),
   ("¿Fórmula?","50% del mejor sueldo últimos 6 meses (con topes)."),
   ("¿Tiempo?","2-12 meses según antigüedad."),
   ("¿Tope?","Mínimo y máximo establecidos por ANSES."),
   ("¿Compatible?","No podés cobrar mientras tengas otro trabajo formal."),
   ("¿Trámite?","Online en mi.ANSES o presencialmente."),
   ("¿Plazo para solicitar?","90 días desde el despido.")],
  """  const s=Number(i.sueldoPromedio)||0; const m=Number(i.mesesTrabajados)||0;
  const monto=Math.min(s*0.5,500000); // tope aprox
  const dur=m<12?2:m<24?4:m<36?8:12;
  return { montoMensual:`$${Math.round(monto).toLocaleString('es-AR')}`, duracion:`${dur} meses`, interpretacion:`Con ${m} meses aportados cobrás $${Math.round(monto).toLocaleString('es-AR')}/mes durante ${dur} meses.` };""")

M("dias-vacaciones-ganadas-antiguedad-lct", "finanzas", "🏖️", "Días de vacaciones LCT",
  "Días de vacaciones según antigüedad (Ley 20.744).",
  "escala LCT art 150",
  [("antiguedadMeses","Antigüedad en meses","number",36)],
  [("dias","Días de vacaciones",None),("interpretacion","Interpretación",None)],
  ["36 meses","21 días"],"Tramo 5-10 años",
  [("¿Ley?","Ley de Contrato de Trabajo (LCT) 20.744, artículos 150-157."),
   ("¿Escala?","≤5 años: 14 días; 5-10: 21 días; 10-20: 28 días; >20: 35 días."),
   ("¿Primer año?","Si no trabajaste 6 meses, cobrás proporcional (1 día por mes trabajado)."),
   ("¿Días hábiles?","Son corridos, incluyen sábados/domingos."),
   ("¿Cuándo tomar?","Período vacacional oct-abril, pero puede pactarse fuera."),
   ("¿Se puede vender?","No. Derecho irrenunciable."),
   ("¿Acumular?","Hasta el 50% del año anterior como máximo.")],
  """  const a=Number(i.antiguedadMeses)||0; const anios=a/12;
  let d=0, t='';
  if(anios<0.5){d=Math.floor(a);t='proporcional primer año'}
  else if(anios<=5){d=14;t='hasta 5 años'}
  else if(anios<=10){d=21;t='5-10 años'}
  else if(anios<=20){d=28;t='10-20 años'}
  else {d=35;t='más de 20 años'}
  return { dias:`${d} días corridos`, interpretacion:`Con ${anios.toFixed(1)} años (${a} meses) de antigüedad: ${d} días (tramo: ${t}).` };""")

M("cuota-alimentos-porcentaje-sueldo-hijo", "finanzas", "👨‍👧", "Cuota alimentaria hijo",
  "Porcentaje típico de cuota alimentaria sobre el sueldo del obligado.",
  "sueldo × % según cantidad hijos",
  [("sueldoProgenitor","Sueldo neto del progenitor $","number",1000000),("cantidadHijos","Cantidad de hijos","number",1)],
  [("cuotaMensual","Cuota mensual estimada",None),("porcentaje","% sobre sueldo",None),("interpretacion","Interpretación",None)],
  ["$1M, 1 hijo","$250k/mes"],"25% del neto",
  [("¿Quién fija la cuota?","Juez de familia, según acuerdo o demanda."),
   ("¿% típico?","1 hijo: 20-25%; 2 hijos: 30-35%; 3+: 40%+."),
   ("¿Qué cubre?","Alimentación, salud, educación, vestimenta, esparcimiento."),
   ("¿Extraordinario?","Cuotas extra por gastos escolares, médicos, vacaciones."),
   ("¿Se actualiza?","Sí, por IPC o salario mínimo según fallo."),
   ("¿Incumplimiento?","Inhibición general, embargo sueldo, denuncia penal."),
   ("¿Menores de 21?","Obligación alimentaria hasta los 21 (o 25 si estudia).")],
  """  const s=Number(i.sueldoProgenitor)||0; const h=Number(i.cantidadHijos)||1;
  const pct=h===1?22:h===2?32:h===3?40:45;
  const cuota=s*pct/100;
  return { cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, porcentaje:`${pct}%`, interpretacion:`Referencia: ${pct}% del sueldo neto para ${h} hijo${h>1?'s':''} = $${Math.round(cuota).toLocaleString('es-AR')}/mes. El juez fija el valor final.` };""")

M("sucesiones-costo-total-argentina-abogado", "finanzas", "⚖️", "Sucesión Argentina costo",
  "Estimación del costo total de una sucesión.",
  "% sobre masa hereditaria",
  [("valorPatrimonio","Valor patrimonio sucesorio $","number",100000000),("complejidad","Complejidad","select",["simple","mediana","compleja"])],
  [("honorarios","Honorarios abogado",None),("tasaJusticia","Tasa justicia",None),("costoTotal","Costo total estimado",None)],
  ["$100M simple","~$4M honorarios"],"Total ~$5M",
  [("¿Quién hace sucesión?","Abogado matriculado obligatorio. Juez declara herederos."),
   ("¿Honorarios?","Escala Colegio Abogados: 5-20% del valor según complejidad."),
   ("¿Tasa justicia?","1-2% del monto sucesorio."),
   ("¿Tiempo?","6-18 meses mínimo. Puede estirarse años."),
   ("¿Sin hacer?","Los bienes no pueden venderse. Herederos no los poseen formalmente."),
   ("¿Cómo ahorrar?","Sucesión extrajudicial (acuerdo entre herederos) si no hay disputa."),
   ("¿Testamento?","Simplifica pero no evita sucesión judicial.")],
  """  const v=Number(i.valorPatrimonio)||0; const c=String(i.complejidad||'simple');
  const pct:Record<string,number>={'simple':0.04,'mediana':0.08,'compleja':0.15};
  const hon=v*(pct[c]||0.04); const tasa=v*0.015; const total=hon+tasa;
  return { honorarios:`$${Math.round(hon).toLocaleString('es-AR')}`, tasaJusticia:`$${Math.round(tasa).toLocaleString('es-AR')}`, costoTotal:`$${Math.round(total).toLocaleString('es-AR')}` };""")

M("valor-presente-bono-cupon-zero-tir", "finanzas", "📐", "Valor presente bono",
  "VP de un bono cupón cero o con cupones.",
  "VP = Σ flujo / (1+r)^t",
  [("valorNominal","Valor nominal (al vencimiento) $","number",1000),("tir","TIR % anual","number",10),("anos","Años al vencimiento","number",5)],
  [("valorPresente","Valor presente",None),("descuento","Descuento aplicado",None),("interpretacion","Interpretación",None)],
  ["VN 1000, TIR 10%, 5a","VP 620"],"38% descuento",
  [("¿VP?","Valor hoy de un flujo futuro, descontado a la TIR."),
   ("¿Cupón zero?","Paga solo al vencimiento. VP = VN / (1+r)^n."),
   ("¿Con cupones?","Suma VP de cada cupón + VP del principal."),
   ("¿Usos?","Análisis de bonos, proyectos de inversión."),
   ("¿Regla del 72?","Mide cuánto tarda en duplicarse: 72 / tasa."),
   ("¿Vs NPV?","VP = NPV considerando el flujo único. Para múltiples flujos usar NPV."),
   ("¿Por qué es menor VN?","Porque recibir plata en el futuro vale menos que tenerla hoy.")],
  """  const vn=Number(i.valorNominal)||0; const tir=Number(i.tir)||0; const a=Number(i.anos)||0;
  const vp=vn/((1+tir/100)**a); const desc=((1-vp/vn)*100);
  return { valorPresente:`$${vp.toFixed(2)}`, descuento:`${desc.toFixed(1)}% del VN`, interpretacion:`Un bono que paga $${vn} en ${a} años al ${tir}% TIR vale hoy $${vp.toFixed(2)}.` };""")

M("duracion-modificada-bono-riesgo-tasa", "finanzas", "📉", "Duration modificada bono",
  "Duration modificada: sensibilidad del bono a cambios de tasa.",
  "DM = Duration / (1+TIR)",
  [("tir","TIR anual %","number",10),("anosVencimiento","Años al vencimiento","number",10),("cupones","Cupones por año","number",2)],
  [("durationMod","Duration modificada",None),("cambioPrecio1Pct","Cambio precio por 1% tasa",None),("interpretacion","Interpretación",None)],
  ["TIR 10%, 10 años","DM ~7.5"],"Si tasa sube 1%: precio baja 7.5%",
  [("¿Duration?","Tiempo promedio ponderado en que recibís los flujos del bono."),
   ("¿Modified duration?","Duration ajustada por la TIR. Mide sensibilidad del precio a cambios de tasa."),
   ("¿Uso práctico?","Si la TIR sube 1pp, el precio baja aprox (Duration Modificada)%."),
   ("¿Cupón zero?","Su DM = vencimiento / (1+TIR)."),
   ("¿Bonos largos?","Mayor DM = mayor volatilidad ante tasa."),
   ("¿Para qué sirve?","Inmunización de portfolios, gestión de riesgo de tasa."),
   ("¿Convexidad?","Complementa DM para movimientos grandes de tasas.")],
  """  const tir=Number(i.tir)||0; const a=Number(i.anosVencimiento)||0;
  const durAprox=a*0.85; // aproximación para bono cupón regular
  const dm=durAprox/(1+tir/100);
  return { durationMod:`${dm.toFixed(2)}`, cambioPrecio1Pct:`${dm.toFixed(2)}%`, interpretacion:`Si la TIR sube 1 punto, el precio del bono cae ~${dm.toFixed(2)}%. A mayor DM, mayor volatilidad.` };""")

M("spread-tasas-arbitraje-bancos-plazo-fijo", "finanzas", "📊", "Spread tasas arbitraje",
  "Oportunidad de arbitraje entre tasas de distintos bancos.",
  "diff entre TNA bancos",
  [("tnaBancoA","TNA Banco A %","number",70),("tnaBancoB","TNA Banco B %","number",85),("monto","Monto $","number",1000000),("dias","Días","number",30)],
  [("spreadAnual","Spread anual",None),("diferencia30Dias","Diferencia 30 días",None),("interpretacion","Interpretación",None)],
  ["A:70% B:85% $1M","+$12.3k 30d"],"Cambiá de banco",
  [("¿Arbitraje?","Aprovechar diferencia de precios/tasas entre mercados o instituciones."),
   ("¿Es legal?","100% legal, solo estás eligiendo mejor rendimiento."),
   ("¿Cuándo no conviene?","Si hay costos de transferencia (CBU, comisión) que superan el spread."),
   ("¿Plazo fijo digital?","Dentro de cada banco, apps facilitan renovación y comparación."),
   ("¿Riesgo contraparte?","En AR está cubierto por seguro BCRA hasta cierto monto."),
   ("¿Tiempo?","Apertura cuenta nueva: 24-48hs online típicamente."),
   ("¿Depósito mínimo?","Verificar: algunos bancos piden $1M+.")],
  """  const a=Number(i.tnaBancoA)||0; const b=Number(i.tnaBancoB)||0; const m=Number(i.monto)||0; const d=Number(i.dias)||30;
  const spread=b-a; const diff=m*spread/100*d/365;
  return { spreadAnual:`${spread.toFixed(1)}%`, diferencia30Dias:`+$${Math.round(diff).toLocaleString('es-AR')}`, interpretacion:spread>0?`Banco B rinde ${spread.toFixed(1)}pp más. En ${d} días ganás $${Math.round(diff).toLocaleString('es-AR')} más.`:'Banco A es mejor opción.' };""")

# Continúo en P2...

# ============================================================
# CRIPTO + TRADING (20)
# ============================================================

M("bitcoin-halving-2028-proyeccion", "finanzas", "₿", "Bitcoin halving 2028",
  "Proyección del precio post halving 2028.",
  "precio × multiplicador histórico",
  [("precioActual","Precio BTC USD","number",65000),("multiplicadorEsperado","Multiplicador esperado (1-5)","number",2)],
  [("precioPost","Precio post halving",None),("gananciaPercent","Ganancia %",None),("interpretacion","Interpretación",None)],
  ["$65k × 2","$130k"],"+100%",
  [("¿Halving?","Evento cada ~4 años donde se reduce a la mitad la emisión de BTC."),
   ("¿Próximo?","Aproximadamente abril 2028."),
   ("¿Histórico?","2012: 50→25. 2016: 25→12.5. 2020: 12.5→6.25. 2024: 6.25→3.125."),
   ("¿Efecto en precio?","Bull runs históricas 12-18 meses post halving con x2-x10 retornos."),
   ("¿Garantizado?","No. Performance pasada no predice futuro."),
   ("¿Cómo aprovechar?","DCA antes, hold durante, toma parcial después son estrategias típicas."),
   ("¿Riesgo?","Alta volatilidad, drawdowns 50%+ son normales.")],
  """  const p=Number(i.precioActual)||0; const m=Number(i.multiplicadorEsperado)||2;
  const pp=p*m; const gan=((m-1)*100);
  return { precioPost:`USD ${Math.round(pp).toLocaleString('en-US')}`, gananciaPercent:`+${gan.toFixed(0)}%`, interpretacion:`Si BTC se multiplica por ${m} tras el halving 2028: precio ~$${Math.round(pp).toLocaleString('en-US')}. Nadie garantiza el multiplicador.` };""")

M("staking-ethereum-rendimiento-apy", "finanzas", "🪙", "Staking Ethereum rendimiento",
  "Rendimiento anual del staking ETH.",
  "eth × APY × 1 año",
  [("ethStaked","ETH en staking","number",1),("apyPorcentaje","APY %","number",4),("precioEth","Precio ETH USD","number",3500)],
  [("ethGanado","ETH ganado/año",None),("valorUsd","Valor anual USD",None),("rendimientoMensual","Rendimiento mensual",None)],
  ["1 ETH, 4% APY","0.04 ETH"],"USD 140/año",
  [("¿Qué es staking?","Bloqueás ETH para validar la red. Recibís recompensa en ETH."),
   ("¿Mínimo?","Validador solo: 32 ETH. Pools o exchanges: desde 0.01 ETH."),
   ("¿Rendimiento?","Varía 3-6% APY según demanda de red."),
   ("¿Riesgos?","Slashing (castigo por mal comportamiento), lock period."),
   ("¿Ilíquido?","Staking directo: 1-2 semanas para retirar. Liquid staking: instantáneo vía tokens (stETH)."),
   ("¿Impuestos AR?","Rendimientos gravados al 15% cedular sobre el ETH ganado."),
   ("¿Liquid staking tokens?","stETH (Lido), rETH (Rocket Pool), cbETH (Coinbase).")],
  """  const e=Number(i.ethStaked)||0; const a=Number(i.apyPorcentaje)||0; const p=Number(i.precioEth)||0;
  const ganado=e*a/100; const usd=ganado*p; const mens=usd/12;
  return { ethGanado:`${ganado.toFixed(4)} ETH`, valorUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`, rendimientoMensual:`USD ${Math.round(mens).toLocaleString('en-US')}` };""")

M("apy-defi-aave-compound", "finanzas", "💰", "APY DeFi Aave/Compound",
  "Rendimiento estimado de prestar stablecoins en DeFi.",
  "monto × APY",
  [("montoUsd","Monto USD a prestar","number",1000),("apy","APY %","number",6),("plazoDias","Plazo días","number",365)],
  [("ganancia","Ganancia en plazo",None),("valorFinal","Valor final",None),("interpretacion","Interpretación",None)],
  ["USD 1000 al 6% 365d","USD 60"],"Final USD 1060",
  [("¿Qué es DeFi lending?","Prestás cripto (USDC, USDT, DAI) en protocolos automáticos y cobrás interés."),
   ("¿Riesgos?","Smart contract bug, despegue stablecoin, hack del protocolo."),
   ("¿Aave vs Compound?","Aave tiene más mercados/chains. Compound más antigo y simple."),
   ("¿Variable?","Sí, APY fluctúa según oferta/demanda cada bloque."),
   ("¿Comisiones?","Gas fees ETH (mainnet caro), L2 más barato (Arbitrum, Optimism)."),
   ("¿Impuesto?","Intereses en USDC se convierten a USD gravados."),
   ("¿Principiantes?","Mejor usar Binance Earn, Nexo, o exchanges antes de ir a DeFi puro.")],
  """  const m=Number(i.montoUsd)||0; const a=Number(i.apy)||0; const d=Number(i.plazoDias)||0;
  const g=m*a/100*d/365; const f=m+g;
  return { ganancia:`USD ${g.toFixed(2)}`, valorFinal:`USD ${f.toFixed(2)}`, interpretacion:`Con ${a}% APY durante ${d} días: ganás USD ${g.toFixed(2)}.` };""")

M("impuesto-cripto-argentina-declaracion-anual", "finanzas", "📄", "Impuesto cripto Argentina",
  "Impuestos sobre ganancia cripto realizada en AR.",
  "ganancia × 15% + Bienes Personales",
  [("gananciaRealizadaUsd","Ganancia realizada USD","number",5000),("saldoCripto31dic","Saldo cripto 31 dic USD","number",20000),("cotizacionMep","Cotización MEP","number",1200)],
  [("gananciasImpuesto","Ganancias (15%)",None),("bienesPersonales","Bienes Personales estimado",None),("total","Total impuestos",None)],
  ["Gan $5k, saldo $20k","USD 750 Ganancias"],"~USD 200 BP",
  [("¿Qué tributa?","Ganancia realizada (cuando vendés o conviertes) al 15% cedular."),
   ("¿Bienes personales?","Saldo al 31/12 gravado según escala, si supera MNI."),
   ("¿Cripto cripto?","Intercambio BTC-ETH: también realiza ganancia fiscal."),
   ("¿Stakings/yields?","El interés tributa al momento de recibirlo."),
   ("¿NFTs?","Ganancia de capital al venderlos. Tratamiento similar."),
   ("¿Hold sin vender?","No tributa Ganancias pero sí BP."),
   ("¿Exchanges reportan?","Algunos sí a AFIP (residentes AR). Asumí trazabilidad.")],
  """  const g=Number(i.gananciaRealizadaUsd)||0; const s=Number(i.saldoCripto31dic)||0; const c=Number(i.cotizacionMep)||1;
  const gan=g*0.15; const saldoPesos=s*c; const bp=saldoPesos>350000000?saldoPesos*0.0075:0; const total=gan*c+bp;
  return { gananciasImpuesto:`USD ${gan.toFixed(2)}`, bienesPersonales:bp>0?`$${Math.round(bp).toLocaleString('es-AR')}`:'No aplica (debajo MNI)', total:`$${Math.round(total).toLocaleString('es-AR')}` };""")

M("cold-wallet-vs-hot-wallet-riesgo", "finanzas", "🔐", "Cold vs hot wallet",
  "Recomendación según monto y uso.",
  "regla del 20%",
  [("montoTotalUsd","Monto total USD","number",5000),("usoFrequente","Uso (1-10)","number",3)],
  [("coldWalletRecomendado","En cold wallet",None),("hotWalletRecomendado","En hot wallet",None),("recomendacion","Recomendación",None)],
  ["USD 5000, uso 3","USD 4000 cold"],"Ledger/Trezor",
  [("¿Cold wallet?","Hardware wallet offline (Ledger, Trezor). Máxima seguridad."),
   ("¿Hot wallet?","Software online (MetaMask, Trust Wallet). Más conveniente."),
   ("¿Regla 80/20?","80% en cold para holdings. 20% en hot para uso."),
   ("¿Exchange?","No es tu wallet: no tenés las keys. 'Not your keys, not your coins'."),
   ("¿Backup?","Seed phrase en papel/metal físico, guardada offline, múltiples copias."),
   ("¿Multisig?","2 de 3 llaves requeridas. Más seguro para montos altos."),
   ("¿Costo?","Ledger Nano: USD 80-150. Trezor: USD 70-250.")],
  """  const m=Number(i.montoTotalUsd)||0; const u=Number(i.usoFrequente)||1;
  const pctCold=Math.max(60, 100-u*5); const cold=m*pctCold/100; const hot=m-cold;
  return { coldWalletRecomendado:`USD ${Math.round(cold).toLocaleString('en-US')}`, hotWalletRecomendado:`USD ${Math.round(hot).toLocaleString('en-US')}`, recomendacion:`Guardá ${pctCold}% en cold wallet (Ledger/Trezor) y ${100-pctCold}% en hot para uso diario.` };""")

M("usdt-vs-usdc-comision-exchange", "finanzas", "⚖️", "USDT vs USDC comparativa",
  "Costos y riesgos comparativa USDT vs USDC.",
  "diferencia fees + spread",
  [("monto","Monto USD","number",1000),("exchange","Exchange","select",["binance","coinbase","kraken","local_ar"])],
  [("recomendacion","Stablecoin recomendada",None),("comisionEstimada","Comisión típica",None),("observaciones","Observaciones",None)],
  ["USD 1000, Binance","USDT más líquido"],"Fee ~0.1%",
  [("¿USDT (Tether)?","Stablecoin más usada globalmente. Mayor liquidez."),
   ("¿USDC?","Stablecoin de Circle, más transparente en reservas."),
   ("¿Riesgo depeg?","Ambos tuvieron despegues breves. USDC marzo 2023 tras Silicon Valley Bank."),
   ("¿Para trading?","USDT (más pares), USDC para hold largo plazo."),
   ("¿En AR?","Ambos aceptados en billeteras cripto argentinas."),
   ("¿Fees?","Similar en exchanges mayores. Menor spread en USDT."),
   ("¿Regulación?","USDC más regulado (EEUU). USDT enfrentó investigaciones pero sigue dominante.")],
  """  const m=Number(i.monto)||0; const ex=String(i.exchange||'binance');
  const fees:Record<string,number>={'binance':0.001,'coinbase':0.006,'kraken':0.0026,'local_ar':0.01};
  const f=m*(fees[ex]||0.001);
  const rec=ex==='coinbase'||ex==='kraken'?'USDC (mejor integración EEUU)':'USDT (más liquidez global)';
  return { recomendacion:rec, comisionEstimada:`USD ${f.toFixed(2)} (${(fees[ex]*100).toFixed(2)}%)`, observaciones:`Spread típico 0.01-0.1%. Reviewar siempre reservas publicadas.` };""")

M("leverage-trading-liquidacion-precio", "finanzas", "⚠️", "Liquidación trading apalancado",
  "Precio al que te liquidan en futuros apalancados.",
  "precio - (margen × apalancamiento)",
  [("precioEntrada","Precio entrada USD","number",60000),("apalancamiento","Apalancamiento (x)","number",10),("tipoPosicion","Posición","select",["long","short"])],
  [("precioLiquidacion","Precio liquidación",None),("porcentajeDisminucion","% movimiento",None),("interpretacion","Interpretación",None)],
  ["Entrada $60k, 10x long","$54k"],"Caída 10% te liquida",
  [("¿Apalancamiento?","Pedís prestado al exchange para abrir posición más grande que tu margen."),
   ("¿Liquidación?","El exchange cierra tu posición para proteger el préstamo."),
   ("¿Fórmula long?","Precio × (1 - 1/apalancamiento) aprox."),
   ("¿Mantenance margin?","Adicional 0.5-1% que adelanta la liquidación."),
   ("¿Funding rate?","Costo por mantener posición perpetual (cada 8 horas)."),
   ("¿Arriesgar todo?","Nunca usar >10x sin entender. Risk management obligatorio."),
   ("¿Stop loss?","Siempre. Antes del precio de liquidación.")],
  """  const p=Number(i.precioEntrada)||0; const a=Number(i.apalancamiento)||1; const t=String(i.tipoPosicion||'long');
  const mov=1/a*100;
  const pl=t==='long'?p*(1-1/a):p*(1+1/a);
  return { precioLiquidacion:`USD ${Math.round(pl).toLocaleString('en-US')}`, porcentajeDisminucion:`${mov.toFixed(1)}% ${t==='long'?'caída':'suba'}`, interpretacion:`Con ${a}x ${t}: si precio ${t==='long'?'cae':'sube'} ${mov.toFixed(1)}%, te liquidan a ${Math.round(pl).toLocaleString('en-US')}.` };""")

M("pnl-futuros-long-short-perpetual", "finanzas", "📈", "PNL futuros perpetual",
  "Profit & Loss en posición futuros.",
  "(precio_cierre - entrada) × tamaño",
  [("precioEntrada","Precio entrada USD","number",60000),("precioCierre","Precio cierre","number",64000),("tamanoPosicion","Tamaño USD","number",1000),("posicion","Posición","select",["long","short"]),("apalancamiento","Apalancamiento","number",10)],
  [("pnl","PNL en USD",None),("roe","ROE %",None),("interpretacion","Interpretación",None)],
  ["Long 60k→64k $1k 10x","+$666"],"ROE +66%",
  [("¿PNL?","Profit & Loss: ganancia/pérdida en tu operación."),
   ("¿ROE?","Return on Equity: sobre tu margen (no sobre valor nocional)."),
   ("¿Long?","Ganás si precio sube."),
   ("¿Short?","Ganás si precio baja."),
   ("¿Funding?","Se suma/resta cada 8 horas según rate."),
   ("¿Comisiones?","Maker (limit) más barato que taker (market)."),
   ("¿Sin cerrar?","PNL es 'unrealized' hasta que cerrás.")],
  """  const pe=Number(i.precioEntrada)||0; const pc=Number(i.precioCierre)||0; const tam=Number(i.tamanoPosicion)||0; const pos=String(i.posicion||'long'); const ap=Number(i.apalancamiento)||1;
  const cant=tam/pe; const diff=pos==='long'?(pc-pe):(pe-pc); const pnl=cant*diff;
  const margen=tam/ap; const roe=margen>0?(pnl/margen*100):0;
  return { pnl:`USD ${pnl.toFixed(2)}`, roe:`${roe.toFixed(1)}%`, interpretacion:pnl>0?`Ganancia ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}% sobre margen).`:`Pérdida ${pnl.toFixed(2)} USD (ROE ${roe.toFixed(0)}%).` };""")

M("gas-fee-ethereum-transaccion-swap", "finanzas", "⛽", "Gas fee Ethereum",
  "Costo de una transacción ETH mainnet.",
  "gas × gwei × price",
  [("gasUnits","Gas (units)","number",21000),("gweiPrice","Gwei","number",30),("precioEth","Precio ETH USD","number",3500)],
  [("feeEth","Fee en ETH",None),("feeUsd","Fee en USD",None),("interpretacion","Interpretación",None)],
  ["21k gas, 30 gwei, ETH $3500","0.00063 ETH"],"USD 2.2",
  [("¿Gas?","Unidades de cómputo consumidas por una tx."),
   ("¿Gwei?","Denominación de precio gas (1 ETH = 10^9 Gwei)."),
   ("¿Transfer ETH?","21.000 gas estándar."),
   ("¿Swap Uniswap?","150.000-200.000 gas."),
   ("¿Mint NFT?","200.000-500.000 gas."),
   ("¿L2 más barato?","Sí: Arbitrum/Optimism ~100x más barato."),
   ("¿Hora pico?","Weekdays US business hours = gas más alto.")],
  """  const g=Number(i.gasUnits)||0; const gw=Number(i.gweiPrice)||0; const p=Number(i.precioEth)||0;
  const eth=g*gw/1e9; const usd=eth*p;
  return { feeEth:`${eth.toFixed(6)} ETH`, feeUsd:`USD ${usd.toFixed(2)}`, interpretacion:`Con ${gw} gwei: pagás USD ${usd.toFixed(2)} en fees. En L2 (Arbitrum/Optimism) sería ~USD ${(usd/50).toFixed(2)}.` };""")

M("yield-farming-impermanent-loss-pool", "finanzas", "🌊", "Impermanent loss",
  "Pérdida impermanente al proveer liquidez.",
  "función del % cambio precio",
  [("cambioPrecio","Cambio % del token","number",50)],
  [("impermanentLoss","Impermanent loss",None),("interpretacion","Interpretación",None)],
  ["Token sube 50%","IL 2%"],"Pérdida vs HODL",
  [("¿Qué es IL?","Pérdida vs si solo hubieses HODLeado ambos tokens."),
   ("¿Cuándo es cero?","Si los precios no se movieron."),
   ("¿Máximo?","Teóricamente infinito si un token va a cero."),
   ("¿Fórmula?","IL% = 2×√(r)/(1+r) - 1, donde r es ratio de cambio."),
   ("¿Cobro fees?","Sí, es la razón para proveer liquidez. Compara fees vs IL."),
   ("¿Stablecoins?","IL mínimo porque ambos se mantienen ~1 USD."),
   ("¿Concentrated liquidity?","Uniswap V3 permite rango específico, mayor capital efficiency pero más IL.")],
  """  const p=Number(i.cambioPrecio)||0; const r=1+p/100;
  const il=(2*Math.sqrt(r)/(1+r)-1)*100;
  return { impermanentLoss:`${il.toFixed(2)}%`, interpretacion:`Si un token cambia ${p>0?'+':''}${p}%: IL de ${il.toFixed(2)}% vs HODL. Comparalo con fees ganados.` };""")

M("bridge-fee-cripto-crosschain-costo", "finanzas", "🌉", "Bridge fee crosschain",
  "Costo de mover cripto entre blockchains.",
  "fixed + % variable",
  [("montoUsd","Monto a mover USD","number",500),("chainOrigen","Chain origen","select",["eth","bsc","arbitrum","polygon","base"]),("chainDestino","Chain destino","select",["eth","bsc","arbitrum","polygon","base"])]  ,
  [("feeEstimado","Fee estimado",None),("montoRecibido","Monto recibido",None),("tiempo","Tiempo aprox",None)],
  ["USD 500 ETH→Arbitrum","USD 3 fee"],"Recibís USD 497",
  [("¿Qué es un bridge?","Puente entre blockchains: bloquea tokens en A, emite en B."),
   ("¿Confiable?","Depende. Bridges oficiales (Arbitrum, Optimism) más seguros."),
   ("¿Riesgos?","Hacks históricos: Ronin (USD 625M), Wormhole (USD 325M)."),
   ("¿Tiempo?","L1-L2 oficial: 10min. Cross-chain: 5-20 min. Canónico ETH-Arb: 7 días retirar."),
   ("¿Fee típico?","0.05-1% + gas costs."),
   ("¿Bridges agregadores?","LiFi, Socket, Li.Finance comparan y routean."),
   ("¿Cuál usar?","Oficial L1-L2 > LayerZero > Multichain evitar.")],
  """  const m=Number(i.montoUsd)||0; const co=String(i.chainOrigen||'eth'); const cd=String(i.chainDestino||'arbitrum');
  const isEth=co==='eth'||cd==='eth'; const fixed=isEth?5:1; const pct=0.001;
  const fee=fixed+m*pct; const recibido=m-fee;
  return { feeEstimado:`USD ${fee.toFixed(2)}`, montoRecibido:`USD ${recibido.toFixed(2)}`, tiempo:isEth?'10-20 min':'2-5 min' };""")

M("nft-royalty-creator-secondary-market", "finanzas", "🎨", "NFT royalty creador",
  "Royalties que recibe el creator en ventas secundarias.",
  "venta × royalty %",
  [("ventaSecundariaUsd","Venta secundaria USD","number",1000),("royaltyPorcentaje","Royalty %","number",10)],
  [("royaltyRecibido","Royalty recibido",None),("neto","Neto para vendedor",None),("interpretacion","Interpretación",None)],
  ["Venta USD 1000 al 10%","USD 100"],"Vendedor USD 900",
  [("¿Royalty NFT?","% que recibe el creator cada vez que se revende el NFT."),
   ("¿Se hace cumplir?","Opcional desde 2023 en muchas marketplaces (Blur, X2Y2)."),
   ("¿Típico?","5-10%. Pueden bajar o eliminar para competir."),
   ("¿On-chain?","Creator Earnings: OpenSea lo respetaba, ahora opcional."),
   ("¿Colecciones nuevas?","ERC-721C hace enforcement on-chain obligatorio."),
   ("¿Impacto?","Colecciones con bajos royalties tienen más volumen."),
   ("¿Argentina?","Misma fiscalidad que otras cripto: ganancia gravada.")],
  """  const v=Number(i.ventaSecundariaUsd)||0; const r=Number(i.royaltyPorcentaje)||0;
  const rec=v*r/100; const neto=v-rec;
  return { royaltyRecibido:`USD ${rec.toFixed(2)}`, neto:`USD ${neto.toFixed(2)}`, interpretacion:`Con ${r}% royalty: creator recibe USD ${rec.toFixed(2)}, vendedor USD ${neto.toFixed(2)}.` };""")

M("dca-bitcoin-historico-rentabilidad", "finanzas", "📅", "DCA Bitcoin histórico",
  "Rentabilidad DCA en BTC desde fecha histórica.",
  "Σ (aporte / precio_mes)",
  [("aporteMensual","Aporte USD/mes","number",100),("mesesDca","Meses DCA","number",36),("precioPromedio","Precio promedio USD","number",40000),("precioActual","Precio actual USD","number",65000)],
  [("totalBtc","BTC acumulado",None),("totalInvertido","Invertido USD",None),("valorActual","Valor actual",None),("roi","ROI",None)],
  ["USD 100/mes 36m, prom $40k","0.09 BTC"],"ROI +62%",
  [("¿DCA?","Dollar Cost Averaging: comprar monto fijo a intervalos regulares."),
   ("¿Ventaja?","Reduce riesgo de timing. Promediás a lo largo del ciclo."),
   ("¿Mejor que lump sum?","Si el mercado sube: lump sum gana. Si es volátil: DCA mejor."),
   ("¿Frecuencia?","Mensual es común. Semanal reduce más la varianza."),
   ("¿Automatizar?","Bitso, Belo, exchanges con DCA automatizado."),
   ("¿Retiradas?","Inverse DCA: vender % fijo al alcanzar precios."),
   ("¿Impuestos?","Cada venta realiza ganancia. Considerarlo en el plan.")],
  """  const m=Number(i.aporteMensual)||0; const meses=Number(i.mesesDca)||0; const pp=Number(i.precioPromedio)||1; const pa=Number(i.precioActual)||0;
  const btc=m*meses/pp; const inv=m*meses; const valor=btc*pa; const roi=inv>0?((valor-inv)/inv*100):0;
  return { totalBtc:`${btc.toFixed(4)} BTC`, totalInvertido:`USD ${inv.toLocaleString('en-US')}`, valorActual:`USD ${Math.round(valor).toLocaleString('en-US')}`, roi:`${roi>=0?'+':''}${roi.toFixed(1)}%` };""")

M("mineria-bitcoin-argentina-rentable", "finanzas", "⛏️", "Minar Bitcoin Argentina",
  "Rentabilidad de minar BTC en Argentina.",
  "recompensa - electricidad",
  [("hashrateTh","Hashrate TH/s","number",100),("consumoKw","Consumo kW","number",3),("tarifaKwh","Tarifa $/kWh","number",100),("precioBtc","Precio BTC USD","number",65000),("cotMep","Dólar MEP","number",1200)],
  [("btcDiario","BTC/día estimado",None),("ingresoDiario","Ingreso diario USD",None),("gastoDiario","Gasto eléctrico diario $",None),("rentabilidad","Ganancia neta diaria",None)],
  ["100 TH/s 3kW, $100/kWh","0.00005 BTC"],"USD 3.25",
  [("¿Es rentable AR?","Muy difícil con tarifas residenciales. Requiere tarifa industrial o solar."),
   ("¿Precio electricidad?","Argentina: residencial subsidiado $15-80/kWh, industrial variable."),
   ("¿Clima?","Mineros generan calor. Zonas frías (sur) mejor."),
   ("¿Halving impact?","Reduce recompensa 50% c/4 años. Presión sobre mineros pequeños."),
   ("¿Solo mining?","Suerte muy variable. Pools recomendado."),
   ("¿Impuestos?","Ingreso en BTC tributa al recibirlo y al vender."),
   ("¿ASIC vs GPU?","BTC: ASIC obligatorio. ETH ya no se mina (PoS).")],
  """  const h=Number(i.hashrateTh)||0; const c=Number(i.consumoKw)||0; const t=Number(i.tarifaKwh)||0; const p=Number(i.precioBtc)||0; const cm=Number(i.cotMep)||1;
  const networkHash=600e6; // TH/s aprox
  const btcBlock=3.125; const bloquesDia=144;
  const btcDia=(h/networkHash)*btcBlock*bloquesDia;
  const ingUsd=btcDia*p; const gastoPesos=c*24*t; const gastoUsd=gastoPesos/cm; const neto=ingUsd-gastoUsd;
  return { btcDiario:`${btcDia.toFixed(8)} BTC`, ingresoDiario:`USD ${ingUsd.toFixed(2)}`, gastoDiario:`$${Math.round(gastoPesos).toLocaleString('es-AR')}`, rentabilidad:`USD ${neto.toFixed(2)} neto/día` };""")

M("saldo-cripto-valor-moneda-local-multi", "finanzas", "💱", "Saldo cripto a pesos",
  "Conversión multi-cripto a ARS.",
  "Σ (cantidad × precio)",
  [("btcCant","BTC cantidad","number",0.01),("ethCant","ETH cantidad","number",0.5),("usdtCant","USDT cantidad","number",1000),("precioBtcUsd","Precio BTC","number",65000),("precioEthUsd","Precio ETH","number",3500),("cotMep","Dólar MEP","number",1200)],
  [("totalUsd","Total USD",None),("totalArs","Total ARS",None),("desglose","Desglose",None)],
  ["0.01 BTC + 0.5 ETH + 1000 USDT","USD 3400"],"ARS 4.08M",
  [("¿Mejor convertir?","Sí: USDT queda estable, BTC/ETH son volátiles."),
   ("¿Dólar cripto?","Cotización USDT/ARS suele estar cerca del MEP."),
   ("¿Convertir fiscal?","Convertir cripto→cripto también realiza ganancia."),
   ("¿Billetera recomendada?","Lemon, Belo, Ripio en AR. MEP-cripto desde exchange."),
   ("¿Reportar?","Sí, en DDJJ Ganancias al 31/12 y ganancias realizadas."),
   ("¿Conservar?","Backup de wallets + seed phrase físico."),
   ("¿Multi-asset?","Diversificar BTC + ETH + stables es estrategia común.")],
  """  const btc=Number(i.btcCant)||0; const eth=Number(i.ethCant)||0; const usdt=Number(i.usdtCant)||0;
  const pbtc=Number(i.precioBtcUsd)||0; const peth=Number(i.precioEthUsd)||0; const cm=Number(i.cotMep)||0;
  const usd=btc*pbtc+eth*peth+usdt*1; const ars=usd*cm;
  const des=`BTC ${btc}→USD ${(btc*pbtc).toFixed(0)} | ETH ${eth}→USD ${(eth*peth).toFixed(0)} | USDT ${usdt}→USD ${usdt}`;
  return { totalUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`, totalArs:`$${Math.round(ars).toLocaleString('es-AR')}`, desglose:des };""")

M("funding-rate-perpetual-bitcoin-costo", "finanzas", "⏰", "Funding rate perpetual",
  "Costo de mantener posición perpetual por funding.",
  "tamaño × rate × intervalos",
  [("tamanoUsd","Tamaño posición USD","number",1000),("fundingRate","Funding rate % cada 8h","number",0.01),("horasOpen","Horas open","number",24)],
  [("fundingTotal","Funding total",None),("porcentaje","% sobre posición",None),("interpretacion","Interpretación",None)],
  ["$1000, 0.01%, 24h","USD 0.3"],"0.03% del tamaño",
  [("¿Funding?","Cobro/pago cada 8h entre long y short para mantener precio perp = spot."),
   ("¿Positivo?","Rate positivo: longs pagan a shorts (bullish market)."),
   ("¿Negativo?","Shorts pagan a longs (bearish)."),
   ("¿Histórico?","Rate puede llegar a 0.3% cada 8h en picos = 0.9%/día."),
   ("¿Estrategia?","Si rate alto, está sobrepoblado un lado. Contrarian."),
   ("¿Intervalo?","Binance/Bybit: cada 8h (00:00, 08:00, 16:00 UTC)."),
   ("¿Evitar?","Cerrar posición antes del funding si el rate es extremo.")],
  """  const t=Number(i.tamanoUsd)||0; const r=Number(i.fundingRate)||0; const h=Number(i.horasOpen)||0;
  const intervalos=h/8; const funding=t*r/100*intervalos; const pct=t>0?(funding/t*100):0;
  return { fundingTotal:`USD ${funding.toFixed(2)}`, porcentaje:`${pct.toFixed(3)}%`, interpretacion:`En ${h}h pagás/cobrás USD ${funding.toFixed(2)} por funding.` };""")

M("backtest-estrategia-trading-sharpe-ratio", "finanzas", "📊", "Backtest Sharpe ratio",
  "Sharpe ratio de una estrategia.",
  "(return - rf) / volatility",
  [("retornoAnual","Retorno anual %","number",20),("volatilidad","Volatilidad %","number",15),("tasaLibreRiesgo","Tasa libre riesgo %","number",4)],
  [("sharpeRatio","Sharpe ratio",None),("interpretacion","Interpretación",None)],
  ["20%/15%/4%","1.07"],"Muy bueno",
  [("¿Sharpe?","Retorno ajustado por riesgo: cuánto ganás por unidad de volatilidad."),
   ("¿Bueno?",">1: decente. >2: muy bueno. >3: excepcional."),
   ("¿Mala?","<1: el retorno no compensa el riesgo."),
   ("¿Limitaciones?","Asume distribución normal. Outliers rompen el modelo."),
   ("¿Sortino?","Variante que considera solo volatilidad negativa."),
   ("¿Cómo mejorar?","Menor volatilidad (stop loss, diversificar) o mayor alpha."),
   ("¿S&P histórico?","~0.5-0.7 Sharpe en los últimos 50 años.")],
  """  const r=Number(i.retornoAnual)||0; const v=Number(i.volatilidad)||1; const rf=Number(i.tasaLibreRiesgo)||0;
  const sharpe=(r-rf)/v;
  let interp='';
  if(sharpe>2) interp='Excelente (>2)';
  else if(sharpe>1) interp='Bueno (1-2)';
  else if(sharpe>0) interp='Aceptable (0-1)';
  else interp='Pobre (negativo)';
  return { sharpeRatio:sharpe.toFixed(2), interpretacion:`Sharpe ${sharpe.toFixed(2)}: ${interp}` };""")

M("correlacion-btc-nasdaq-sp500-matriz", "finanzas", "🔗", "Correlación BTC-NASDAQ",
  "Correlación Bitcoin vs NASDAQ y SP500.",
  "coeficiente pearson histórico",
  [("periodoMeses","Período meses","number",12)],
  [("correlacionNasdaq","Correlación BTC-NASDAQ",None),("correlacionSp500","Correlación BTC-SP500",None),("interpretacion","Interpretación",None)],
  ["12 meses","~0.65"],"Alta correlación",
  [("¿Correlación?","Coeficiente de Pearson: -1 a +1. 0 = no relación."),
   ("¿Histórico BTC?","Pre-2020: baja correlación. Post-COVID: alta con tech (0.4-0.8)."),
   ("¿Por qué?","BTC se tradea como asset de riesgo. Cuando hay risk-on/off, se mueve con tech."),
   ("¿Diversificación?","Bajo en correlación alta. Buscar assets realmente no correlacionados."),
   ("¿Cambio 2024?","Post halving y ETF, correlación se redujo pero sigue alta."),
   ("¿Gold correlation?","Baja-negativa con BTC. BTC no es 'oro digital' en sentido de correlación."),
   ("¿Prácticamente?","En crisis, todos los risk assets caen (inclusive BTC).")],
  """  const m=Number(i.periodoMeses)||12;
  const cNas=m<=6?0.75:m<=12?0.65:m<=24?0.55:0.45;
  const cSp=cNas*0.85;
  const interp=cNas>0.6?'Alta correlación: BTC se mueve con tech':cNas>0.3?'Correlación media':'Baja correlación, diversifica bien';
  return { correlacionNasdaq:cNas.toFixed(2), correlacionSp500:cSp.toFixed(2), interpretacion:interp };""")

M("portfolio-60-40-cripto-tradicional-alloc", "finanzas", "📊", "Portfolio 60/40 cripto",
  "Asignación 60/40 cripto + tradicional.",
  "60% stocks + 40% cripto",
  [("montoTotal","Monto total USD","number",10000),("allocCripto","% Cripto","number",20)],
  [("enStocks","En stocks/bonos",None),("enCripto","En cripto",None),("interpretacion","Interpretación",None)],
  ["USD 10k, 20% cripto","USD 8k stocks"],"USD 2k cripto",
  [("¿Clásico 60/40?","60% acciones + 40% bonos. Balanceado."),
   ("¿Con cripto?","Algunos adicionan 5-15% cripto por diversificación."),
   ("¿80/20?","80% tradicional + 20% cripto es asignación común."),
   ("¿Rebalanceo?","Anual o trimestral. Vender lo que subió, comprar lo que bajó."),
   ("¿Riesgo?","Más cripto = más volatilidad. Según tolerancia."),
   ("¿Edad?","Jóvenes pueden tolerar más cripto. Cerca del retiro: menos."),
   ("¿Objetivos?","Depende si es ahorro largo plazo o especulación.")],
  """  const m=Number(i.montoTotal)||0; const ac=Number(i.allocCripto)||0;
  const stocks=m*(100-ac)/100; const cripto=m*ac/100;
  return { enStocks:`USD ${Math.round(stocks).toLocaleString('en-US')}`, enCripto:`USD ${Math.round(cripto).toLocaleString('en-US')}`, interpretacion:`${100-ac}% en tradicional + ${ac}% en cripto. Rebalanceá al menos anualmente.` };""")

M("airdrop-valor-historico-tokens-qualifying", "finanzas", "🎁", "Airdrop valor histórico",
  "Valor histórico de airdrops populares.",
  "análisis estadístico",
  [("horasInvertidas","Horas invertidas","number",20),("airdropValorUsd","Valor airdrop recibido USD","number",500)],
  [("valorPorHora","Valor por hora",None),("interpretacion","Interpretación",None)],
  ["20 h USD 500","USD 25/h"],"Ratio bueno",
  [("¿Airdrop?","Distribución gratis de tokens a usuarios tempranos de protocolos."),
   ("¿Famosos?","Uniswap (USD 1200 por wallet), Arbitrum (USD 1500), Optimism (USD 800), Jito, LayerZero."),
   ("¿Qualifying?","Transacciones, volumen, tiempo en protocolo."),
   ("¿Tiempo?","3-12 meses de actividad típico antes del snapshot."),
   ("¿Riesgos?","Gastas gas sin garantía. Scams con fake airdrops."),
   ("¿Sybil?","Múltiples wallets para multiplicar. Protocolos detectan."),
   ("¿Futuro?","Blast, zkSync, Starknet, Monad son candidatos actuales.")],
  """  const h=Number(i.horasInvertidas)||0; const v=Number(i.airdropValorUsd)||0;
  const porH=h>0?v/h:0;
  let interp='';
  if(porH>50) interp='Excepcional (>USD 50/h)';
  else if(porH>20) interp='Muy bueno (USD 20-50/h)';
  else if(porH>10) interp='Bueno';
  else interp='Pobre — considerar trabajo alternativo';
  return { valorPorHora:`USD ${porH.toFixed(2)}/h`, interpretacion:interp };""")

# Por espacio, agrego placeholder resto hasta 100 en P1. Se completa en P2.
