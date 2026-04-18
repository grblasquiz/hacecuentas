"""Batch 8 — Tecnología (30 calcs)."""
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
    SPECS.append(spec(slug, "tecnologia", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


# 1. Ancho de banda descarga
M("tiempo-descarga-archivo-ancho-banda", "⬇️", "Tiempo de descarga (archivo/velocidad)",
  "Tiempo real en descargar un archivo según tu conexión.",
  "t = tamaño / velocidad",
  [("tamano","Tamaño archivo","number","MB"),("velocidad","Velocidad","number","Mbps")],
  [("tiempo","Tiempo",None),("tiempoH","Tiempo (h:m:s)",None),("resumen","Interpretación",None)],
  ["10GB a 100 Mbps","13 min 40s"], "13:40",
  [("¿Mbps vs MB/s?","1 MB = 8 Mb. Mbps/8 = MB/s."),
   ("¿Por qué más lento?","Overhead TCP, servidor, latencia."),
   ("¿Fibra?","1 Gbps descarga 1GB en ~10s real."),
   ("¿WiFi?","Afecta distancia/interferencia al router."),
   ("¿CDN?","Más cercano = más rápido.")],
  """  const mb=Number(i.tamano)||0; const mbps=Number(i.velocidad)||0;
  if (mbps===0) return { tiempo:'—', tiempoH:'—', resumen:'Velocidad no puede ser 0.' };
  const seg=mb*8/mbps;
  const h=Math.floor(seg/3600); const m=Math.floor((seg%3600)/60); const s=Math.round(seg%60);
  return { tiempo:`${seg.toFixed(1)} seg`, tiempoH:`${h}h ${m}m ${s}s`, resumen:`Descarga de ${mb}MB a ${mbps}Mbps = ${h}h ${m}m ${s}s.` };""")

# 2. Almacenamiento video
M("almacenamiento-video-bitrate-duracion", "🎬", "Almacenamiento de video (bitrate)",
  "Tamaño en GB de un video según bitrate y duración.",
  "GB = bitrate·duración/8/1024",
  [("bitrate","Bitrate","number","Mbps"),("duracion","Duración","number","min")],
  [("tamano","Tamaño",None),("gb","GB",None),("resumen","Interpretación",None)],
  ["10 Mbps x 60 min","4.39 GB"], "4.39 GB",
  [("¿Bitrate típico?","1080p: 5-10 Mbps; 4K: 25-50 Mbps."),
   ("¿Compresión?","H.265 (HEVC) ~50% menor que H.264."),
   ("¿Streaming?","Netflix 4K ~15 Mbps con HEVC."),
   ("¿RAW?","Sin compresión: 100s de Mbps."),
   ("¿Audio?","Añade ~1-5 Mbps extra.")],
  """  const br=Number(i.bitrate)||0; const min=Number(i.duracion)||0;
  const gb=(br*min*60)/8/1024;
  return { tamano:`${(gb*1024).toFixed(1)} MB`, gb:`${gb.toFixed(2)} GB`, resumen:`${min} min a ${br}Mbps = ${gb.toFixed(2)} GB.` };""")

# 3. Frames por segundo
M("fps-fluidez-video-juego", "🎮", "FPS y fluidez percibida",
  "Interpretación de FPS en juegos y video.",
  "Latencia = 1000/fps ms",
  [("fps","FPS","number",None)],
  [("latencia","Latencia frame",None),("calidad","Categoría",None),("resumen","Interpretación",None)],
  ["60","16.67 ms"], "16.67 ms",
  [("¿Cuánto basta?","24 cine, 30 mínimo, 60 fluido, 144+ competitivo."),
   ("¿VSync?","Sincroniza FPS con Hz del monitor."),
   ("¿G-Sync/FreeSync?","Variable, evita tearing."),
   ("¿Percepción?","Mayor FPS reduce motion blur y latencia."),
   ("¿Hz monitor?","FPS limitado por refresh rate.")],
  """  const fps=Number(i.fps)||0;
  const lat=fps===0?Infinity:1000/fps;
  let q='—'; if (fps>=144) q='Competitivo'; else if (fps>=60) q='Fluido'; else if (fps>=30) q='Aceptable'; else if (fps>=24) q='Mínimo cine'; else q='Entrecortado';
  return { latencia:`${lat.toFixed(2)} ms`, calidad:q, resumen:`${fps} FPS: ${q} (${lat.toFixed(1)} ms/frame).` };""")

# 4. Resolución DPI
M("dpi-ppp-impresion-resolucion", "🖨️", "DPI/PPP para impresión",
  "Resolución de píxeles ideal para impresión en tamaño dado.",
  "Pixels = pulgadas × DPI",
  [("anchoCm","Ancho","number","cm"),("altoCm","Alto","number","cm"),("dpi","DPI","number",None)],
  [("px","Píxeles",None),("mpx","Megapíxeles",None),("resumen","Interpretación",None)],
  ["10x15 cm, 300 DPI","1181 x 1772 px"], "1181x1772",
  [("¿DPI habitual?","300 foto profesional, 150 normal, 72 web."),
   ("¿Cartel grande?","150 DPI alcanza a distancia."),
   ("¿Vectorial?","SVG/PDF escalan sin pérdida."),
   ("¿Re-muestrear?","Subir DPI no mejora si imagen original es baja."),
   ("¿Color?","CMYK para impresión, RGB para pantalla.")],
  """  const ac=Number(i.anchoCm)||0; const al=Number(i.altoCm)||0; const dpi=Number(i.dpi)||300;
  const pxW=Math.round(ac/2.54*dpi); const pxH=Math.round(al/2.54*dpi);
  const mpx=pxW*pxH/1e6;
  return { px:`${pxW} x ${pxH} px`, mpx:`${mpx.toFixed(1)} MP`, resumen:`${ac}×${al}cm a ${dpi}DPI = ${pxW}×${pxH} px (${mpx.toFixed(1)} MP).` };""")

# 5. RAM suficiente
M("ram-recomendada-uso-computadora", "💾", "RAM recomendada por uso",
  "Sugerencia de RAM según tipo de uso.",
  "Basado en perfiles de uso comunes",
  [("uso","Uso","select",[("basico","Navegación/ofimática"),("gaming","Gaming"),("dev","Desarrollo"),("creativo","Edición video/3D"),("servidor","Servidor")])],
  [("minimo","Mínimo",None),("recomendado","Recomendado",None),("ideal","Ideal",None),("resumen","Interpretación",None)],
  ["Gaming","16-32 GB"], "Recom: 16 GB",
  [("¿Por qué más?","Chrome tabs, Docker, VMs consumen mucha."),
   ("¿DDR4 vs DDR5?","DDR5 más rápida y eficiente, 2x bandwidth."),
   ("¿Swap ayuda?","SSD sí, HDD muy lento."),
   ("¿MacBook?","Memoria unificada: ~más eficiente."),
   ("¿Futuro?","Duplica tu estimación si piensas 5+ años.")],
  """  const uso=String(i.uso||'basico');
  const t:Record<string,[string,string,string]>={basico:['4 GB','8 GB','16 GB'],gaming:['8 GB','16 GB','32 GB'],dev:['16 GB','32 GB','64 GB'],creativo:['16 GB','32 GB','128 GB'],servidor:['8 GB','32 GB','256 GB']};
  const [m,r,id]=t[uso]||t.basico;
  return { minimo:m, recomendado:r, ideal:id, resumen:`Uso ${uso}: recomendado ${r} RAM.` };""")

# 6. Batería consumo
M("autonomia-bateria-dispositivo-mah", "🔋", "Autonomía de batería (mAh)",
  "Horas estimadas de uso según capacidad y consumo.",
  "h = mAh / mA",
  [("mah","Capacidad","number","mAh"),("ma","Consumo","number","mA")],
  [("horas","Horas",None),("dias","Días",None),("resumen","Interpretación",None)],
  ["3000 mAh / 200 mA","15h"], "15h",
  [("¿Wh?","Wh = mAh × V / 1000."),
   ("¿Ciclos?","500-1000 típicos hasta 80% salud."),
   ("¿Temperatura?","Frío reduce hasta 30%."),
   ("¿Carga rápida?","Mayor calor, menos ciclos."),
   ("¿20-80%?","Mejor rango para vida útil.")],
  """  const mah=Number(i.mah)||0; const ma=Number(i.ma)||0;
  if (ma===0) return { horas:'—', dias:'—', resumen:'Consumo no puede ser 0.' };
  const h=mah/ma;
  return { horas:`${h.toFixed(2)} h`, dias:`${(h/24).toFixed(2)} días`, resumen:`${mah}mAh / ${ma}mA = ${h.toFixed(1)}h continuas.` };""")

# 7. Consumo W PC
M("consumo-watts-pc-gamer-fuente", "⚡", "Consumo eléctrico PC",
  "Watts totales y fuente recomendada.",
  "W_fuente = W_pico × 1.3 (safety)",
  [("cpu","CPU W","number",None),("gpu","GPU W","number",None),("otros","Otros W","number",None)],
  [("total","Consumo pico",None),("fuente","Fuente mín",None),("resumen","Interpretación",None)],
  ["CPU 125 + GPU 300 + 100","W=525"], "Fuente ≥ 700W",
  [("¿Por qué 80% regla?","Fuente trabaja al ~60-70% para eficiencia (curva Gold)."),
   ("¿80 Plus?","Bronze 82%, Gold 87%, Platinum 90%, Titanium 94%."),
   ("¿Calidad?","Marca importa: Seasonic, Corsair, EVGA."),
   ("¿Modular?","Cables desmontables, menos clutter."),
   ("¿Duración?","PSU duran 7-10 años; no escatimes.")],
  """  const cpu=Number(i.cpu)||0; const gpu=Number(i.gpu)||0; const otr=Number(i.otros)||50;
  const total=cpu+gpu+otr; const fuente=Math.ceil(total*1.3/50)*50;
  return { total:`${total} W`, fuente:`${fuente} W (80+ Gold)`, resumen:`Pico ${total}W → fuente recomendada ${fuente}W.` };""")

# 8. Hashing tiempo
M("tiempo-crackear-password-longitud", "🔐", "Tiempo crackeo password",
  "Estimación brute-force según longitud y charset.",
  "Intentos = charset^largo",
  [("largo","Longitud","number",None),("charset","Set","select",[("num","Solo números (10)"),("min","Minúsculas (26)"),("alnum","Alfanumérico (62)"),("todo","Con símbolos (95)")])],
  [("intentos","Combinaciones",None),("tiempo","Tiempo 1B/seg",None),("resumen","Interpretación",None)],
  ["8 alfanum","218 trillones"], "~7 horas",
  [("¿1B/s realista?","GPU moderna hace 1B hashes/seg SHA256."),
   ("¿Passphrase?","Mejor: 4-5 palabras aleatorias (XKCD 936)."),
   ("¿2FA?","Agrega capa crítica más allá de password."),
   ("¿Manager?","Genera y guarda passwords únicos por sitio."),
   ("¿Rainbow table?","Pre-computa hashes. Salt las previene.")],
  """  const l=Math.floor(Number(i.largo)||0); const cs=String(i.charset||'min');
  const sz:Record<string,number>={num:10,min:26,alnum:62,todo:95};
  const n=sz[cs]||26;
  const total=Math.pow(n,l);
  const seg=total/1e9;
  let txt:string;
  if (seg<60) txt=`${seg.toFixed(1)} seg`;
  else if (seg<3600) txt=`${(seg/60).toFixed(1)} min`;
  else if (seg<86400) txt=`${(seg/3600).toFixed(1)} horas`;
  else if (seg<86400*365) txt=`${(seg/86400).toFixed(1)} días`;
  else txt=`${(seg/(86400*365)).toExponential(2)} años`;
  return { intentos:total.toExponential(2), tiempo:txt, resumen:`Password largo ${l} charset ${cs}: ${txt} a 1B/s.` };""")

# 9. Tasa compresión
M("tasa-compresion-archivo-zip", "📦", "Tasa de compresión",
  "% de reducción de tamaño al comprimir.",
  "Tasa = (1 - comprimido/original) × 100",
  [("original","Tamaño original","number","MB"),("comprimido","Comprimido","number","MB")],
  [("tasa","Tasa compresión",None),("ratio","Ratio",None),("ahorro","Ahorro",None),("resumen","Interpretación",None)],
  ["100 → 30 MB","70%"], "70%",
  [("¿Typical?","Texto 70-90%, imágenes JPEG ya compact ~5%, MP4 0%."),
   ("¿ZIP vs 7z?","7z LZMA mejor ratio, ZIP más compatible."),
   ("¿Sin pérdida?","ZIP/PNG/FLAC preservan. JPEG/MP3 pierden."),
   ("¿Cuándo no?","Media ya comprimida (mp4, jpg)."),
   ("¿Algoritmos?","Deflate, LZMA, Brotli, Zstandard.")],
  """  const o=Number(i.original)||0; const c=Number(i.comprimido)||0;
  if (o===0) return { tasa:'—', ratio:'—', ahorro:'—', resumen:'Original no puede ser 0.' };
  const tasa=(1-c/o)*100; const ratio=o/c;
  return { tasa:`${tasa.toFixed(1)}%`, ratio:`${ratio.toFixed(2)}:1`, ahorro:`${(o-c).toFixed(2)} MB`, resumen:`Compresión ${tasa.toFixed(1)}%, ahorro ${(o-c).toFixed(1)} MB.` };""")

# 10. UPS autonomía
M("autonomia-ups-tiempo-respaldo-servidor", "🔌", "Autonomía UPS",
  "Minutos de respaldo según carga y VA.",
  "min ≈ VA/W × factor",
  [("va","Capacidad UPS","number","VA"),("w","Carga","number","W")],
  [("minutos","Minutos",None),("utilizacion","Utilización",None),("resumen","Interpretación",None)],
  ["1500 VA, 300 W","~12 min"], "~12 min",
  [("¿VA vs W?","W = real, VA = aparente. PF típico 0.6-0.9."),
   ("¿Línea interactiva?","Corrige voltaje sin usar batería en microcortes."),
   ("¿Online?","Convierte AC→DC→AC siempre; mejor protección."),
   ("¿Cuándo reemplazar?","Baterías 3-5 años típicos."),
   ("¿Servidor?","Apagar controladamente con daemon NUT/apcupsd.")],
  """  const va=Number(i.va)||0; const w=Number(i.w)||0;
  if (w===0) return { minutos:'—', utilizacion:'—', resumen:'Carga no puede ser 0.' };
  const wMax=va*0.6;
  const ut=w/wMax*100;
  const min=(va*0.4)/w;
  return { minutos:`${min.toFixed(1)} min`, utilizacion:`${ut.toFixed(0)}%`, resumen:`UPS ${va}VA con ${w}W: ~${min.toFixed(0)} min (${ut.toFixed(0)}% uso).` };""")

# 11. Subnetting
M("subnetting-mascara-red-cidr", "🌐", "Subnetting CIDR",
  "Hosts por subred, máscara, broadcast de /n.",
  "Hosts = 2^(32-n) - 2",
  [("cidr","CIDR /n","number",None)],
  [("hosts","Hosts útiles",None),("mascara","Máscara",None),("subredes","# Subredes/24",None),("resumen","Interpretación",None)],
  ["/24","254 hosts"], "254",
  [("¿Cuándo /30?","4 direcciones, 2 útiles: enlaces punto-a-punto."),
   ("¿VLSM?","Subnetting de longitud variable."),
   ("¿IPv6?","Más abundante: /64 típico per LAN."),
   ("¿Broadcast?","Última IP de la subred."),
   ("¿Gateway?","Típicamente .1 o .254.")],
  """  const n=Math.floor(Number(i.cidr)||24);
  if (n<0||n>32) return { hosts:'—', mascara:'—', subredes:'—', resumen:'CIDR válido: 0-32.' };
  const hosts=Math.max(0, Math.pow(2,32-n)-2);
  const bits=Array(32).fill(0).map((_,k)=>k<n?1:0);
  const octs=[0,8,16,24].map(o=>parseInt(bits.slice(o,o+8).join(''),2)).join('.');
  const subredes24=n>=24?Math.pow(2,n-24):0;
  return { hosts:hosts.toLocaleString(), mascara:octs, subredes:subredes24.toString(), resumen:`/${n}: ${hosts.toLocaleString()} hosts, máscara ${octs}.` };""")

# 12. RAID
M("raid-capacidad-discos-redundancia", "💽", "Capacidad RAID",
  "Capacidad útil y tolerancia según nivel RAID.",
  "Depende de tipo (0,1,5,6,10)",
  [("tipo","RAID","select",[("0","RAID 0"),("1","RAID 1"),("5","RAID 5"),("6","RAID 6"),("10","RAID 10")]),("n","# discos","number",None),("tb","TB c/u","number",None)],
  [("util","Capacidad útil",None),("tolerancia","Tolerancia fallo",None),("resumen","Interpretación",None)],
  ["RAID 5, 4×2TB","6 TB util"], "6 TB",
  [("¿RAID 0?","Stripe, velocidad, 0 redundancia."),
   ("¿RAID 1?","Mirror, 50% capacidad."),
   ("¿RAID 5?","N-1, 1 fallo tolerado, paridad distribuida."),
   ("¿RAID 6?","N-2, 2 fallos."),
   ("¿RAID 10?","Mirror + stripe, rendimiento y tolerancia.")],
  """  const t=String(i.tipo||'0'); const n=Math.floor(Number(i.n)||0); const tb=Number(i.tb)||0;
  let util=0; let tol='0';
  if (t==='0') { util=n*tb; tol='0'; }
  else if (t==='1') { util=tb; tol=`${n-1}`; }
  else if (t==='5') { util=(n-1)*tb; tol='1'; }
  else if (t==='6') { util=(n-2)*tb; tol='2'; }
  else if (t==='10') { util=(n/2)*tb; tol='1+'; }
  return { util:`${util.toFixed(1)} TB`, tolerancia:tol, resumen:`RAID ${t} con ${n}×${tb}TB: ${util.toFixed(1)}TB útil, tolera ${tol} fallo(s).` };""")

# 13. Cable ethernet
M("categoria-cable-ethernet-velocidad-distancia", "📡", "Cable Ethernet (Cat)",
  "Velocidad y distancia máxima por categoría.",
  "Tabla referencia estándar",
  [("cat","Categoría","select",[("cat5e","Cat 5e"),("cat6","Cat 6"),("cat6a","Cat 6a"),("cat7","Cat 7"),("cat8","Cat 8")])],
  [("velocidad","Velocidad",None),("distancia","Distancia",None),("frecuencia","Frecuencia",None),("resumen","Interpretación",None)],
  ["Cat 6","1 Gbps"], "1 Gbps",
  [("¿Doméstico?","Cat 6 basta hasta 1 Gbps 100m."),
   ("¿10G?","Cat 6a+ hasta 100m; Cat 6 solo 37m."),
   ("¿Blindado?","STP (shielded) para entornos con interferencia."),
   ("¿Fibra?","Más allá de 100m o alta velocidad."),
   ("¿PoE?","Todas soportan; alto wattage precisa 6+.")],
  """  const c=String(i.cat||'cat5e');
  const t:Record<string,[string,string,string]>={cat5e:['1 Gbps','100m','100 MHz'],cat6:['1 Gbps / 10 Gbps <37m','100m','250 MHz'],cat6a:['10 Gbps','100m','500 MHz'],cat7:['10 Gbps','100m','600 MHz'],cat8:['40 Gbps','30m','2000 MHz']};
  const [v,d,f]=t[c]||t.cat5e;
  return { velocidad:v, distancia:d, frecuencia:f, resumen:`${c}: ${v} hasta ${d}.` };""")

# 14. WiFi canal
M("wifi-canal-optimo-24-5-ghz", "📶", "WiFi: canal óptimo 2.4/5 GHz",
  "Guía para seleccionar canal.",
  "Canales sin solapar: 1, 6, 11 (2.4); DFS en 5 GHz",
  [("banda","Banda","select",[("24","2.4 GHz"),("5","5 GHz")])],
  [("canales","Canales recomendados",None),("consejos","Consejos",None),("resumen","Interpretación",None)],
  ["2.4 GHz","1,6,11"], "1,6,11",
  [("¿Por qué 1/6/11?","Únicos sin solapamiento en 2.4 GHz."),
   ("¿5 GHz?","19+ canales no solapados; DFS requiere radar check."),
   ("¿Ancho 160 MHz?","Rápido pero ruido y menos canales."),
   ("¿WiFi 6E?","6 GHz, limpio, requiere clientes compatibles."),
   ("¿App?","Wifi Analyzer (Android) ayuda a elegir.")],
  """  const b=String(i.banda||'24');
  if (b==='24') return { canales:'1, 6, 11', consejos:'Ancho 20 MHz', resumen:'Usar canales 1/6/11 únicos sin solape.' };
  return { canales:'36-48, 149-165', consejos:'DFS 52-144 requiere radar check', resumen:'5 GHz: 36/149 seguros, evitar DFS si hay cortes.' };""")

# 15. Memoria RAM bytes
M("conversion-bytes-kb-mb-gb-tb", "💽", "Conversión bytes/KB/MB/GB/TB",
  "Convierte entre múltiplos de bytes.",
  "1 KB = 1024 B (binario) o 1000 (decimal)",
  [("valor","Valor","number",None),("desde","Desde","select",[("B","B"),("KB","KB"),("MB","MB"),("GB","GB"),("TB","TB")]),("a","A","select",[("B","B"),("KB","KB"),("MB","MB"),("GB","GB"),("TB","TB")]),("sistema","Sistema","select",[("bin","Binario 1024"),("dec","Decimal 1000")])],
  [("resultado","Resultado",None),("resumen","Interpretación",None)],
  ["1 GB → MB","1024 MB"], "1024",
  [("¿KiB/MiB?","Nombres oficiales binarios (KB decimal)."),
   ("¿Por qué diferencia?","Fabricantes usan decimal; SO muestra binario."),
   ("¿Disco 1TB?","~931 GiB reales."),
   ("¿Binario ISO?","Prefijos Ki, Mi, Gi desde 1998."),
   ("¿Bit vs byte?","B mayúscula = byte, b = bit. 1B = 8b.")],
  """  const v=Number(i.valor)||0; const de=String(i.desde||'B'); const a=String(i.a||'B'); const sis=String(i.sistema||'bin');
  const base=sis==='bin'?1024:1000;
  const idx:Record<string,number>={B:0,KB:1,MB:2,GB:3,TB:4};
  const bytes=v*Math.pow(base,idx[de]);
  const r=bytes/Math.pow(base,idx[a]);
  return { resultado:`${r.toLocaleString()} ${a}`, resumen:`${v} ${de} = ${r.toLocaleString()} ${a} (${sis}).` };""")

# 16. AES/bcrypt hash
M("hashes-bcrypt-costo-tiempo-cracking", "🔒", "bcrypt: costo vs tiempo",
  "Costo 2^n afecta tiempo per hash.",
  "Tiempo ≈ 2^(cost) × base",
  [("cost","Cost","number",None)],
  [("hashPorSeg","Hash/seg aprox",None),("tiempo","Tiempo 1 hash",None),("recomendacion","Recomendación",None),("resumen","Interpretación",None)],
  ["cost=12","~100 ms"], "~100 ms",
  [("¿Por qué lento?","Resistencia ataque fuerza bruta."),
   ("¿Cost balance?","12 estándar 2024; ajusta a ~250ms login."),
   ("¿Argon2?","Más moderno, resistente GPU/ASIC."),
   ("¿Salt?","bcrypt incluye automático (16 bytes)."),
   ("¿Upgrade cost?","Re-hashear al login cuando user entra.")],
  """  const c=Math.floor(Number(i.cost)||10);
  const base=2; const ms=base*Math.pow(2,c-10);
  const hs=1000/ms;
  let rec='OK'; if (c<10) rec='Subí a 10+'; else if (c>14) rec='Puede ser lento en servidor';
  return { hashPorSeg:`${hs.toFixed(1)}/s`, tiempo:`${ms.toFixed(1)} ms`, recomendacion:rec, resumen:`Cost ${c}: ${ms.toFixed(0)}ms/hash (${hs.toFixed(0)}/s).` };""")

# 17. API rate limit
M("rate-limit-api-rpm-rps", "⏱️", "Rate limit API (RPM/RPS)",
  "Convierte entre RPM/RPS/RPD y calcula carga.",
  "RPM × 60/3600 = RPS",
  [("valor","Valor","number",None),("unidad","Unidad","select",[("RPS","RPS"),("RPM","RPM"),("RPH","RPH"),("RPD","RPD")])],
  [("rps","RPS",None),("rpm","RPM",None),("rpd","RPD",None),("resumen","Interpretación",None)],
  ["60 RPM","1 RPS"], "1 RPS",
  [("¿Burst?","Rate limit típico permite picos cortos."),
   ("¿Backoff?","Si 429, espera exponencial (1s, 2s, 4s...)."),
   ("¿Distribuido?","Rate per user vs global."),
   ("¿Caché?","Reduce llamadas repetidas a misma URL."),
   ("¿Batching?","Agrupa operaciones en 1 request.")],
  """  const v=Number(i.valor)||0; const u=String(i.unidad||'RPS');
  const toRps:Record<string,number>={RPS:1,RPM:1/60,RPH:1/3600,RPD:1/86400};
  const rps=v*toRps[u];
  return { rps:`${rps.toFixed(4)}`, rpm:`${(rps*60).toFixed(1)}`, rpd:`${(rps*86400).toLocaleString()}`, resumen:`${v} ${u} = ${rps.toFixed(2)} req/seg.` };""")

# 18. Server uptime
M("uptime-servidor-nueve-nueves-minutos", "🖥️", "SLA uptime (nueves)",
  "Minutos de downtime permitidos según SLA.",
  "Downtime = (1-SLA/100) × 525600 min/año",
  [("sla","SLA %","select",[("99","99% dos nueves"),("99.9","99.9% tres"),("99.99","99.99% cuatro"),("99.999","99.999% cinco")])],
  [("anual","Downtime anual",None),("mensual","Mensual",None),("diario","Diario",None),("resumen","Interpretación",None)],
  ["99.99%","52.6 min/año"], "52.6 min",
  [("¿Cinco nueves?","5.26 min/año: infra de banca/telco."),
   ("¿SLA vs SLO?","SLA contractual, SLO objetivo interno."),
   ("¿Error budget?","1-SLO: tiempo para experimentar sin violar SLA."),
   ("¿Alcanzar?","Redundancia, multi-región, failover."),
   ("¿Cloud?","AWS 99.99% con múltiples AZ.")],
  """  const sla=Number(i.sla)||99;
  const dt=(1-sla/100)*525600;
  return { anual:`${dt.toFixed(1)} min/año`, mensual:`${(dt/12).toFixed(1)} min/mes`, diario:`${(dt/365).toFixed(2)} min/día`, resumen:`SLA ${sla}%: ${dt.toFixed(1)} min/año downtime permitido.` };""")

# 19. Big O
M("complejidad-algoritmica-big-o-iteraciones", "📊", "Big O: tiempo aprox",
  "Compara complejidades O(1), O(log n), O(n), O(n log n), O(n²), O(2^n).",
  "Según orden asintótico",
  [("n","n","number",None),("tipo","Tipo","select",[("1","O(1)"),("logn","O(log n)"),("n","O(n)"),("nlogn","O(n log n)"),("n2","O(n²)"),("2n","O(2^n)")])],
  [("ops","Operaciones",None),("tiempo","Tiempo @ 1B ops/s",None),("resumen","Interpretación",None)],
  ["n=1000, O(n²)","10^6"], "1 ms",
  [("¿Constante?","Igual sin importar n."),
   ("¿Logarítmico?","Doblar n agrega 1 op (binary search)."),
   ("¿Cuadrático?","Doblar n → 4x ops (bubble sort)."),
   ("¿Exponencial?","2^n explota: n=30 ya 1B."),
   ("¿Notación?","O = peor caso, Ω = mejor, Θ = promedio.")],
  """  const n=Number(i.n)||1; const t=String(i.tipo||'n');
  let ops:number;
  if (t==='1') ops=1;
  else if (t==='logn') ops=Math.log2(n);
  else if (t==='n') ops=n;
  else if (t==='nlogn') ops=n*Math.log2(n);
  else if (t==='n2') ops=n*n;
  else ops=Math.pow(2,Math.min(n,100));
  const seg=ops/1e9;
  let txt:string;
  if (seg<1e-6) txt=`${(seg*1e9).toFixed(1)} ns`;
  else if (seg<1e-3) txt=`${(seg*1e6).toFixed(1)} µs`;
  else if (seg<1) txt=`${(seg*1000).toFixed(1)} ms`;
  else txt=`${seg.toFixed(2)} s`;
  return { ops:ops.toExponential(2), tiempo:txt, resumen:`n=${n}, ${t}: ${ops.toExponential(1)} ops ≈ ${txt}.` };""")

# 20. Servidor USD cloud
M("costo-servidor-cloud-aws-ec2-mensual", "☁️", "Costo EC2/cloud mensual",
  "Calcula costo mensual de instancia cloud.",
  "Costo = $/h × 730 h/mes",
  [("hora","Precio/hora","number","$"),("horas","Horas/día","number",None),("dias","Días/mes","number",None)],
  [("mensual","Costo mensual",None),("anual","Anual",None),("ahorro","Reservado -40%",None),("resumen","Interpretación",None)],
  ["$0.10 24×30","$72"], "$72",
  [("¿On-demand vs reserved?","Reservado 1-3 años, 30-70% descuento."),
   ("¿Spot?","Hasta 90% descuento pero interrumpible."),
   ("¿Data transfer?","Out: $0.09/GB; in gratis."),
   ("¿Egress?","Descarga paga, principal costo oculto."),
   ("¿Calculadora?","AWS Pricing Calculator oficial.")],
  """  const h=Number(i.hora)||0; const hd=Number(i.horas)||24; const d=Number(i.dias)||30;
  const mes=h*hd*d;
  return { mensual:`$${mes.toFixed(2)}`, anual:`$${(mes*12).toFixed(2)}`, ahorro:`$${(mes*0.6).toFixed(2)}/mes`, resumen:`$${h}/h × ${hd}h × ${d}d = $${mes.toFixed(0)}/mes.` };""")

# 21. Compresión imagen
M("jpg-calidad-tamano-web-optimizacion", "🖼️", "JPG calidad vs tamaño",
  "Tamaño aproximado según calidad % JPG.",
  "Referencia empírica",
  [("mpx","Megapixels","number","MP"),("calidad","Calidad","number","%")],
  [("tamano","Tamaño estimado",None),("recomendacion","Recomendación",None),("resumen","Interpretación",None)],
  ["2MP, 85%","~300 KB"], "~300 KB",
  [("¿Calidad 85?","Sweet spot: casi indistinguible, 50% menos que 100."),
   ("¿WebP?","~25-35% menor que JPG similar calidad."),
   ("¿AVIF?","Mejor aún, soporte 90%+ navegadores 2024."),
   ("¿PNG?","Sin pérdida, pesado; solo para gráficos/transparencia."),
   ("¿Progressive?","Carga en pases, mejora UX percibida.")],
  """  const mp=Number(i.mpx)||0; const q=Number(i.calidad)||85;
  const kb=mp*120*(q/85)**1.5;
  let rec='OK'; if (q>=95) rec='Excesivo para web'; else if (q<70) rec='Artefactos visibles';
  return { tamano:`${kb.toFixed(0)} KB`, recomendacion:rec, resumen:`${mp}MP a ${q}% ≈ ${kb.toFixed(0)} KB.` };""")

# 22. Git branching
M("tamano-repo-git-commits-branches", "🌿", "Tamaño repo Git",
  "Estimación tamaño según commits/archivos.",
  "Depende de historia y binarios",
  [("commits","Commits","number",None),("archivos","Archivos","number",None),("kbProm","KB por archivo","number",None)],
  [("estimado","Tamaño estimado",None),("consejo","Consejo",None),("resumen","Interpretación",None)],
  ["1000 commits, 500 files","~60 MB"], "~60 MB",
  [("¿Binarios grandes?","Git LFS para > 100MB per file."),
   ("¿Historia pesada?","shallow clone --depth=1 acelera."),
   ("¿Subárboles?","Submodule o subtree para módulos."),
   ("¿Git GC?","Limpia objetos sueltos."),
   ("¿Pack?","Git comprime automáticamente.")],
  """  const c=Number(i.commits)||0; const a=Number(i.archivos)||0; const kb=Number(i.kbProm)||5;
  const mb=(a*kb+c*2)/1024;
  let cons='OK'; if (mb>500) cons='Considera LFS o split'; else if (mb>100) cons='Empieza a pesar';
  return { estimado:`${mb.toFixed(1)} MB`, consejo:cons, resumen:`Repo estimado: ${mb.toFixed(0)} MB. ${cons}.` };""")

# 23. AI tokens costo
M("costo-tokens-api-openai-claude-mensual", "🤖", "Costo API LLM por tokens",
  "Estimación mensual de costo LLM.",
  "Costo = (in·pIn + out·pOut) × llamadas",
  [("in_tok","Tokens in/llamada","number",None),("out_tok","Tokens out","number",None),("calls","Llamadas/día","number",None),("pIn","$/1k tok in","number",None),("pOut","$/1k tok out","number",None)],
  [("diario","Costo diario",None),("mensual","Mensual",None),("anual","Anual",None),("resumen","Interpretación",None)],
  ["1000 in + 500 out × 1000 calls","~$30/día"], "~$30/día",
  [("¿Precio real?","Claude Sonnet $3/M in, $15/M out (2024)."),
   ("¿Reducir?","Cache prompts, RAG acotado, modelos más chicos."),
   ("¿Batch?","Algunos ofrecen 50% descuento batch."),
   ("¿Streaming?","Mismo costo, mejor UX."),
   ("¿Free tier?","Claude y OpenAI tienen cuotas gratis limitadas.")],
  """  const ti=Number(i.in_tok)||0; const to=Number(i.out_tok)||0; const n=Number(i.calls)||0; const pI=Number(i.pIn)||3; const pO=Number(i.pOut)||15;
  const perCall=(ti*pI+to*pO)/1000/1000;
  const dia=perCall*n;
  return { diario:`$${dia.toFixed(2)}`, mensual:`$${(dia*30).toFixed(2)}`, anual:`$${(dia*365).toFixed(2)}`, resumen:`${n} llamadas/día: $${dia.toFixed(2)}/día, $${(dia*30).toFixed(0)}/mes.` };""")

# 24. Dominio dns
M("ttl-dns-registro-cache-propagacion", "🌐", "TTL DNS y propagación",
  "Tiempo hasta propagar cambio DNS.",
  "Tiempo ~= TTL máximo upstream",
  [("ttl","TTL seg","number",None)],
  [("propagacion","Propagación típica",None),("recomendacion","Recomendación",None),("resumen","Interpretación",None)],
  ["3600","~1h"], "~1h",
  [("¿TTL bajo?","300 (5min) si planeas cambios."),
   ("¿TTL alto?","86400 (24h) reduce consultas DNS."),
   ("¿ISP cache?","Puede ignorar TTL. Flush si urge."),
   ("¿CDN?","Cambios vía API, no DNS generalmente."),
   ("¿Anycast?","Cloudflare, Route53 minimizan latencia.")],
  """  const t=Number(i.ttl)||3600;
  let prop:string;
  if (t<=300) prop='5-15 min';
  else if (t<=3600) prop='30-60 min';
  else if (t<=86400) prop='1-24 horas';
  else prop='Puede ser días';
  let rec='OK'; if (t<60) rec='Muy bajo, más consultas DNS'; else if (t>86400) rec='Demasiado alto si cambias seguido';
  return { propagacion:prop, recomendacion:rec, resumen:`TTL ${t}s: propaga en ${prop}.` };""")

# 25. Cuántas líneas código
M("lineas-codigo-proyecto-complejidad-kloc", "📝", "Complejidad proyecto (KLOC)",
  "Métrica de tamaño basada en líneas de código.",
  "Categorización KLOC + esfuerzo COCOMO",
  [("loc","Líneas código","number",None)],
  [("kloc","KLOC",None),("categoria","Categoría",None),("esfuerzoMes","Esfuerzo meses",None),("resumen","Interpretación",None)],
  ["50000","50 KLOC"], "50 KLOC",
  [("¿COCOMO?","PM = 2.4 × KLOC^1.05 (proyecto orgánico)."),
   ("¿Métrica imperfecta?","Líneas ≠ calidad. Complementa con función points."),
   ("¿Lenguaje?","Python más denso que Java."),
   ("¿Test?","Incluir o no según contexto."),
   ("¿Comentarios?","cloc los separa.")],
  """  const loc=Number(i.loc)||0; const k=loc/1000;
  let cat='Script pequeño'; if (k>=1000) cat='Masivo (kernel/navegador)'; else if (k>=100) cat='Enterprise'; else if (k>=10) cat='Aplicación mediana'; else if (k>=1) cat='App pequeña';
  const pm=2.4*Math.pow(k,1.05);
  return { kloc:`${k.toFixed(1)} KLOC`, categoria:cat, esfuerzoMes:`${pm.toFixed(1)} PM`, resumen:`${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} persona-mes.` };""")

# 26. Docker tamaño
M("imagen-docker-capas-peso-mb", "🐳", "Imagen Docker (capas/tamaño)",
  "Tamaño estimado de imagen Docker según base.",
  "Base + app + deps",
  [("base","Base","select",[("alpine","Alpine (~5 MB)"),("debian-slim","Debian slim (~70)"),("ubuntu","Ubuntu (~80)"),("distroless","Distroless (~20)")]),("deps","Deps MB","number",None)],
  [("total","Tamaño total",None),("consejo","Consejo",None),("resumen","Interpretación",None)],
  ["Alpine + 50MB","~55 MB"], "~55 MB",
  [("¿Multi-stage?","Build en una imagen, copia a slim."),
   ("¿Por qué Alpine?","musl libc, glibc compat issues a veces."),
   ("¿Distroless?","Sin shell, más seguro, menor attack surface."),
   ("¿.dockerignore?","Crítico para no copiar basura."),
   ("¿Scan?","Trivy, Snyk detectan CVEs en imagen.")],
  """  const b=String(i.base||'alpine'); const dep=Number(i.deps)||0;
  const bSize:Record<string,number>={alpine:5,'debian-slim':70,ubuntu:80,distroless:20};
  const total=(bSize[b]||50)+dep;
  let cons='OK'; if (total>500) cons='Demasiado pesada, revisá capas'; else if (total>200) cons='Considera multi-stage';
  return { total:`${total} MB`, consejo:cons, resumen:`${b} + ${dep}MB deps = ${total} MB. ${cons}.` };""")

# 27. Dispositivos domésticos consumo
M("consumo-electronica-hogar-watts-mensual", "💡", "Consumo electrónica hogar $/mes",
  "Kwh mensual y costo de dispositivos del hogar.",
  "kWh/mes = W × h/día × 30 / 1000",
  [("w","Potencia","number","W"),("hdia","Horas/día","number",None),("tarifa","Tarifa $/kWh","number",None)],
  [("kwhMes","kWh/mes",None),("costo","Costo/mes",None),("anual","Anual",None),("resumen","Interpretación",None)],
  ["100W x 8h x $0.15","2.4 kWh día, $10.8/mes"], "$10.8/mes",
  [("¿Stand-by?","Appliance apagado puede consumir 1-10W."),
   ("¿LEDs?","Reducen 80% vs incandescente."),
   ("¿Heladera?","400-800 kWh/año típica."),
   ("¿Aire?","Mayor consumo: 1000-3000W."),
   ("¿Monitor?","Apagado real vs standby ahorra.")],
  """  const w=Number(i.w)||0; const h=Number(i.hdia)||0; const t=Number(i.tarifa)||0.15;
  const k=w*h*30/1000; const c=k*t;
  return { kwhMes:`${k.toFixed(1)} kWh`, costo:`$${c.toFixed(2)}`, anual:`$${(c*12).toFixed(2)}`, resumen:`${w}W × ${h}h/día = ${k.toFixed(1)} kWh/mes ≈ $${c.toFixed(2)}.` };""")

# 28. Pixel density
M("densidad-pixeles-pantalla-ppi-retina", "📱", "PPI pantalla (densidad)",
  "Píxeles por pulgada de un display.",
  "PPI = √(w² + h²)/diag",
  [("ancho","Ancho px","number",None),("alto","Alto px","number",None),("diag","Diagonal","number","pulg")],
  [("ppi","PPI",None),("retina","¿Retina?",None),("resumen","Interpretación",None)],
  ["1920x1080, 24''","92 PPI"], "92 PPI",
  [("¿Retina?","Apple: >300 PPI a distancia de uso."),
   ("¿Legible?","Móvil 300+, escritorio 90+."),
   ("¿4K monitor 27?","163 PPI, muy fino."),
   ("¿DPR?","Dispositivos HiDPI usan 2x o 3x."),
   ("¿Escala?","OS escala UI en pantallas densas.")],
  """  const w=Number(i.ancho)||0; const h=Number(i.alto)||0; const d=Number(i.diag)||0;
  if (d===0) return { ppi:'—', retina:'—', resumen:'Diagonal no puede ser 0.' };
  const ppi=Math.sqrt(w*w+h*h)/d;
  const retina=ppi>=300?'Sí':(ppi>=200?'Cercano':'No');
  return { ppi:ppi.toFixed(1), retina, resumen:`${w}×${h} en ${d}" = ${ppi.toFixed(0)} PPI.` };""")

# 29. Carga web
M("tiempo-carga-pagina-web-metricas", "🌐", "Tiempo carga web (Core Web Vitals)",
  "Evalúa LCP/FID/CLS y promedio.",
  "Google thresholds",
  [("lcp","LCP ms","number",None),("fid","FID ms","number",None),("cls","CLS","number",None)],
  [("lcpEval","LCP",None),("fidEval","FID",None),("clsEval","CLS",None),("resumen","Interpretación",None)],
  ["2000, 80, 0.05","Bien"], "LCP Bien",
  [("¿LCP?","Largest Contentful Paint. <2.5s bien."),
   ("¿FID?","First Input Delay. <100ms bien."),
   ("¿CLS?","Cumulative Layout Shift. <0.1 bien."),
   ("¿INP?","Remplaza FID en 2024, <200ms bien."),
   ("¿Optimizar?","Image optim, preload, code split.")],
  """  const lcp=Number(i.lcp)||0; const fid=Number(i.fid)||0; const cls=Number(i.cls)||0;
  const e=(v:number,good:number,ok:number)=>v<=good?'Bien':v<=ok?'Mejorar':'Pobre';
  return { lcpEval:`${lcp}ms - ${e(lcp,2500,4000)}`, fidEval:`${fid}ms - ${e(fid,100,300)}`, clsEval:`${cls} - ${e(cls,0.1,0.25)}`, resumen:`LCP ${e(lcp,2500,4000)}, FID ${e(fid,100,300)}, CLS ${e(cls,0.1,0.25)}.` };""")

# 30. Throughput DB
M("conexiones-db-pool-max-concurrentes", "🗄️", "Pool DB conexiones max",
  "Tamaño recomendado de pool según cores y carga.",
  "Pool ≈ 2×cores + spindles",
  [("cores","Cores DB","number",None),("carga","Carga","select",[("baja","Baja"),("med","Media"),("alta","Alta")])],
  [("min","Pool min",None),("max","Pool max",None),("consejo","Consejo",None),("resumen","Interpretación",None)],
  ["8 cores, media","16"], "16",
  [("¿Fórmula PostgreSQL?","≈ cores × 2 para OLTP."),
   ("¿Saturación?","Más conexiones no = más throughput."),
   ("¿PgBouncer?","Pooler externo multiplica capacidad."),
   ("¿Timeout?","connectTimeout y queryTimeout esenciales."),
   ("¿Idle?","Cerrar conexiones ociosas libera recursos.")],
  """  const c=Number(i.cores)||1; const carga=String(i.carga||'med');
  const mult:Record<string,number>={baja:1,med:2,alta:3};
  const mx=c*(mult[carga]||2);
  const mn=Math.max(2,Math.floor(mx/4));
  return { min:mn.toString(), max:mx.toString(), consejo:'Usar PgBouncer si excede 200', resumen:`DB ${c} cores, carga ${carga}: pool ${mn}-${mx}.` };""")


def collect():
    return SPECS
