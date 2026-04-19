"""Batch 12 — Impuestos AR + Subsidios/asignaciones (40 calcs)."""
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


# =========================================================
# 20 CALCS DE IMPUESTOS AR
# =========================================================

M("ganancias-tramos-empleado-mensual-2026", "finanzas", "📊", "Ganancias empleado 2026: tramos mensuales",
  "Calculá cuánto te retienen de Ganancias según tramos 2026 (escala progresiva mensual).",
  "Tramo × alicuota + fijo", [("sueldoBrutoMensual","Sueldo bruto mensual","number","$")],
  [("retencion","Retención mensual",None),("alicuotaMarginal","Alícuota marginal",None),("resumen","Interpretación",None)],
  ["$2.000.000","~$80.000"], "~$80.000",
  [("¿Tramos 2026?","5% hasta $X, 9% hasta $Y, 12%, 15%, 19%, 23%, 27%, 31%, 35% (9 tramos progresivos)."),
   ("¿Mínimo no imponible?","Se actualiza semestralmente. Solteros menos que casados con hijos."),
   ("¿Deducciones?","Familia, prepaga, alquiler (40%), donaciones (5%), honorarios médicos."),
   ("¿4ta vs monotributo?","4ta categoría = relación dependencia. Monotributo = autónomo con régimen simplificado."),
   ("¿Aguinaldo?","Se paga ganancias prorrateando el SAC en 12 meses.")],
  """  const s=Number(i.sueldoBrutoMensual)||0;
  const tramos=[[1800000,0.05],[2200000,0.09],[2700000,0.12],[3300000,0.15],[4000000,0.19],[5000000,0.23],[6500000,0.27],[9000000,0.31]];
  let imp=0, prev=0, alic=0.35;
  for (const [tope,al] of tramos) { if (s<=tope) { imp+=(s-prev)*al; alic=al; break; } else { imp+=(tope-prev)*al; prev=tope; } }
  if (s>9000000) imp+=(s-9000000)*0.35;
  return { retencion:'$'+imp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), alicuotaMarginal:(alic*100).toFixed(0)+'%', resumen:`Sueldo $${s.toLocaleString('es-AR')}: retención ganancias ~$${imp.toFixed(0)}, tramo marginal ${(alic*100).toFixed(0)}%.` };""")

M("monotributo-cuota-2026-todas-categorias", "finanzas", "🧾", "Monotributo 2026: cuota por categoría (A-K)",
  "Cuota mensual de monotributo 2026 por categoría: impuesto integrado + aportes SIPA + obra social.",
  "Integrado + SIPA + obra social",
  [("categoria","Categoría","select",[("A","A"),("B","B"),("C","C"),("D","D"),("E","E"),("F","F"),("G","G"),("H","H"),("I","I"),("J","J"),("K","K")])],
  [("cuota","Cuota total",None),("integrado","Impuesto integrado",None),("sipa","Aportes SIPA",None),("resumen","Interpretación",None)],
  ["Cat F","~$120.000"], "~$120.000",
  [("¿Actualización monotributo?","Semestralmente enero y julio según RIPTE."),
   ("¿Recategorización?","Cuatrimestral (enero, mayo, septiembre) con los últimos 12 meses."),
   ("¿Excedo tope?","Al superar categoría K en facturación anual, pasás a responsable inscripto."),
   ("¿Servicios vs bienes?","Tope distinto: categorías H en servicios tienen tope menor que bienes."),
   ("¿Deducciones RI?","Si pasás a RI podés deducir gastos y aportes. Monotributo no.")],
  """  const c=String(i.categoria||'A');
  const cuotas: Record<string,[number,number,number]> = {
    A:[7100,20500,15400], B:[13500,22500,15400], C:[23200,24800,15400], D:[38100,27300,15400],
    E:[72300,30000,19200], F:[99400,33000,23200], G:[126400,36300,27900], H:[286700,39900,33600],
    I:[467300,43900,40400], J:[544700,48300,48500], K:[632500,53100,58300]
  };
  const [ig,sp,os]=cuotas[c]||cuotas.A;
  const total=ig+sp+os;
  return { cuota:'$'+total.toLocaleString('es-AR'), integrado:'$'+ig.toLocaleString('es-AR'), sipa:'$'+sp.toLocaleString('es-AR'), resumen:`Categoría ${c}: cuota total $${total.toLocaleString('es-AR')}/mes.` };""")

M("iva-saldo-favor-contra-ri", "finanzas", "💰", "IVA: saldo a favor vs a pagar (RI)",
  "Si sos Responsable Inscripto: calculá cuánto IVA tenés que pagar (débito − crédito fiscal).",
  "Débito − crédito = saldo",
  [("ventasBrutas","Ventas brutas","number","$"),("comprasBrutas","Compras brutas","number","$"),("alicuota","Alícuota","select",[("21","21%"),("10.5","10.5% reducido"),("27","27%")])],
  [("debito","Débito fiscal",None),("credito","Crédito fiscal",None),("saldo","Saldo IVA",None),("resumen","Interpretación",None)],
  ["Vendo $1M, compro $500k","$105.000 a pagar"], "$105.000",
  [("¿Débito fiscal?","IVA que cobrás en tus ventas."),
   ("¿Crédito fiscal?","IVA que pagás en tus compras, podés descontar."),
   ("¿A favor?","Si compraste más IVA del que vendiste, tenés saldo a favor → próximo mes."),
   ("¿Alícuotas?","21% general, 10.5% construcción/intereses, 27% servicios públicos.")],
  """  const v=Number(i.ventasBrutas)||0; const c=Number(i.comprasBrutas)||0; const a=Number(i.alicuota)||21;
  const f=a/(100+a);
  const deb=v*f; const cre=c*f;
  const saldo=deb-cre;
  return { debito:'$'+deb.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), credito:'$'+cre.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), saldo:(saldo>=0?'$':'-$')+Math.abs(saldo).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:saldo>=0?`A pagar: $${saldo.toFixed(0)}.`:`A favor próximo mes: $${Math.abs(saldo).toFixed(0)}.` };""")

M("bienes-personales-tramos-alicuota-2026", "finanzas", "🏘️", "Bienes Personales 2026: tramos y alícuota",
  "Calculá Bienes Personales 2026 con nueva escala progresiva y mínimo no imponible actualizado.",
  "Base × alícuota marginal",
  [("patrimonio","Patrimonio declarable","number","$"),("vivienda","Valor vivienda","number","$")],
  [("base","Base imponible",None),("impuesto","Impuesto",None),("alicuota","Alícuota",None),("resumen","Interpretación",None)],
  ["Patrimonio $500M, vivienda $200M","~$2M"], "~$2M",
  [("¿Mínimo no imponible 2026?","~$292M actualizado. Por encima tributás sobre el exceso."),
   ("¿Vivienda exenta?","Hasta ~$584M la vivienda única está exenta."),
   ("¿Alícuotas?","0.5%, 0.75%, 1%, 1.25% según tramos del exceso."),
   ("¿Reasa?","Régimen Especial de Adelanto Simplificado: pagás menos si cumplís condiciones."),
   ("¿Exterior?","Bienes afuera: alícuota agravada (0.7% a 2.25%).")],
  """  const p=Number(i.patrimonio)||0; const v=Number(i.vivienda)||0;
  const MNI=292000000; const VIV_EX=584000000;
  const vivExenta=Math.min(v,VIV_EX);
  const base=Math.max(0, p-vivExenta-MNI);
  let imp=0; let alic='0%';
  if (base>0) {
    if (base<=5000000000) { imp=base*0.005; alic='0.5%'; }
    else if (base<=10000000000) { imp=5000000000*0.005+(base-5000000000)*0.0075; alic='0.75%'; }
    else if (base<=20000000000) { imp=5000000000*0.005+5000000000*0.0075+(base-10000000000)*0.01; alic='1%'; }
    else { imp=5000000000*0.005+5000000000*0.0075+10000000000*0.01+(base-20000000000)*0.0125; alic='1.25%'; }
  }
  return { base:'$'+base.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), impuesto:'$'+imp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), alicuota:alic, resumen:`Patrimonio $${p.toLocaleString('es-AR')}: impuesto $${imp.toFixed(0)} (${alic}).` };""")

M("autonomos-categoria-monto-2026", "finanzas", "🧑‍💼", "Autónomos AFIP 2026: categorías y aportes",
  "Autónomos (Régimen General) 2026: categoría por actividad/ingresos y cuota mensual SIPA.",
  "Categoría × monto",
  [("categoria","Categoría","select",[("I","I"),("II","II"),("III","III"),("IV","IV"),("V","V")])],
  [("aporte","Aporte mensual",None),("anual","Anual",None),("resumen","Interpretación",None)],
  ["Cat II","~$45.000/mes"], "~$45.000",
  [("¿Diferencia monotributo?","Autónomo paga IVA + Ganancias + SIPA por separado. Monotributo todo en una cuota."),
   ("¿5 categorías?","I: sin personal + baja facturación. V: directores de SA/SRL grandes."),
   ("¿Actividades?","Profesional, dirigente empresa, empresario sin relación dependencia, rentista."),
   ("¿Combinar?","Podés ser monotributista de una actividad y autónomo de otra.")],
  """  const c=String(i.categoria||'I');
  const montos: Record<string,number> = { I:38000, II:53000, III:76000, IV:122000, V:168000 };
  const m=montos[c]||38000;
  return { aporte:'$'+m.toLocaleString('es-AR'), anual:'$'+(m*12).toLocaleString('es-AR'), resumen:`Categoría ${c}: $${m}/mes = $${(m*12).toLocaleString('es-AR')}/año.` };""")

M("sellos-compra-inmueble-caba-pba", "finanzas", "📜", "Impuesto de Sellos compra inmueble CABA/PBA",
  "Calculá el impuesto de Sellos al comprar inmueble en CABA o PBA (3.5% normal, exento vivienda única).",
  "Valor × alícuota − exenciones",
  [("valor","Valor escritura","number","$"),("jurisdiccion","Jurisdicción","select",[("caba","CABA"),("pba","PBA")]),("viviendaUnica","Vivienda única","select",[("no","No"),("si","Sí hasta monto exento")])],
  [("sellos","Sellos a pagar",None),("alicuota","Alícuota aplicable",None),("resumen","Interpretación",None)],
  ["$100M CABA no única","$3.5M"], "$3.5M",
  [("¿Quién paga Sellos?","50% comprador, 50% vendedor (por norma). Negociable."),
   ("¿Vivienda única exenta?","Hasta monto tope actualizado anualmente (~$250M-500M según año)."),
   ("¿CABA vs PBA?","Alícuota principal 3.5% en ambas. Exenciones varían."),
   ("¿Cuándo se paga?","Al escriturar. El escribano suele retener."),
   ("¿Timbrado?","Es el comprobante físico del pago del sello.")],
  """  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'caba'); const u=String(i.viviendaUnica||'no')==='si';
  const topeUnica=j==='caba'?350000000:300000000;
  let base=v;
  if (u && v<=topeUnica) base=0;
  else if (u) base=v-topeUnica;
  const imp=base*0.035;
  return { sellos:'$'+imp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), alicuota:'3.5%', resumen:`$${v.toLocaleString('es-AR')} en ${j.toUpperCase()}: sellos $${imp.toFixed(0)}${u?' (vivienda única)':''}.` };""")

M("ingresos-brutos-convenio-multilateral-jurisdicciones", "finanzas", "🏛️", "IIBB convenio multilateral: coeficientes",
  "Calculá IIBB con convenio multilateral cuando facturás en varias provincias.",
  "Coef ventas × Coef gastos",
  [("ventasCABA","Ventas CABA","number","$"),("ventasPBA","Ventas PBA","number","$"),("gastosCABA","Gastos CABA","number","$"),("gastosPBA","Gastos PBA","number","$"),("totalBase","Base imponible total","number","$")],
  [("coefCABA","Coef CABA",None),("coefPBA","Coef PBA",None),("iibbCABA","IIBB CABA",None),("iibbPBA","IIBB PBA",None),("resumen","Interpretación",None)],
  ["70/30 CABA/PBA","CABA 70%, PBA 30%"], "CABA 70%",
  [("¿Convenio multilateral?","Norma entre provincias para distribuir base imponible proporcionalmente."),
   ("¿Fórmula del 50/50?","50% según ventas + 50% según gastos, por jurisdicción."),
   ("¿Quién presenta?","El contribuyente, mensualmente, en cada provincia donde tenga sustancial actividad."),
   ("¿Unificar?","Algunas actividades pueden optar por régimen simplificado CM05.")],
  """  const vC=Number(i.ventasCABA)||0; const vP=Number(i.ventasPBA)||0;
  const gC=Number(i.gastosCABA)||0; const gP=Number(i.gastosPBA)||0;
  const total=Number(i.totalBase)||0;
  const totV=vC+vP; const totG=gC+gP;
  if (totV===0 || totG===0) return { coefCABA:'—', coefPBA:'—', iibbCABA:'—', iibbPBA:'—', resumen:'Sin datos suficientes.' };
  const cCaba=(vC/totV*0.5+gC/totG*0.5);
  const cPba=(vP/totV*0.5+gP/totG*0.5);
  const iibbC=total*cCaba*0.04;
  const iibbP=total*cPba*0.045;
  return { coefCABA:(cCaba*100).toFixed(1)+'%', coefPBA:(cPba*100).toFixed(1)+'%', iibbCABA:'$'+iibbC.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), iibbPBA:'$'+iibbP.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Coef CABA ${(cCaba*100).toFixed(1)}% · Coef PBA ${(cPba*100).toFixed(1)}%.` };""")

M("deduccion-alquiler-ganancias-40-porciento", "finanzas", "🏠", "Deducción alquiler 40% Ganancias",
  "Deducción del 40% del alquiler pagado por vivienda, con tope anual del MNI.",
  "40% × alquiler anual (tope)",
  [("alquilerMensual","Alquiler mensual","number","$"),("mniActual","MNI anual","number","$")],
  [("deduccionAnual","Deducción anual",None),("dedMensual","Prorrateo mensual",None),("resumen","Interpretación",None)],
  ["$500k/mes alquiler","$2.4M deducible anual"], "$2.4M",
  [("¿Cuándo aplica?","Monotributo y 4ta categoría. No deben ser propietarios de otro inmueble."),
   ("¿Tope?","No puede superar el mínimo no imponible anual de Ganancias."),
   ("¿Requisito?","Contrato escrito registrado o con factura/recibo del locador."),
   ("¿SIRADIG?","Informar en SiRADIG-TRABAJADOR para que el empleador retenga menos.")],
  """  const a=Number(i.alquilerMensual)||0; const mni=Number(i.mniActual)||21000000;
  const anualBruto=a*12*0.4;
  const anual=Math.min(anualBruto,mni);
  const mensual=anual/12;
  return { deduccionAnual:'$'+anual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), dedMensual:'$'+mensual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Alquiler $${a}/mes: deducción anual $${anual.toFixed(0)} (40%, con tope MNI).` };""")

M("deduccion-familia-conyuge-hijo-ganancias", "finanzas", "👨‍👩‍👧", "Deducción familia Ganancias: cónyuge e hijos",
  "Deducciones por cónyuge y cada hijo a cargo en Ganancias 2026.",
  "Deducciones legales por carga",
  [("conyuge","Cónyuge a cargo","select",[("si","Sí"),("no","No")]),("hijosMenores","Hijos menores 18","number",None),("hijosInca","Hijos incapacitados","number",None)],
  [("totalAnual","Total deducción anual",None),("mensual","Por mes",None),("resumen","Desglose",None)],
  ["Cónyuge + 2 hijos","~$6M"], "~$6M",
  [("¿Monto 2026?","Se actualiza semestralmente. Cónyuge ~$2.8M, hijo ~$1.4M/año (orientativo)."),
   ("¿Conviviente?","La Ley incluye conviviente con 2+ años o hijo en común."),
   ("¿Edad hijos?","Hasta 18 años sin límite de edad. Adultos incapacitados siempre deducibles."),
   ("¿Ambos padres deducen?","NO. Solo uno. Hay que elegir cuál toma la deducción."),
   ("¿Ascendientes?","Padres a cargo deducibles si no superan ingresos tope anual.")],
  """  const c=String(i.conyuge||'no')==='si'; const hm=Number(i.hijosMenores)||0; const hi=Number(i.hijosInca)||0;
  const DEDUC_CONY=2800000; const DEDUC_HIJO=1400000; const DEDUC_INCA=2800000;
  const total=(c?DEDUC_CONY:0)+hm*DEDUC_HIJO+hi*DEDUC_INCA;
  return { totalAnual:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), mensual:'$'+(total/12).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${c?'Cónyuge':''}${c&&(hm+hi>0)?' + ':''}${hm+hi>0?`${hm+hi} hijo(s)`:''}: deducción anual $${total.toFixed(0)}.` };""")

M("deduccion-prepaga-medicina-ganancias", "finanzas", "🏥", "Deducción prepaga Ganancias: 5% tope",
  "Cuánto de prepaga (OSDE, Swiss, Galeno, etc) podés deducir en Ganancias.",
  "Hasta 5% de la ganancia neta",
  [("cuotaPrepagaMensual","Cuota prepaga mensual","number","$"),("gananciaNetaAnual","Ganancia neta anual","number","$")],
  [("deduccionReal","Deducción anual",None),("topeAnual","Tope 5%",None),("resumen","Interpretación",None)],
  ["$300k/mes prepaga","Hasta $1.2M anual"], "$1.2M",
  [("¿Tope?","5% de la ganancia neta sujeta a impuesto."),
   ("¿Qué incluye?","Cuota de prepaga propia + cónyuge + hijos a cargo."),
   ("¿Honorarios médicos?","40% del pagado, con tope 5% ganancia neta adicional."),
   ("¿Factura electrónica?","Sí. Prepaga la emite automáticamente en tu CUIT.")],
  """  const c=Number(i.cuotaPrepagaMensual)||0; const g=Number(i.gananciaNetaAnual)||0;
  const anual=c*12;
  const tope=g*0.05;
  const deduc=Math.min(anual,tope);
  return { deduccionReal:'$'+deduc.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), topeAnual:'$'+tope.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Prepaga $${c}/mes = $${anual} anual. Deducción efectiva $${deduc.toFixed(0)} (tope 5%).` };""")

M("patente-auto-valor-provincia-alicuota", "finanzas", "🚗", "Patente automotor: alícuota por provincia",
  "Patente anual de auto según provincia y valor fiscal del vehículo.",
  "Valor × alícuota provincial",
  [("valor","Valor vehículo","number","$"),("provincia","Provincia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba"),("sfe","Santa Fe"),("mza","Mendoza")])],
  [("patente","Patente anual",None),("mensual","Cuota mensual",None),("resumen","Interpretación",None)],
  ["Auto $30M en CABA","$1.350.000"], "$1.350.000",
  [("¿CABA?","Alícuota 3-4.5% según valor. Los más caros pagan más."),
   ("¿PBA?","Alícuota escalonada 3-5%. Más cara que CABA."),
   ("¿Exención?","Muchas provincias exenta vehículos +10 años o adaptados discapacidad."),
   ("¿Cuotas?","Casi todas: 3-5 cuotas. Descuentos por pago anual adelantado (5-15%).")],
  """  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const alic: Record<string,number> = { caba:0.045, pba:0.045, cba:0.05, sfe:0.045, mza:0.04 };
  const a=alic[p]||0.045;
  const patente=v*a;
  return { patente:'$'+patente.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), mensual:'$'+(patente/12).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${p.toUpperCase()} auto $${v.toLocaleString('es-AR')}: patente anual $${patente.toFixed(0)}.` };""")

M("abl-caba-valuacion-fiscal-vivienda", "finanzas", "🏢", "ABL CABA: cálculo por valuación fiscal",
  "Impuesto ABL (Alumbrado Barrido Limpieza) en CABA según valuación fiscal del inmueble.",
  "Valuación × alícuota según tramo",
  [("valuacion","Valuación fiscal","number","$")],
  [("ablAnual","ABL anual",None),("ablMensual","Por mes",None),("resumen","Interpretación",None)],
  ["$50M valuación","~$1.2M/año"], "$1.2M",
  [("¿Valuación fiscal?","Valor asignado por AGIP, menor al de mercado. Se actualiza anualmente."),
   ("¿Alícuotas CABA?","Progresivas 0.8% a 2% según tramos."),
   ("¿Cuándo se paga?","6 cuotas bimestrales o pago anual con descuento del 10%."),
   ("¿Exención jubilados?","Sí, con tope de ingreso jubilatorio y valuación fiscal.")],
  """  const v=Number(i.valuacion)||0;
  let alic=0.008; if (v>10000000) alic=0.012; if (v>25000000) alic=0.015; if (v>50000000) alic=0.018; if (v>100000000) alic=0.02;
  const anual=v*alic;
  return { ablAnual:'$'+anual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), ablMensual:'$'+(anual/12).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Valuación $${v.toLocaleString('es-AR')}: ABL $${anual.toFixed(0)}/año.` };""")

M("inmobiliario-provincial-pba-tramos", "finanzas", "🏡", "Inmobiliario PBA: cálculo tramos",
  "Impuesto inmobiliario provincial Buenos Aires según valuación fiscal.",
  "Valuación × tramo × alícuota",
  [("valuacion","Valuación fiscal","number","$")],
  [("inmob","Inmobiliario anual",None),("mensual","Por mes",None),("resumen","Interpretación",None)],
  ["$40M","~$900k"], "$900k",
  [("¿Diferencia con CABA?","PBA es ARBA, CABA es AGIP. Valuación fiscal distinta y alícuotas propias."),
   ("¿Cuotas?","4 cuotas anuales + pago anual con descuento."),
   ("¿Zonas diferenciadas?","Zonas urbanas, rurales y suburbanas con alícuotas distintas."),
   ("¿Vivienda permanente?","Descuento del 10% si es vivienda permanente y única.")],
  """  const v=Number(i.valuacion)||0;
  let alic=0.01; if (v>8000000) alic=0.015; if (v>20000000) alic=0.02; if (v>50000000) alic=0.025;
  const anual=v*alic;
  return { inmob:'$'+anual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), mensual:'$'+(anual/12).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`PBA valuación $${v.toLocaleString('es-AR')}: inmobiliario $${anual.toFixed(0)}/año.` };""")

M("retencion-ganancias-siradig-trabajador", "finanzas", "📋", "SiRADIG: impacto deducciones declaradas",
  "Cuánto menos te retienen si declarás deducciones en SiRADIG-Trabajador.",
  "Retención ajustada con deducciones",
  [("sueldoBrutoAnual","Sueldo bruto anual","number","$"),("deduccionesDeclaradas","Total deducciones SiRADIG","number","$")],
  [("retencionSinDec","Sin declarar",None),("retencionConDec","Con declaración",None),("ahorro","Ahorro",None),("resumen","Interpretación",None)],
  ["$24M sueldo + $3M deducc","Ahorro ~$600k"], "$600k",
  [("¿SiRADIG-TRABAJADOR?","Servicio web AFIP para cargar deducciones y que tu empleador retenga menos."),
   ("¿Cuándo?","Antes de cada cierre mensual de liquidación."),
   ("¿Qué cargar?","Prepaga, alquiler, hijos, cónyuge, donaciones, honorarios médicos, intereses hipoteca."),
   ("¿No declaro?","Te retienen el máximo. Podés recuperar lo pagado en exceso con declaración anual."),
   ("¿Obligatorio?","No, pero te conviene para mejorar flujo mensual.")],
  """  const s=Number(i.sueldoBrutoAnual)||0; const d=Number(i.deduccionesDeclaradas)||0;
  const baseSin=s*0.85; const baseCon=Math.max(0,s*0.85-d);
  const retSin=baseSin*0.25; const retCon=baseCon*0.25;
  return { retencionSinDec:'$'+retSin.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), retencionConDec:'$'+retCon.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), ahorro:'$'+(retSin-retCon).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Deducir $${d.toLocaleString('es-AR')}: ahorrás $${(retSin-retCon).toFixed(0)} de retención.` };""")

M("impuesto-paulista-iibb-influencer-redes", "finanzas", "📱", "IIBB para influencers y creadores AR",
  "IIBB aplicable a streaming (Twitch, YouTube, Kick) y creadores de contenido en AR.",
  "Facturación × alícuota",
  [("ingresos","Ingresos mensuales","number","$"),("provincia","Residencia","select",[("caba","CABA"),("pba","PBA"),("cba","Córdoba")])],
  [("iibb","IIBB mensual",None),("alicuota","Alícuota",None),("resumen","Interpretación",None)],
  ["$5M/mes CABA","$200k"], "$200k",
  [("¿Creadores digitales?","AFIP los categoriza como prestadores de servicios. IIBB se paga en la provincia de residencia."),
   ("¿Monotributo?","Hasta cierto tope podés estar en monotributo. Ingresos alto: RI."),
   ("¿Exterior?","Pagos de Twitch/YouTube son exportación. Tratamiento diferente."),
   ("¿Plataformas argentinas?","Suelen retener IIBB automáticamente."),
   ("¿Stream solidario?","Donaciones a 'causas': trato fiscal especial.")],
  """  const i_=Number(i.ingresos)||0; const p=String(i.provincia||'caba');
  const alic: Record<string,number> = { caba:0.04, pba:0.045, cba:0.05 };
  const a=alic[p]||0.04;
  const iibb=i_*a;
  return { iibb:'$'+iibb.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), alicuota:(a*100).toFixed(1)+'%', resumen:`$${i_.toLocaleString('es-AR')} en ${p.toUpperCase()}: IIBB $${iibb.toFixed(0)} (${(a*100).toFixed(1)}%).` };""")

M("ganancias-aguinaldo-sac-retencion", "finanzas", "🎁", "Ganancias sobre aguinaldo (SAC)",
  "Retención de Ganancias sobre el aguinaldo (SAC). Prorrateo 12 meses.",
  "SAC/12 × 12 + ajuste",
  [("sueldoBrutoMensual","Bruto mensual","number","$")],
  [("sacSemestral","SAC semestral",None),("retencionAnual","Impacto anual Gan",None),("resumen","Interpretación",None)],
  ["$2M bruto","SAC $1M → Gan ~$200k"], "~$200k",
  [("¿Prorrateo?","AFIP pide prorratear el SAC en 12 cuotas cada mes para la retención."),
   ("¿Solteros vs casados?","El SAC no cambia, pero las deducciones cambian el neto."),
   ("¿Medio aguinaldo?","Mitad junio, mitad diciembre. Cada uno se retiene proporcionalmente."),
   ("¿Si cambio de trabajo?","El SAC proporcional del anterior sigue siendo deducible si no se cobró.")],
  """  const s=Number(i.sueldoBrutoMensual)||0;
  const sac=s*0.5;
  const anualSinSac=s*13;
  const base=anualSinSac*0.85;
  const gan=Math.max(0,(base-21000000)*0.27);
  return { sacSemestral:'$'+sac.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), retencionAnual:'$'+gan.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Bruto $${s}: SAC $${sac.toFixed(0)} c/u, Ganancias anuales ~$${gan.toFixed(0)}.` };""")

M("retencion-rg2616-proveedor-monotributo", "finanzas", "🧾", "Retención RG 2616: monotributo proveedor",
  "Retención de IVA/Ganancias cuando comprás a monotributista según RG 2616 AFIP.",
  "Monto × % retención",
  [("monto","Monto operación","number","$"),("tipo","Tipo","select",[("bien","Bien"),("servicio","Servicio")])],
  [("retencionIVA","Retención IVA",None),("retencionGan","Retención Ganancias",None),("total","Retención total",None),("resumen","Interpretación",None)],
  ["$500k servicio","Retención ~$50k"], "$50k",
  [("¿RG 2616?","Régimen AFIP de retención cuando le comprás a monotributista excediendo topes."),
   ("¿Quién retiene?","El comprador Responsable Inscripto cuando contrata a monotributista."),
   ("¿Tope mensual?","Acumulado con el mismo proveedor. Si se supera, retenés."),
   ("¿Certificado?","Si el proveedor tiene certificado de exclusión AFIP, no se retiene.")],
  """  const m=Number(i.monto)||0; const t=String(i.tipo||'servicio');
  const iva=t==='servicio'?m*0.105:m*0.105;
  const gan=m*0.035;
  const total=iva+gan;
  return { retencionIVA:'$'+iva.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), retencionGan:'$'+gan.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`$${m.toLocaleString('es-AR')} ${t}: retención total $${total.toFixed(0)}.` };""")

M("intereses-resarcitorios-punitorios-afip", "finanzas", "📉", "Intereses resarcitorios y punitorios AFIP",
  "Calcular intereses sobre deuda AFIP atrasada: resarcitorios + punitorios.",
  "Capital × tasa × días/365",
  [("deuda","Deuda original","number","$"),("dias","Días de atraso","number",None)],
  [("resarcitorios","Resarcitorios",None),("punitorios","Punitorios",None),("totalAdeudar","Total",None),("resumen","Interpretación",None)],
  ["$1M, 90 días atraso","~$1.12M"], "$1.12M",
  [("¿Resarcitorios?","Tasa AFIP por atraso en el pago. Actualmente ~5% mensual."),
   ("¿Punitorios?","Se suman si hay juicio de ejecución fiscal. Tasa más alta."),
   ("¿Capital, intereses y multa?","Además pueden sumar multa por infracción formal."),
   ("¿Plan de pagos?","AFIP ofrece planes con reducción de intereses y cuotas.")],
  """  const d=Number(i.deuda)||0; const dias=Number(i.dias)||0;
  const res=d*0.06*(dias/30);
  const pun=d*0.08*(dias/30);
  const total=d+res;
  return { resarcitorios:'$'+res.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), punitorios:'$'+pun.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), totalAdeudar:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Deuda $${d.toLocaleString('es-AR')} × ${dias} días: total a regularizar $${total.toFixed(0)}.` };""")

M("percepcion-dolar-tarjeta-impuesto-pais", "finanzas", "💳", "Percepciones dólar tarjeta 2026",
  "Percepciones al comprar USD tarjeta: Impuesto PAIS + RG 5617 (35% y 30%).",
  "USD × (oficial × 1.60)",
  [("montoUsd","Monto en USD","number","USD"),("dolarOficial","Dólar oficial","number","$")],
  [("subtotalArs","Subtotal ARS",None),("perceptPais","Impuesto PAIS",None),("perceptGan","Percepción Gan",None),("totalPagar","Total a pagar",None),("resumen","Interpretación",None)],
  ["USD 100 a $1400","$224k total"], "$224k",
  [("¿Impuesto PAIS?","30% sobre compras con tarjeta en USD y servicios digitales (Netflix, Spotify, etc.)."),
   ("¿RG 5617?","Percepción 30% a cuenta de Ganancias, recuperable en declaración jurada anual."),
   ("¿Dólar tarjeta?","Oficial × 1.60 (30% PAIS + 30% Ganancias)."),
   ("¿Cómo recuperar?","Monotributista: SiRADIG o nota. Responsable inscripto: via DDJJ."),
   ("¿Exentos?","Cuotas de hipoteca/alquiler en USD, entradas a eventos internacionales locales.")],
  """  const u=Number(i.montoUsd)||0; const d=Number(i.dolarOficial)||1400;
  const sub=u*d;
  const pais=sub*0.30;
  const gan=sub*0.30;
  const total=sub+pais+gan;
  return { subtotalArs:'$'+sub.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), perceptPais:'$'+pais.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), perceptGan:'$'+gan.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), totalPagar:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`USD ${u} × $${d} + PAIS + Gan = $${total.toFixed(0)}.` };""")

M("cuarta-categoria-empleado-empresa-argentina", "finanzas", "📑", "4ta categoría Ganancias: empleado",
  "Explicación de 4ta categoría Ganancias: empleados en relación de dependencia.",
  "Base × escala progresiva",
  [("brutoAnual","Bruto anual con SAC","number","$")],
  [("base","Base imponible",None),("impuesto","Impuesto anual",None),("alicuotaProm","Alícuota efectiva",None),("resumen","Interpretación",None)],
  ["$24M bruto anual","~$1.2M impuesto"], "~$1.2M",
  [("¿4ta categoría?","Ingresos del trabajo personal en relación de dependencia, pensiones, jubilaciones."),
   ("¿1ra, 2da, 3ra?","1ra: inmuebles. 2da: capitales. 3ra: empresas. 4ta: trabajo personal."),
   ("¿Escala 2026?","9 tramos de 5% a 35%. Más alto: 35% sobre el excedente del último tramo."),
   ("¿Diferencia con monotributo?","Monotributo paga cuota fija. 4ta paga según escala progresiva.")],
  """  const b=Number(i.brutoAnual)||0;
  const base=b*0.85;
  const mni=21000000;
  const imponible=Math.max(0,base-mni);
  const imp=imponible*0.25;
  return { base:'$'+base.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), impuesto:'$'+imp.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), alicuotaProm:(b>0?(imp/b*100).toFixed(1):'0')+'%', resumen:`Bruto anual $${b.toLocaleString('es-AR')}: impuesto ~$${imp.toFixed(0)}.` };""")


# =========================================================
# 20 CALCS DE SUBSIDIOS / ASIGNACIONES
# =========================================================

M("auh-asignacion-universal-hijo-monto-2026", "finanzas", "👶", "AUH monto 2026 (Asignación Universal por Hijo)",
  "Monto AUH 2026 por hijo y AU por embarazo. Quiénes la cobran y requisitos.",
  "Monto fijo × hijos + retenido",
  [("hijos","Cantidad hijos menores","number",None),("embarazo","Embarazo","select",[("no","No"),("si","Sí")])],
  [("auhMensual","AUH mensual total",None),("retenido","20% retenido",None),("cobroEfectivo","Cobro efectivo",None),("resumen","Interpretación",None)],
  ["2 hijos","~$130k"], "~$130k",
  [("¿AUH?","Asignación Universal por Hijo ANSES. Para desempleados, monotributistas sociales, trabajadores casas."),
   ("¿Monto 2026?","Se actualiza trimestralmente. ~$65k por hijo (orientativo)."),
   ("¿20% retenido?","Se acredita 80% mensual. 20% queda retenido hasta acreditar libreta sanitaria y escolaridad."),
   ("¿Discapacidad?","Monto diferenciado, superior al básico, sin tope de edad."),
   ("¿Incompatibilidades?","No compatible con otra asignación familiar por el mismo hijo.")],
  """  const h=Number(i.hijos)||0; const e=String(i.embarazo||'no')==='si';
  const porHijo=65000;
  const total=h*porHijo+(e?porHijo:0);
  const retenido=total*0.20;
  const cobro=total*0.80;
  return { auhMensual:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), retenido:'$'+retenido.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), cobroEfectivo:'$'+cobro.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${h} hijos${e?' + embarazo':''}: AUH $${total.toFixed(0)}/mes, cobro efectivo $${cobro.toFixed(0)}.` };""")

M("asignacion-familiar-empleado-registrado-anses", "finanzas", "💼", "Asignación familiar ANSES empleados",
  "Asignación familiar por hijo para empleados registrados según ingreso del grupo familiar.",
  "Rango × tramo",
  [("ingresoGrupoFam","Ingreso grupo familiar","number","$"),("hijos","Hijos menores 18","number",None)],
  [("porHijo","Monto por hijo",None),("total","Total mensual",None),("rango","Rango",None),("resumen","Interpretación",None)],
  ["$800k ingreso, 2 hijos","$160k"], "$160k",
  [("¿Rangos ingresos?","4 rangos. A mayor ingreso, menor asignación. Tope: deja de cobrarse."),
   ("¿Diferencia AUH?","Asignación familiar = trabajador registrado. AUH = sin empleo formal."),
   ("¿Hijos discapacidad?","Monto mayor sin tope de edad."),
   ("¿Nacimiento?","Pago único al nacer: $X (actualizado)."),
   ("¿Matrimonio?","Ya no existe como asignación separada.")],
  """  const i_=Number(i.ingresoGrupoFam)||0; const h=Number(i.hijos)||0;
  let porHijo=0; let rango='';
  if (i_<=1300000) { porHijo=85000; rango='Rango 1'; }
  else if (i_<=1900000) { porHijo=57000; rango='Rango 2'; }
  else if (i_<=2200000) { porHijo=34000; rango='Rango 3'; }
  else if (i_<=2600000) { porHijo=17000; rango='Rango 4'; }
  else { porHijo=0; rango='Fuera de tope'; }
  const total=porHijo*h;
  return { porHijo:'$'+porHijo.toLocaleString('es-AR'), total:'$'+total.toLocaleString('es-AR'), rango, resumen:`${h} hijos, ingreso grupo $${i_.toLocaleString('es-AR')}: $${total.toLocaleString('es-AR')}/mes (${rango}).` };""")

M("tarjeta-alimentar-monto-hijos-2026", "finanzas", "🍽️", "Tarjeta Alimentar monto 2026",
  "Monto de la Tarjeta Alimentar 2026: por cantidad de hijos menores de 14.",
  "Escalonado por cantidad",
  [("hijos","Hijos menores 14","number",None)],
  [("monto","Monto mensual",None),("resumen","Interpretación",None)],
  ["2 hijos","~$80k"], "~$80k",
  [("¿Qué es?","Tarjeta para compra de alimentos. Cobra con AUH, monotributistas sociales, pensiones no contributivas."),
   ("¿Montos?","1 hijo: $52k. 2 hijos: $81k. 3+ hijos: $108k (actualizado 2026)."),
   ("¿Dónde usar?","Comercios adheridos para comida. No retira efectivo."),
   ("¿Se acumula con AUH?","Sí, es compatible con AUH."),
   ("¿Plazo?","Mensual, mismo día que AUH.")],
  """  const h=Number(i.hijos)||0;
  const montos=[0,52000,81000,108000];
  const m=h>=3?montos[3]:montos[h]||0;
  return { monto:'$'+m.toLocaleString('es-AR'), resumen:`${h} hijos menores 14: Tarjeta Alimentar $${m.toLocaleString('es-AR')}/mes.` };""")

M("progresar-beca-monto-requisitos-2026", "finanzas", "🎓", "Progresar beca 2026: monto y requisitos",
  "Beca Progresar 2026: estudiantes secundarios, terciarios y universitarios.",
  "Monto por nivel educativo",
  [("nivel","Nivel educativo","select",[("sec","Secundario"),("ter","Terciario"),("uni","Universitario"),("trab","Trabajo")])],
  [("monto","Monto mensual",None),("requisitos","Requisitos",None),("resumen","Interpretación",None)],
  ["Universitario","~$35k"], "~$35k",
  [("¿Secundario?","Jóvenes 16-24 terminando secundario. ~$25k/mes."),
   ("¿Terciario?","Profesorados y técnicas. ~$30k/mes."),
   ("¿Universitario?","~$35-45k según año. Aumenta a medida que avanzás."),
   ("¿Trabajo?","Capacitación laboral para 18-24 sin estudio ni trabajo."),
   ("¿Requisito ingreso?","Ingreso familiar tope 3 SMVM, materias aprobadas.")],
  """  const n=String(i.nivel||'uni');
  const m: Record<string,number> = { sec:25000, ter:30000, uni:40000, trab:30000 };
  return { monto:'$'+(m[n]||30000).toLocaleString('es-AR'), requisitos:'16-24 años, ingreso familiar ≤3 SMVM, escolaridad regular', resumen:`Beca Progresar ${n}: $${(m[n]||30000).toLocaleString('es-AR')}/mes.` };""")

M("jubilacion-anses-monto-minimo-maxima-2026", "finanzas", "👴", "Jubilación ANSES 2026: mínima y máxima",
  "Montos de jubilación mínima, máxima y bono ANSES 2026.",
  "Tabla actualizada por movilidad",
  [("tipo","Tipo","select",[("minima","Jubilación mínima"),("media","Haber medio"),("maxima","Jubilación máxima"),("pnc","Pensión no contributiva")])],
  [("haberMensual","Haber mensual",None),("bono","Bono extra",None),("total","Total",None),("resumen","Interpretación",None)],
  ["Mínima","$290k + bono"], "$290k",
  [("¿Mínima 2026?","~$290k + bono $70k = ~$360k (actualizado movilidad)."),
   ("¿Máxima?","~$1.95M (8x la mínima, por ley de movilidad)."),
   ("¿Movilidad?","Mensual por IPC desde 2024. Actualización automática."),
   ("¿Bono?","Suma fija variable según mes. Compensación por inflación."),
   ("¿PNC?","Pensiones no contributivas: 70% de jubilación mínima.")],
  """  const t=String(i.tipo||'minima');
  const h: Record<string,[number,number]> = { minima:[290000,70000], media:[550000,70000], maxima:[1950000,0], pnc:[200000,50000] };
  const [haber,bono]=h[t]||h.minima;
  return { haberMensual:'$'+haber.toLocaleString('es-AR'), bono:'$'+bono.toLocaleString('es-AR'), total:'$'+(haber+bono).toLocaleString('es-AR'), resumen:`${t}: $${haber} + bono $${bono} = $${haber+bono}/mes.` };""")

M("ife-ingreso-familiar-emergencia-historia", "finanzas", "💵", "IFE: historia y montos (referencia)",
  "Ingreso Familiar de Emergencia: historia en AR, montos pagados y beneficiarios.",
  "Datos históricos",
  [("consulta","Qué consultar","select",[("monto","Montos históricos"),("requisitos","Requisitos"),("liquidacion","Fechas")])],
  [("info","Info",None),("resumen","Resumen",None)],
  ["Montos","Datos 3 pagos 2020"], "Datos",
  [("¿IFE 2020?","Bono excepcional $10k por pandemia. 3 pagos."),
   ("¿IFE 2024-2026?","Suele aparecer en momentos de crisis económica. Sin IFE permanente actualmente."),
   ("¿Requisitos típicos?","Desempleo formal, monotributo A, B o C, trabajadores informales."),
   ("¿Diferencia con AUH?","IFE es excepcional. AUH permanente.")],
  """  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'$10.000 cada pago × 3 pagos (2020)',
    requisitos:'Desempleo formal, monotributo A/B/C, informales, casas particulares',
    liquidacion:'Mayo-Julio-Octubre 2020'
  };
  return { info:info[c]||'Info no disponible', resumen:`IFE ${c}: ${info[c]||'—'}.` };""")

M("asignacion-desempleo-seguro-prestacion-anses", "finanzas", "📃", "Seguro desempleo ANSES",
  "Seguro de desempleo: cuánto se cobra y por cuántos meses (según antigüedad).",
  "50% remuneración hasta tope",
  [("ultimoSueldoBruto","Último sueldo bruto","number","$"),("mesesCotizados","Meses cotizados últimos 3 años","number",None)],
  [("monto","Monto mensual",None),("meses","Meses de cobro",None),("total","Total prestación",None),("resumen","Interpretación",None)],
  ["$1.5M bruto, 24 meses cotizado","4 meses × $750k"], "$3M",
  [("¿Cuándo cobro?","Despido sin causa o por cierre de empresa. No por renuncia."),
   ("¿Cuánto cobro?","50% de la remuneración promedio últimos 6 meses, topeado."),
   ("¿Cuántos meses?","Depende de cotizaciones: 2 meses (6-12 cotizados) hasta 12 meses (36+ cotizados)."),
   ("¿Obra social?","Seguís con cobertura mientras cobrás el seguro."),
   ("¿Jubilados?","No aplica. Hay que estar en edad activa.")],
  """  const s=Number(i.ultimoSueldoBruto)||0; const m=Number(i.mesesCotizados)||0;
  const monto=Math.min(s*0.5,1200000);
  let meses=0;
  if (m>=36) meses=12; else if (m>=24) meses=8; else if (m>=12) meses=4; else if (m>=6) meses=2;
  const total=monto*meses;
  return { monto:'$'+monto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), meses:meses.toString(), total:'$'+total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Sueldo $${s.toLocaleString('es-AR')}, ${m} meses cotizados: ${meses} meses × $${monto.toFixed(0)}.` };""")

M("asignacion-nacimiento-matrimonio-adopcion", "finanzas", "👶", "Asignaciones nacimiento/adopción ANSES",
  "Pagos únicos ANSES por nacimiento, adopción. Monto 2026.",
  "Monto fijo único",
  [("tipo","Tipo","select",[("nac","Nacimiento"),("ado","Adopción"),("pren","Prenatal")])],
  [("monto","Monto único",None),("requisitos","Requisitos",None),("resumen","Interpretación",None)],
  ["Nacimiento","~$80k único"], "$80k",
  [("¿Nacimiento?","Pago único al nacer el hijo."),
   ("¿Adopción?","Pago único mayor al de nacimiento."),
   ("¿Prenatal?","Mensual durante embarazo, solo en asignación familiar."),
   ("¿Requisito?","Partida de nacimiento + inscribir al hijo en ANSES.")],
  """  const t=String(i.tipo||'nac');
  const m: Record<string,number> = { nac:80000, ado:480000, pren:65000 };
  const req: Record<string,string> = { nac:'Hijo inscripto ANSES + partida', ado:'Sentencia judicial + inscripción', pren:'Desde 3er mes hasta nacimiento' };
  return { monto:'$'+(m[t]||0).toLocaleString('es-AR'), requisitos:req[t]||'', resumen:`Asignación ${t}: $${(m[t]||0).toLocaleString('es-AR')}.` };""")

M("potenciar-trabajo-programa-vigente", "finanzas", "💪", "Potenciar Trabajo (plan vigente)",
  "Plan social Potenciar Trabajo / sus reemplazos. Montos y requisitos actuales.",
  "Monto fijo mensual",
  [("consulta","Consultar","select",[("monto","Monto actual"),("req","Requisitos"),("cumplimiento","Contraprestación")])],
  [("info","Info",None),("resumen","Resumen",None)],
  ["Monto","$80k actual"], "$80k",
  [("¿Plan actual?","Potenciar Trabajo fue discontinuado en 2024. Fue reemplazado por otros (Volver al Trabajo, etc.)."),
   ("¿Monto?","Suele ser 50% de SMVM. Varía según programa vigente."),
   ("¿Contraprestación?","4 horas diarias trabajo, capacitación o tarea comunitaria."),
   ("¿Incompatible?","Con trabajo registrado. Con AUH puede ser compatible.")],
  """  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'~$80.000/mes (50% SMVM aprox)',
    req:'18-65 años, situación vulnerabilidad, sin trabajo registrado',
    cumplimiento:'4 hs diarias capacitación o trabajo comunitario'
  };
  return { info:info[c]||'', resumen:`Potenciar Trabajo ${c}: ${info[c]||'—'}.` };""")

M("pami-prestaciones-monto-copago-2026", "finanzas", "⚕️", "PAMI: prestaciones y copago 2026",
  "Qué cubre PAMI (medicamentos, internación, rehabilitación) y copagos 2026.",
  "Tabla de cobertura",
  [("prestacion","Prestación","select",[("med","Medicamentos"),("odont","Odontología"),("opt","Óptica"),("rehab","Rehabilitación"),("intern","Internación")])],
  [("cobertura","Cobertura",None),("copago","Copago afiliado",None),("resumen","Interpretación",None)],
  ["Medicamentos","50-100%"], "50-100%",
  [("¿Medicamentos crónicos?","PAMI cubre 50-100% según patología crónica."),
   ("¿Vademecum especial?","Lista de medicamentos al 100%: diabetes, HTA, oncológicos, etc."),
   ("¿Copago?","Algunos medicamentos tienen copago nominal."),
   ("¿Urgencia?","Internación de urgencia 100% cubierta sin copago."),
   ("¿Óptica?","Lentes cada 2 años + reparaciones.")],
  """  const p=String(i.prestacion||'med');
  const cov: Record<string,[string,string]> = {
    med:['50-100% según vademecum','Copago nominal en ciertos'],
    odont:['100% prestaciones básicas','Sin copago urgencia'],
    opt:['Lentes cada 2 años','Copago material estándar'],
    rehab:['100% kinesio, fonoaudiología','Sin copago'],
    intern:['100% urgencia y programada','Sin copago afiliado')]
  };
  const [c,cp]=cov[p]||cov.med;
  return { cobertura:c, copago:cp, resumen:`PAMI ${p}: ${c}, ${cp}.` };""")

M("becas-manuel-belgrano-monto", "finanzas", "🎓", "Beca Manuel Belgrano 2026",
  "Beca Manuel Belgrano universitaria. Monto y requisitos.",
  "Mensual por carrera estratégica",
  [("carrera","Tipo carrera","select",[("salud","Salud"),("cyt","Ciencia y Tec"),("ing","Ingeniería"),("otra","Otra")])],
  [("monto","Monto mensual",None),("requisitos","Requisitos",None),("resumen","Interpretación",None)],
  ["Ciencia y Tec","~$60k"], "~$60k",
  [("¿Para quién?","Universitarios en carreras estratégicas: ingenierías, medicina, tecnología."),
   ("¿Monto 2026?","~$60-80k/mes según carrera."),
   ("¿Requisitos?","Ingreso familiar ≤3 SMVM, promedio aprobado, materias al día."),
   ("¿Duración?","Duración de la carrera (típicamente 5-6 años)."),
   ("¿Compatible con Progresar?","No. Es una u otra.")],
  """  const c=String(i.carrera||'salud');
  const m: Record<string,number> = { salud:70000, cyt:60000, ing:75000, otra:50000 };
  return { monto:'$'+(m[c]||50000).toLocaleString('es-AR'), requisitos:'Ingreso ≤3 SMVM, promedio aprobado, carrera estratégica', resumen:`Beca Belgrano ${c}: $${(m[c]||50000).toLocaleString('es-AR')}/mes.` };""")

M("ayuda-escolar-anual-asignacion", "finanzas", "🎒", "Ayuda escolar anual ANSES",
  "Ayuda escolar única anual ANSES: por hijo en edad escolar.",
  "Pago único por hijo",
  [("hijos","Hijos en edad escolar","number",None)],
  [("monto","Monto total único",None),("porHijo","Por hijo",None),("resumen","Interpretación",None)],
  ["2 hijos escolarizados","~$130k"], "~$130k",
  [("¿Cuándo?","Inicio de clases (marzo). Pago único anual."),
   ("¿Quién cobra?","Empleados registrados y trabajadores casas con hijos 5-18 escolarizados."),
   ("¿Monto 2026?","~$65k por hijo (orientativo)."),
   ("¿AUH?","Compatible. Suele liquidarse con la cuota normal."),
   ("¿Secundario completo?","Plus adicional por finalizar secundario.")],
  """  const h=Number(i.hijos)||0;
  const perHijo=65000;
  const total=h*perHijo;
  return { monto:'$'+total.toLocaleString('es-AR'), porHijo:'$'+perHijo.toLocaleString('es-AR'), resumen:`${h} hijos × $${perHijo.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')} único anual.` };""")

M("pension-viudez-porcentaje-conyuge", "finanzas", "💔", "Pensión viudez: porcentaje cónyuge",
  "Pensión por fallecimiento del cónyuge. Porcentaje del haber jubilatorio.",
  "70% + ajuste por hijos",
  [("haberJubilado","Haber jubilatorio del fallecido","number","$"),("hijosMenores","Hijos menores","number",None)],
  [("pension","Pensión mensual",None),("porcentaje","% del haber",None),("resumen","Interpretación",None)],
  ["$500k, 1 hijo","$400k"], "$400k",
  [("¿Viudo/a?","Cobra 70% del haber que cobraba/le correspondía al fallecido."),
   ("¿Hijos?","+20% por cada hijo menor a cargo, máximo 100%."),
   ("¿Conviviente?","Sí, acreditando 5 años de convivencia (2 con hijo en común)."),
   ("¿Incompatibilidades?","Si ya tenés jubilación propia, podés optar por la mayor."),
   ("¿Vitalicia?","Sí, mientras cumpla requisitos.")],
  """  const h=Number(i.haberJubilado)||0; const hij=Number(i.hijosMenores)||0;
  const pct=Math.min(1, 0.70+hij*0.10);
  const p=h*pct;
  return { pension:'$'+p.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), porcentaje:(pct*100).toFixed(0)+'%', resumen:`Haber $${h.toLocaleString('es-AR')} × ${(pct*100).toFixed(0)}% = $${p.toFixed(0)}/mes.` };""")

M("asignacion-discapacidad-pensionado", "finanzas", "♿", "Pensión no contributiva discapacidad",
  "Pensión no contributiva por discapacidad. Monto y certificación requerida.",
  "70% jubilación mínima",
  [("cdu","Tiene CUD","select",[("si","Sí"),("no","No")]),("gradoDeps","% Invalidez","number","%")],
  [("monto","Monto mensual",None),("acceso","Puede acceder",None),("resumen","Interpretación",None)],
  ["CUD sí, 76% invalidez","~$200k"], "~$200k",
  [("¿Requisito?","Certificado de Discapacidad (CUD) + invalidez +76%."),
   ("¿Monto?","70% de jubilación mínima = ~$200k/mes."),
   ("¿Compatible con AUH?","No. AUH discapacidad reemplaza esta pensión."),
   ("¿PAMI?","Sí, PAMI cubre automáticamente."),
   ("¿Trabajar?","Permitido con rehabilitación, hasta cierto tope.")],
  """  const c=String(i.cdu||'no')==='si'; const g=Number(i.gradoDeps)||0;
  const acceso=c && g>=76;
  const monto=acceso?200000:0;
  return { monto:'$'+monto.toLocaleString('es-AR'), acceso:acceso?'Sí':'No (requiere CUD + ≥76%)', resumen:acceso?`Acceso habilitado: $${monto.toLocaleString('es-AR')}/mes.`:'No cumple requisitos.' };""")

M("becas-juanmarin-primarias-secundarias", "finanzas", "📚", "Beca Juan Manuel Azul (primaria-secundaria) AR",
  "Becas nacionales para primario y secundario (Juan Manuel Azul / equivalentes 2026).",
  "Mensual por ciclo",
  [("ciclo","Ciclo","select",[("prim","Primario"),("sec","Secundario")])],
  [("monto","Monto mensual",None),("total10m","Total 10 meses",None),("resumen","Interpretación",None)],
  ["Secundario","~$30k"], "~$30k",
  [("¿Cómo inscribirse?","Online en ministerios provinciales o nación."),
   ("¿Monto?","~$20-30k según ciclo (actualizado)."),
   ("¿Requisito?","Ingreso familiar ≤X SMVM, escolaridad regular."),
   ("¿Duración?","10 meses del ciclo lectivo.")],
  """  const c=String(i.ciclo||'sec');
  const m: Record<string,number> = { prim:20000, sec:30000 };
  const v=m[c]||20000;
  return { monto:'$'+v.toLocaleString('es-AR'), total10m:'$'+(v*10).toLocaleString('es-AR'), resumen:`Beca ${c}: $${v.toLocaleString('es-AR')}/mes × 10 = $${(v*10).toLocaleString('es-AR')}.` };""")

M("anses-complemento-leche-maternidad", "finanzas", "🍼", "ANSES complemento leche / maternidad",
  "Complemento leche para gestantes/lactantes y hijos <5. Monto ANSES 2026.",
  "Mensual con AUH/AUE",
  [("situacion","Situación","select",[("emb","Embarazo"),("lact","Lactante"),("h5","Hijo <5 años")])],
  [("monto","Complemento mensual",None),("resumen","Interpretación",None)],
  ["Embarazo","~$15k"], "~$15k",
  [("¿Para quién?","Personas gestantes + lactantes hasta 2 años + hijos <5 años."),
   ("¿Monto 2026?","~$12-18k/mes (orientativo)."),
   ("¿Compatible con AUH?","Sí, complemento acumulable."),
   ("¿Requisito?","Controles médicos + nutricionales al día.")],
  """  const s=String(i.situacion||'emb');
  const m: Record<string,number> = { emb:15000, lact:15000, h5:12000 };
  return { monto:'$'+(m[s]||0).toLocaleString('es-AR'), resumen:`Complemento leche ${s}: $${(m[s]||0).toLocaleString('es-AR')}/mes.` };""")

M("prestamo-anses-jubilado-argenta-monto", "finanzas", "🏦", "Préstamo ANSES Argenta / jubilados 2026",
  "Préstamo ANSES para jubilados, pensionados y AUH. Tope y cuota.",
  "Monto tope × cuota mensual",
  [("haberMensual","Haber mensual actual","number","$"),("plazo","Plazo cuotas","number",None)],
  [("maximoPrestable","Máximo prestable",None),("cuotaEstim","Cuota estimada",None),("resumen","Interpretación",None)],
  ["Jubilado con $500k, 48 cuotas","~$1M prestable"], "$1M",
  [("¿Quién accede?","Jubilados, pensionados, AUH, pensiones no contributivas."),
   ("¿Tope préstamo?","Depende del haber y descuenta hasta 30% del mismo por cuota."),
   ("¿Tasa ANSES?","Subsidiada, menor que mercado. ~50-70% TNA."),
   ("¿Plazo?","24 a 72 meses según monto y edad."),
   ("¿Descuento automático?","Directo del haber mensual.")],
  """  const h=Number(i.haberMensual)||0; const p=Number(i.plazo)||24;
  const cuotaMax=h*0.30;
  const tnaMensual=0.55/12;
  const maxPrest=cuotaMax*(1-Math.pow(1+tnaMensual,-p))/tnaMensual;
  return { maximoPrestable:'$'+maxPrest.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), cuotaEstim:'$'+cuotaMax.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`Haber $${h.toLocaleString('es-AR')}, ${p} cuotas: máx $${maxPrest.toFixed(0)} prestable.` };""")

M("jubilacion-pua-prestacion-universal-adulto-mayor", "finanzas", "🌅", "PUAM: Pensión Universal Adulto Mayor",
  "PUAM para mayores 65 sin requisitos de aportes. Monto 2026.",
  "80% jubilación mínima",
  [("edad","Edad","number",None),("aportes","Tiene aportes suficientes","select",[("si","Sí (jubilación normal)"),("no","No")])],
  [("monto","Monto PUAM",None),("accede","Accede",None),("resumen","Interpretación",None)],
  ["67 años sin aportes","~$230k"], "$230k",
  [("¿PUAM?","Pensión universal: no necesita 30 años de aportes, solo edad 65+."),
   ("¿Monto?","80% de la jubilación mínima. ~$230k/mes."),
   ("¿Compatible con trabajo?","No. Si trabajás en relación dependencia, se suspende."),
   ("¿PAMI?","Sí, PAMI automático con PUAM."),
   ("¿Diferencia con jubilación?","Jubilación: 30 años aportes + edad. PUAM: solo edad 65+.")],
  """  const e=Number(i.edad)||0; const a=String(i.aportes||'no')==='si';
  const accede=e>=65 && !a;
  const monto=accede?232000:0;
  return { monto:'$'+monto.toLocaleString('es-AR'), accede:accede?'Sí, cumple requisitos':(a?'No - tiene aportes (va jubilación)':'No - edad <65'), resumen:accede?`Acceso PUAM: $${monto}/mes.`:'No aplica PUAM.' };""")

M("monotributo-social-beneficio-exencion", "finanzas", "🤝", "Monotributo Social: exención y beneficios",
  "Monotributo social: quiénes acceden, exenciones y limitaciones.",
  "Cuota reducida 50% + beneficios",
  [("consulta","Consultar","select",[("req","Requisitos"),("cuota","Cuota"),("benef","Beneficios")])],
  [("info","Info",None),("resumen","Interpretación",None)],
  ["Cuota","50% de la A"], "$12k",
  [("¿Monotributo social?","Categoría reducida para cooperativas, emprendedores sociales, vulnerabilidad."),
   ("¿Cuota?","50% del componente impositivo de categoría A. Aportes SIPA + OS normales."),
   ("¿Acceso?","RENATEA o programas sociales. Ingreso familiar ≤SMVM."),
   ("¿Compatible AUH?","Sí."),
   ("¿Tope?","No puede superar categoría A en facturación.")],
  """  const c=String(i.consulta||'req');
  const info: Record<string,string> = {
    req:'Cooperativas, emprendedores sociales, beneficiarios planes, ingreso ≤SMVM',
    cuota:'~$12.000/mes (50% categoría A + aportes SIPA + obra social)',
    benef:'Obra social, jubilación mínima, posibilidad facturar legalmente'
  };
  return { info:info[c]||'', resumen:`Monotributo social ${c}: ${info[c]||'—'}.` };""")


def collect():
    return SPECS
