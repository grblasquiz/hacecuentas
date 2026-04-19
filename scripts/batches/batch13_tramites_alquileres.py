"""Batch 13 — Trámites + Alquileres AR (40 calcs)."""
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


def fmt(n): return f"'$'+{n}.toFixed(0).replace(/\\\\B(?=(\\\\d{{3}})+(?!\\\\d))/g,'.')"


# === 20 TRÁMITES ===

M("costo-escritura-inmueble-porcentaje-valor", "finanzas", "📄", "Costo escritura de inmueble 2026",
  "Cuánto cuesta escriturar en CABA/PBA: escribano + aportes + impuestos + sellos (~6-9% del valor).",
  "Valor × (honorarios + impuestos + aportes)",
  [("valorInmueble","Valor escritura","number","$"),("jurisdiccion","Jurisdicción","select",[("caba","CABA"),("pba","PBA")])],
  [("honorarios","Honorarios escribano",None),("impuestos","Impuestos",None),("total","Total escrituración",None),("resumen","Interpretación",None)],
  ["$80M CABA","~$5.5M total"], "$5.5M",
  [("¿Honorarios escribano?","~1.5% del valor (negociable pero suele estar regulado)."),
   ("¿Sellos?","3.5% CABA/PBA. Lo paga mitad comprador, mitad vendedor."),
   ("¿Impuesto Transferencia ITI?","1.5% a cargo del vendedor."),
   ("¿Colegio escribanos?","~1% aporte al colegio profesional."),
   ("¿Vivienda única?","Puede exentar sellos hasta cierto tope.")],
  """  const v=Number(i.valorInmueble)||0; const j=String(i.jurisdiccion||'caba');
  const hon=v*0.015;
  const sellos=v*0.035;
  const iti=v*0.015;
  const aportes=v*0.01;
  const total=hon+sellos+iti+aportes;
  return { honorarios:'$'+hon.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), impuestos:'$'+(sellos+iti).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Inmueble $${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: ~$${total.toFixed(0)} total (${(total/v*100).toFixed(1)}%).` };""")

M("costo-transferencia-auto-0km-usado", "finanzas", "🚗", "Costo transferencia auto usado",
  "Cuánto cuesta transferir un auto usado: aranceles + impuestos + sellado provincial.",
  "Valor × % + fijos",
  [("valor","Valor auto","number","$"),("provincia","Provincia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba")])],
  [("aranceles","Aranceles DNRPA",None),("impuestos","Impuestos provinciales",None),("total","Total transferencia",None),("resumen","Interpretación",None)],
  ["Auto $20M PBA","~$900k"], "$900k",
  [("¿Qué pagás?","Aranceles nacionales DNRPA + impuestos provinciales (sellos 1-2%) + servicios gestoría."),
   ("¿Gestor?","Puede adelantar trámites. Cobra $50k-150k de honorarios."),
   ("¿Tiempo?","2-7 días hábiles."),
   ("¿Exenciones?","Parentesco directo, discapacidad."),
   ("¿Necesitás?","Título + cédula verde/azul, verificación, libre deuda, DNI.")],
  """  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const ara=85000;
  const alicSe: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02 };
  const sellos=v*(alicSe[p]||0.02);
  const total=ara+sellos;
  return { aranceles:'$'+ara.toLocaleString('es-AR'), impuestos:'$'+sellos.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Auto $${v.toLocaleString('es-AR')} en ${p.toUpperCase()}: transferencia ~$${total.toFixed(0)}.` };""")

M("vtv-costo-provincia-2026", "automotor", "🔍", "VTV costo 2026 por provincia",
  "Cuánto cuesta la VTV (Verificación Técnica Vehicular) 2026 por provincia.",
  "Tarifa por tipo vehículo",
  [("provincia","Provincia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba"),("sfe","Santa Fe")]),("tipo","Tipo vehículo","select",[("auto","Auto"),("moto","Moto"),("pickup","Pick-up"),("camion","Camión")])],
  [("costo","Costo VTV",None),("vigencia","Vigencia",None),("resumen","Interpretación",None)],
  ["Auto CABA","$60k"], "$60k",
  [("¿Qué revisan?","Frenos, luces, dirección, suspensión, emisiones, vidrios, cinturones."),
   ("¿Frecuencia?","Vehículos 0-3 años: sin VTV. 4-9: anual. 10+: semestral (varía provincia)."),
   ("¿Si no paso?","Tenés 30-60 días para corregir y recheck gratis."),
   ("¿Multa sin VTV?","Infracción grave: $100k-300k según provincia."),
   ("¿Digital?","En CABA se saca con DNI + patente online, pago y turno.")],
  """  const p=String(i.provincia||'caba'); const t=String(i.tipo||'auto');
  const base: Record<string,number> = { caba:55000, pba:48000, cba:42000, sfe:45000 };
  const mult: Record<string,number> = { auto:1, moto:0.5, pickup:1.3, camion:2.0 };
  const c=(base[p]||50000)*(mult[t]||1);
  return { costo:'$'+c.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), vigencia:'1-2 años según edad', resumen:`VTV ${t} ${p.toUpperCase()}: ~$${c.toFixed(0)}.` };""")

M("licencia-conducir-costo-categoria-b1-a", "finanzas", "🪪", "Licencia conducir: costo + categorías",
  "Costo de sacar/renovar licencia de conducir por categoría y provincia 2026.",
  "Examen + trámite + fotocheck",
  [("tipo","Tipo","select",[("nueva","Nueva"),("renov","Renovación"),("duplicado","Duplicado"),("ampliacion","Ampliación")]),("categoria","Categoría","select",[("a","A moto"),("b","B auto"),("c","C camión"),("d","D transporte pasajeros"),("e","E remolque")])],
  [("costo","Costo total",None),("validez","Validez",None),("resumen","Interpretación",None)],
  ["Nueva B auto","~$50k"], "$50k",
  [("¿Examen psicofísico?","Obligatorio: vista, audición, presión arterial, reflejos."),
   ("¿Tiempo validez?","5 años primeros. Luego 2-5 años según edad (más corto adulto mayor)."),
   ("¿Curso teórico?","Obligatorio para nueva licencia en la mayoría de provincias."),
   ("¿Scoring?","Sistema de puntos: -X puntos por infracción, impacta en renovación."),
   ("¿Cat profesional?","C, D, E para transporte. Requieren mayor examen médico.")],
  """  const t=String(i.tipo||'nueva'); const c=String(i.categoria||'b');
  const baseTipo: Record<string,number> = { nueva:40000, renov:25000, duplicado:15000, ampliacion:30000 };
  const multCat: Record<string,number> = { a:1, b:1, c:1.4, d:1.5, e:1.3 };
  const t1=(baseTipo[t]||40000)*(multCat[c]||1);
  return { costo:'$'+t1.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), validez:'5 años primera, luego 2-5 según edad', resumen:`${t} ${c.toUpperCase()}: ~$${t1.toFixed(0)}.` };""")

M("registro-dnrpa-auto-0km-arancel", "finanzas", "📝", "DNRPA: arancel registro auto 0km",
  "Arancel DNRPA para registrar un auto 0km: cédula verde, cédula azul, titularidad.",
  "Aranceles federales fijos + provincial",
  [("valor","Valor auto","number","$"),("provincia","Provincia","select",[("caba","CABA"),("pba","PBA")])],
  [("dnrpa","Arancel DNRPA",None),("sellos","Sellos provinciales",None),("total","Total",None),("resumen","Interpretación",None)],
  ["Auto $30M CABA","~$1.5M"], "$1.5M",
  [("¿DNRPA?","Dirección Nacional de Registros Propiedad Automotor."),
   ("¿Arancel fijo?","Parte fija + parte proporcional al valor."),
   ("¿Patentamiento inicial?","Primera patente: más caro que renovación."),
   ("¿Tiempo?","2-5 días hábiles con gestor, más si hacés solo."),
   ("¿Leasing?","Tramo proporcional al comprador + tramo al banco.")],
  """  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const dnrpa=85000+v*0.008;
  const sellos=v*(p==='pba'?0.02:0.015);
  const total=dnrpa+sellos;
  return { dnrpa:'$'+dnrpa.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), sellos:'$'+sellos.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Auto $${v.toLocaleString('es-AR')} ${p}: registro $${total.toFixed(0)}.` };""")

M("dni-pasaporte-costo-tramite-argentina", "finanzas", "🛂", "DNI y pasaporte: costo Argentina 2026",
  "Cuánto cuesta sacar DNI (nuevo, renovación, canje) y pasaporte argentino.",
  "Tarifas Registro Civil + Renaper",
  [("tipo","Trámite","select",[("dni-0-5","DNI 0-5 años"),("dni-renov","DNI renovación"),("dni-duplic","DNI duplicado"),("pas-com","Pasaporte común"),("pas-ex","Pasaporte express")])],
  [("costo","Costo",None),("tiempo","Tiempo entrega",None),("resumen","Interpretación",None)],
  ["Pasaporte común","~$95k"], "$95k",
  [("¿DNI primera vez?","Gratuito hasta 5 años, luego arancel."),
   ("¿Pasaporte común?","~$90-100k. Entrega en 15 días."),
   ("¿Pasaporte express?","+~50% del costo. Entrega en 5-10 días."),
   ("¿Vigencia?","DNI sin vencimiento. Pasaporte 10 años adultos, 5 años menores."),
   ("¿Mayor urgencia?","Trámite en frontera: habilitación excepcional 24/48h.")],
  """  const t=String(i.tipo||'dni-renov');
  const tar: Record<string,[number,string]> = {
    'dni-0-5':[0,'15 días'], 'dni-renov':[12000,'15 días'], 'dni-duplic':[18000,'15 días'],
    'pas-com':[95000,'15 días'], 'pas-ex':[150000,'5-10 días']
  };
  const [c,t1]=tar[t]||tar['dni-renov'];
  return { costo:'$'+c.toLocaleString('es-AR'), tiempo:t1, resumen:`${t}: $${c.toLocaleString('es-AR')}, entrega ${t1}.` };""")

M("matrimonio-civil-costo-tramite-argentina", "finanzas", "💒", "Matrimonio civil AR: costo y trámite",
  "Costo del matrimonio civil por provincia, incluyendo registro y certificados.",
  "Arancel Registro Civil",
  [("provincia","Provincia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba")]),("sede","Sede","select",[("ofic","Oficina Reg.Civil"),("dom","A domicilio")])],
  [("costo","Costo",None),("documentos","Documentos necesarios",None),("resumen","Interpretación",None)],
  ["CABA oficina","$0 (gratis)"], "Gratuito",
  [("¿Gratis en Argentina?","Sí, el matrimonio civil en oficina es gratuito."),
   ("¿A domicilio?","Tiene costo (~$150-300k según jurisdicción y distancia)."),
   ("¿Documentos?","DNI + partida de nacimiento + testigos + turno."),
   ("¿Testigos?","2 mayores de edad con DNI."),
   ("¿Divorcio previo?","Sentencia de divorcio inscripta."),
   ("¿Acta internacional?","Si alguno es extranjero: apostilla y traducciones.")],
  """  const p=String(i.provincia||'caba'); const s=String(i.sede||'ofic');
  const c=s==='ofic'?0:(p==='caba'?250000:200000);
  return { costo:c===0?'Gratuito':'$'+c.toLocaleString('es-AR'), documentos:'DNI + partida + 2 testigos + turno', resumen:`Matrimonio ${p} ${s}: ${c===0?'gratuito':'$'+c.toLocaleString('es-AR')}.` };""")

M("divorcio-express-costo-argentina-honorarios", "finanzas", "📑", "Divorcio express AR: costo y tiempo",
  "Costo del divorcio en Argentina (ley 26.994): express 3-6 meses típicamente.",
  "Honorarios + aportes + sellados",
  [("comun","Común acuerdo","select",[("si","Sí (más rápido)"),("no","No")]),("hijosMenores","Hijos menores","select",[("si","Sí"),("no","No")])],
  [("costo","Rango honorarios",None),("tiempo","Tiempo estimado",None),("resumen","Interpretación",None)],
  ["Común acuerdo, sin hijos","3-6 meses, $500k"], "$500k",
  [("¿Express?","Desde 2015 con Código Civil unificado: no hace falta plazo de espera."),
   ("¿Común acuerdo?","3-6 meses típicamente. Menor costo."),
   ("¿Contencioso?","1-3 años. Honorarios mayores."),
   ("¿Hijos menores?","Hay que acordar cuota alimentaria + régimen de visitas."),
   ("¿Bienes gananciales?","Liquidación de sociedad conyugal aparte si corresponde.")],
  """  const c=String(i.comun||'si')==='si'; const h=String(i.hijosMenores||'no')==='si';
  const base=c?500000:2500000;
  const extra=h?200000:0;
  const total=base+extra;
  const tiempo=c?'3-6 meses':'1-3 años';
  return { costo:'$'+base.toLocaleString('es-AR')+(h?' + '+extra.toLocaleString('es-AR')+' hijos':''), tiempo, resumen:`Divorcio ${c?'común acuerdo':'contencioso'}${h?' con hijos':''}: ~$${total.toLocaleString('es-AR')}, ${tiempo}.` };""")

M("sucesion-costo-honorarios-abogado-inmueble", "finanzas", "⚰️", "Sucesión AR: honorarios y costos",
  "Costo aproximado de sucesión con inmueble: honorarios + impuestos + trámites.",
  "6-10% del valor acervo",
  [("valorAcervo","Valor total acervo","number","$"),("complejidad","Complejidad","select",[("simple","Simple"),("med","Media"),("compleja","Compleja")])],
  [("honorariosAbog","Honorarios abogado",None),("impuestos","Impuestos",None),("total","Total estimado",None),("resumen","Interpretación",None)],
  ["Acervo $100M simple","~$7M"], "$7M",
  [("¿Quién paga?","Se descuenta del acervo hereditario antes de distribuir."),
   ("¿Honorarios abogado?","Regulación legal: 8-15% del acervo según complejidad."),
   ("¿Impuesto transmisión gratuita?","Provincias como PBA: alícuotas progresivas. CABA: exento."),
   ("¿Tasa justicia?","~1.5% del valor en la mayoría de provincias."),
   ("¿Sucesión abintestato?","Sin testamento: orden legal (hijos, cónyuge, padres).")],
  """  const v=Number(i.valorAcervo)||0; const c=String(i.complejidad||'simple');
  const hono: Record<string,number> = { simple:0.08, med:0.12, compleja:0.15 };
  const h=v*(hono[c]||0.08);
  const imp=v*0.03;
  const total=h+imp;
  return { honorariosAbog:'$'+h.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), impuestos:'$'+imp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Acervo $${v.toLocaleString('es-AR')} ${c}: total ~$${total.toFixed(0)} (${(total/v*100).toFixed(1)}%).` };""")

M("certificado-antecedentes-penales-costo", "finanzas", "🗂️", "Certificado antecedentes penales",
  "Costo del certificado antecedentes penales (Reincidencia) 2026. Express y común.",
  "Arancel único Registro Nacional",
  [("urgencia","Urgencia","select",[("comun","Común 5 días"),("urg","Urgente 24h"),("exp","Express 3h")])],
  [("costo","Costo",None),("validez","Validez",None),("resumen","Interpretación",None)],
  ["Común","~$30k"], "$30k",
  [("¿Reincidencia?","Registro Nacional de Reincidencia. Depende de Ministerio Justicia."),
   ("¿Online?","Se gestiona en www.dnrec.jus.gov.ar con firma digital o turno."),
   ("¿Validez?","30 días (puede extenderse a 90 para trabajo/visa)."),
   ("¿Para qué?","Trabajo, visa, matriculación profesional, licencias especiales.")],
  """  const u=String(i.urgencia||'comun');
  const t: Record<string,[number,string]> = { comun:[30000,'5 días'], urg:[60000,'24 horas'], exp:[120000,'3 horas'] };
  const [c,t1]=t[u]||t.comun;
  return { costo:'$'+c.toLocaleString('es-AR'), validez:'30 días', resumen:`${u}: $${c.toLocaleString('es-AR')} (${t1}).` };""")

# === 9 MÁS TRÁMITES ===

M("certificado-libre-deuda-auto-costo", "finanzas", "📋", "Libre deuda automotor costo",
  "Libre deuda de infracciones/patente para vender auto. Costo + cómo sacarlo.",
  "Arancel + trámite",
  [("provincia","Provincia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba")])],
  [("costo","Costo",None),("tiempo","Tiempo",None),("resumen","Interpretación",None)],
  ["CABA","$15k"], "$15k",
  [("¿Por qué?","Obligatorio para transferencia del vehículo."),
   ("¿Online?","En muchas provincias: online con pago."),
   ("¿Si hay deuda?","Debes regularizar primero antes de sacar el libre."),
   ("¿Vigencia?","30 días.")],
  """  const p=String(i.provincia||'caba');
  const c: Record<string,number> = { caba:15000, pba:18000, cba:14000 };
  return { costo:'$'+(c[p]||15000).toLocaleString('es-AR'), tiempo:'24-48h online', resumen:`Libre deuda ${p}: $${(c[p]||15000).toLocaleString('es-AR')}.` };""")

M("patente-ciclomotor-moto-argentina-costo", "automotor", "🏍️", "Patente moto/ciclomotor AR",
  "Patentamiento de moto 0km o ciclomotor: aranceles + sellos + verificación.",
  "Arancel fijo + % sellos",
  [("valor","Valor moto","number","$"),("cilindrada","Cilindrada","select",[("cic","<50cc ciclomotor"),("moto","50-500cc"),("gran",">500cc")])],
  [("costo","Costo patentamiento",None),("patente","Patente anual estimada",None),("resumen","Interpretación",None)],
  ["Moto 150cc $1.5M","$80k patente"], "$80k",
  [("¿Ciclomotor <50cc?","No paga patente. Seguro sí obligatorio."),
   ("¿Cilindrada >500cc?","Patente más alta y seguro especial."),
   ("¿Casco?","Obligatorio para piloto y acompañante."),
   ("¿Registro?","Categoría A1 (50-150cc), A2 (150-250), A3 (+250cc).")],
  """  const v=Number(i.valor)||0; const c=String(i.cilindrada||'moto');
  const pat: Record<string,number> = { cic:0, moto:v*0.03, gran:v*0.045 };
  const p=pat[c]||v*0.03;
  const costo=45000+v*0.008;
  return { costo:'$'+costo.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), patente:'$'+p.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Moto ${c} $${v.toLocaleString('es-AR')}: registro $${costo.toFixed(0)}, patente $${p.toFixed(0)}.` };""")

M("dni-extranjero-residencia-costo-migraciones", "finanzas", "🌍", "Residencia / DNI extranjeros AR",
  "Costo de residencia temporaria/permanente para extranjeros + DNI.",
  "Tasa Migraciones + Renaper",
  [("tipo","Tipo","select",[("temp-merc","Temporaria Mercosur"),("temp-no","Temporaria no Mercosur"),("perm","Permanente")])],
  [("migraciones","Tasa Migraciones",None),("dni","DNI extranjero",None),("total","Total",None),("resumen","Interpretación",None)],
  ["Temp Mercosur","~$80k"], "$80k",
  [("¿Mercosur?","Argentinos, uruguayos, paraguayos, brasileños, chilenos: arancel reducido."),
   ("¿No Mercosur?","Arancel mayor + requisitos adicionales."),
   ("¿Permanente?","Después de 2-3 años de temporaria."),
   ("¿DNI extranjero?","Mismo trámite que DNI local con visa + residencia."),
   ("¿Visas?","Trabajo, estudio, rentista, asistido. Cada una tiene requisitos.")],
  """  const t=String(i.tipo||'temp-merc');
  const m: Record<string,[number,number]> = { 'temp-merc':[35000,12000], 'temp-no':[90000,12000], perm:[50000,12000] };
  const [mig,dni]=m[t]||m['temp-merc'];
  const total=mig+dni;
  return { migraciones:'$'+mig.toLocaleString('es-AR'), dni:'$'+dni.toLocaleString('es-AR'), total:'$'+total.toLocaleString('es-AR'), resumen:`${t}: Migraciones $${mig.toLocaleString('es-AR')} + DNI $${dni.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')}.` };""")

M("visa-turismo-usa-ee-uu-costo-b1-b2", "finanzas", "🇺🇸", "Visa EE.UU. B1/B2 turismo: costo",
  "Costo de la visa turista EE.UU. (B1/B2) + MRV fee + fotos + traducciones.",
  "USD fijos + ARS gestión",
  [("dolarOficial","Dólar oficial","number","$")],
  [("mrvFee","MRV fee consulado",None),("mrvArs","MRV en ARS",None),("gestion","Gestión estimada",None),("total","Total estimado",None),("resumen","Interpretación",None)],
  ["$1400","~$350k"], "$350k",
  [("¿MRV fee?","USD 185 por persona (a cuenta del consulado)."),
   ("¿Duración?","10 años múltiple entrada B1/B2 si se aprueba."),
   ("¿Entrevista?","Obligatoria en Embajada de Buenos Aires. Turno online."),
   ("¿DS-160?","Formulario obligatorio previo. Complejo."),
   ("¿Documentos?","Pasaporte + entrevista + prueba arraigo (trabajo, propiedades).")],
  """  const d=Number(i.dolarOficial)||1400;
  const usd=185;
  const mrvArs=usd*d;
  const gest=80000;
  const total=mrvArs+gest;
  return { mrvFee:'USD '+usd, mrvArs:'$'+mrvArs.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), gestion:'$'+gest.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Visa USA: USD ${usd} (≈$${mrvArs.toFixed(0)}) + gestión = ~$${total.toFixed(0)}.` };""")

M("ciudadania-italiana-argentina-costo-tramite", "finanzas", "🇮🇹", "Ciudadanía italiana AR: costo",
  "Costo de obtener ciudadanía italiana en Argentina (vía consulado): trámites + traducciones + gestor.",
  "Consulado + traducciones + legalizaciones",
  [("viaConsulado","Vía","select",[("consulado","Consulado AR"),("italia","Viaje a Italia")]),("documentos","Documentos a traducir","number",None)],
  [("consulado","Consulado",None),("traducciones","Traducciones",None),("total","Total estimado",None),("resumen","Interpretación",None)],
  ["Consulado AR, 8 docs","~$1.5M"], "$1.5M",
  [("¿Turno consulado?","Demora 3-8 años obtener turno en consulados AR."),
   ("¿Via Italia?","Se puede hacer en 3-6 meses yendo a residir a Italia."),
   ("¿Documentos?","Partidas nacimiento, matrimonio, defunción traducidas + apostilladas."),
   ("¿Apellido?","Regla de línea (padres/abuelos italianos, no por matrimonio)."),
   ("¿Costo medio?","$1-3M en Argentina, USD 3000-8000 en Italia total.")],
  """  const v=String(i.viaConsulado||'consulado'); const d=Number(i.documentos)||8;
  const cons=v==='consulado'?300:0;
  const trad=d*35000;
  const apost=d*20000;
  const gest=500000;
  const total=trad+apost+gest+cons*1400;
  return { consulado:v==='consulado'?'Arancel EUR 300':'No aplica', traducciones:'$'+trad.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Ciudadanía italiana ${v}: ~$${total.toFixed(0)} total.` };""")

M("monotributo-alta-afip-tramite-zero", "finanzas", "📝", "Alta monotributo AFIP: trámite 2026",
  "Cómo darse de alta en monotributo AFIP + documentos + primer pago.",
  "Arancel cero + cuota del mes",
  [("categoria","Categoría inicial","select",[("A","A"),("B","B"),("C","C"),("D","D")])],
  [("costoAlta","Costo alta",None),("primeraPaga","Primera cuota",None),("documentos","Documentos",None),("resumen","Interpretación",None)],
  ["Cat A","Alta gratis, $43k primer mes"], "$43k",
  [("¿Alta gratis?","Sí, trámite cero costo en afip.gob.ar con clave fiscal."),
   ("¿Qué pagás?","Solo la cuota mensual de la categoría elegida."),
   ("¿Clave fiscal?","Nivel 3 mínimo (biométrica o videollamada)."),
   ("¿CUIT?","Si no tenés: hacer alta en Registro ante AFIP."),
   ("¿Categorizarse?","Estimá facturación anual + alquiler + gastos.")],
  """  const c=String(i.categoria||'A');
  const cuotas: Record<string,number> = { A:43000, B:51400, C:63400, D:80800 };
  return { costoAlta:'Gratuito', primeraPaga:'$'+(cuotas[c]||43000).toLocaleString('es-AR'), documentos:'DNI + Clave Fiscal nivel 3 + CUIT', resumen:`Alta monotributo ${c}: gratis + primera cuota $${(cuotas[c]||43000).toLocaleString('es-AR')}.` };""")

M("factura-electronica-afip-primera-vez", "finanzas", "📄", "Primera factura electrónica AFIP",
  "Cómo emitir tu primera factura electrónica AFIP (monotributo/RI). Paso a paso.",
  "Trámite gratuito online",
  [("regimen","Régimen","select",[("mono","Monotributo"),("ri","Responsable Inscripto")]),("tipo","Tipo factura","select",[("c","C"),("a","A"),("b","B"),("m","M")])],
  [("costo","Costo emisión",None),("proceso","Proceso",None),("resumen","Interpretación",None)],
  ["Monotributo C","Gratis"], "Gratis",
  [("¿Gratuito?","Sí, AFIP ofrece facturador web gratis."),
   ("¿Tipo factura?","Monotributo: solo C. RI: A (IVA), B (consumidor final), M (caso de error)."),
   ("¿Nombre fiscal?","Primero registrar punto de venta y domicilio fiscal."),
   ("¿Terceros?","Apps como Colppy, Contabilium, Xubio facturan directo AFIP."),
   ("¿Controladores fiscales?","Solo para RI con venta masiva presencial.")],
  """  const r=String(i.regimen||'mono'); const t=String(i.tipo||'c');
  return { costo:'Gratuito (AFIP web)', proceso:'Alta punto venta → emisión factura → PDF/email al cliente', resumen:`Factura ${r} tipo ${t.toUpperCase()}: trámite gratuito en AFIP.` };""")

M("titularidad-caratular-auto-trasladar-provincia", "finanzas", "🚙", "Cambio radicación auto entre provincias",
  "Cuánto cuesta cambiar la radicación del auto a otra provincia (mudanza).",
  "Transferencia provincial + sellos",
  [("provOrigen","Provincia origen","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba")]),("provDestino","Provincia destino","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba"),("sfe","Santa Fe")]),("valor","Valor auto","number","$")],
  [("costo","Costo radicación",None),("tiempo","Tiempo",None),("resumen","Interpretación",None)],
  ["CABA → PBA, $30M","~$350k"], "$350k",
  [("¿Cuándo?","Cambio de domicilio fiscal del titular."),
   ("¿Documentos?","Cédula + título + cambio de domicilio DNI + libre deuda."),
   ("¿Costo?","Sellado nueva provincia + aranceles DNRPA."),
   ("¿Patente?","Nueva patente con el sistema de la nueva provincia."),
   ("¿Plazo legal?","30 días desde cambio de domicilio.")],
  """  const v=Number(i.valor)||0; const d=String(i.provDestino||'pba');
  const sel: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02, sfe:0.018 };
  const c=85000+v*(sel[d]||0.02);
  return { costo:'$'+c.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), tiempo:'5-15 días', resumen:`Radicación a ${d.toUpperCase()} auto $${v.toLocaleString('es-AR')}: ~$${c.toFixed(0)}.` };""")

M("libreta-sanitaria-costo-hueria-food", "finanzas", "📖", "Libreta sanitaria manipulación alimentos",
  "Costo de la libreta sanitaria para trabajar con alimentos en Argentina.",
  "Arancel municipal",
  [("municipio","Municipio","select",[("caba","CABA"),("la-plata","La Plata"),("cba","Córdoba Cap"),("rosario","Rosario")])],
  [("costo","Costo",None),("validez","Validez",None),("resumen","Interpretación",None)],
  ["CABA","$15k"], "$15k",
  [("¿Obligatoria?","Sí para cualquier trabajador que manipule alimentos."),
   ("¿Renovación?","Anual en la mayoría de municipios."),
   ("¿Incluye curso?","Generalmente sí: 4-8 horas de capacitación + examen."),
   ("¿Sin libreta?","Multa + clausura preventiva del local."),
   ("¿En línea?","Varias provincias permiten curso online + examen.")],
  """  const m=String(i.municipio||'caba');
  const c: Record<string,number> = { caba:15000, 'la-plata':12000, cba:13000, rosario:11000 };
  return { costo:'$'+(c[m]||15000).toLocaleString('es-AR'), validez:'1 año', resumen:`Libreta sanitaria ${m}: $${(c[m]||15000).toLocaleString('es-AR')}/año.` };""")

M("baja-auto-desarme-chatarra-fin-vida", "finanzas", "🚮", "Baja auto por desarme / chatarra",
  "Cómo dar de baja un auto por desarme/chatarra. DNRPA + impacto patente.",
  "Arancel DNRPA + verificación",
  [("motivo","Motivo","select",[("dest","Destrucción"),("expo","Exportación"),("chat","Chatarra total")])],
  [("costo","Costo DNRPA",None),("beneficio","Beneficio",None),("resumen","Interpretación",None)],
  ["Destrucción","$60k"], "$60k",
  [("¿Por qué dar baja?","Dejás de pagar patente y liberás responsabilidad civil."),
   ("¿Chatarra?","Vehículos 15+ años o siniestro total."),
   ("¿Costo?","Arancel fijo DNRPA + verificación técnica."),
   ("¿Partes usables?","Podés vender partes (motor, caja, etc.) antes de chatarra."),
   ("¿Impacto fiscal?","Cese de patente desde la fecha registro baja.")],
  """  const m=String(i.motivo||'dest');
  const c: Record<string,number> = { dest:60000, expo:85000, chat:45000 };
  return { costo:'$'+(c[m]||60000).toLocaleString('es-AR'), beneficio:'Cese patente + responsabilidad civil', resumen:`Baja ${m}: $${(c[m]||60000).toLocaleString('es-AR')}.` };""")


# === 20 ALQUILERES ===

M("actualizacion-alquiler-icl-bcra-mensual", "finanzas", "📊", "Actualización alquiler ICL BCRA mensual",
  "Calcula nuevo alquiler con ICL (Índice de Contratos de Locación BCRA).",
  "Alquiler × ICL actual / ICL inicial",
  [("alquilerInicial","Alquiler inicial","number","$"),("iclInicial","ICL inicial","number",None),("iclActual","ICL actual","number",None)],
  [("alquilerActual","Nuevo alquiler",None),("aumento","Aumento %",None),("resumen","Interpretación",None)],
  ["$200k, ICL 280 → 420","$300k (+50%)"], "$300k",
  [("¿ICL?","Índice de Contratos de Locación del BCRA. Promedio IPC + RIPTE."),
   ("¿Cuándo?","Actualización anual automática (ley 27551). Nuevos contratos: pactada entre partes."),
   ("¿Ley vigente?","DNU 70/2023 + ley nueva: libertad contractual, ICL como referencia."),
   ("¿Dónde consultar ICL?","BCRA.gob.ar → ICL serie diaria."),
   ("¿Retroactivo?","No. Aplica al período siguiente del aniversario.")],
  """  const a=Number(i.alquilerInicial)||0; const i1=Number(i.iclInicial)||0; const i2=Number(i.iclActual)||0;
  if (i1===0) return { alquilerActual:'—', aumento:'—', resumen:'ICL inicial inválido.' };
  const nuevo=a*(i2/i1);
  const aum=((i2/i1)-1)*100;
  return { alquilerActual:'$'+nuevo.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), aumento:aum.toFixed(1)+'%', resumen:`Alquiler $${a.toLocaleString('es-AR')} → $${nuevo.toFixed(0)} (+${aum.toFixed(1)}%).` };""")

M("expensas-departamento-calcular-m2-categoria", "finanzas", "🏢", "Expensas consorcio: cálculo por m²",
  "Calcula expensas mensuales del departamento según m² y servicios del edificio.",
  "$/m² × metros + fijos",
  [("m2","Metros cuadrados","number","m²"),("categoria","Categoría edificio","select",[("basico","Básico (sin amenities)"),("medio","Medio (algunos)"),("alto","Alto (piscina, gym, SUM)")]),("amenities","Amenities extra","number",None)],
  [("expensas","Expensas mensuales",None),("porM2","$/m²",None),("resumen","Interpretación",None)],
  ["70m² categoría media","~$140k"], "$140k",
  [("¿Quién administra?","Administrador matriculado elegido por consorcio."),
   ("¿Qué pagás?","Sueldos encargado, luz/gas comunes, limpieza, ABL del edificio, seguros, reserva."),
   ("¿Extraordinarias?","Obras mayores (pintura, ascensor): se votan en asamblea."),
   ("¿Amenities?","Piscina, gym, SUM suben las expensas 30-50%."),
   ("¿Juicios?","Deudas de más de 3 meses: pueden iniciar ejecución.")],
  """  const m2=Number(i.m2)||0; const c=String(i.categoria||'medio'); const a=Number(i.amenities)||0;
  const perM2: Record<string,number> = { basico:1500, medio:2200, alto:3500 };
  const v=(perM2[c]||2200)+a*400;
  const exp=m2*v;
  return { expensas:'$'+exp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), porM2:'$'+v.toLocaleString('es-AR'), resumen:`${m2}m² ${c}: ~$${v}/m² = $${exp.toFixed(0)}/mes.` };""")

M("contrato-alquiler-2-anios-vs-3-anios", "finanzas", "📑", "Contrato alquiler: 2 vs 3 años",
  "Comparativo plazos contrato alquiler 2 años vs 3 años: ventajas y desventajas.",
  "Matrix comparativa",
  [("plazo","Plazo","select",[("2a","2 años"),("3a","3 años"),("libre","Libre (nuevo)")])],
  [("garantia","Garantía típica",None),("actualizacion","Actualización",None),("ventajas","Ventajas",None),("resumen","Interpretación",None)],
  ["3 años","Anual ICL"], "Anual ICL",
  [("¿Ley vigente 2026?","DNU 70/2023: plazo mínimo legal 3 años, pero derogado; hoy libre pacto."),
   ("¿Actualización pactada?","Nuevos contratos permiten cualquier índice (CVS, USD, dólar MEP, ICL, UVA)."),
   ("¿2 años ilegal?","No, con el DNU puede pactarse menor plazo."),
   ("¿Garantía?","Propietaria, seguro, recibo sueldo, garante, fianza bancaria."),
   ("¿Estado inicial?","Acta estado + fotos firmada por ambas partes es CRÍTICA.")],
  """  const p=String(i.plazo||'3a');
  const info: Record<string,[string,string,string]> = {
    '2a':['Propietaria o seguro','Pactado (ICL/USD)','Plazo más corto, más flexibilidad'],
    '3a':['Propietaria o seguro','Anual ICL o pactado','Estabilidad mayor'],
    libre:['Negociable','Libre (mensual/sem/anual)','Máxima flexibilidad bilateral']
  };
  const [g,a,v]=info[p]||info['3a'];
  return { garantia:g, actualizacion:a, ventajas:v, resumen:`Contrato ${p}: ${v}.` };""")

M("seguro-caucion-alquiler-costo-mensual", "finanzas", "🛡️", "Seguro de caución alquiler",
  "Costo de seguro de caución para garantizar alquiler (alternativa a propietaria).",
  "% del alquiler + gastos",
  [("alquilerMensual","Alquiler mensual","number","$"),("plazo","Plazo","select",[("12","12 meses"),("24","24 meses"),("36","36 meses")])],
  [("prima","Prima",None),("mensualizada","Prorrateo mensual",None),("resumen","Interpretación",None)],
  ["$400k alquiler, 24 meses","~$160k prima"], "$160k",
  [("¿Seguro caución?","Reemplaza la garantía propietaria. La aseguradora cubre al propietario si el inquilino no paga."),
   ("¿Costo?","10-20% del alquiler mensual (pago único al inicio)."),
   ("¿Aprobación?","Inquilino debe calificar: recibo sueldo, antigüedad, sin deudas."),
   ("¿Propietario exige?","Cada vez más aceptan caución como garantía válida."),
   ("¿Renovación?","Debe renovarse cada vez que se renueva el contrato.")],
  """  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24;
  const tasa=p===12?0.10:p===24?0.15:0.20;
  const prima=a*tasa;
  return { prima:'$'+prima.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), mensualizada:'$'+(prima/p).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Alquiler $${a.toLocaleString('es-AR')} × ${p} meses: prima $${prima.toFixed(0)}.` };""")

M("depositos-alquiler-cuantos-meses-devolucion", "finanzas", "💰", "Depósito alquiler: cuántos meses",
  "Cuánto debe pagar de depósito de garantía. Devolución al final del contrato.",
  "1-3 meses de alquiler",
  [("alquilerMensual","Alquiler","number","$"),("contrato","Contrato","select",[("actual","Ley actual"),("ant","Ant. ley 27551")])],
  [("deposito","Depósito típico",None),("maximo","Máximo legal",None),("devolucion","Devolución final",None),("resumen","Interpretación",None)],
  ["$300k, ley actual","$300k-900k"], "1-3 meses",
  [("¿Máximo legal?","Ley 27551 pone tope: 1 mes del último alquiler. DNU 70/23 permite pactar libre."),
   ("¿Se actualiza?","Sí, con el valor del último alquiler."),
   ("¿Devolución?","30 días del egreso con descuento de daños o deudas."),
   ("¿Intereses?","Si se demora: devolver + intereses mora."),
   ("¿Daños?","Inventario inicial vs final. Lo acordado se resta.")],
  """  const a=Number(i.alquilerMensual)||0; const c=String(i.contrato||'actual');
  const max=c==='actual'?a*3:a;
  return { deposito:'$'+a.toLocaleString('es-AR')+' - $'+max.toLocaleString('es-AR'), maximo:'$'+max.toLocaleString('es-AR'), devolucion:'30 días post egreso - daños', resumen:`Alquiler $${a.toLocaleString('es-AR')}: depósito ${c==='actual'?'1-3 meses':'máx 1 mes'} = hasta $${max.toLocaleString('es-AR')}.` };""")

M("comision-inmobiliaria-alquiler-caba-pba", "finanzas", "🏘️", "Comisión inmobiliaria alquiler",
  "Comisión inmobiliaria por cerrar alquiler: CABA 4.15%, PBA variable. Quién paga.",
  "% del contrato total",
  [("alquilerMensual","Alquiler","number","$"),("plazo","Plazo","select",[("24","24 meses"),("36","36 meses")]),("jurisdiccion","Jurisdicción","select",[("caba","CABA"),("pba","PBA")])],
  [("total","Comisión total",None),("inquilino","Paga inquilino",None),("propietario","Paga propietario",None),("resumen","Interpretación",None)],
  ["$300k × 36 meses CABA","~$450k"], "$450k",
  [("¿CABA?","Ley 5859: comisión 4.15% + IVA del valor total del contrato."),
   ("¿Quién paga?","CABA: propietario paga (ley). Antes era 50/50 o inquilino."),
   ("¿PBA?","No hay tope legal. Negociable."),
   ("¿Sin inmobiliaria?","Directo propietario-inquilino: sin comisión, más riesgo."),
   ("¿Se paga cuándo?","Al firmar el contrato. Única.")],
  """  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24; const j=String(i.jurisdiccion||'caba');
  const pct=j==='caba'?0.0415:0.05;
  const total=a*p*pct*1.21;
  const propPct=j==='caba'?1:0.5;
  return { total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), inquilino:'$'+(total*(1-propPct)).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), propietario:'$'+(total*propPct).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${j.toUpperCase()}: comisión total $${total.toFixed(0)} ${j==='caba'?'(propietario paga 100%)':'(50/50)'}.` };""")

M("abl-expensas-quien-paga-inquilino-propietario", "finanzas", "❓", "ABL y expensas: inquilino vs propietario",
  "Quién paga ABL (inmobiliario) vs expensas ordinarias y extraordinarias.",
  "Por ley + pacto",
  [("concepto","Concepto","select",[("abl","ABL/Inmobiliario"),("expOrd","Expensas ordinarias"),("expExt","Expensas extraordinarias"),("serv","Servicios (luz/gas)")])],
  [("quienPaga","Quién paga",None),("comentario","Comentario",None),("resumen","Aclaración",None)],
  ["Exp ordinarias","Inquilino"], "Inquilino",
  [("¿ABL?","Impuesto inmobiliario municipal. Paga el PROPIETARIO (no es un servicio)."),
   ("¿Expensas ordinarias?","Gastos regulares del edificio: INQUILINO paga."),
   ("¿Expensas extraordinarias?","Obras mayores (pintura general, ascensor nuevo): PROPIETARIO."),
   ("¿Servicios?","Luz, gas, agua del depto: INQUILINO. A su nombre."),
   ("¿Si contrato dice al revés?","Se puede pactar pero la ley es supletoria.")],
  """  const c=String(i.concepto||'expOrd');
  const quien: Record<string,[string,string]> = {
    abl:['Propietario','Impuesto, no servicio'],
    expOrd:['Inquilino','Gastos regulares'],
    expExt:['Propietario','Obras mayores del edificio'],
    serv:['Inquilino','A su nombre']
  };
  const [q,com]=quien[c]||quien.expOrd;
  return { quienPaga:q, comentario:com, resumen:`${c}: paga ${q}.` };""")

M("aumento-alquiler-trimestral-cuatrimestral-semestral", "finanzas", "📈", "Aumento alquiler según frecuencia",
  "Comparativo aumento alquiler trimestral / cuatrimestral / semestral con inflación real.",
  "Alquiler × (1+i)^períodos",
  [("alquilerInicial","Alquiler inicial","number","$"),("inflacionMensual","Inflación mensual","number","%"),("frecuencia","Frecuencia","select",[("trim","Trimestral"),("cuat","Cuatrimestral"),("sem","Semestral"),("anual","Anual")])],
  [("alqFinal","Alquiler final (1 año)",None),("aumento","Aumento %",None),("resumen","Interpretación",None)],
  ["$300k, 3%/mes, trimestral","$400k (+33%)"], "$400k",
  [("¿Trimestral mejor?","Depende. Con alta inflación el propietario prefiere más frecuente; inquilino menos."),
   ("¿Legal?","Con DNU 70/2023 todo es pactable."),
   ("¿IPC?","Podés acordar en IPC, ICL, UVA o USD."),
   ("¿Retroactivo?","No. Aplica al período siguiente."),
   ("¿Actualización vs aumento?","Diferente a aumentos extra por servicios o mejoras.")],
  """  const a=Number(i.alquilerInicial)||0; const inf=(Number(i.inflacionMensual)||0)/100; const f=String(i.frecuencia||'trim');
  const pasosTotal=12; const mesesPeriodo: Record<string,number> = { trim:3, cuat:4, sem:6, anual:12 };
  const mp=mesesPeriodo[f]||3;
  let actual=a;
  for (let m=mp; m<=pasosTotal; m+=mp) actual=actual*Math.pow(1+inf,mp);
  const aum=(actual/a-1)*100;
  return { alqFinal:'$'+actual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), aumento:aum.toFixed(1)+'%', resumen:`$${a.toLocaleString('es-AR')} con ${f} @ ${(inf*100).toFixed(1)}%/mes: final $${actual.toFixed(0)} (+${aum.toFixed(1)}%).` };""")

M("desalojo-causa-plazos-honorarios-juicio", "finanzas", "⚖️", "Desalojo: plazos y costos juicio",
  "Cuánto dura un juicio de desalojo por falta de pago + honorarios abogado.",
  "Tiempo típico + honorarios",
  [("causa","Causa","select",[("fp","Falta de pago"),("venc","Vencimiento contrato"),("incu","Incumplimiento")])],
  [("tiempo","Tiempo estimado",None),("honorarios","Honorarios abogado",None),("resumen","Interpretación",None)],
  ["Falta de pago","6-18 meses"], "6-18 meses",
  [("¿Express?","Nueva ley permite desalojo más rápido (3-6 meses si no hay dominio consentido)."),
   ("¿Falta pago?","Intimación fehaciente + 10 días de gracia + juicio."),
   ("¿Honorarios abogado?","15-25% del valor locativo en juicio (regulado)."),
   ("¿Lanzamiento?","Orden del juez con oficial de justicia + fuerza pública si es necesario."),
   ("¿Mediación previa?","Obligatoria en CABA/PBA antes de juicio.")],
  """  const c=String(i.causa||'fp');
  const t: Record<string,string> = { fp:'6-18 meses', venc:'3-8 meses', incu:'8-24 meses' };
  return { tiempo:t[c]||t.fp, honorarios:'15-25% valor locativo', resumen:`Desalojo ${c}: ${t[c]||t.fp}, honorarios 15-25% del valor.` };""")

M("alquiler-temporal-airbnb-ganancia-neta", "finanzas", "🏖️", "Alquiler temporal Airbnb: ganancia neta",
  "Cuánto quedás neto de un alquiler en Airbnb: descontando comisión, expensas, impuestos.",
  "Ingreso bruto − gastos",
  [("precioNoche","Precio por noche","number","$"),("nochesMes","Noches/mes ocupadas","number",None),("expensas","Expensas mensuales","number","$")],
  [("bruto","Ingreso bruto",None),("comisiones","Comisiones Airbnb",None),("neto","Neto estimado",None),("roiBruto","ROI vs alquiler tradicional",None),("resumen","Interpretación",None)],
  ["$40k/noche × 15 noches","$510k neto"], "$510k",
  [("¿Comisión Airbnb?","3% host + 6-14% huésped. Total varía."),
   ("¿Ocupación real?","40-70% en Bs As, 80-95% en Bariloche/Iguazú temporada alta."),
   ("¿Impuestos?","IVA si pasás tope monotributo. IIBB provincial."),
   ("¿Rentabilidad?","Airbnb suele ganar 2-3x más que alquiler tradicional."),
   ("¿Limpieza?","Fee separado que paga huésped, pero tu tiempo o servicio."),
   ("¿Gastos ocultos?","Reposiciones, limpieza profunda, photo shoot, mantenimiento.")],
  """  const p=Number(i.precioNoche)||0; const n=Number(i.nochesMes)||0; const e=Number(i.expensas)||0;
  const bruto=p*n;
  const com=bruto*0.03;
  const imp=bruto*0.08;
  const neto=bruto-com-imp-e;
  return { bruto:'$'+bruto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), comisiones:'$'+com.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), roiBruto:'~2.5x', resumen:`$${p}/noche × ${n}: bruto $${bruto.toFixed(0)}, neto ~$${neto.toFixed(0)}.` };""")

M("contrato-locacion-en-dolares-usd-pesificacion", "finanzas", "💵", "Contrato de alquiler en USD",
  "Contrato de alquiler pactado en USD: ventajas, riesgos y cláusula de pesificación.",
  "USD × cotización al pago",
  [("alquilerUsd","Alquiler en USD","number","USD"),("dolar","Cotización","select",[("of","Oficial"),("mep","MEP"),("blue","Blue")])],
  [("enPesos","Valor en pesos actual",None),("pros","Ventajas",None),("contras","Riesgos",None),("resumen","Interpretación",None)],
  ["USD 400 @ MEP","~$540k"], "$540k",
  [("¿Legal?","Sí. Con DNU 70/2023 libre pacto en moneda."),
   ("¿Qué cotización?","Oficial (menor), MEP (razonable), Blue (especulativo)."),
   ("¿Cláusula pesificación?","Puede pactarse pago en pesos al TC del día."),
   ("¿Ventaja para propietario?","Protección contra inflación."),
   ("¿Desventaja inquilino?","Si sueldo en pesos y dólar sube, se encarece el alquiler.")],
  """  const u=Number(i.alquilerUsd)||0; const c=String(i.dolar||'mep');
  const cotiz: Record<string,number> = { of:1400, mep:1450, blue:1500 };
  const v=u*(cotiz[c]||1450);
  return { enPesos:'$'+v.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), pros:'Protección vs inflación AR', contras:'Sueldo ARS: riesgo devaluación', resumen:`USD ${u} @ ${c}: $${v.toFixed(0)}.` };""")

M("alquiler-con-opcion-a-compra-leasing-inmueble", "finanzas", "🏠", "Alquiler con opción a compra",
  "Alquiler con opción a compra: cómo calcular la porción que cuenta como pago.",
  "Alquiler × factor descontable",
  [("alquilerMensual","Alquiler","number","$"),("mesesPago","Meses a pagar","number",None),("valorInmueble","Valor inmueble","number","$"),("pctDescontable","% descontable mensual","number","%")],
  [("totalAlquilado","Total alquilado",None),("acumuladoCompra","Acumulado a cuenta",None),("faltante","Falta para compra",None),("resumen","Interpretación",None)],
  ["$300k × 24 meses al 30%","~$2.16M acumulado"], "$2.16M",
  [("¿Lease option?","Alquiler tradicional + derecho preferencial + parte del alquiler cuenta como seña."),
   ("¿Porcentaje descontable?","Típicamente 30-60% del alquiler cuenta como seña."),
   ("¿Registro?","Contrato se registra en AFIP como cualquier otro + aparte compromiso compra."),
   ("¿Si no ejerce opción?","Pierde lo 'acumulado' — solo fue alquiler común."),
   ("¿Plazo?","1-3 años típico.")],
  """  const a=Number(i.alquilerMensual)||0; const m=Number(i.mesesPago)||0; const v=Number(i.valorInmueble)||0; const p=(Number(i.pctDescontable)||30)/100;
  const totAlq=a*m;
  const acum=totAlq*p;
  const falta=v-acum;
  return { totalAlquilado:'$'+totAlq.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), acumuladoCompra:'$'+acum.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), faltante:'$'+falta.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${m} meses × $${a}: total alquilado $${totAlq.toFixed(0)}, acumulado compra $${acum.toFixed(0)}.` };""")

M("rentabilidad-alquiler-inmueble-caba-neto-bruto", "finanzas", "📊", "Rentabilidad alquiler inmueble",
  "Rentabilidad anual del alquiler vs valor del inmueble (bruta y neta).",
  "(Ingreso − gastos) / inversión",
  [("valorInmueble","Valor inmueble","number","$"),("alquilerMensual","Alquiler","number","$"),("gastosMensuales","Gastos mensuales (ABL+expensas)","number","$")],
  [("rentBruta","Rentabilidad bruta",None),("rentNeta","Rentabilidad neta",None),("paybackAños","Payback años",None),("resumen","Interpretación",None)],
  ["$100M, alq $400k","~4.8% bruta"], "4.8%",
  [("¿Bruta?","Alquiler × 12 / valor. Sin descontar gastos."),
   ("¿Neta?","Después de ABL, expensas, vacancia, impuestos."),
   ("¿Argentina 2026?","Rentabilidad típica bruta 3-6% anual en CABA/PBA."),
   ("¿Comparar con?","Plazo fijo, bonos, cedears. Alquiler es seguro pero baja rentabilidad."),
   ("¿Vacancia?","Descontar 1-2 meses al año por inquilino nuevo/obras.")],
  """  const v=Number(i.valorInmueble)||0; const a=Number(i.alquilerMensual)||0; const g=Number(i.gastosMensuales)||0;
  const bruta=(a*12/v)*100;
  const neta=((a-g)*12/v)*100;
  const pay=a>0?(v/(a*12)):0;
  return { rentBruta:bruta.toFixed(2)+'%', rentNeta:neta.toFixed(2)+'%', paybackAños:pay.toFixed(1), resumen:`Inmueble $${v.toLocaleString('es-AR')}: bruta ${bruta.toFixed(1)}%, neta ${neta.toFixed(1)}%, payback ${pay.toFixed(1)} años.` };""")

M("cuota-credito-hipotecario-uva-banco-nacion", "finanzas", "🏦", "Crédito hipotecario UVA: cuota",
  "Cuota mensual de un crédito hipotecario UVA (Banco Nación, Ciudad, Provincia).",
  "Sistema francés ajustable",
  [("monto","Monto crédito","number","$"),("plazoAnios","Plazo","number","años"),("tnaReal","TNA real","number","%")],
  [("cuotaInicial","Cuota inicial",None),("totalPagar","Total a pagar",None),("resumen","Interpretación",None)],
  ["$30M, 20 años, 5%","~$200k/mes"], "$200k",
  [("¿UVA?","Unidad Valor Adquisitivo: actualización diaria por inflación."),
   ("¿Cuota crece?","Sí, con UVA. Pero proporcionalmente al sueldo (si usás sueldo variable)."),
   ("¿Tope cuota?","Cuota no debe superar 25-30% ingresos mensuales (exigencia banco)."),
   ("¿TNA real?","4-8% típicamente en 2026 (baja vs. nominal por UVA incorporar inflación)."),
   ("¿Se suspende UVA?","En épocas de alta inflación se discute. Ley 'anti-UVA' actualmente archivada.")],
  """  const m=Number(i.monto)||0; const p=Number(i.plazoAnios)||0; const tna=(Number(i.tnaReal)||0)/100;
  const n=p*12; const i_m=tna/12;
  const cuota=i_m===0?m/n:m*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=cuota*n;
  return { cuotaInicial:'$'+cuota.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), totalPagar:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`$${m.toLocaleString('es-AR')} × ${p} años @ ${(tna*100).toFixed(1)}%: cuota $${cuota.toFixed(0)}/mes.` };""")

M("gastos-escriturar-vivienda-primera-casa", "finanzas", "🏡", "Primera vivienda: gastos totales",
  "Todos los gastos comprar primera vivienda: seña + escrituración + mudanza + muebles.",
  "Total desglose",
  [("valorCasa","Valor casa","number","$")],
  [("senia","Seña (10-20%)",None),("gastosEscritura","Gastos escritura",None),("muebles","Muebles inicial",None),("totalInicial","Total inicial",None),("resumen","Interpretación",None)],
  ["Casa $60M","~$20M inicial"], "$20M",
  [("¿Seña típica?","10-20% del valor. Paga a reserva."),
   ("¿Escrituración?","6-9% del valor (honorarios + impuestos + sellos)."),
   ("¿Financiación?","Crédito hipotecario cubre 50-80% según banco."),
   ("¿Muebles primera casa?","Presupuesto mínimo $2-5M para equipamiento básico."),
   ("¿Fondo emergencia?","Mantener 3-6 meses gastos post-compra.")],
  """  const v=Number(i.valorCasa)||0;
  const sen=v*0.15;
  const escr=v*0.07;
  const mue=Math.min(v*0.05,5000000);
  const tot=sen+escr+mue;
  return { senia:'$'+sen.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), gastosEscritura:'$'+escr.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), muebles:'$'+mue.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), totalInicial:'$'+tot.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Casa $${v.toLocaleString('es-AR')}: desembolso inicial ~$${tot.toFixed(0)}.` };""")

M("fideicomiso-construccion-aporte-cuotas", "finanzas", "🏗️", "Fideicomiso construcción: cuotas",
  "Cuánto aporta por cuota en fideicomiso al costo o 'de pozo'.",
  "Valor total / cuotas",
  [("valorDepto","Valor depto estimado","number","$"),("cuotasTotales","Cuotas totales","number",None),("avanceObra","Avance obra %","number","%")],
  [("cuota","Cuota mensual",None),("debido","Acumulado deberías pagar",None),("resumen","Interpretación",None)],
  ["$80M, 30 cuotas, 50% obra","$2.7M × 15 cuotas"], "$2.7M",
  [("¿Fideicomiso?","Vehículo legal para construir entre varios. Cada uno es beneficiario de una unidad."),
   ("¿Al costo?","Pagás costo real de construcción, no valor de mercado → más barato."),
   ("¿Riesgo?","Demoras de obra, costo que sube con inflación, fideicomitente con problemas."),
   ("¿Actualización?","Suele ajustarse por CAC (Cámara Construcción) o IPC."),
   ("¿Escritura?","Al final de obra, por escribano designado por el fideicomiso.")],
  """  const v=Number(i.valorDepto)||0; const n=Number(i.cuotasTotales)||0; const a=(Number(i.avanceObra)||0)/100;
  const cuota=v/n;
  const debido=cuota*(n*a);
  return { cuota:'$'+cuota.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), debido:'$'+debido.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`$${v.toLocaleString('es-AR')} / ${n} cuotas: $${cuota.toFixed(0)}/mes. A ${(a*100).toFixed(0)}% obra debería haber pagado $${debido.toFixed(0)}.` };""")

M("impuesto-transferencia-itu-iti-inmueble", "finanzas", "📜", "ITI Impuesto Transferencia Inmueble",
  "Impuesto a la transferencia de inmuebles: 1.5% del valor escritura (vendedor).",
  "Valor × 1.5%",
  [("valor","Valor escritura","number","$"),("viviendaUnica","Vivienda única","select",[("no","No"),("si","Sí"),("reemplazo","Sí + reinvierte")])],
  [("iti","ITI a pagar",None),("exento","Exento",None),("resumen","Interpretación",None)],
  ["$80M no única","$1.2M ITI"], "$1.2M",
  [("¿ITI?","Impuesto nacional 1.5% sobre valor escritura. Paga el vendedor."),
   ("¿Exento?","Vivienda única + reinversión en otra vivienda única dentro del año."),
   ("¿Declaración Bienes?","No pagás ITI pero declarás la operación en Bienes Personales."),
   ("¿Monto mínimo?","Operaciones muy pequeñas (< tope) pueden estar exentas."),
   ("¿Quién retiene?","El escribano retiene e ingresa a AFIP.")],
  """  const v=Number(i.valor)||0; const u=String(i.viviendaUnica||'no');
  const exento=u==='reemplazo';
  const iti=exento?0:v*0.015;
  return { iti:'$'+iti.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), exento:exento?'Sí (reemplazo único)':'No', resumen:`Venta $${v.toLocaleString('es-AR')}: ITI ${exento?'exento':'$'+iti.toFixed(0)}.` };""")

M("mudanza-costo-flete-camioneta-km-caja", "finanzas", "📦", "Mudanza: costo flete + embalaje",
  "Calculá costo de mudanza: camión + km + cajas + embalaje. En Argentina 2026.",
  "Flete + km + servicios",
  [("km","Km a recorrer","number",None),("m3","Volumen muebles","number","m³"),("pisoSalida","Piso salida","select",[("pb","Planta baja"),("1-3","1-3"),("4-6","4-6"),("7-mas","7+")]),("conEmbalaje","Con embalaje","select",[("no","No"),("si","Sí")])],
  [("flete","Flete base",None),("km","Por kilómetros",None),("piso","Recargo piso",None),("total","Total estimado",None),("resumen","Interpretación",None)],
  ["20km, 25m³, piso 5, embalaje","~$650k"], "$650k",
  [("¿Cómo calculan?","Por metros cúbicos + distancia + accesibilidad."),
   ("¿Escalera vs ascensor?","Sin ascensor: recargo +30-50% según piso."),
   ("¿Embalaje?","Cajas + protección: +20-40% del flete base."),
   ("¿Seguro?","Opcional. Cubre roturas y pérdidas en tránsito."),
   ("¿Paso a paso?","Visita técnica + cotización + día elegido + pago + ejecución.")],
  """  const k=Number(i.km)||0; const m3=Number(i.m3)||0; const p=String(i.pisoSalida||'pb'); const e=String(i.conEmbalaje||'no')==='si';
  const base=300000+m3*12000;
  const perKm=k*1500;
  const pisoRec: Record<string,number> = { pb:0, '1-3':30000, '4-6':60000, '7-mas':100000 };
  const piso=pisoRec[p]||0;
  const emb=e?base*0.3:0;
  const total=base+perKm+piso+emb;
  return { flete:'$'+base.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), km:'$'+perKm.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), piso:'$'+piso.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Mudanza ${m3}m³ ${k}km piso ${p}${e?' + embalaje':''}: ~$${total.toFixed(0)}.` };""")


def collect():
    return SPECS
