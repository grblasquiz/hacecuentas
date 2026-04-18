"""Batch 9 — Automotor (30 calcs)."""
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


def M(slug, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, "automotor", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


# 1. Consumo combustible
M("consumo-combustible-km-litro", "⛽", "Consumo combustible km/L",
  "Rendimiento real km/L desde km recorridos y litros.",
  "km/L = km / L",
  [("km","Km recorridos","number",None),("l","Litros","number",None)],
  [("kml","km/L",None),("l100km","L/100 km",None),("mpg","MPG",None),("resumen","Interpretación",None)],
  ["500 km, 40 L","12.5 km/L"], "12.5 km/L",
  [("¿Europa?","Usa L/100km (inverso)."),
   ("¿US?","MPG: mil per gallon (3.785 L)."),
   ("¿Real vs fábrica?","Real 15-25% peor."),
   ("¿Estilo?","Manejo suave mejora 15-20%."),
   ("¿Neumáticos?","Presión correcta ahorra 3-5%.")],
  """  const km=Number(i.km)||0; const l=Number(i.l)||0;
  if (l===0) return { kml:'—', l100km:'—', mpg:'—', resumen:'Litros no puede ser 0.' };
  const kml=km/l; const l100=100/kml; const mpg=kml*2.352;
  return { kml:`${kml.toFixed(2)} km/L`, l100km:`${l100.toFixed(2)} L/100km`, mpg:`${mpg.toFixed(1)} MPG`, resumen:`${km}km con ${l}L = ${kml.toFixed(1)}km/L.` };""")

# 2. Costo viaje
M("costo-viaje-combustible-kilometros", "💵", "Costo viaje combustible",
  "Costo total en combustible de un viaje.",
  "Costo = km/rendimiento × precio",
  [("km","Km","number",None),("rend","Rendimiento","number","km/L"),("precio","Precio L","number","$")]
  ,
  [("litros","Litros",None),("costo","Costo",None),("perKm","Costo/km",None),("resumen","Interpretación",None)],
  ["500km, 10km/L, $1/L","50L, $50"], "$50",
  [("¿Peajes?","Sumar aparte."),
   ("¿Ida y vuelta?","Duplicar km."),
   ("¿Cargado?","Peso reduce rendimiento ~10% cada 100kg."),
   ("¿Velocidad?",">120 km/h consume hasta 30% más."),
   ("¿Carpool?","Divide por # pasajeros.")],
  """  const km=Number(i.km)||0; const r=Number(i.rend)||1; const p=Number(i.precio)||0;
  const l=km/r; const c=l*p;
  return { litros:`${l.toFixed(1)} L`, costo:`$${c.toFixed(2)}`, perKm:`$${(c/km).toFixed(2)}/km`, resumen:`${km}km = ${l.toFixed(1)}L × $${p} = $${c.toFixed(2)}.` };""")

# 3. Autonomía tanque
M("autonomia-tanque-lleno-kilometros", "🚗", "Autonomía tanque lleno",
  "Km que recorre un tanque lleno.",
  "km = capacidad × rendimiento",
  [("cap","Capacidad tanque","number","L"),("rend","Rendimiento","number","km/L")],
  [("km","Km autonomía",None),("resumen","Interpretación",None)],
  ["50L × 15km/L","750km"], "750km",
  [("¿Cuándo recargar?","Reserva ~1/4, no esperar a 0."),
   ("¿Reserva luz?","Típico quedan 50-80 km."),
   ("¿Nafta mezcla?","Usa el octanaje recomendado."),
   ("¿Diesel vs nafta?","Diesel ~25% más rendimiento."),
   ("¿GNC?","Híbrido nafta/GNC mixto común ARG.")],
  """  const c=Number(i.cap)||0; const r=Number(i.rend)||0;
  const km=c*r;
  return { km:`${km.toFixed(0)} km`, resumen:`${c}L × ${r}km/L = ${km.toFixed(0)} km.` };""")

# 4. CC motor cilindrada
M("cilindrada-motor-relacion-potencia", "🔧", "Cilindrada → potencia aprox",
  "Potencia aproximada para cilindrada dada (nafta atmosférico).",
  "~70-100 HP/L atm; 150+ con turbo",
  [("cc","Cilindrada","number","cc"),("turbo","Turbo","select",[("no","No"),("si","Sí")])],
  [("hpAprox","HP aprox",None),("categoria","Categoría",None),("resumen","Interpretación",None)],
  ["2000cc, sí","300 HP aprox"], "300 HP aprox",
  [("¿Por qué turbo?","Aire comprimido = más combustión = más HP."),
   ("¿Downsizing?","Motores pequeños turbo igualan grandes atm."),
   ("¿Octanaje?","Mayor turbo = mayor octano recomendado."),
   ("¿Diesel?","Más torque, menos HP/cc."),
   ("¿Eléctrico?","No aplica cc; compara en kW.")],
  """  const cc=Number(i.cc)||0; const tb=String(i.turbo||'no');
  const l=cc/1000; const hp=tb==='si'?l*150:l*85;
  let cat='Económico'; if (hp>400) cat='Supercar'; else if (hp>200) cat='Sport'; else if (hp>130) cat='Medio';
  return { hpAprox:`${hp.toFixed(0)} HP`, categoria:cat, resumen:`${cc}cc ${tb==='si'?'turbo':'atm'}: ~${hp.toFixed(0)} HP (${cat}).` };""")

# 5. HP a kW
M("conversion-hp-kw-caballos-kilowatts", "⚡", "HP ↔ kW conversión",
  "HP a kW y viceversa.",
  "1 HP = 0.7457 kW",
  [("valor","Valor","number",None),("desde","Desde","select",[("hp","HP"),("kw","kW"),("cv","CV")])],
  [("hp","HP",None),("kw","kW",None),("cv","CV",None),("resumen","Equivalencias",None)],
  ["150 HP","111.8 kW"], "111.8 kW",
  [("¿HP vs CV?","HP americano = 745.7W; CV métrico = 735.5W. Casi iguales."),
   ("¿BHP?","Brake HP = medido al crank."),
   ("¿WHP?","Wheel HP = en las ruedas, ~15% menos."),
   ("¿Torque vs HP?","HP = torque × rpm / 5252."),
   ("¿Eléctrico?","Siempre en kW.")],
  """  const v=Number(i.valor)||0; const de=String(i.desde||'hp');
  let kw:number;
  if (de==='hp') kw=v*0.7457; else if (de==='cv') kw=v*0.7355; else kw=v;
  return { hp:`${(kw/0.7457).toFixed(2)} HP`, kw:`${kw.toFixed(2)} kW`, cv:`${(kw/0.7355).toFixed(2)} CV`, resumen:`${v} ${de} = ${kw.toFixed(1)} kW.` };""")

# 6. Neumático tamaño
M("conversion-medida-neumatico-radio-diametro", "🛞", "Medida neumático (diámetro real)",
  "Diámetro exterior desde medida 205/55 R16.",
  "D = R×25.4 + 2·(ancho·aspect/100)",
  [("ancho","Ancho","number","mm"),("aspect","Aspect","number","%"),("rin","Rin","number","''")],
  [("diametroMm","Diámetro",None),("circunf","Circunferencia",None),("revKm","Rev/km",None),("resumen","Interpretación",None)],
  ["205/55 R16","632 mm"], "632 mm",
  [("¿Aspect?","Alto como % del ancho. Menor = más plano."),
   ("¿Rin?","Diámetro del aro en pulgadas."),
   ("¿Cambiar medida?","Mantener diámetro total ±3%."),
   ("¿Velocímetro?","Cambio altera lectura."),
   ("¿Duración?","Low-profile: confort menor, más precisión.")],
  """  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const h=w*a/100*2; const d=r*25.4+h;
  const circ=d*Math.PI/1000; const rev=1000/circ;
  return { diametroMm:`${d.toFixed(0)} mm`, circunf:`${circ.toFixed(2)} m`, revKm:`${rev.toFixed(0)} rev/km`, resumen:`${w}/${a} R${r}: diámetro ${d.toFixed(0)}mm.` };""")

# 7. Presión aceite
M("aceite-motor-capacidad-cambio-km", "🛢️", "Cambio de aceite: intervalo",
  "Km próximo cambio según tipo aceite.",
  "Tabla referencia por tipo",
  [("tipo","Tipo","select",[("mineral","Mineral"),("semi","Semisint."),("sint","Sintético"),("sintLong","Long-life")]),("kmActual","Km actuales","number",None)],
  [("proximo","Próx cambio",None),("km","Km restantes",None),("resumen","Recomendación",None)],
  ["Sintético, 50000","Próximo 60000"], "60000 km",
  [("¿Cada cuánto?","Mineral 5k, Semi 7.5k, Sint 10-15k, Longlife 20k."),
   ("¿Tiempo?","Aunque no uses auto, cambia 1-2 años."),
   ("¿Filtro?","Siempre con cada cambio."),
   ("¿Viscosidad?","5W-30 común moderno; ver manual."),
   ("¿Uso severo?","Ciudad/polvo: reducir intervalo 30%.")],
  """  const t=String(i.tipo||'mineral'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={mineral:5000,semi:7500,sint:10000,sintLong:20000};
  const int=iv[t]||5000;
  const prox=km+int;
  return { proximo:prox.toLocaleString()+' km', km:int.toLocaleString()+' km', resumen:`${t}: próximo cambio a ${prox.toLocaleString()} km.` };""")

# 8. Velocidad RPM
M("velocidad-auto-rpm-marcha-relacion", "🚗", "Velocidad desde RPM y marcha",
  "Velocidad teórica a RPM dado en marcha n.",
  "V = RPM × circ × 60 / (relación × diff)",
  [("rpm","RPM","number",None),("rel","Relación marcha","number",None),("diff","Relación final","number",None),("circ","Circunferencia rueda","number","m")],
  [("velocidad","Velocidad",None),("resumen","Interpretación",None)],
  ["3000rpm, 5ta, 1:3.5, 2m","103 km/h"], "103 km/h",
  [("¿Relación?","Caja + diferencial."),
   ("¿Cuál 5ta?","Auto típico: 0.8-1.0."),
   ("¿Overdrive?","6ta en 0.6-0.8 reduce RPM en ruta."),
   ("¿Patinaje?","Pérdida en tracción, real es menor."),
   ("¿CVT?","Varía continuamente.")],
  """  const r=Number(i.rpm)||0; const rel=Number(i.rel)||1; const dif=Number(i.diff)||1; const c=Number(i.circ)||2;
  const rueda_rpm=r/(rel*dif);
  const v_m_min=rueda_rpm*c;
  const v_kmh=v_m_min*60/1000;
  return { velocidad:`${v_kmh.toFixed(0)} km/h`, resumen:`${r}rpm en esa marcha = ${v_kmh.toFixed(0)} km/h.` };""")

# 9. Frenado distancia
M("distancia-frenado-velocidad-adhesion", "🛑", "Distancia de frenado",
  "Distancia total: reacción + frenado.",
  "d = v·t_reac + v²/(2·μ·g)",
  [("v","Velocidad","number","km/h"),("mu","Adherencia","number",None),("treac","T reacción","number","seg")],
  [("reaccion","Dist reacción",None),("frenado","Dist frenado",None),("total","Total",None),("resumen","Interpretación",None)],
  ["100km/h, μ=0.7","~57m total"], "~57m",
  [("¿μ típico?","Seco 0.7-0.9; mojado 0.4-0.6; nieve 0.1-0.3; hielo 0.05."),
   ("¿Reacción?","Promedio 1s alerta, 1.5s distraído."),
   ("¿ABS?","No reduce distancia, preserva control."),
   ("¿Peso?","Más masa = más distancia."),
   ("¿Neumáticos?","Cargarlos frescos reduce d.")],
  """  const vk=Number(i.v)||0; const mu=Number(i.mu)||0.7; const tr=Number(i.treac)||1;
  const v=vk/3.6;
  const dr=v*tr; const df=v*v/(2*mu*9.81);
  return { reaccion:`${dr.toFixed(1)} m`, frenado:`${df.toFixed(1)} m`, total:`${(dr+df).toFixed(1)} m`, resumen:`A ${vk}km/h: reacción ${dr.toFixed(0)}m + frenado ${df.toFixed(0)}m = ${(dr+df).toFixed(0)}m total.` };""")

# 10. Costo mantenimiento anual
M("costo-mantenimiento-auto-anual-km", "🔧", "Costo mantenimiento anual",
  "Estimación anual de mantenimiento (no combustible).",
  "Por edad y km",
  [("anio","Año modelo","number",None),("km","Km/año","number",None),("precio","Valor auto","number","$")],
  [("mantenimiento","Mantenimiento/año",None),("pctValor","% del valor",None),("resumen","Interpretación",None)],
  ["2020, 20000 km, $20000","$1600/año"], "$1600",
  [("¿Regla pulgar?","2-8% del valor anual."),
   ("¿Nuevo?","Poco mantenimiento primeros 3 años."),
   ("¿Alemán premium?","40-60% más caro que asiático."),
   ("¿DIY?","Cambio aceite/filtros ahorra 50%."),
   ("¿Garantía?","5-10 años en marcas nuevas.")],
  """  const a=Number(i.anio)||2020; const km=Number(i.km)||15000; const p=Number(i.precio)||0;
  const edad=Math.max(0, new Date().getFullYear()-a);
  const pctBase=0.03+edad*0.005+Math.max(0,(km-15000)/15000)*0.01;
  const anual=p*Math.min(0.1,pctBase);
  return { mantenimiento:`$${anual.toFixed(0)}`, pctValor:`${(anual/p*100).toFixed(1)}%`, resumen:`Auto ${a} (${edad} años, ${km}km/año): ~$${anual.toFixed(0)}/año mantenimiento.` };""")

# 11. Conversión velocidad
M("conversion-velocidad-kmh-mph-nudos", "💨", "Conversión km/h ↔ mph ↔ nudos",
  "Unidades de velocidad.",
  "1 km/h = 0.621 mph = 0.54 kn",
  [("v","Valor","number",None),("de","Desde","select",[("kmh","km/h"),("mph","mph"),("kn","nudos"),("ms","m/s")])],
  [("kmh","km/h",None),("mph","mph",None),("kn","nudos",None),("ms","m/s",None),("resumen","Resumen",None)],
  ["100 km/h","62.1 mph"], "62.1 mph",
  [("¿Nudo?","Milla náutica/hora (1.852 km/h). Barcos/aviones."),
   ("¿mph?","Millas/h (EE.UU., UK)."),
   ("¿m/s?","Viento meteorológico."),
   ("¿c?","Luz: 299792 km/s ≈ 1.08 Gkm/h."),
   ("¿Mach?","Velocidad sonido depende altitud/temp.")],
  """  const v=Number(i.v)||0; const d=String(i.de||'kmh');
  let kmh:number;
  if (d==='kmh') kmh=v; else if (d==='mph') kmh=v*1.609; else if (d==='kn') kmh=v*1.852; else kmh=v*3.6;
  return { kmh:`${kmh.toFixed(2)}`, mph:`${(kmh/1.609).toFixed(2)}`, kn:`${(kmh/1.852).toFixed(2)}`, ms:`${(kmh/3.6).toFixed(2)}`, resumen:`${v} ${d} = ${kmh.toFixed(1)} km/h.` };""")

# 12. Ahorro eléctrico
M("ahorro-auto-electrico-vs-nafta-anual", "🔌", "Ahorro auto eléctrico vs nafta",
  "Compara costos anuales EV vs combustión.",
  "Costo = km × consumo × precio",
  [("km","Km/año","number",None),("evKwh","EV kWh/100km","number",None),("nkm","Nafta km/L","number",None),("pElec","$ kWh","number",None),("pNafta","$ L","number",None)],
  [("evCosto","Eléctrico/año",None),("nCosto","Nafta/año",None),("ahorro","Ahorro",None),("resumen","Interpretación",None)],
  ["15000km","$500 vs $1500"], "Ahorro ~$1000",
  [("¿TCO?","Eléctrico más caro compra, más barato uso."),
   ("¿Cargar casa?","Más barato que público."),
   ("¿Degradación?","Baterías 10-20% en 10 años típico."),
   ("¿Incentivos?","Exención patente/impuestos en algunos países."),
   ("¿Largas distancias?","Red de carga aún desigual.")],
  """  const km=Number(i.km)||0; const ev=Number(i.evKwh)||18; const n=Number(i.nkm)||12; const pe=Number(i.pElec)||0.15; const pn=Number(i.pNafta)||1.2;
  const evC=km*ev/100*pe; const nC=km/n*pn;
  return { evCosto:`$${evC.toFixed(0)}`, nCosto:`$${nC.toFixed(0)}`, ahorro:`$${(nC-evC).toFixed(0)}`, resumen:`EV $${evC.toFixed(0)}/año vs Nafta $${nC.toFixed(0)} → ahorro $${(nC-evC).toFixed(0)}.` };""")

# 13. Patente argentina
M("patente-argentina-antiguedad-vehiculo", "📋", "Patente: antigüedad típica",
  "Edad típica según valor patente AR.",
  "Por tabla SRV (referencia)",
  [("valor","Valor fiscal","number","$")],
  [("cuotaAnual","Cuota anual aprox",None),("mensual","Mensual",None),("resumen","Interpretación",None)],
  ["$10000000","$450000/año"], "$450000",
  [("¿Alicuota AR?","4-5% anual sobre valor fiscal en varias provincias."),
   ("¿Variación provincial?","CABA, BA, CBA difieren."),
   ("¿Descuento pago?","Anual 10-20% vs mensual."),
   ("¿Antigüedad?","Vehículos >10 años pagan menos/nada según distrito."),
   ("¿VTV?","Extra anual obligatorio en muchas provincias.")],
  """  const v=Number(i.valor)||0;
  const anual=v*0.045;
  return { cuotaAnual:`$${anual.toFixed(0)}`, mensual:`$${(anual/12).toFixed(0)}`, resumen:`Valor fiscal $${v.toLocaleString()}: patente ~$${anual.toFixed(0)}/año.` };""")

# 14. Seguro cuota
M("seguro-auto-cuota-mensual-cobertura", "🛡️", "Seguro auto: cuota mensual",
  "Cuota estimada según valor y cobertura.",
  "Cuota ~= valor × (1-4%)/12",
  [("valor","Valor auto","number","$"),("cob","Cobertura","select",[("rc","RC básica"),("interm","Intermedia"),("todo","Todo riesgo")])]
  ,
  [("mensual","Cuota mensual",None),("anual","Anual",None),("resumen","Interpretación",None)],
  ["$15000 todo","$100/mes"], "$100",
  [("¿RC?","Mínimo legal, cubre a terceros."),
   ("¿Todo riesgo?","Más caro, cubre tu auto."),
   ("¿Franquicia?","Mayor franquicia = menor cuota."),
   ("¿Zona riesgo?","Urbana más cara que rural."),
   ("¿Historial?","Sin siniestros = descuentos.")],
  """  const v=Number(i.valor)||0; const c=String(i.cob||'rc');
  const pct:Record<string,number>={rc:0.01,interm:0.025,todo:0.04};
  const mes=v*(pct[c]||0.02)/12;
  return { mensual:`$${mes.toFixed(0)}`, anual:`$${(mes*12).toFixed(0)}`, resumen:`Auto $${v.toLocaleString()} ${c}: ~$${mes.toFixed(0)}/mes.` };""")

# 15. Depreciación
M("depreciacion-auto-anual-valor-residual", "📉", "Depreciación anual auto",
  "Pérdida valor año a año (curva típica).",
  "V(t) = V0 × (1-d)^t",
  [("valor","Valor inicial","number","$"),("anios","Años","number",None)],
  [("valorFinal","Valor final",None),("perdida","Pérdida",None),("pctAnual","% anual",None),("resumen","Interpretación",None)],
  ["$20000, 5 años","$10240"], "Pérdida 49%",
  [("¿Regla?","-20% primer año, -15% anual luego."),
   ("¿Km alto?","Reduce más. >30k km/año penalizado."),
   ("¿Marca?","Toyota/Honda menos depreciación."),
   ("¿Color?","Blanco/negro/gris estables."),
   ("¿Leasing?","Residual = valor año X.")],
  """  const v=Number(i.valor)||0; const a=Number(i.anios)||1;
  const pct1=0.2; const pctN=0.12;
  let vf=v*(1-pct1);
  for (let k=1;k<a;k++) vf*=(1-pctN);
  return { valorFinal:`$${vf.toFixed(0)}`, perdida:`$${(v-vf).toFixed(0)}`, pctAnual:`~${(pctN*100).toFixed(0)}%`, resumen:`Tras ${a} años: $${vf.toFixed(0)} (pérdida ${((1-vf/v)*100).toFixed(0)}%).` };""")

# 16. Batería CCA
M("cca-bateria-auto-temperatura-motor", "🔋", "CCA batería auto",
  "Cold Cranking Amps recomendado por motor.",
  "~1 CCA por cc nafta, ~2x diesel",
  [("cc","Cilindrada","number","cc"),("tipo","Tipo","select",[("nafta","Nafta"),("diesel","Diesel")])],
  [("ccaMin","CCA mínimo",None),("ccaRecom","Recomendado",None),("resumen","Interpretación",None)],
  ["2000cc nafta","400 CCA"], "500 CCA",
  [("¿CCA?","Amperios entregados a -18°C por 30s."),
   ("¿Frío?","Batería pierde 30-50% en clima muy frío."),
   ("¿Vida?","3-5 años típica."),
   ("¿Síntomas?","Arranque lento, luces débiles."),
   ("¿Test?","Multímetro en reposo: 12.6V sano.")],
  """  const cc=Number(i.cc)||0; const t=String(i.tipo||'nafta');
  const mult=t==='diesel'?2:1;
  const min=Math.round(cc/1000*300*mult); const rec=Math.round(min*1.2);
  return { ccaMin:`${min} CCA`, ccaRecom:`${rec} CCA`, resumen:`${cc}cc ${t}: CCA mín ${min}, recomendado ${rec}.` };""")

# 17. Neumático presión
M("presion-neumatico-psi-bar-auto", "🛞", "Conversión PSI/Bar neumáticos",
  "PSI ↔ Bar ↔ kPa.",
  "1 bar = 14.5 PSI = 100 kPa",
  [("v","Valor","number",None),("de","Desde","select",[("psi","PSI"),("bar","Bar"),("kpa","kPa")])],
  [("psi","PSI",None),("bar","Bar",None),("kpa","kPa",None),("resumen","Recomendación",None)],
  ["32 PSI","2.2 Bar"], "2.2 Bar",
  [("¿Auto típico?","30-35 PSI (2.0-2.4 bar)."),
   ("¿Frío?","Medir en frío; aumenta con calor."),
   ("¿Bajo?","Desgaste bordes, consume más."),
   ("¿Alto?","Desgaste centro, pierde adherencia."),
   ("¿Rueda auxilio?","Alta (60 PSI) para poco uso.")],
  """  const v=Number(i.v)||0; const de=String(i.de||'psi');
  let bar:number;
  if (de==='psi') bar=v/14.504; else if (de==='kpa') bar=v/100; else bar=v;
  return { psi:`${(bar*14.504).toFixed(1)} PSI`, bar:`${bar.toFixed(2)} bar`, kpa:`${(bar*100).toFixed(0)} kPa`, resumen:`${v} ${de} = ${bar.toFixed(2)} bar.` };""")

# 18. Consumo AC
M("consumo-aire-acondicionado-auto-extra", "❄️", "Consumo extra de A/A",
  "Litros extra por hora de A/A.",
  "~5-10% más consumo",
  [("rend","Rendimiento","number","km/L"),("horas","Horas uso/día","number",None),("precio","Precio L","number","$")],
  [("extra","L extra/día",None),("costoMes","Costo mes",None),("resumen","Interpretación",None)],
  ["12km/L, 2h, $1","~0.2L"], "$6/mes",
  [("¿Cuánto más?","5-15% según motor y clima."),
   ("¿Más que ventanas?","A ciudad sí; ruta ventanas peor por aero."),
   ("¿Mantenimiento?","Recarga gas cada 3-5 años."),
   ("¿Filtro?","Cambiar anual, afecta salud."),
   ("¿ECO?","Modo Eco atenúa A/A automático.")],
  """  const r=Number(i.rend)||12; const h=Number(i.horas)||1; const p=Number(i.precio)||1;
  const lHora=0.3;
  const dia=lHora*h; const mes=dia*30*p;
  return { extra:`${dia.toFixed(2)} L/día`, costoMes:`$${mes.toFixed(2)}`, resumen:`A/A ${h}h/día: ~$${mes.toFixed(0)}/mes extra combustible.` };""")

# 19. Correa distribución km
M("correa-distribucion-cambio-intervalo-km", "⚙️", "Correa distribución cambio",
  "Km recomendado cambio correa.",
  "60-100k km típico",
  [("marca","Marca","select",[("generico","Genérico 80k"),("vw","VW 90k"),("toyota","Toyota (cadena)"),("ford","Ford 100k")]),("kmActual","Km","number",None)],
  [("proximo","Próximo",None),("advertencia","Advertencia",None),("resumen","Recomendación",None)],
  ["VW 45000","A los 90000"], "A los 90000",
  [("¿Cadena?","No se cambia (a menos de ruido)."),
   ("¿Rotura?","Daño motor severo (válvulas)."),
   ("¿Síntoma?","Ruido, chequeo visual."),
   ("¿Tiempo?","También por años (6-10)."),
   ("¿Kit?","Tensor y bomba de agua a la vez.")],
  """  const m=String(i.marca||'generico'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={generico:80000,vw:90000,toyota:0,ford:100000};
  const int=iv[m];
  if (int===0) return { proximo:'No aplica (cadena)', advertencia:'Cadena de distribución no requiere cambio programado', resumen:'Cadena: solo cambiar si falla.' };
  const prox=Math.ceil(km/int)*int; const adv=km>prox-5000?'⚠️ Próximo a vencer':'OK';
  return { proximo:prox.toLocaleString()+' km', advertencia:adv, resumen:`${m}: próximo cambio a ${prox.toLocaleString()}. ${adv}.` };""")

# 20. Torque newton
M("conversion-torque-nm-lb-ft-kgm", "🔩", "Conversión torque Nm/lb·ft/kgm",
  "Unidades de torque.",
  "1 Nm = 0.738 lb·ft = 0.102 kgm",
  [("v","Valor","number",None),("de","Desde","select",[("nm","Nm"),("lbft","lb·ft"),("kgm","kg·m")])],
  [("nm","Nm",None),("lbft","lb·ft",None),("kgm","kg·m",None),("resumen","Resumen",None)],
  ["100 Nm","73.8 lb·ft"], "73.8",
  [("¿Torque vs potencia?","Torque = giro; potencia = torque·rpm."),
   ("¿Diesel?","Alto torque a bajas rpm."),
   ("¿EV?","Torque máximo instantáneo desde 0 rpm."),
   ("¿Ajuste llave?","Usar llave dinamométrica."),
   ("¿Auto?","Rueda auto: 90-140 Nm típico.")],
  """  const v=Number(i.v)||0; const d=String(i.de||'nm');
  let nm:number;
  if (d==='nm') nm=v; else if (d==='lbft') nm=v*1.356; else nm=v*9.807;
  return { nm:`${nm.toFixed(2)} Nm`, lbft:`${(nm*0.738).toFixed(2)} lb·ft`, kgm:`${(nm*0.102).toFixed(2)} kg·m`, resumen:`${v} ${d} = ${nm.toFixed(1)} Nm.` };""")

# 21. Costo ruta GNC
M("ahorro-gnc-vs-nafta-anual-ars", "⛽", "Ahorro GNC vs nafta anual",
  "Ahorro anual usando GNC (ARG).",
  "Ahorro = km/(rend·precio)",
  [("km","Km/año","number",None),("kmL","Nafta km/L","number",None),("kmM3","GNC km/m³","number",None),("pN","$ nafta","number",None),("pG","$ m³ GNC","number",None)],
  [("costoN","Costo nafta",None),("costoG","Costo GNC",None),("ahorro","Ahorro anual",None),("resumen","Interpretación",None)],
  ["20000km","$20000 vs $8000"], "Ahorro $12000",
  [("¿Equipo GNC?","Inversión inicial importante."),
   ("¿Km necesarios?","Vale la pena >20000 km/año."),
   ("¿Autonomía GNC?","Menor, conviene tener nafta backup."),
   ("¿Habilitación?","RTO GNC anual obligatoria."),
   ("¿Potencia?","Pérdida ~10% vs nafta.")],
  """  const km=Number(i.km)||0; const kl=Number(i.kmL)||10; const km3=Number(i.kmM3)||12; const pn=Number(i.pN)||1; const pg=Number(i.pG)||0.5;
  const cn=km/kl*pn; const cg=km/km3*pg;
  return { costoN:`$${cn.toFixed(0)}`, costoG:`$${cg.toFixed(0)}`, ahorro:`$${(cn-cg).toFixed(0)}`, resumen:`Nafta $${cn.toFixed(0)} vs GNC $${cg.toFixed(0)}: ahorro $${(cn-cg).toFixed(0)}/año.` };""")

# 22. Leasing
M("leasing-auto-mensual-vs-compra", "💳", "Leasing auto cuota",
  "Cuota mensual leasing según valor y residual.",
  "Cuota = (V - VR) / meses + interés",
  [("valor","Valor","number","$"),("residual","Residual %","number",None),("meses","Meses","number",None),("tasa","Tasa anual","number","%")],
  [("cuota","Cuota mensual",None),("totalPago","Total pagado",None),("resumen","Interpretación",None)],
  ["$30000, 50% res, 36m, 10%","~$475/mes"], "~$475",
  [("¿Leasing vs préstamo?","Pagás uso, no compra."),
   ("¿Opción compra?","Al final pagás residual para ser dueño."),
   ("¿Km?","Leasing suele limitar km/año."),
   ("¿Mantenimiento?","Algunos incluyen service."),
   ("¿Impuestos?","Diferimiento ventajoso para empresas.")],
  """  const v=Number(i.valor)||0; const r=Number(i.residual)||0; const m=Number(i.meses)||36; const t=Number(i.tasa)||10;
  const vr=v*r/100;
  const i_m=t/100/12;
  const cuota=((v-vr)/m)+(v+vr)/2*i_m;
  return { cuota:`$${cuota.toFixed(2)}`, totalPago:`$${(cuota*m+vr).toFixed(0)}`, resumen:`Leasing ${m} meses: $${cuota.toFixed(0)}/mes, residual $${vr.toFixed(0)}.` };""")

# 23. Nafta litros dolar
M("litros-nafta-por-salario-poder-compra", "💰", "Litros de nafta por salario",
  "Poder de compra: cuántos L con tu sueldo.",
  "L = salario / precio",
  [("sueldo","Sueldo","number","$"),("precio","Precio L","number","$")],
  [("litros","Litros",None),("km","Km a 10km/L",None),("resumen","Interpretación",None)],
  ["$500, $1","500L"], "5000 km",
  [("¿Para qué?","Comparar poder compra entre países/épocas."),
   ("¿Medida real?","Considerar inflación y PPA."),
   ("¿Argentina?","Varía mucho, revisar mensualmente."),
   ("¿Premium?","Super vs Premium ~15-20% más."),
   ("¿Promedio?","Tomar precio YPF base como referencia.")],
  """  const s=Number(i.sueldo)||0; const p=Number(i.precio)||1;
  const l=s/p;
  return { litros:`${l.toFixed(0)} L`, km:`${(l*10).toFixed(0)} km`, resumen:`$${s} / $${p} = ${l.toFixed(0)} litros.` };""")

# 24. SUV vs sedán
M("emisiones-co2-auto-g-km-anual", "🌫️", "Emisiones CO2 anuales auto",
  "CO2 emitido según consumo.",
  "~2.3 kg CO2/L nafta",
  [("km","Km/año","number",None),("rend","Rendimiento","number","km/L")],
  [("litros","L/año",None),("co2","CO2 año",None),("arboles","Árboles equiv",None),("resumen","Interpretación",None)],
  ["15000km, 12km/L","~2870 kg CO2"], "~130 árboles",
  [("¿Factor?","2.31 kg CO2/L nafta, 2.68 diesel."),
   ("¿Árboles?","1 árbol absorbe ~22 kg CO2/año."),
   ("¿Compensar?","Offset voluntario en proyectos de reforestación."),
   ("¿EV?","Depende mix eléctrico país."),
   ("¿Auto compartido?","Divide emisiones per capita.")],
  """  const km=Number(i.km)||0; const r=Number(i.rend)||12;
  const l=km/r; const co2=l*2.31;
  return { litros:`${l.toFixed(0)} L`, co2:`${co2.toFixed(0)} kg CO2`, arboles:`${(co2/22).toFixed(0)} árboles`, resumen:`${km}km/año emite ${co2.toFixed(0)} kg CO2 (~${(co2/22).toFixed(0)} árboles/año para absorber).` };""")

# 25. VTV fecha
M("vtv-ruta-vencimiento-vigencia-meses", "📅", "VTV vigencia y próxima",
  "Calcula próxima VTV según antigüedad.",
  "Vigencia según edad",
  [("anio","Año modelo","number",None),("ultima","Última VTV","number","mes (1-12)")],
  [("frecuencia","Frecuencia",None),("proxima","Próxima (meses)",None),("resumen","Recomendación",None)],
  ["2018, mes 6","Cada 2 años"], "24 meses",
  [("¿Frecuencia?","0-4 años nueva; 5-9 anual; 10+ semestral (BA)."),
   ("¿Qué revisan?","Luces, frenos, emisiones, dirección."),
   ("¿Costo?","Varía provincia."),
   ("¿Multas?","Sin VTV: infracción grave."),
   ("¿Ejemplo?","CABA: cada 3 años <10 años, anual 10+.")],
  """  const a=Number(i.anio)||2020; const u=Number(i.ultima)||1;
  const edad=new Date().getFullYear()-a;
  let fr:string; let meses:number;
  if (edad<=4) { fr='Cada 3 años'; meses=36; }
  else if (edad<=9) { fr='Anual'; meses=12; }
  else { fr='Semestral'; meses=6; }
  return { frecuencia:fr, proxima:`${meses} meses`, resumen:`Auto ${a} (${edad}a): VTV ${fr}.` };""")

# 26. Amortización préstamo
M("cuota-prestamo-auto-frances-argentino", "💸", "Cuota préstamo auto (francés)",
  "Cuota fija mensual sistema francés.",
  "C = V × i(1+i)^n/((1+i)^n-1)",
  [("v","Monto","number","$"),("meses","Meses","number",None),("tna","TNA","number","%")],
  [("cuota","Cuota",None),("total","Total pagado",None),("interes","Total interés",None),("resumen","Interpretación",None)],
  ["$15000, 60m, 12%","~$334"], "~$334",
  [("¿Francés?","Cuota constante, amortización creciente."),
   ("¿Alemán?","Cuota decreciente, amortización constante."),
   ("¿TEA vs TNA?","TEA = (1+TNA/12)^12 - 1."),
   ("¿Pre-cancelar?","Reduces interés total."),
   ("¿UVA?","Cuota ajusta por inflación.")],
  """  const v=Number(i.v)||0; const n=Number(i.meses)||1; const tna=Number(i.tna)||0;
  const i_m=tna/100/12;
  const c=i_m===0?v/n:v*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=c*n;
  return { cuota:`$${c.toFixed(2)}`, total:`$${total.toFixed(2)}`, interes:`$${(total-v).toFixed(2)}`, resumen:`Cuota $${c.toFixed(0)}, total $${total.toFixed(0)} (interés $${(total-v).toFixed(0)}).` };""")

# 27. Peso tara
M("capacidad-carga-camioneta-peso-util", "📦", "Capacidad carga camioneta",
  "Peso útil = PBT - tara.",
  "Útil = PBT - Tara",
  [("pbt","PBT","number","kg"),("tara","Tara","number","kg")],
  [("util","Capacidad útil",None),("resumen","Interpretación",None)],
  ["2800 - 1900","900 kg"], "900 kg",
  [("¿Pickup tipo?","Medianas 800-1200 kg, grandes 1500+."),
   ("¿Pasajeros?","Incluir peso personas."),
   ("¿Remolque?","Tracción suma peso arrastrado."),
   ("¿Legal?","Excederlo = multa y peligro."),
   ("¿Distribución?","70% sobre eje trasero óptima.")],
  """  const p=Number(i.pbt)||0; const t=Number(i.tara)||0;
  const u=p-t;
  return { util:`${u} kg`, resumen:`PBT ${p} - Tara ${t} = ${u} kg útiles.` };""")

# 28. Tiempo viaje
M("tiempo-viaje-auto-distancia-velocidad-paradas", "⏱️", "Tiempo viaje (con paradas)",
  "Tiempo real considerando paradas.",
  "t = km/v + paradas",
  [("km","Km","number",None),("v","Velocidad prom","number","km/h"),("paradas","# paradas","number",None),("dur","Min/parada","number",None)],
  [("tiempo","Tiempo total",None),("resumen","Interpretación",None)],
  ["1000km 90kmh 2×30min","12h 11min"], "12h 11min",
  [("¿Real vs max?","Velocidad promedio siempre menor por tráfico."),
   ("¿Descansos?","Cada 2h. 20 min recomendados."),
   ("¿Noche?","Evitar fatiga, reducir velocidad."),
   ("¿Peajes?","Sumar ~2 min cada uno."),
   ("¿Ruta?","Consultar tráfico en tiempo real.")],
  """  const km=Number(i.km)||0; const v=Number(i.v)||80; const np=Number(i.paradas)||0; const d=Number(i.dur)||0;
  const h=km/v; const extra=np*d/60;
  const tot=h+extra;
  const hh=Math.floor(tot); const mm=Math.round((tot-hh)*60);
  return { tiempo:`${hh}h ${mm}min`, resumen:`${km}km a ${v}km/h + ${np} paradas: ${hh}h ${mm}min.` };""")

# 29. Amortiguación
M("suspension-altura-libre-piso-auto", "🔧", "Altura libre piso (clearance)",
  "Clearance según tipo auto.",
  "Rangos típicos",
  [("tipo","Tipo","select",[("sedan","Sedán"),("suv","SUV"),("pickup","Pickup"),("off","Off-road 4x4")])]
  ,
  [("altura","Altura libre",None),("categoria","Categoría",None),("resumen","Interpretación",None)],
  ["SUV","18-22 cm"], "~20 cm",
  [("¿Mínimo legal?","Suele haber norma altura luces."),
   ("¿Aumentar?","Suspensión lift; afecta centro gravedad."),
   ("¿Bajar?","Estética; problemas en lomos."),
   ("¿Importante?","Off-road prioritario; calle mínimo 15cm."),
   ("¿Aprobado?","Modificaciones requieren verificación.")],
  """  const t=String(i.tipo||'sedan');
  const r:Record<string,string>={sedan:'12-15 cm',suv:'18-22 cm',pickup:'20-25 cm',off:'25-30 cm'};
  return { altura:r[t]||'15 cm', categoria:t, resumen:`${t}: altura libre típica ${r[t]||'15 cm'}.` };""")

# 30. Circunferencia rueda
M("circunferencia-rueda-velocimetro-exacto", "🛞", "Circunferencia rueda para velocímetro",
  "Circunferencia exacta para calibrar velocímetro.",
  "C = π·D",
  [("ancho","Ancho","number","mm"),("aspect","Aspect","number","%"),("rin","Rin","number","''")],
  [("circ","Circunferencia",None),("ms","m por rev",None),("calibracion","Calibración velocímetro",None),("resumen","Interpretación",None)],
  ["205/55R16","1.99 m"], "1.99 m",
  [("¿Por qué?","Velocímetro calcula v desde ω rueda."),
   ("¿Diámetros diferentes?","Error velocímetro lineal."),
   ("¿GPS check?","Confirma velocidad real."),
   ("¿Cadencia ABS?","Diferencias pequeñas rueda ~OK."),
   ("¿Reglamentado?","+3% tolerancia típica.")],
  """  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const d=r*25.4+w*a/100*2;
  const c=d*Math.PI/1000;
  return { circ:`${c.toFixed(3)} m`, ms:`${c.toFixed(3)} m`, calibracion:`${c.toFixed(3)} m/rev`, resumen:`${w}/${a}R${r}: circunferencia ${c.toFixed(2)}m.` };""")


def collect():
    return SPECS
