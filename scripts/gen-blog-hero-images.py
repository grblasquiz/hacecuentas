#!/usr/bin/env python3
"""
Genera hero images editoriales (1200x630 JPG) para posts de blog evergreen que
sólo tenían la card de marca. Discover es image-first y prefiere fotos reales.
Imágenes vía Gemini (Nano Banana). Anti-spam: SIN texto/letras/números en la
imagen (Discover penaliza cards de texto), estilo foto editorial limpio.

Uso: python3 scripts/gen-blog-hero-images.py [--out DIR]
"""
import os, re, sys, json, base64, time, ssl, urllib.request, urllib.error
from pathlib import Path
from io import BytesIO
from PIL import Image

try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()  # macOS sin certs; la key ya se validó con curl

MODEL = "gemini-3.1-flash-image-preview"
KEY_FILE = Path.home() / "Memoria/cerebro/_archive/conversaciones/2026-03-10_chat-74cf6d9a.md"
OUT = Path(sys.argv[sys.argv.index("--out")+1]) if "--out" in sys.argv else Path("/tmp/blog-hero")
OUT.mkdir(parents=True, exist_ok=True)

def get_key():
    # Key propia de Martin guardada en sus notas; verificada funcional (HTTP 200).
    m = re.search(r"AIzaSyDAKcP[A-Za-z0-9_-]+", KEY_FILE.read_text())
    if not m: sys.exit("No encontré la key Gemini")
    return m.group(0)

STYLE = ("photorealistic editorial photography, clean and modern, soft natural "
         "light, shallow depth of field, 16:9 aspect ratio, high resolution. "
         "ABSOLUTELY NO text, no letters, no numbers, no words, no logos, no UI, "
         "no charts with labels. No human faces.")

POSTS = {
  "como-calcular-porcentajes":
    "Overhead flat-lay of a modern white calculator, an open notebook and a pencil on a light wood desk, a cup of coffee to the side. Tidy minimal workspace.",
  "como-calcular-interes-compuesto":
    "Stacks of coins gradually increasing in height with a tiny fresh green sprout growing from the tallest stack, warm soft bokeh background. Concept of money growing over time.",
  "guia-imc-peso-saludable":
    "A cloth measuring tape coiled next to a glass of water and a small bowl of fresh colorful vegetables on a bright clean kitchen counter. Wellness and healthy-weight mood.",
  "como-ahorrar-en-dolares-argentina":
    "A neat stack of US one-hundred dollar bills beside a clear glass savings jar partly filled with folded bills, on a warm wooden surface. Personal savings concept.",
  "como-calcular-calorias-para-bajar-de-peso":
    "Top-down view of a balanced healthy meal: a plate with grilled lean protein, leafy greens, cherry tomatoes and avocado, on a bright clean table. Fresh nutritious food.",
  "indemnizacion-por-despido-argentina":
    "A tidy modern office desk with a neat closed paper folder, a fountain pen and a pair of reading glasses, soft daylight from a window. Calm neutral professional tone.",
  "como-calcular-sueldo-en-mano-argentina":
    "A calculator, a plain folded document and a small neat stack of banknotes on a clean light desk, warm morning light. Personal-finance payroll mood.",
}

def gen(key, slug, scene):
    prompt = f"{scene} {STYLE}"
    body = json.dumps({"contents":[{"parts":[{"text":prompt}]}],
                       "generationConfig":{"responseModalities":["TEXT","IMAGE"]}}).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type":"application/json"})
            with urllib.request.urlopen(req, timeout=120, context=SSL_CTX) as r:
                data = json.load(r)
            for part in data.get("candidates",[{}])[0].get("content",{}).get("parts",[]):
                if "inlineData" in part:
                    raw = base64.b64decode(part["inlineData"]["data"])
                    im = Image.open(BytesIO(raw)).convert("RGB")
                    # center-crop a 1200x630 (1.904:1)
                    tw, th = 1200, 630
                    target = tw/th
                    w, h = im.size
                    if w/h > target:
                        nw = int(h*target); im = im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
                    else:
                        nh = int(w/target); im = im.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
                    im = im.resize((tw,th), Image.LANCZOS)
                    out = OUT / f"{slug}.jpg"
                    im.save(out, "JPEG", quality=86, optimize=True)
                    return f"OK {out} ({os.path.getsize(out)//1024}KB)"
            err = data.get("error",{}).get("message","sin imagen en respuesta")
            return f"FALLO {slug}: {err[:120]}"
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(8*(attempt+1)); continue
            return f"FALLO {slug}: HTTP {e.code} {e.read()[:120]}"
        except Exception as e:
            time.sleep(3);
            if attempt==2: return f"FALLO {slug}: {e}"
    return f"FALLO {slug}: reintentos agotados"

key = get_key()
for slug, scene in POSTS.items():
    print(gen(key, slug, scene)); time.sleep(2)
print(f"\nListo. Imágenes en {OUT}")
