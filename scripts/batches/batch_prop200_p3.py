"""Batch Prop200 P3 — 50 calcs (15 Vida restantes + 15 Viajes + 15 Trabajo + 5 Educación inicio)."""
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
# VIDA DIARIA restantes (15)
# ============================================================

M("estacionamiento-medido-hora-caba-zona", "vida", "🅿️", "Estacionamiento medido CABA",
  "Costo estacionamiento medido CABA por zona y tiempo.",
  "horas × tarifa zona",
  [("horas","Horas","number",4),("zona","Zona","select",["centro","microcentro","residencial","barrios_perifericos"])]  ,
  [("costoTotal","Costo total",None),("porHora","Por hora",None),("limite","Límite horario",None)],
  ["4 h centro","$6400"],"$1600/h",
  [("¿Zonas?","A (microcentro), B (comercial), C (residencial), D (periféricas)."),
   ("¿Tarifa?","Variable. A: ~$2000/h. D: ~$500/h."),
   ("¿Horario?","Lunes-viernes 8-20 hs. Sábados 8-14 hs."),
   ("¿Pago?","App MiGobierno CABA. Fin de sesión al alejarse."),
   ("¿Residentes?","Pase residente para zona cercana al domicilio, descuento."),
   ("¿Grúa?","Si no pagás o supera el máximo: multa + remolque."),
   ("¿Límite?","2 horas máximo algunos lugares. Revisar cartel.")],
  """  const h=Number(i.horas)||0; const z=String(i.zona||'centro');
  const tarifa={'centro':2000,'microcentro':2500,'residencial':1000,'barrios_perifericos':500}[z];
  const total=h*tarifa;
  return { costoTotal:`$${total.toLocaleString('es-AR')}`, porHora:`$${tarifa.toLocaleString('es-AR')}/h`, limite:z==='microcentro'?'Máx 2 horas':'Sin límite (pagá por hora)' };""")

M("peaje-autopista-baires-la-plata-costo", "vida", "🛣️", "Peaje Buenos Aires",
  "Costo peajes Buenos Aires por ruta.",
  "tarifa según tramo",
  [("ruta","Ruta","select",["panamericana","accesso_oeste","autopista_la_plata","acceso_norte","25_de_mayo"]),("horario","Horario","select",["pico","valle","noche"])],
  [("peajeTotal","Costo peaje",None),("descuentoTelepase","Con Telepase",None),("frecuencia","Frecuencia cobro",None)],
  ["Panamericana pico","$500"],"10% menos con Telepase",
  [("¿Telepase?","Pago automático. 10-20% descuento."),
   ("¿Hora pico?","Tarifa mayor 7-10h y 17-20h."),
   ("¿Valle?","Noche/fines de semana más barato."),
   ("¿RTA/LPBA?","Red Autopistas Tesa/LP Bahía Blanca concesiones."),
   ("¿Rutas nacionales?","Corredores Viales SA u otras concesionarias."),
   ("¿Vehículo?","Autos. Camiones mucho más caro."),
   ("¿Manual?","Cambiar efectivo molesto. Mejor Telepase.")],
  """  const r=String(i.ruta||'panamericana'); const h=String(i.horario||'valle');
  const base={'panamericana':400,'accesso_oeste':350,'autopista_la_plata':600,'acceso_norte':300,'25_de_mayo':250}[r];
  const mult={'pico':1.25,'valle':1,'noche':0.8}[h];
  const total=base*mult; const tele=total*0.9;
  return { peajeTotal:`$${Math.round(total).toLocaleString('es-AR')}`, descuentoTelepase:`$${Math.round(tele).toLocaleString('es-AR')}`, frecuencia:'Por tramo/estación' };""")

M("combustible-gnc-instalacion-amortizacion-auto", "vida", "⛽", "GNC instalación amortización",
  "¿Conviene poner GNC? Meses para amortizar.",
  "costo_instal / ahorro_por_mes",
  [("costoInstalacion","Costo instalación $","number",800000),("kmMensuales","Km/mes","number",1500),("consumo100km","L/100 km","number",12),("precioNafta","$/L nafta","number",1200),("precioGnc","$/m³ GNC","number",500)],
  [("ahorroMensual","Ahorro mensual",None),("mesesAmortizar","Meses a amortizar",None),("conviene","¿Conviene?",None)],
  ["Inst $800k, 1500 km","~$115k/mes"],"7 meses",
  [("¿Consumo GNC?","7-10 m³/100 km (depende tipo vehículo)."),
   ("¿GNC vs nafta?","GNC 60-70% más barato por km."),
   ("¿Limitaciones?","Menor potencia (-10%), maletero ocupado por tubo."),
   ("¿Autonomía?","Doble combustible: ampliada."),
   ("¿Costo?","$500k-1.5M instalación según equipo."),
   ("¿Mantenimiento?","Revisión anual obligatoria."),
   ("¿Reventa?","Suele no agregar valor (puede restar).")],
  """  const ci=Number(i.costoInstalacion)||0; const km=Number(i.kmMensuales)||0; const c=Number(i.consumo100km)||0;
  const pn=Number(i.precioNafta)||0; const pg=Number(i.precioGnc)||0;
  const costoNaftaMes=km/100*c*pn;
  const consumoGncMes=km/100*c*0.75;
  const costoGncMes=consumoGncMes*pg;
  const ahorro=costoNaftaMes-costoGncMes;
  const meses=ahorro>0?ci/ahorro:0;
  return { ahorroMensual:`$${Math.round(ahorro).toLocaleString('es-AR')}`, mesesAmortizar:`${Math.ceil(meses)} meses`, conviene:meses<12?'Sí, menos de 1 año':meses<24?'Sí, moderado':'Evaluar: >2 años para recuperar' };""")

M("vtv-costo-provincias-2026", "vida", "🚗", "VTV 2026 provincias",
  "Costo VTV por provincia y tipo vehículo.",
  "tarifa según provincia",
  [("provincia","Provincia","select",["caba","pba","cordoba","santa_fe","mendoza","otras"]),("tipo","Tipo","select",["auto","camioneta","moto","taxi"])]  ,
  [("costo","Costo VTV",None),("frecuencia","Frecuencia",None),("penalizacion","Penalización fuera término",None)],
  ["CABA auto","~$45k"],"Cada 2 años",
  [("¿VTV?","Verificación Técnica Vehicular. Obligatoria."),
   ("¿Frecuencia?","Autos: cada 2 años <10 años. Anual >10 años."),
   ("¿Multa?","Multa de tránsito + no poder circular."),
   ("¿Provincia?","Cada una fija tarifa y puntos de verificación."),
   ("¿Motos?","Cada 2 años. Tarifa menor."),
   ("¿Taxis?","Anual siempre."),
   ("¿Qué revisan?","Frenos, luces, dirección, emisiones, neumáticos.")],
  """  const p=String(i.provincia||'pba'); const t=String(i.tipo||'auto');
  const base={'caba':45000,'pba':40000,'cordoba':38000,'santa_fe':35000,'mendoza':32000,'otras':40000}[p];
  const mult={'auto':1,'camioneta':1.3,'moto':0.5,'taxi':1.2}[t];
  const total=base*mult;
  return { costo:`$${Math.round(total).toLocaleString('es-AR')}`, frecuencia:t==='taxi'?'Anual':'Cada 2 años (autos <10 años)', penalizacion:'Multa + impedimento circular' };""")

M("patente-moto-provincias-2026-alicuota", "vida", "🏍️", "Patente moto 2026",
  "Patente anual de moto por cilindrada y provincia.",
  "valor × alícuota",
  [("cilindradaCc","Cilindrada (cc)","number",150),("provincia","Provincia","select",["caba","pba","cordoba","santa_fe","otras"]),("valorFiscal","Valor fiscal $","number",500000)],
  [("patenteAnual","Patente anual",None),("cuotas","Cuotas disponibles",None),("observacion","Observación",None)],
  ["150cc PBA val $500k","~$15k"],"3-5 cuotas",
  [("¿Quién cobra?","Impuesto provincial."),
   ("¿Exención?","<100cc muchas provincias."),
   ("¿Pago?","Cuotas 3-5 en el año."),
   ("¿Moras?","Recargos y embargo posible."),
   ("¿Transferencia?","Sellado 1-2% valor al cambio titular."),
   ("¿Robada?","Denuncia suspende patente."),
   ("¿Usada?","Misma alícuota según antigüedad.")],
  """  const c=Number(i.cilindradaCc)||0; const p=String(i.provincia||'pba'); const v=Number(i.valorFiscal)||0;
  let aliq=0.03;
  if(c<100) aliq=0.015;
  else if(c<250) aliq=0.03;
  else if(c<500) aliq=0.04;
  else aliq=0.05;
  if(p==='caba') aliq*=1.1;
  const total=v*aliq;
  return { patenteAnual:`$${Math.round(total).toLocaleString('es-AR')}`, cuotas:'3-5 cuotas según provincia', observacion:c<100?'Puede estar exenta según provincia.':`Alícuota ${(aliq*100).toFixed(1)}% sobre valor fiscal.` };""")

M("seguro-auto-comparativa-cobertura-tipo", "vida", "🚗", "Seguro auto cobertura",
  "Comparativa tipos de cobertura auto.",
  "análisis por tipo",
  [("tipo","Tipo cobertura","select",["terceros","terceros_completo","todo_riesgo","todo_riesgo_sin_franquicia"]),("valorVehiculo","Valor vehículo $","number",20000000)],
  [("premiumAnual","Premium anual estimado",None),("cobertura","Cobertura",None),("recomendacion","Recomendación",None)],
  ["Todo riesgo $20M","~$800k/año"],"Auto nuevo",
  [("¿Terceros?","Solo daños a terceros (obligatorio)."),
   ("¿Terceros completo?","+ robo/incendio parcial tu auto."),
   ("¿Todo riesgo?","+ daños propios. Franquicia variable."),
   ("¿Sin franquicia?","Paga todo sin mínimo. Más caro."),
   ("¿Premium?","3-6% valor auto / año típico."),
   ("¿Auto 0km?","Todo riesgo casi obligatorio."),
   ("¿Auto viejo?","Terceros puede ser suficiente.")],
  """  const t=String(i.tipo||'terceros_completo'); const v=Number(i.valorVehiculo)||0;
  const rate={'terceros':0.015,'terceros_completo':0.03,'todo_riesgo':0.045,'todo_riesgo_sin_franquicia':0.06}[t];
  const prem=v*rate;
  const cob={'terceros':'Solo daños a terceros','terceros_completo':'+ robo/incendio parcial','todo_riesgo':'+ daños propios con franquicia','todo_riesgo_sin_franquicia':'+ sin franquicia'}[t];
  const rec=v>15000000?'Todo riesgo recomendado':v>5000000?'Terceros completo':'Terceros puede bastar';
  return { premiumAnual:`$${Math.round(prem).toLocaleString('es-AR')}`, cobertura:cob, recomendacion:rec };""")

M("estampillado-sellado-inmueble-pba-caba-2026", "vida", "🏠", "Sellos inmueble",
  "Sellado compraventa inmueble CABA/PBA 2026.",
  "valor × 3.6% (mitad c/u)",
  [("valor","Valor propiedad $","number",80000000),("jurisdiccion","Jurisdicción","select",["caba","pba","otra"])]  ,
  [("sellosTotal","Sellos total",None),("porParte","Por parte",None),("escrituracionTotal","Total escrituración estimado",None)],
  ["$80M CABA","$2.88M"],"+ honorarios escribano",
  [("¿Sellado?","Impuesto provincial compraventa y otros contratos."),
   ("¿Alícuota?","3.6% CABA/PBA. 2% vivienda única bajo tope."),
   ("¿Quién paga?","Mitad comprador + mitad vendedor."),
   ("¿Honorarios?","Escribano: 1-2% + IVA."),
   ("¿Impuesto ganancias?","Vendedor, si no es vivienda única familiar."),
   ("¿ITI?","Reemplazado por Impuesto Cedular de ganancia inmobiliaria."),
   ("¿Reserva?","3% adicional de garantía en fideicomiso.")],
  """  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'pba');
  const aliq=j==='otra'?0.035:0.036;
  const sellos=v*aliq; const parte=sellos/2;
  const esc=v*0.02*1.21; // honorarios + IVA
  const total=sellos+esc;
  return { sellosTotal:`$${Math.round(sellos).toLocaleString('es-AR')}`, porParte:`$${Math.round(parte).toLocaleString('es-AR')}`, escrituracionTotal:`$${Math.round(total).toLocaleString('es-AR')} (sellos + honorarios + IVA)` };""")

M("alquiler-temporal-vs-tradicional-rendimiento-neto", "vida", "🏘️", "Airbnb vs alquiler tradicional",
  "Rendimiento neto alquiler temporal vs tradicional.",
  "ingresos netos anualizados",
  [("valorPropiedad","Valor propiedad USD","number",150000),("alquilerTemporalMes","Temporal promedio USD","number",800),("alquilerTradicionalMes","Tradicional USD","number",500),("ocupacion","Ocupación temporal %","number",70)],
  [("rendimientoTemporal","Rendimiento anual temporal",None),("rendimientoTradicional","Rendimiento anual tradicional",None),("diferencia","Diferencia",None)],
  ["USD 150k, 800 vs 500, 70%","6.7%"],"+$1680/año",
  [("¿Airbnb rentable?","Depende mucho de ubicación y ocupación."),
   ("¿Ocupación?","Airbnb típico 50-80%. Tradicional 95-100%."),
   ("¿Costos temporal?","Limpieza, rotación, plataformas (15-20% comisión)."),
   ("¿Gestión?","Autogestión o empresa (20-30% comisión)."),
   ("¿Tradicional?","Más estable. Contrato mínimo."),
   ("¿Impuestos?","Ambos tributan. Temporal puede ser IVA si frecuente."),
   ("¿Ley?","Ley alquileres cambia reglas: indexación, plazo, retención.")],
  """  const v=Number(i.valorPropiedad)||0; const t=Number(i.alquilerTemporalMes)||0; const tr=Number(i.alquilerTradicionalMes)||0; const oc=Number(i.ocupacion)||70;
  const anualTemp=t*12*oc/100*0.75; // 25% costos extra
  const anualTrad=tr*12*0.9;
  const rTemp=v>0?anualTemp/v*100:0;
  const rTrad=v>0?anualTrad/v*100:0;
  const dif=anualTemp-anualTrad;
  return { rendimientoTemporal:`${rTemp.toFixed(1)}% (USD ${Math.round(anualTemp).toLocaleString('en-US')}/año)`, rendimientoTradicional:`${rTrad.toFixed(1)}% (USD ${Math.round(anualTrad).toLocaleString('en-US')}/año)`, diferencia:`${dif>=0?'+':''}USD ${Math.round(dif).toLocaleString('en-US')}/año` };""")

M("jardin-riego-litros-plantas-clima-semana", "vida", "🌱", "Riego jardín litros",
  "Litros de agua necesarios para riego semanal.",
  "m² × litros/semana",
  [("m2Jardin","m² jardín","number",50),("climaZona","Clima","select",["seco","templado","humedo"]),("tipoPlantas","Tipo","select",["cesped","hortaliza","flores","arboles"])]  ,
  [("litrosSemana","Litros semanales",None),("frecuencia","Frecuencia riego",None),("tip","Tip ahorro",None)],
  ["50 m² templado cesped","~1000 L"],"2x/semana",
  [("¿Cantidad?","Césped 20-40 L/m²/semana. Hortalizas 30-50. Flores 15-25. Árboles 25-50."),
   ("¿Clima?","Seco: +40%. Templado: base. Húmedo: -30%."),
   ("¿Mejor momento?","Temprano AM o atardecer. Evitar mediodía."),
   ("¿Goteo?","Ahorra 50-70% vs aspersión."),
   ("¿Época?","Primavera y verano: +. Invierno: bajo."),
   ("¿Suelo?","Arcilloso retiene. Arenoso drena rápido (más frecuencia)."),
   ("¿Sensor?","Humedad del suelo evita sobre-riego.")],
  """  const m=Number(i.m2Jardin)||0; const c=String(i.climaZona||'templado'); const t=String(i.tipoPlantas||'cesped');
  const basePorM2={'cesped':25,'hortaliza':40,'flores':20,'arboles':35}[t];
  const multClima={'seco':1.4,'templado':1,'humedo':0.7}[c];
  const lit=m*basePorM2*multClima;
  const freq=t==='arboles'?'2-3 veces/semana':'3-4 veces/semana';
  return { litrosSemana:`${Math.round(lit).toLocaleString('es-AR')} L`, frecuencia:freq, tip:'Goteo ahorra 50-70% vs aspersión.' };""")

M("pileta-cloro-litros-volumen-dosificacion", "vida", "🏊", "Cloro pileta",
  "Cloro necesario para tu pileta.",
  "ppm × litros",
  [("largoM","Largo m","number",8),("anchoM","Ancho m","number",4),("profundidadM","Profundidad m","number",1.5),("ppmObjetivo","ppm objetivo","number",2)],
  [("volumen","Volumen",None),("cloroGranulos","Cloro granulado (g)",None),("frecuencia","Frecuencia",None)],
  ["8×4×1.5 m, 2 ppm","48.000 L"],"96 g cloro",
  [("¿ppm?","Partes por millón. Ideal 1-3 ppm para uso casero."),
   ("¿Cloro granulado 70%?","~2 g cloro × cada 1000 L × 1 ppm."),
   ("¿Frecuencia?","Shock 1/semana. Mantenimiento diario."),
   ("¿Cuándo nadar?","Esperar 2-4 h post-shock."),
   ("¿pH?","Ideal 7.2-7.6. Afecta efectividad cloro."),
   ("¿Lluvia?","Diluye y altera pH. Revisar post-tormenta."),
   ("¿Sales?","Generador sal produce cloro continuamente.")],
  """  const l=Number(i.largoM)||0; const a=Number(i.anchoM)||0; const p=Number(i.profundidadM)||0;
  const ppm=Number(i.ppmObjetivo)||2;
  const vol=l*a*p*1000; // litros
  const cloro=vol/1000*ppm*2;
  return { volumen:`${Math.round(vol).toLocaleString('es-AR')} L`, cloroGranulos:`${Math.round(cloro)} g`, frecuencia:'Mantenimiento diario + shock semanal' };""")

M("aire-acondicionado-frigorias-m2-ambiente", "vida", "❄️", "AC frigorías por m²",
  "Frigorías necesarias según m² y orientación.",
  "100-150 fg/m²",
  [("m2","m² ambiente","number",25),("orientacion","Orientación","select",["norte_sur","este_oeste"]),("piso","Piso","select",["ultimo","intermedio"])],
  [("frigoriasRecomendadas","Frigorías recomendadas",None),("btuEquivalente","BTU equivalente",None),("observacion","Observación",None)],
  ["25 m² N/S intermedio","~3000 fg"],"12.000 BTU",
  [("¿Regla base?","100 fg/m² orientación S. Añadir por calor."),
   ("¿Oeste?","150 fg/m² (sol tarde calienta)."),
   ("¿Último piso?","+20-30% por techo."),
   ("¿Divisiones?","Ambiente integrado necesita más."),
   ("¿BTU?","1 fg ≈ 4 BTU."),
   ("¿Inverter?","Más eficiente. Sobredimensionar 10-20%."),
   ("¿Muchas personas?","+200 fg por persona adicional.")],
  """  const m=Number(i.m2)||0; const o=String(i.orientacion||'norte_sur'); const p=String(i.piso||'intermedio');
  const base=o==='este_oeste'?150:100;
  const mult=p==='ultimo'?1.25:1;
  const fg=m*base*mult;
  const btu=fg*4;
  return { frigoriasRecomendadas:`${Math.round(fg).toLocaleString('es-AR')} fg`, btuEquivalente:`${Math.round(btu).toLocaleString('es-AR')} BTU`, observacion:p==='ultimo'?'Piso último: +25% por techo':'Ambiente estándar' };""")

M("calefactor-tiro-balanceado-kcal-m2-invierno", "vida", "🔥", "Calefactor kcal/h",
  "Kcal/h necesarias para calefaccionar.",
  "kcal/h = m³ × factor",
  [("m2","m²","number",30),("alturaTecho","Altura techo m","number",2.5),("aislacion","Aislación","select",["buena","regular","mala"])]  ,
  [("kcalHora","Kcal/h recomendadas",None),("modeloSugerido","Modelo sugerido (calorías)",None),("observacion","Observación",None)],
  ["30 m² 2.5m regular","~4500 kcal/h"],"Tiro balanceado 5000",
  [("¿Fórmula?","m³ × 45-55 kcal/h para climas templados AR."),
   ("¿Aislación buena?","×40 kcal/m³. Regular ×50. Mala ×60."),
   ("¿Modelos?","2500, 3000, 4000, 5500, 7500 kcal/h."),
   ("¿Tiro balanceado?","Entrada/salida al exterior. Más seguro."),
   ("¿Cuidados?","Revisión anual obligatoria."),
   ("¿Eléctricos?","Costos altos. Solo ambientes chicos."),
   ("¿Aires calefactores?","Frigorías ≈ kcal (una relación similar).")],
  """  const m=Number(i.m2)||0; const h=Number(i.alturaTecho)||2.5; const a=String(i.aislacion||'regular');
  const factor={'buena':40,'regular':50,'mala':60}[a];
  const kcal=m*h*factor;
  const modelos=[2500,3000,4000,5500,7500]; const sug=modelos.find(x=>x>=kcal)||7500;
  return { kcalHora:`${Math.round(kcal).toLocaleString('es-AR')} kcal/h`, modeloSugerido:`${sug} kcal/h (tiro balanceado)`, observacion:a==='mala'?'Mala aislación: considerá aislar techo/ventanas':'Dimensionado correcto' };""")

M("heladera-inverter-vs-no-inverter-consumo-ahorro", "vida", "🧊", "Heladera inverter",
  "Ahorro anual: inverter vs tradicional.",
  "kWh × tarifa",
  [("kwhAnoInverter","kWh/año inverter","number",250),("kwhAnoTradicional","kWh/año tradicional","number",450),("tarifaKwh","$/kWh","number",120)],
  [("ahorroAnual","Ahorro anual",None),("amortizacion","Años amortización premium",None),("observacion","Observación",None)],
  ["250 vs 450 kWh","$24k/año"],"Premium USD 150 en 5 años",
  [("¿Inverter?","Compresor velocidad variable. Más eficiente."),
   ("¿Ahorro?","25-50% energía vs tradicional."),
   ("¿Durabilidad?","Motor inverter vida más larga (menos arranques)."),
   ("¿Costo?","Inverter premium USD 100-300 vs tradicional."),
   ("¿Ruido?","Silenciosa."),
   ("¿Etiqueta A+++?","Mejor eficiencia. Comparar kWh/año."),
   ("¿Inverter 2026?","Cada vez más estándar. Diferencia precio se reduce.")],
  """  const i_=Number(i.kwhAnoInverter)||250; const t=Number(i.kwhAnoTradicional)||450; const tarifa=Number(i.tarifaKwh)||120;
  const ahorroKwh=t-i_; const ahorroArs=ahorroKwh*tarifa*1.21;
  const premiumEstimado=150000; const anios=ahorroArs>0?premiumEstimado/ahorroArs:0;
  return { ahorroAnual:`$${Math.round(ahorroArs).toLocaleString('es-AR')} (${ahorroKwh} kWh)`, amortizacion:`~${anios.toFixed(1)} años`, observacion:'Inverter: menos ruido + vida más larga del compresor.' };""")

M("limpieza-hogar-tiempo-metros-frecuencia-total", "vida", "🧹", "Tiempo limpieza hogar",
  "Tiempo semanal de limpieza según m² hogar.",
  "min/m² según profundidad",
  [("m2Hogar","m² hogar","number",80),("profundidad","Profundidad","select",["mantenimiento","media","a_fondo"])]  ,
  [("tiempoSemanal","Tiempo semanal",None),("recomendacion","Recomendación frecuencia",None),("serviciosCosto","Servicio externo costo",None)],
  ["80 m² mantenimiento","~3 h"],"2 veces/semana",
  [("¿Minutos por m²?","Mantenimiento 1-2 min, media 3, a fondo 6."),
   ("¿Profunda?","1-2 veces al mes."),
   ("¿Externo?","$5k-15k/hora según zona y servicio."),
   ("¿Mensualmente?","30-80 hs/mes según hábitos."),
   ("¿Organización?","Zonas por día: lunes cocina, martes baños, etc."),
   ("¿Profesional?","Hogares grandes (>150 m²) considerá empleada 2x/semana."),
   ("¿Productos?","Stock: lavandina, limpiadores, paños microfibra.")],
  """  const m=Number(i.m2Hogar)||0; const p=String(i.profundidad||'mantenimiento');
  const minPorM2={'mantenimiento':2,'media':3,'a_fondo':6}[p];
  const min=m*minPorM2; const h=min/60;
  const hora=8000; const costo=h*hora;
  const rec=m<50?'1 vez/semana':m<100?'2 veces/semana':'3 veces/semana o servicio';
  return { tiempoSemanal:`${h.toFixed(1)} horas (${Math.round(min)} min)`, recomendacion:rec, serviciosCosto:`Servicio: $${Math.round(costo).toLocaleString('es-AR')}` };""")

# ============================================================
# VIAJES (15)
# ============================================================

M("presupuesto-viaje-europa-30-dias-total", "viajes", "✈️", "Viaje Europa 30 días",
  "Presupuesto total viaje Europa 30 días.",
  "aereo + hospedaje + comida + transporte",
  [("paisesPrincipales","Países","number",4),("estiloViaje","Estilo","select",["hostel","hotel_medio","hotel_alto"]),("comidasAfuera","Comidas afuera/día","number",2)],
  [("totalUsd","Total estimado",None),("porDia","Costo por día",None),("desglose","Desglose","text")],
  ["4 países hostel","USD 3000"],"USD 100/día",
  [("¿Básico?","USD 60-80/día mochilero."),
   ("¿Medio?","USD 100-150/día."),
   ("¿Alto?","USD 200+/día."),
   ("¿Europa Oriental?","Más barato (Hungría, Rep Checa)."),
   ("¿Europa Occidental?","Más caro (Suiza, UK, Escandinavia)."),
   ("¿Aéreos?","USD 800-1500 desde AR."),
   ("¿Interrail?","USD 400-700 pass mensual trenes.")],
  """  const p=Number(i.paisesPrincipales)||4; const e=String(i.estiloViaje||'hostel'); const c=Number(i.comidasAfuera)||2;
  const porDia={'hostel':70,'hotel_medio':130,'hotel_alto':230}[e];
  const hospedaje=porDia*30;
  const aereo=1200;
  const transInterno=p*80;
  const actividades=30*50;
  const totalDia=porDia+25+c*15;
  const total=aereo+transInterno+actividades+totalDia*30;
  return { totalUsd:`USD ${Math.round(total).toLocaleString('en-US')}`, porDia:`USD ${Math.round(totalDia)}`, desglose:`Aéreo USD ${aereo} + Hospedaje ${hospedaje} + Transporte ${transInterno} + Comidas ${30*c*15} + Actividades ${actividades}` };""")

M("working-holiday-australia-costo-ano", "viajes", "🇦🇺", "Working Holiday Australia",
  "Costo inicial visa Working Holiday Australia.",
  "visa + inicial + buffer",
  [("mesesPlan","Meses planeados","number",12)],
  [("costoInicial","Costo inicial necesario",None),("visaAud","Visa AUD",None),("buffer","Buffer recomendado",None)],
  ["12 meses","AUD 10-15k"],"Incluye buffer",
  [("¿Visa?","Working Holiday (417/462). Edad 18-30/35 según país."),
   ("¿Costo visa?","AUD 495 al año 2024."),
   ("¿Savings requirement?","AUD 5000 + boleto vuelta."),
   ("¿Alquiler?","AUD 200-400/semana en ciudades grandes."),
   ("¿Sueldos?","AUD 25-35/h trabajos sin calificación."),
   ("¿Health cover?","Seguro médico obligatorio."),
   ("¿Extender?","3 meses farm work = 2do año. 6 meses = 3er año.")],
  """  const m=Number(i.mesesPlan)||12;
  const visa=500; const savings=5000; const boletoVuelta=1500;
  const viviendaInicial=2000;
  const tot=visa+savings+boletoVuelta+viviendaInicial;
  return { costoInicial:`AUD ${tot.toLocaleString('en-US')}`, visaAud:`AUD 500`, buffer:`AUD 3000-5000 adicional recomendado por contingencias.` };""")

M("emigrar-espana-presupuesto-inicial-6meses", "viajes", "🇪🇸", "Emigrar España",
  "Presupuesto inicial emigrar España 6 meses.",
  "vivienda + visa + viaje + buffer",
  [("ciudad","Ciudad","select",["madrid","barcelona","valencia","sevilla","otras"])],
  [("costoInicial","Costo 6 meses",None),("alquilerMes","Alquiler mensual",None),("observaciones","Observaciones",None)],
  ["Madrid","EUR 15.000"],"1200/mes alquiler",
  [("¿Visa?","Residencia estudios, trabajo, reagrupación familiar."),
   ("¿Ciudadanía?","2 años con residencia legal para hispanoamericanos."),
   ("¿Alquiler?","Madrid/Barcelona: EUR 1000-1800/mes compartido EUR 500-800."),
   ("¿Aval?","Garantía obligatoria: aval bancario o 6 meses adelantados."),
   ("¿Trabajo?","Nie + autonomía económica para solicitarlo."),
   ("¿Health?","Padrón + seguro/cobertura pública."),
   ("¿Colchón?","3-6 meses gastos recomendado.")],
  """  const c=String(i.ciudad||'madrid');
  const alquiler={'madrid':1400,'barcelona':1500,'valencia':900,'sevilla':800,'otras':750}[c];
  const comida=400; const transporte=60;
  const mensual=alquiler+comida+transporte+300;
  const sixMonths=mensual*6+2500; // buffer
  return { costoInicial:`EUR ${Math.round(sixMonths).toLocaleString('en-US')}`, alquilerMes:`EUR ${alquiler}/mes (1 bedroom)`, observaciones:`Gastos mensuales ~EUR ${mensual}. Buffer 6 meses.` };""")

M("visa-eta-canada-argentinos-requisitos", "viajes", "🇨🇦", "Visa ETA Canadá",
  "Requisitos y tiempos Electronic Travel Authorization Canadá.",
  "eta + pasaporte",
  [("duracionViaje","Días viaje","number",14)],
  [("costoEta","Costo ETA",None),("validez","Validez",None),("requisitos","Requisitos","text")],
  ["14 días","CAD 7"],"5 años",
  [("¿ETA?","Electronic Travel Authorization. Para pasaportes argentinos desde 2022."),
   ("¿Costo?","CAD 7."),
   ("¿Duración?","5 años o hasta vencimiento pasaporte."),
   ("¿Pasaporte argentino?","Desde junio 2022 ETA en lugar de visa."),
   ("¿Trámite?","Online directo en sitio oficial. No hacerlo con intermediarios."),
   ("¿Estadía?","Hasta 6 meses por viaje."),
   ("¿Trabajo?","Requiere permiso de trabajo separado, no entra con ETA.")],
  """  const d=Number(i.duracionViaje)||14;
  return { costoEta:`CAD 7`, validez:`5 años o vencimiento pasaporte`, requisitos:'Pasaporte argentino vigente +6 meses, formulario online, tarjeta pago, correo electrónico, sin antecedentes penales recientes.' };""")

M("pasaje-aereo-millas-vs-pesos-canjear", "viajes", "🎫", "Millas vs pesos canje",
  "Conveniencia canje millas vs pago efectivo.",
  "valor_millas / precio_pesos",
  [("pasajePesos","Pasaje en pesos $","number",500000),("millasRequeridas","Millas requeridas","number",40000)],
  [("valorMilla","Valor por milla",None),("conviene","Conveniencia",None),("recomendacion","Recomendación",None)],
  ["$500k / 40k millas","$12.5/milla"],"Muy buen valor",
  [("¿Valor milla?","Referencia: $8-15 buena, $5-8 media, <$5 malo."),
   ("¿Aerolíneas Plus?","Milla típica $8-12 en vuelos cabotaje."),
   ("¿Smiles?","Milla $5-10 internacional. Promos muy buenas."),
   ("¿LATAM Pass?","Milla similar a Smiles."),
   ("¿American AAdvantage?","Milla $10-20 dependiendo ruta."),
   ("¿Cuándo canjear?","Pasajes caros (internacionales, fechas pico)."),
   ("¿Cuándo no?","Cabotaje barato, off-peak (milla sub-valorada).")],
  """  const p=Number(i.pasajePesos)||0; const m=Number(i.millasRequeridas)||1;
  const valor=p/m;
  let conv='', rec='';
  if(valor>12){conv='Muy buen valor';rec='Canjealo. Milla mejor uso.'}
  else if(valor>8){conv='Buen valor';rec='Canjear conviene.'}
  else if(valor>5){conv='Valor medio';rec='Considerar si no necesitás millas para otro viaje.'}
  else {conv='Mal valor';rec='Paga en efectivo, guardá millas para pasajes más caros.'}
  return { valorMilla:`$${valor.toFixed(2)}/milla`, conviene:conv, recomendacion:rec };""")

M("hotel-vs-airbnb-vs-hostel-noche-comparativa", "viajes", "🛏️", "Hotel vs Airbnb vs Hostel",
  "Costo/beneficio según tipo viaje.",
  "analisis por tipo",
  [("personas","Personas","number",2),("noches","Noches","number",5),("tipoViaje","Tipo","select",["solo","pareja","familia","amigos"])]  ,
  [("hostelUsd","Hostel",None),("airbnbUsd","Airbnb",None),("hotelUsd","Hotel",None),("recomendacion","Recomendación",None)],
  ["2 personas 5 noches pareja","Airbnb: USD 400"],"Mejor para pareja",
  [("¿Hostel?","Económico, mochileros. Compartido."),
   ("¿Airbnb?","Casa/depto. Cocina. Mejor grupos."),
   ("¿Hotel?","Servicios, seguridad, profesional."),
   ("¿Pareja?","Airbnb con cocina puede ser mejor valor."),
   ("¿Familia?","Airbnb multihabitación."),
   ("¿Amigos?","Airbnb grande, o hostel privado grupo."),
   ("¿Solo?","Hostel mejor para socializar.")],
  """  const p=Number(i.personas)||1; const n=Number(i.noches)||1; const t=String(i.tipoViaje||'pareja');
  const hostel=n*25*p; const airbnb=n*80*(p>2?1.3:1); const hotel=n*120*(p>1?1:0.7);
  const recMap={'solo':'Hostel','pareja':'Airbnb','familia':'Airbnb','amigos':'Airbnb grande o hostel grupo'};
  return { hostelUsd:`USD ${hostel}`, airbnbUsd:`USD ${Math.round(airbnb)}`, hotelUsd:`USD ${Math.round(hotel)}`, recomendacion:recMap[t] };""")

M("seguro-viaje-dias-continente-edad-cotizador", "viajes", "🏥", "Seguro viaje cotizador",
  "Estimación seguro viaje según destino.",
  "tarifa diaria × días",
  [("dias","Días viaje","number",14),("continente","Continente","select",["sudamerica","norteamerica","europa","asia","oceania"]),("edad","Edad","number",35)]  ,
  [("premiumTotal","Premium total",None),("porDia","Por día",None),("cobertura","Cobertura recomendada",None)],
  ["14 días Europa 35a","~USD 80"],"Schengen USD 40k",
  [("¿Obligatorio?","Schengen: sí, USD 30k+. Resto: recomendado."),
   ("¿Edad?","+65 premium más caro. +75 muy caro."),
   ("¿Continente?","USA, Canadá, Japón: más caros (hospitales caros)."),
   ("¿Cobertura?","Médica USD 30-60k. Equipaje USD 1-2k."),
   ("¿Preexistencias?","Declararlas o quedan sin cobertura."),
   ("¿Mochilero?","Cobertura para deportes de riesgo adicional."),
   ("¿Comparar?","Assist Card, Universal Assistance, Global Rescue, etc.")],
  """  const d=Number(i.dias)||0; const c=String(i.continente||'europa'); const e=Number(i.edad)||30;
  const tarifaDiaria={'sudamerica':3,'norteamerica':6,'europa':5,'asia':5,'oceania':7}[c];
  const multEdad=e<65?1:e<75?1.5:2.5;
  const tot=d*tarifaDiaria*multEdad;
  return { premiumTotal:`USD ${Math.round(tot)}`, porDia:`USD ${Math.round(tot/d)}`, cobertura:c==='europa'?'Schengen: USD 30-40k médico obligatorio.':c==='norteamerica'?'Mínimo USD 100k (USA muy caro).':'USD 30-60k recomendado' };""")

M("millaje-frecuente-aerolineas-argentinas-programas", "viajes", "✈️", "Millas aerolíneas AR",
  "Millas programas Smiles, Aerolíneas Plus, LATAM Pass.",
  "millas por USD volado",
  [("programa","Programa","select",["aerolineas_plus","smiles","latam_pass","american"]),("kmVuelo","Km vuelo","number",10000),("clase","Clase","select",["economica","business"])]  ,
  [("millasGanadas","Millas ganadas",None),("valorEstimado","Valor estimado",None),("categoria","Categoría",None)],
  ["Smiles 10k km economy","5000 millas"],"~USD 75",
  [("¿Programas AR?","Aerolíneas Plus, Smiles (GOL), LATAM Pass."),
   ("¿American AR?","Alianza con Aerolíneas (oneworld)."),
   ("¿Acumular?","Vuelos, tarjetas de crédito con bonificaciones."),
   ("¿Categorías elite?","Gold, Platinum. Beneficios: priority boarding, equipaje extra, salas VIP."),
   ("¿Expirar?","Sí, muchas expiran. Actividad mínima requerida."),
   ("¿Mejor programa?","Smiles: buenas promos. LATAM Pass: buen upgrade availability."),
   ("¿Status match?","Transferir status entre programas con prueba.")],
  """  const p=String(i.programa||'smiles'); const k=Number(i.kmVuelo)||0; const c=String(i.clase||'economica');
  const multPrograma={'aerolineas_plus':0.5,'smiles':0.5,'latam_pass':0.6,'american':0.7}[p];
  const multClase=c==='business'?2.5:1;
  const millas=k*multPrograma*multClase;
  const valor=millas*0.015;
  return { millasGanadas:`${Math.round(millas).toLocaleString('en-US')}`, valorEstimado:`USD ${valor.toFixed(0)}`, categoria:'Económica estándar. Elite: 2-3x.' };""")

M("jet-lag-zonas-horarias-adaptacion-dias", "viajes", "🕐", "Jet lag adaptación",
  "Días para adaptarse al jet lag.",
  "horas / 1.5 días",
  [("diferenciaHoras","Diferencia horaria (+/-)","number",6),("direccion","Dirección","select",["este","oeste"])]  ,
  [("diasAdaptacion","Días adaptación",None),("severidad","Severidad",None),("tips","Tips","text")],
  ["6 horas este","4 días"],"Más severo hacia este",
  [("¿Fórmula?","1 día cada 1-1.5 h diferencia. Hacia este más difícil."),
   ("¿Por qué?","Reloj biológico (circadiano) ~24.2 horas natural."),
   ("¿Oeste?","Más fácil (alargar día)."),
   ("¿Este?","Más difícil (acortar día)."),
   ("¿Tips?","Luz solar en AM del destino. Melatonina 0.5-1 mg."),
   ("¿Alimentación?","Ayunar antes + comida del nuevo horario."),
   ("¿Alcohol/cafe?","Evitar 6 h antes de dormir destino.")],
  """  const h=Math.abs(Number(i.diferenciaHoras)||0); const d=String(i.direccion||'este');
  const dias=d==='este'?Math.ceil(h/1.25):Math.ceil(h/2);
  const severidad=h<=3?'Leve':h<=6?'Medio':h<=9?'Alto':'Muy alto';
  return { diasAdaptacion:`${dias} días`, severidad:severidad, tips:`${d==='este'?'Este: más duro':'Oeste: más fácil'}. Melatonina 0.5-1 mg 30 min antes hora objetivo. Luz solar AM destino. Ayunar vuelo + comer horario nuevo.` };""")

M("equipaje-mano-bodega-peso-volumen-aerolinea", "viajes", "🧳", "Equipaje límites",
  "Límites típicos de equipaje por aerolínea.",
  "tabla aerolíneas",
  [("aerolinea","Aerolínea","select",["aerolineas_ar","latam","gol","american","iberia","emirates"]),("tipo","Tipo","select",["mano","bodega_economica","bodega_business"])]  ,
  [("peso","Peso permitido",None),("medidas","Medidas",None),("costoExceso","Costo exceso",None)],
  ["Aerolíneas AR mano","8 kg"],"55×35×25",
  [("¿Aerolíneas AR?","Mano 8 kg + personal. Bodega economía 23 kg."),
   ("¿LATAM?","Mano 8 kg. Bodega depende tarifa (10-32 kg)."),
   ("¿Emirates?","Mano 7 kg. Bodega 30-35 kg economy."),
   ("¿Low cost?","JetSmart/Flybondi: todo aparte del básico (incluso mano)."),
   ("¿Líquidos?","Cabina: envases <100 mL, bolsa transparente."),
   ("¿Litio baterías?","Siempre en cabina, prohibido bodega."),
   ("¿Exceso peso?","USD 10-30/kg típicamente.")],
  """  const a=String(i.aerolinea||'aerolineas_ar'); const t=String(i.tipo||'mano');
  const pesos={'aerolineas_ar':{mano:8,bodega_economica:23,bodega_business:32},'latam':{mano:8,bodega_economica:23,bodega_business:32},'gol':{mano:10,bodega_economica:23,bodega_business:32},'american':{mano:10,bodega_economica:23,bodega_business:32},'iberia':{mano:10,bodega_economica:23,bodega_business:32},'emirates':{mano:7,bodega_economica:30,bodega_business:40}};
  const p=pesos[a][t];
  const med=t==='mano'?'55×35×25 cm':'158 cm lineales (largo+ancho+alto)';
  return { peso:`${p} kg`, medidas:med, costoExceso:`USD 10-30/kg exceso` };""")

M("propina-pais-porcentaje-costumbre-cultural", "viajes", "💰", "Propina por país",
  "Propina por país (%).",
  "guía propinas",
  [("pais","País","select",["eeuu","europa","japon","mexico","brasil","argentina","uk","australia"])],
  [("porcentajeSugerido","% sugerido",None),("costumbre","Costumbre",None),("nota","Nota",None)],
  ["USA","18-20%"],"Esencial",
  [("¿USA?","18-22% obligatorio en restaurants. Mesero vive de propinas."),
   ("¿Japón?","0%. Considerado ofensivo."),
   ("¿Europa?","5-10% si no está incluido. 0% si dice 'servizio'."),
   ("¿Argentina?","10% estándar. Algunos no dejan nada."),
   ("¿Brasil?","10% suele estar incluido. Verificar recibo."),
   ("¿UK?","10-15% si no está en cuenta. 0% pub para cerveza."),
   ("¿Australia?","0-10%. No obligatorio.")],
  """  const p=String(i.pais||'eeuu');
  const data={'eeuu':{pct:'18-22%',cost:'Esencial. Sueldos bajos + propinas.',nota:'Ubers 15-20%. Taxis 15%.'},'europa':{pct:'5-10%',cost:'Opcional. Verificar si está incluido.',nota:'Italia/Francia: 5%. Alemania: redondear.'},'japon':{pct:'0%',cost:'No aceptada. Considerada ofensiva.',nota:'Servicio ya incluido en cultura.'},'mexico':{pct:'10-15%',cost:'Estándar.',nota:'15% si buen servicio.'},'brasil':{pct:'10%',cost:'Suele estar incluido.',nota:'Verificar recibo "10% serviço".'},'argentina':{pct:'10%',cost:'Opcional pero esperada.',nota:'Redondear si no es redondo.'},'uk':{pct:'10-15%',cost:'Si no está en cuenta.',nota:'Pubs: 0%. Taxis: redondear.'},'australia':{pct:'0-10%',cost:'No obligatoria.',nota:'Solo si muy buen servicio.'}};
  const d=data[p];
  return { porcentajeSugerido:d.pct, costumbre:d.cost, nota:d.nota };""")

M("tarjeta-prepaga-viaje-comisiones-tipo", "viajes", "💳", "Tarjeta prepaga viaje",
  "Comisiones tarjetas prepagas viaje.",
  "análisis por tipo",
  [("tipo","Tipo","select",["ar_usd_prepaga","ar_visa_internacional","wise","payoneer","revolut"]),("montoUsdCargar","Monto USD cargar","number",500)]  ,
  [("comisionCarga","Comisión carga",None),("cambioUsd","Tipo cambio",None),("recomendacion","Recomendación",None)],
  ["Wise USD 500","0.5%"],"Mejor para viajes",
  [("¿Wise?","Antes TransferWise. Low fees, cambio real."),
   ("¿Payoneer?","Orientada freelance. Comisiones medias."),
   ("¿Revolut?","Digital bank. No en AR directamente."),
   ("¿Prepagas AR?","Brubank, Ualá permiten USD."),
   ("¿Visa/Master int?","Tarjetas tradicionales con recargo ~3%."),
   ("¿Cash vs tarjeta?","Combinar. Evitar depender solo de una."),
   ("¿ATM extracción?","USD 3-8 por operación típicamente.")],
  """  const t=String(i.tipo||'wise'); const m=Number(i.montoUsdCargar)||0;
  const comisiones={'ar_usd_prepaga':0.02,'ar_visa_internacional':0.03,'wise':0.005,'payoneer':0.02,'revolut':0.005};
  const com=m*comisiones[t];
  const rec=t==='wise'||t==='revolut'?'Mejor opción: baja comisión + cambio real':'Moderada. Comparar opciones.';
  return { comisionCarga:`USD ${com.toFixed(2)} (${(comisiones[t]*100).toFixed(2)}%)`, cambioUsd:t==='wise'||t==='revolut'?'Cambio interbancario real':'Tipo cambio con markup 2-3%', recomendacion:rec };""")

M("impuesto-pais-pasaje-avion-internacional", "viajes", "🧾", "Impuesto PAIS pasaje",
  "Impuesto PAIS sobre pasaje internacional.",
  "pasaje × 30%",
  [("pasajeUsd","Pasaje USD","number",1200),("impuestoPais","Impuesto PAIS %","number",30),("percepcion","Percepción %","number",45)],
  [("impuestoTotal","Impuestos totales",None),("costoFinal","Costo final USD",None),("recuperoPosible","Recupero posible",None)],
  ["USD 1200","USD 1200 + USD 900"],"Total USD 2100",
  [("¿Impuesto PAIS?","30% sobre pasajes internacionales vendidos en AR."),
   ("¿Percepción Ganancias?","45% adicional."),
   ("¿Total?","75% sobre el valor original."),
   ("¿Recupero?","Percepción recuperable en DDJJ Ganancias/BP."),
   ("¿Comprar afuera?","Posible si tenés cuenta en el exterior."),
   ("¿Monotributistas?","Ajuste en DDJJ anual."),
   ("¿Paquete turístico?","También grava.")],
  """  const p=Number(i.pasajeUsd)||0; const pais=Number(i.impuestoPais)||30; const per=Number(i.percepcion)||45;
  const impPais=p*pais/100; const impPer=p*per/100; const total=impPais+impPer; const fin=p+total;
  return { impuestoTotal:`USD ${total.toFixed(2)} (${(pais+per)}%)`, costoFinal:`USD ${fin.toFixed(2)}`, recuperoPosible:`USD ${impPer.toFixed(2)} (percepción recuperable en DDJJ)` };""")

M("reintegro-iva-turistas-extranjeros-argentina", "viajes", "🔄", "Reintegro IVA turistas",
  "Reintegro IVA turistas extranjeros visitando AR.",
  "monto × 21% IVA",
  [("compraUsd","Monto compras USD","number",500)],
  [("ivaReintegrable","IVA reintegrable",None),("procedimiento","Procedimiento","text"),("observacion","Observación",None)],
  ["USD 500","USD 105"],"21% del total",
  [("¿Quién?","Turistas no residentes en AR."),
   ("¿Qué?","Productos artesanales y hoteles >USD 30 con factura A."),
   ("¿Dónde?","Sellado en Aduana al salir país."),
   ("¿Mínimo?","ARS 70 de IVA (aproximado)."),
   ("¿Forma?","Transferencia a tarjeta o cuenta del turista."),
   ("¿Facturas?","A nombre del pasaporte del visitante."),
   ("¿Plazo?","Hasta 90 días desde la compra.")],
  """  const m=Number(i.compraUsd)||0;
  const iva=m*0.21/1.21;
  return { ivaReintegrable:`USD ${iva.toFixed(2)}`, procedimiento:'1) Factura A con pasaporte. 2) Sellado Aduana salida. 3) Reintegro vía TaxFree o transferencia.', observacion:'Solo productos artesanales AR + hoteles. Mínimo ARS 70 IVA por factura.' };""")

# ============================================================
# TRABAJO REMOTO (15)
# ============================================================

M("tarifa-freelance-dolar-experiencia-hora", "finanzas", "💻", "Tarifa freelance USD/hora",
  "Tarifa por hora freelance según experiencia y área.",
  "rango USD/h",
  [("experienciaAnos","Años experiencia","number",5),("area","Área","select",["frontend","backend","fullstack","devops","data","design","pm","marketing"])]  ,
  [("rangoHora","Rango USD/h",None),("promedioMensual","Mensual 40h/sem",None),("observacion","Observación",None)],
  ["5 años fullstack","USD 50-80/h"],"USD 8000-13000/mes",
  [("¿Junior?","0-2 años. USD 15-30/h."),
   ("¿Mid?","2-5 años. USD 30-60/h."),
   ("¿Senior?","5-10 años. USD 50-100/h."),
   ("¿Principal?","10+ años. USD 80-150+/h."),
   ("¿Área?","Data/ML/DevOps suele pagar más que frontend."),
   ("¿Timezone?","LATAM compite con India. US time = mejor tarifa."),
   ("¿Plataforma?","Upwork comisión 10-20%. Toptal selecciona y paga bien.")],
  """  const a=Number(i.experienciaAnos)||0; const ar=String(i.area||'fullstack');
  const base=a<2?20:a<5?40:a<10?70:110;
  const mult={'frontend':1,'backend':1.1,'fullstack':1.15,'devops':1.3,'data':1.35,'design':1,'pm':1.2,'marketing':0.9}[ar];
  const rate=Math.round(base*mult);
  const rateMax=Math.round(rate*1.5);
  const mes=rate*160;
  return { rangoHora:`USD ${rate}-${rateMax}/h`, promedioMensual:`USD ${mes.toLocaleString('en-US')}/mes (160h)`, observacion:`${a} años en ${ar}: rango ${rate}-${rateMax} USD/h típico mercado internacional.` };""")

M("impuestos-freelance-usa-argentina-doble", "finanzas", "🌎", "Impuestos freelance USA→AR",
  "Impuestos pagar freelance argentino cobrando USA.",
  "AR impuestos (no US)",
  [("facturacionAnualUsd","Facturación anual USD","number",60000)],
  [("impuestoAr","Impuesto AR estimado",None),("tasaEfectiva","Tasa efectiva",None),("observacion","Observación",None)],
  ["USD 60k/año","USD ~18k"],"30% efectivo",
  [("¿Paga USA?","Normalmente no (W-8BEN declarás no-residente)."),
   ("¿Monotributo?","Hasta ~USD 75k anuales (varía año)."),
   ("¿Responsable inscripto?","Si pasás monotributo. IVA + Ganancias + IIBB."),
   ("¿Ganancias?","15-35% escala."),
   ("¿IIBB?","1-5% según jurisdicción y actividad."),
   ("¿Aporte?","Monotributo incluye. RI: jubilación + OS aparte."),
   ("¿Contador?","Muy recomendable para RI.")],
  """  const f=Number(i.facturacionAnualUsd)||0;
  const arsFact=f*1200;
  let imp=0;
  if(arsFact<72000000){imp=arsFact*0.08} // monotributo
  else {imp=arsFact*0.3} // IVA + ganancias + IIBB aprox
  const tasa=arsFact>0?(imp/arsFact*100):0;
  return { impuestoAr:`USD ${Math.round(imp/1200).toLocaleString('en-US')}`, tasaEfectiva:`${tasa.toFixed(1)}%`, observacion:arsFact<72000000?'Monotributo Categoría alta.':'Responsable Inscripto. Consultá contador.' };""")

M("upwork-freelancer-comision-neta-argentina", "finanzas", "🌐", "Upwork comisión neta",
  "Neto que recibís de Upwork/Freelancer.",
  "bruto × (1 - comisión)",
  [("brutoHora","Bruto USD/h","number",50),("horasMes","Horas/mes","number",160),("plataforma","Plataforma","select",["upwork","freelancer","toptal","fiverr","direct"])]  ,
  [("netoMensual","Neto mensual",None),("comision","Comisión total",None),("observacion","Observación",None)],
  ["USD 50/h 160h Upwork","USD 7200"],"10% comisión",
  [("¿Upwork?","Primer USD 500: 20%. USD 500-10k: 10%. USD 10k+: 5%."),
   ("¿Freelancer?","10% o USD 5 (el mayor)."),
   ("¿Toptal?","Comisión del empleador, vos ves tu monto."),
   ("¿Fiverr?","20%."),
   ("¿Direct?","0% pero buscás clientes solo."),
   ("¿Recibir en AR?","Payoneer, Deel, Wise."),
   ("¿Impuestos?","Sobre bruto. Monotributo o RI.")],
  """  const b=Number(i.brutoHora)||0; const h=Number(i.horasMes)||0; const p=String(i.plataforma||'upwork');
  const comRates={'upwork':0.1,'freelancer':0.1,'toptal':0,'fiverr':0.2,'direct':0};
  const bruto=b*h; const comision=bruto*comRates[p]; const neto=bruto-comision;
  return { netoMensual:`USD ${Math.round(neto).toLocaleString('en-US')}`, comision:`USD ${Math.round(comision).toLocaleString('en-US')} (${(comRates[p]*100).toFixed(0)}%)`, observacion:p==='toptal'?'Toptal: no te cobra comisión directa.':`Neto USD ${Math.round(neto).toLocaleString('en-US')}/mes.` };""")

M("horas-facturables-empleado-vs-freelance-comparativa", "finanzas", "⏱️", "Empleado vs Freelance",
  "Ingreso anual: empleado vs freelance.",
  "sueldo vs facturación neta",
  [("sueldoBrutoMensual","Sueldo bruto mensual $","number",1500000),("tarifaHoraFree","Tarifa hora freelance USD","number",50),("horasFacturablesMes","Horas facturables/mes","number",120),("dolarMep","Dólar MEP","number",1200)]  ,
  [("empleadoAnual","Empleado anual neto",None),("freelanceAnual","Freelance anual neto",None),("diferencia","Diferencia",None)],
  ["$1.5M vs USD 50/h 120h","Empleado $15.5M"],"Freelance $51M",
  [("¿Empleado?","Sueldo fijo + aguinaldo + vacaciones + beneficios."),
   ("¿Freelance?","Sin límite pero sin estabilidad."),
   ("¿Sueldo bruto?","Descuentos 17% + ganancias según escala."),
   ("¿Horas facturables?","80-120 típicas. Resto es prospecting, admin."),
   ("¿Obra social?","Empleado incluida. Freelance aparte."),
   ("¿Jubilación?","Empleado aportes automáticos. Freelance monotributo."),
   ("¿Vacaciones?","Empleado paga. Freelance no facturás = no cobrás.")],
  """  const s=Number(i.sueldoBrutoMensual)||0; const th=Number(i.tarifaHoraFree)||0; const hf=Number(i.horasFacturablesMes)||0; const d=Number(i.dolarMep)||1;
  const empleadoAnual=(s*0.75)*13; // neto aportes + aguinaldo
  const brutoFree=th*hf*12;
  const freelanceAnualUsd=brutoFree*0.7; // comisiones + imp
  const freelanceAnualArs=freelanceAnualUsd*d;
  const dif=freelanceAnualArs-empleadoAnual;
  return { empleadoAnual:`$${Math.round(empleadoAnual).toLocaleString('es-AR')}`, freelanceAnual:`$${Math.round(freelanceAnualArs).toLocaleString('es-AR')}`, diferencia:`${dif>=0?'+':''}$${Math.round(dif).toLocaleString('es-AR')}` };""")

M("sueldo-dolarizado-vs-pesos-argentina-comparativa", "finanzas", "💱", "Sueldo USD vs pesos",
  "Sueldo en USD vs pesos argentinos.",
  "sueldo × cotización",
  [("sueldoUsdMensual","Sueldo USD","number",3000),("sueldoArsMensual","Sueldo ARS","number",2000000),("cotMep","Dólar MEP","number",1200)]  ,
  [("usdEnPesos","USD en pesos hoy",None),("diferencia","Diferencia",None),("recomendacion","Recomendación",None)],
  ["USD 3k vs $2M","$3.6M"],"+80%",
  [("¿Por qué USD mejor?","Indexado. No pierde con inflación."),
   ("¿Por qué pesos?","Si ajustás a paritaria, puede ser mejor."),
   ("¿Mixto?","Algunas empresas pagan % USD + % pesos."),
   ("¿Modalidad?","USD bolsa, USD cash, USD cuenta comitente, USD en exterior."),
   ("¿Impuestos?","USD tributa en AR (Ganancias + Bienes Personales)."),
   ("¿Retención?","Tarjeta empresa: perceptivo. Cash: declarado."),
   ("¿Relocation?","Exterior: solo relaciones remote con contrato offshore.")],
  """  const u=Number(i.sueldoUsdMensual)||0; const a=Number(i.sueldoArsMensual)||0; const c=Number(i.cotMep)||1;
  const usdEnArs=u*c; const dif=usdEnArs-a;
  const rec=usdEnArs>a?`USD conviene: $${Math.round(dif).toLocaleString('es-AR')} más`:`Pesos conviene: $${Math.abs(Math.round(dif)).toLocaleString('es-AR')} más`;
  return { usdEnPesos:`$${Math.round(usdEnArs).toLocaleString('es-AR')}`, diferencia:`${dif>=0?'+':''}$${Math.round(dif).toLocaleString('es-AR')} (${((dif/a)*100).toFixed(0)}%)`, recomendacion:rec };""")

M("visa-nomada-digital-portugal-espana", "viajes", "🇵🇹", "Visa nómada digital",
  "Requisitos visa nómada digital Portugal/España.",
  "ingresos mínimos + docs",
  [("pais","País","select",["portugal","espana","estonia","croacia"])],
  [("ingresoMinimoMes","Ingreso mensual mínimo",None),("duracion","Duración visa",None),("requisitos","Requisitos principales","text")],
  ["Portugal","EUR 3040/mes"],"1-5 años",
  [("¿Portugal D8?","EUR 3040/mes (4x salario mínimo). Válida 1-2 años renovable."),
   ("¿España?","EUR 2640/mes. Lanzada 2023. Válida 1-3 años."),
   ("¿Estonia?","EUR 4500/mes. Pionera en e-residency."),
   ("¿Croacia?","EUR 2300/mes. Buen lifestyle Mediterráneo."),
   ("¿Impuestos?","Variable. Algunos tienen régimen favorable."),
   ("¿Familia?","Se puede incluir dependientes."),
   ("¿Schengen?","Mayoría incluyen acceso Schengen.")],
  """  const p=String(i.pais||'portugal');
  const data={'portugal':{ing:3040,dur:'1-2 años renovable',req:'Ingresos 4x salario mínimo pt, seguro médico, antecedentes penales, alquiler pt.'},'espana':{ing:2640,dur:'1-3 años',req:'Ingresos 2x SMI, contrato remoto +1 año antigüedad, seguro médico.'},'estonia':{ing:4500,dur:'1 año',req:'Ingresos altos, trabajo remoto, no para ciudadanos UE.'},'croacia':{ing:2300,dur:'1 año',req:'Ingresos suficientes, seguro médico, alojamiento hr.'}};
  const d=data[p];
  return { ingresoMinimoMes:`EUR ${d.ing}/mes`, duracion:d.dur, requisitos:d.req };""")

M("productividad-pomodoro-sesiones-dia-efectivas", "educacion", "🍅", "Pomodoro sesiones",
  "Sesiones Pomodoro efectivas en un día.",
  "25 min × 4 ciclos",
  [("horasDisponibles","Horas disponibles","number",8)],
  [("sesionesMax","Sesiones Pomodoro máx",None),("tiempoEfectivo","Tiempo efectivo trabajo",None),("recomendacion","Recomendación",None)],
  ["8 horas","~12 sesiones"],"5 h efectivas",
  [("¿Pomodoro?","25 min trabajo + 5 min pausa. Cada 4: pausa 15-30 min."),
   ("¿Por qué funciona?","Atención focalizada + pausas activas reducen fatiga."),
   ("¿Variante?","52/17 Draugiem Group. 90 min Ultradian rhythms."),
   ("¿Sólo trabajo?","No admitir distracciones. Modo avión."),
   ("¿Tracking?","Apps como Focus Keeper, Forest, Tomato Timer."),
   ("¿Límite?","10-12 Pomodoros al día es techo sostenible."),
   ("¿Tareas grandes?","Dividí en chunks de 1 Pomodoro cada uno.")],
  """  const h=Number(i.horasDisponibles)||8;
  const minTotales=h*60;
  const cicloCompleto=120; // 4×(25+5) + 30 pausa larga
  const ciclos=Math.floor(minTotales/cicloCompleto);
  const sesiones=ciclos*4+Math.floor((minTotales%cicloCompleto)/30);
  const efectivo=sesiones*25;
  return { sesionesMax:`${sesiones} Pomodoros`, tiempoEfectivo:`${(efectivo/60).toFixed(1)} horas efectivas`, recomendacion:sesiones<8?'Sostenible':'Considerá no más de 10 por día para mantener calidad.' };""")

M("reuniones-costo-tiempo-personas-empresa", "finanzas", "📅", "Costo reuniones",
  "Costo de una reunión según asistentes.",
  "horas × sueldo/h × personas",
  [("personas","Asistentes","number",8),("duracionMin","Duración min","number",60),("sueldoPromedioMes","Sueldo prom mensual $","number",2000000)]  ,
  [("costoReunion","Costo",None),("porHora","Por hora/persona",None),("observacion","Observación",None)],
  ["8 pers 60 min $2M","~$12k"],"Caro, simplificar",
  [("¿Cálculo?","Horas × sueldo/h × personas."),
   ("¿Sueldo/h?","Mensual / 176 horas."),
   ("¿Meeting hidden cost?","Suman a ~30% horas de trabajo en empresas."),
   ("¿Reducir?","Agenda clara, 30 min máx, decisión clara."),
   ("¿Async?","Slack/Linear para no bloquear calendario."),
   ("¿Standups?","15 min diario puede ser más valor que 1h semanal."),
   ("¿Retrospectiva?","Mensual/quincenal. Calendarizada.")],
  """  const p=Number(i.personas)||0; const d=Number(i.duracionMin)||0; const s=Number(i.sueldoPromedioMes)||0;
  const sHora=s/176;
  const horas=d/60;
  const costo=p*horas*sHora;
  return { costoReunion:`$${Math.round(costo).toLocaleString('es-AR')}`, porHora:`$${Math.round(sHora).toLocaleString('es-AR')}/persona/h`, observacion:costo>50000?'Caro — evalúa si async puede reemplazar.':'Razonable' };""")

M("burnout-indice-carga-laboral-test-mbi", "salud", "🔥", "Burnout índice MBI",
  "Indicadores de burnout (Maslach Burnout Inventory simplificado).",
  "test MBI",
  [("cansancioEmocional","Cansancio (1-10)","number",6),("despersonalizacion","Cinismo (1-10)","number",5),("realizacionPersonal","Realización (1-10)","number",5)],
  [("nivel","Nivel burnout",None),("interpretacion","Interpretación",None),("recomendacion","Recomendación",None)],
  ["CE 6 DP 5 RP 5","Moderado"],"Intervención recomendada",
  [("¿MBI?","Escala estándar de 22 ítems. Acá simplificado a 3 dimensiones."),
   ("¿Dimensiones?","Cansancio emocional + despersonalización + baja realización."),
   ("¿Niveles?","Alto CE + alto DP + baja RP = burnout clásico."),
   ("¿Intervenir?","Descansar + límites + asesoría psicológica."),
   ("¿Físico?","Síntomas: insomnio, cefaleas, tensión muscular."),
   ("¿Trabajo?","Causas: sobrecarga, falta autonomía, conflictos valores."),
   ("¿Profesional?","Psicología laboral / RRHH.")],
  """  const ce=Number(i.cansancioEmocional)||0; const dp=Number(i.despersonalizacion)||0; const rp=Number(i.realizacionPersonal)||0;
  const burnout=(ce+dp+(10-rp))/3;
  let nivel='', interp='', rec='';
  if(burnout<4){nivel='Bajo';interp='Sin signos burnout';rec='Mantené hábitos saludables'}
  else if(burnout<6){nivel='Moderado';interp='Señales iniciales';rec='Descanso + asesoría. Establecer límites laborales.'}
  else if(burnout<8){nivel='Alto';interp='Burnout claro';rec='Licencia preventiva + tratamiento psicológico'}
  else {nivel='Severo';interp='Crisis';rec='Intervención urgente. No trabajar hasta estabilizar.'}
  return { nivel:nivel, interpretacion:interp, recomendacion:rec };""")

M("tiempo-aprender-idioma-horas-semana-nivel", "educacion", "🗣️", "Tiempo aprender idioma",
  "Horas necesarias para nivel B2 en idioma.",
  "FSI/CEFR guidelines",
  [("idioma","Idioma","select",["ingles","portugues","italiano","frances","aleman","japones","mandarin","arabe"]),("horasSemana","Horas/semana","number",8),("nivelActual","Nivel actual","select",["cero","a1","a2","b1"])]  ,
  [("semanasB2","Semanas hasta B2",None),("horasTotales","Horas totales",None),("consejo","Consejo",None)],
  ["Inglés 8 h/sem desde cero","~100 semanas"],"750 horas",
  [("¿FSI?","Foreign Service Institute clasifica dificultades."),
   ("¿Fáciles?","Cat I: francés, italiano, portugués (600-750 h)."),
   ("¿Medias?","Cat II: alemán (900 h), indonesio, suajili (1100 h)."),
   ("¿Difíciles?","Cat IV: japonés, mandarin, árabe (2200 h)."),
   ("¿Niveles?","A1 100h, A2 200h, B1 400h, B2 600-800h, C1 1000+."),
   ("¿Consistencia?","8 h/semana > 20 h/mes concentradas."),
   ("¿Inmersión?","Acelera 3-5x (viajar al país).")],
  """  const l=String(i.idioma||'ingles'); const h=Number(i.horasSemana)||1; const n=String(i.nivelActual||'cero');
  const horasB2={'ingles':700,'portugues':600,'italiano':650,'frances':650,'aleman':900,'japones':2200,'mandarin':2200,'arabe':2200}[l];
  const descuento={'cero':0,'a1':100,'a2':250,'b1':450}[n];
  const restante=horasB2-descuento;
  const semanas=Math.ceil(restante/h);
  return { semanasB2:`${semanas} semanas (${(semanas/52).toFixed(1)} años)`, horasTotales:`${restante} horas restantes`, consejo:l==='japones'||l==='mandarin'?'Idioma difícil: priorizar inmersión o apps como Anki.':'Consistencia > intensidad. 1 hora diaria > 7 h un solo día.' };""")

M("estimador-sueldo-programador-stack-argentina", "finanzas", "💻", "Sueldo programador stack",
  "Sueldo según stack y seniority en AR.",
  "mercado AR 2026",
  [("seniority","Seniority","select",["junior","semisenior","senior","tech_lead","staff"]),("stack","Stack","select",["frontend_react","backend_node","fullstack","devops","data_ml","mobile","blockchain"])]  ,
  [("sueldoArs","Sueldo ARS local",None),("sueldoUsd","Sueldo USD remote",None),("observacion","Observación",None)],
  ["Senior fullstack","$3.5-5M"],"USD 5-8k remote",
  [("¿Junior?","0-2 años. $800k-1.8M AR. USD 1.5-3k remote."),
   ("¿Semi-senior?","2-4 años. $1.8-3M AR. USD 3-5k."),
   ("¿Senior?","4-8 años. $3-5M. USD 5-9k."),
   ("¿Tech Lead?","8-12 años + gestión. $5-8M. USD 8-15k."),
   ("¿Staff/Principal?","12+ años. $8M+. USD 15-25k+."),
   ("¿Data/ML?","+20-30% sobre fullstack."),
   ("¿DevOps?","+15-25% por demanda/escasez.")],
  """  const s=String(i.seniority||'semisenior'); const st=String(i.stack||'fullstack');
  const base={'junior':1200000,'semisenior':2400000,'senior':4000000,'tech_lead':6500000,'staff':10000000}[s];
  const mult={'frontend_react':1,'backend_node':1.05,'fullstack':1.1,'devops':1.25,'data_ml':1.3,'mobile':1.1,'blockchain':1.4}[st];
  const ars=Math.round(base*mult);
  const usd=Math.round(ars/1200*1.5); // remote paga más
  return { sueldoArs:`$${Math.round(ars*0.85).toLocaleString('es-AR')}-${ars.toLocaleString('es-AR')}`, sueldoUsd:`USD ${Math.round(usd*0.8).toLocaleString('en-US')}-${usd.toLocaleString('en-US')}`, observacion:`${s} ${st} en AR. Remote internacional paga 40-80% más.` };""")

M("cofundador-equity-split-startup-justo", "negocios", "🤝", "Equity split cofundadores",
  "Split justo entre cofundadores.",
  "factores ponderados",
  [("cantidadFounders","Cantidad fundadores","number",2),("tiempoCompletoRelativo","Tu dedicación (1-10)","number",10),("ideaOriginal","¿Idea tuya?","select",["si","no","compartida"])]  ,
  [("porcentajeSugerido","Tu % sugerido",None),("recomendacion","Recomendación",None),("consejo","Consejo",None)],
  ["2 founders full+idea","60%"],"Cliff + vesting",
  [("¿Equally?","Tendencia: split equal. Simple, pocos conflictos."),
   ("¿Pondering?","Founder con más rol: +5-15%."),
   ("¿Vesting?","4 años, 1 año cliff estándar."),
   ("¿Idea?","Menos de lo que los founders piensan (5-10% bonus)."),
   ("¿Funding?","Futura dilución: VC toma 20-30% Series A."),
   ("¿Salary vs equity?","Founders muchas veces sueldos bajos + más equity."),
   ("¿Legal?","Shareholder agreement desde día 1. Abogado.")],
  """  const n=Number(i.cantidadFounders)||2; const t=Number(i.tiempoCompletoRelativo)||5; const io=String(i.ideaOriginal||'compartida');
  const equalPart=100/n;
  const bonusIdea=io==='si'?5:io==='no'?-5:0;
  const bonusDedic=(t-5)*2;
  const mio=Math.min(90,Math.max(10,equalPart+bonusIdea+bonusDedic));
  const rec=mio>equalPart*1.3?'Buscá consenso con co-founders antes de cerrar.':'Split razonable. Con vesting claro.';
  return { porcentajeSugerido:`${mio.toFixed(0)}%`, recomendacion:rec, consejo:'4 años vesting + 1 año cliff. Shareholder agreement. Revisar con abogado.' };""")

M("cap-table-startup-dilution-serie-a", "negocios", "📊", "Cap table dilution",
  "Dilución post Series A.",
  "dilución = 100% × (1 - pre/(pre+investment))",
  [("equityPreRound","Tu equity pre-ronda %","number",50),("porcentajeInversor","Inversor toma %","number",20)]  ,
  [("equityPost","Tu equity post-ronda",None),("dilucion","Dilución absoluta",None),("observacion","Observación",None)],
  ["50% pre, 20% dilución","40% post"],"-10pp",
  [("¿Pre-money?","Valuación antes de inversión."),
   ("¿Post-money?","Pre + inversión."),
   ("¿Dilución?","Tu % baja proporcional."),
   ("¿Series A típica?","20-25% al inversor."),
   ("¿Seed?","10-20%."),
   ("¿Opciones?","ESOP 10-15% reservado pre-Series A."),
   ("¿Anti-dilution?","Clausulas que protegen en down-rounds.")],
  """  const pre=Number(i.equityPreRound)||0; const inv=Number(i.porcentajeInversor)||0;
  const post=pre*(1-inv/100);
  const dil=pre-post;
  return { equityPost:`${post.toFixed(1)}%`, dilucion:`-${dil.toFixed(1)}pp (${((dil/pre)*100).toFixed(0)}%)`, observacion:`Inversor tomó ${inv}%, diluíste proporcionalmente. Post: ${post.toFixed(1)}%.` };""")

M("runway-startup-cash-burn-rate-meses", "negocios", "🔥", "Runway startup",
  "Meses de runway según burn rate.",
  "cash / burn",
  [("cashDisponible","Cash USD","number",500000),("burnMensual","Burn mensual USD","number",80000)],
  [("runwayMeses","Runway meses",None),("fechaLimite","Fecha límite aprox",None),("recomendacion","Recomendación",None)],
  ["USD 500k / USD 80k/m","6.25 meses"],"Empezar fundraising",
  [("¿Runway?","Meses hasta cash = 0 sin más ingresos."),
   ("¿Burn rate?","Gasto mensual neto (gasto - ingresos)."),
   ("¿Seguro?","18 meses = cómodo. 12 = OK. 6 = crítico."),
   ("¿Fundraising?","Empezar con 9+ meses. Cerrar con 6+."),
   ("¿Extender?","Reducir burn o aumentar revenue."),
   ("¿Default alive?","Revenue cubre gastos sin nuevo funding."),
   ("¿Layoffs?","Si runway <6 meses, reestructurar.")],
  """  const c=Number(i.cashDisponible)||0; const b=Number(i.burnMensual)||1;
  const m=c/b;
  const fechaDias=m*30;
  const fecha=new Date(Date.now()+fechaDias*86400000);
  let rec='';
  if(m>18) rec='Cómodo. Enfocate en ejecución.';
  else if(m>12) rec='OK. Planifica próxima ronda en 6 meses.';
  else if(m>6) rec='Empieza fundraising YA o reducir burn.';
  else rec='CRÍTICO. Layoffs, pivot o cerrar.';
  return { runwayMeses:`${m.toFixed(1)} meses`, fechaLimite:fecha.toISOString().slice(0,10), recomendacion:rec };""")

# ============================================================
# EDUCACIÓN inicio (5 de 15 acá; resto en P4)
# ============================================================

M("cbc-uba-materias-regularidad-requisitos", "educacion", "📚", "CBC UBA regularidad",
  "Requisitos regularidad CBC UBA.",
  "asistencia + parciales",
  [("asistenciaPorcentaje","Asistencia %","number",75),("parcial1","Parcial 1","number",6),("parcial2","Parcial 2","number",7)]  ,
  [("regularidad","Regularidad",None),("promedio","Promedio",None),("observacion","Observación",None)],
  ["75% asistencia 6-7","Regular"],"Falta final",
  [("¿Regularidad?","Asistencia mín 75% + aprobar parciales."),
   ("¿Aprobar?","≥4 los dos parciales. Promedio no se calcula."),
   ("¿Recuperatorio?","Si desaprobás uno, podés recuperar."),
   ("¿Final?","Último paso. Presencial. Evalúa toda la materia."),
   ("¿Ciclo común?","6 materias (4 obligatorias + 2 orientadas a carrera)."),
   ("¿Duración?","1 año full-time. 1-2 años part-time."),
   ("¿Idioma?","Obligatorio acreditar inglés intermedio para algunas carreras.")],
  """  const a=Number(i.asistenciaPorcentaje)||0; const p1=Number(i.parcial1)||0; const p2=Number(i.parcial2)||0;
  let reg='';
  if(a<75) reg='Libre por asistencia';
  else if(p1<4||p2<4) reg='Libre por parciales (recuperatorio disponible)';
  else reg='Regular — rinde final';
  const prom=(p1+p2)/2;
  return { regularidad:reg, promedio:prom.toFixed(1), observacion:reg.includes('Regular')?'Continuá con final oral/escrito.':'Revisá tu caso con docente.' };""")

M("ingreso-medicina-puntaje-cbc-uba-2026", "educacion", "⚕️", "Ingreso medicina UBA",
  "Puntaje CBC necesario para ingresar medicina UBA.",
  "promedio CBC + cupo",
  [("promedioCbc","Promedio CBC","number",8)],
  [("posibilidadIngreso","Posibilidad ingreso",None),("referenciaCorte","Nota corte histórica",None),("consejo","Consejo",None)],
  ["8.0","Altamente probable"],"~7.5 nota corte",
  [("¿CBC medicina?","6 materias específicas. Promedio mínimo requerido."),
   ("¿Cupo?","Limitado. ~1500 lugares por cuatrimestre."),
   ("¿Nota corte?","~7-8 promedio histórico."),
   ("¿Recursar?","Permitido. Muchos lo hacen."),
   ("¿Ingreso libre?","Sí, aprobando CBC podés anotarte. Corte aplica en 2do año."),
   ("¿Facultades privadas?","UCA, Favaloro, Austral. Costo alto."),
   ("¿Duración?","6 años + residencia 3-5 años.")],
  """  const p=Number(i.promedioCbc)||0;
  let pos='', cons='';
  if(p>=9){pos='Casi garantizado';cons='Felicitaciones. Preparate para 2do año.'}
  else if(p>=8){pos='Altamente probable';cons='Mantener nivel.'}
  else if(p>=7){pos='Posible, pero con cupo ajustado';cons='Considerá mejorar el promedio.'}
  else if(p>=6){pos='Difícil con cupo actual';cons='Evaluá recursar materias específicas.'}
  else {pos='Poco probable';cons='Fortalecé bases antes de continuar.'}
  return { posibilidadIngreso:pos, referenciaCorte:'~7.5 histórico (varía por cuatrimestre)', consejo:cons };""")

M("uba-xxi-nota-final-promedio", "educacion", "🏫", "UBA XXI nota final",
  "Nota final UBA XXI: promedio trabajos + examen.",
  "0.4×trabajos + 0.6×final",
  [("promedioTrabajos","Promedio trabajos","number",7),("notaFinal","Nota final","number",8)]  ,
  [("notaFinalMateria","Nota final materia",None),("regularidad","Regularidad",None),("observacion","Observación",None)],
  ["Trabajos 7 Final 8","7.6"],"Aprobado",
  [("¿UBA XXI?","UBA a Distancia. Modalidad virtual/presencial."),
   ("¿Asistencia?","No obligatoria. Trabajos sí."),
   ("¿Final?","Presencial obligatorio."),
   ("¿Promedio?","0.4×trabajos + 0.6×final."),
   ("¿Aprobar?","≥4 final."),
   ("¿Recursar?","Posible. Sin límite."),
   ("¿Acreditar?","Para pase a UBA presencial.")],
  """  const t=Number(i.promedioTrabajos)||0; const f=Number(i.notaFinal)||0;
  const prom=t*0.4+f*0.6;
  const reg=f>=4?'Aprobado':'Desaprobado — recursar';
  return { notaFinalMateria:prom.toFixed(1), regularidad:reg, observacion:prom>=7?'Buena nota. Continuá así.':prom>=4?'Aprobado.':'Recursar o refuerzo.' };""")

M("nota-promedio-bachillerato-secundario-materias", "educacion", "📊", "Promedio secundario",
  "Promedio general secundario.",
  "sum / count",
  [("notasTexto","Notas (separadas por coma)","text","8,7,9,6,7,8")],
  [("promedio","Promedio",None),("clasificacion","Clasificación",None),("materiasAprobadas","Materias aprobadas",None)],
  ["8,7,9,6,7,8","7.5"],"6/6",
  [("¿Promedio?","Suma notas / cantidad."),
   ("¿Aprobar?","≥4 o ≥6 según escuela."),
   ("¿Abanderado?","Mejor promedio por nivel. Promedio >9."),
   ("¿Mejor promedio beca?","Requisito >8 o >9 según beca."),
   ("¿Escolta?","2do y 3er mejor promedio."),
   ("¿Promedio universidad?","Influye para becas."),
   ("¿Promedio 4-6?","Rango amplio. Depende escuela/matería.")],
  """  const t=String(i.notasTexto||'').split(',').map(x=>Number(x.trim())).filter(n=>!isNaN(n));
  if(t.length===0) return { promedio:'—', clasificacion:'—', materiasAprobadas:'—' };
  const prom=t.reduce((a,b)=>a+b,0)/t.length;
  const aprob=t.filter(n=>n>=4).length;
  let clas='';
  if(prom>=9) clas='Excelente';
  else if(prom>=7) clas='Muy bueno';
  else if(prom>=6) clas='Bueno';
  else if(prom>=4) clas='Aprobado';
  else clas='Desaprobado';
  return { promedio:prom.toFixed(2), clasificacion:clas, materiasAprobadas:`${aprob}/${t.length}` };""")

M("credito-universitario-progresar-monto-2026", "finanzas", "🎓", "Progresar 2026",
  "Monto beca Progresar 2026.",
  "categoría × monto",
  [("nivel","Nivel","select",["obligatorio","superior","trabajo"]),("lineaProgresar","Línea","select",["a","b","c"])]  ,
  [("montoMensual","Monto mensual 2026",None),("requisitos","Requisitos","text"),("tramite","Trámite",None)],
  ["Superior B","~$80k"],"10 meses/año",
  [("¿Progresar?","Programa nacional ANSES de becas."),
   ("¿Líneas?","A (obligatorio 16-21), B (superior 17-24), C (trabajo 18-24)."),
   ("¿Monto?","Variable según nivel y línea. $40k-100k/mes aprox."),
   ("¿Duración?","10 meses/año académico."),
   ("¿Requisitos?","Ingresos familiares bajos + constancia estudio."),
   ("¿Tramite?","Online mi.ANSES o oficinas."),
   ("¿Incompatibilidad?","Otras becas, trabajo formal alto.")],
  """  const n=String(i.nivel||'superior'); const l=String(i.lineaProgresar||'b');
  const base={'obligatorio':40000,'superior':80000,'trabajo':70000}[n];
  const mult={'a':1,'b':1,'c':1}[l];
  const monto=base*mult;
  return { montoMensual:`$${monto.toLocaleString('es-AR')} (10 meses/año)`, requisitos:'Ingresos familiares <3 SMVM, regularidad estudios, edad según línea.', tramite:'mi.ANSES + IVE (Informe Valoración Estudios).' };""")
