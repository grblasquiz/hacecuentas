#!/usr/bin/env python3
"""
Genera emails personalizados de outreach a medios para que VOS los envíes.

Flow:
  1. Vos provees una lista de targets (medio + editor + tema)
  2. Script genera 1 email único por target con LLM (Sonnet 4.6)
  3. Output: docs/outreach-emails-{date}.md con todos los emails listos

Cada email es:
  - Subject line click-bait (sin clickbait, just hook real)
  - Personalizado al medio (tone + sección + intereses recientes)
  - Con UN dato concreto exclusivo de hacé cuentas
  - Con UNA call-to-action clara
  - Sin ser spammy

Costo: ~$0.05 por 50 emails (Haiku 4.5).

Uso:
  python3 scripts/outreach-email-generator.py --targets targets.json
"""
import argparse, asyncio, json, os, sys
from pathlib import Path
import anthropic

ROOT = Path(__file__).resolve().parent.parent

SYSTEM = """Sos un experto en PR para sites de SEO/contenido.
Tu trabajo: redactar UN email único de outreach a un medio/editor para
pitchear Hacé Cuentas (calculadoras gratuitas) como fuente de un dato
o herramienta útil para una nota.

# Reglas

- Idioma según el target (ES-AR, ES neutro, EN, PT-BR).
- Asunto < 60 chars. NO clickbait, sí concreto.
- Cuerpo: 100-150 palabras. Más largo = no se lee.
- Estructura:
  1. Saludo personalizado (nombre del editor si está)
  2. 1 oración: por qué les escribís (referenciás algo reciente que ellos
     publicaron o tema en el que tienen autoridad)
  3. Tu pitch: 1 dato concreto exclusivo (cifra, dataset, hallazgo) que les
     puede servir para una nota
  4. CTA chica: "te puedo pasar el dato detallado por provincia / por país /
     por categoría — solo decime"
  5. Firma: Martín de Hacé Cuentas + URL

- NO digas "promociono" o "publicito" o "te dejo nuestra herramienta".
  Decí "te puede servir como fuente" o "data útil para tu nota".
- NO mandes URLs en el body más allá de hacecuentas.com en la firma.
- NO uses emojis (excepto en firma si querés).

Output: solo el email completo, formato:

```
ASUNTO: <asunto>

Hola [editor o "equipo de X"],

[cuerpo según reglas arriba]

Saludos,
Martín
hacecuentas.com
```

Sin meta-comentarios. Solo el email."""


async def gen_email(client, target, sem):
    user = (
        f"Target:\n"
        f"  Medio: {target['medio']}\n"
        f"  País/idioma: {target.get('lang','ES-AR')}\n"
        f"  Editor (si conocés): {target.get('editor','desconocido')}\n"
        f"  Sección: {target.get('seccion','general')}\n"
        f"  Tema reciente del medio: {target.get('tema_reciente','')}\n\n"
        f"Tu dato/pitch a usar:\n"
        f"  {target['pitch']}\n\n"
        f"Generá el email único."
    )
    async with sem:
        try:
            r = await client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=600,
                system=[{"type":"text","text":SYSTEM,"cache_control":{"type":"ephemeral"}}],
                messages=[{"role":"user","content":user}],
            )
            text = next((b.text for b in r.content if b.type=="text"), "")
            return target, text
        except Exception as e:
            return target, f"ERROR: {e}"


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--targets", required=True, help="JSON file con lista de targets")
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        ef = ROOT/".env"
        if ef.exists():
            for l in ef.read_text().splitlines():
                if l.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"]=l.split("=",1)[1].strip().strip('"')

    targets = json.loads(Path(args.targets).read_text())
    print(f"[outreach] generando {len(targets)} emails...", file=sys.stderr)

    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(5)
    tasks = [gen_email(client, t, sem) for t in targets]

    results = []
    for fut in asyncio.as_completed(tasks):
        results.append(await fut)

    out = ROOT/"docs"/f"outreach-emails-{__import__('time').strftime('%Y-%m-%d')}.md"
    lines = ["# Outreach emails — listos para enviar","",f"**{len(results)} emails generados**","","Copy-paste a tu email cliente. Personalizá la línea de saludo si encontrás un editor más específico.","","---",""]
    for target, text in results:
        lines.append(f"## {target['medio']} — {target.get('seccion','')}")
        lines.append("")
        if target.get("email_contacto"):
            lines.append(f"**Email**: `{target['email_contacto']}`")
        lines.append("")
        lines.append("```")
        lines.append(text)
        lines.append("```")
        lines.append("")
        lines.append("---")
        lines.append("")
    out.write_text("\n".join(lines))
    print(f"\n✓ {out}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
