# Panel de tráfico GA4

Panel local de tráfico: sesiones por canal con drill-down a fuente/medio, filtro
de canal, selector de fecha y el pulso del día (hoy vs ayer vs mismo día de la
semana pasada). **No se deploya**: usa el service account y `scripts/` está fuera
del build de Astro.

## Abrir

    http://127.0.0.1:4399        ← siempre disponible
    npm run panel                ← lo abre en el navegador

Corre como servicio de macOS (LaunchAgent `com.hacecuentas.ga4-panel`): arranca
solo al login y si se cae, launchd lo levanta en ~1 s. No hay que arrancarlo a
mano ni dejar una terminal abierta.

    npm run panel:status         # ¿está cargado? PID y último exit
    npm run panel:restart        # reiniciarlo
    tail -f data/ga4-panel/panel.log

El plist vive en `~/Library/LaunchAgents/com.hacecuentas.ga4-panel.plist` (fuera
del repo, como los otros 7 agents de hacecuentas). Para recrearlo en otra máquina,
copiar el bloque de abajo.

## Cómo leerlo — cuatro trampas que el panel ya desactiva

**0. `sessions` NO es aditiva sobre las dimensiones — nunca sumar filas para un
total.** GA4 cuenta una sesión en cada combinación que toca. Medido: sin
dimensiones **1040** (el real) · sumando `hour` 1069 (+3%) · sumando canales
**1535 (+48%)**. El +48% es sólo del día abierto (en días cerrados: 0,0%); el +3%
de `hour` es estructural (sesiones a caballo de dos horas). Por eso cada número
sale de la query con la mínima dimensionalidad que lo responde — `credited` sin
`hour` para los totales, `series` con `hour` sólo para la curva. Si agregás una
métrica, contra-chequeala contra `dimensions=[]`.

**1. El corte va en la última hora COMPLETA.** GA4 tiene 1–2 h de lag, así que la
última hora con datos está a medio llenar: comparar sus 61 sesiones contra los 66
de una hora entera de ayer inventa una caída. Los tres días se cortan a la misma
hora completa; la hora en curso se muestra aparte, marcada y punteada.

**2. Un canal filtrado de HOY está subestimado, no caído.** Con "Unassigned"
inflado (hoy 50% de las sesiones contra 1% de ayer a la misma hora), el orgánico
marca −41% y es mentira: esas sesiones todavía no se repartieron a su canal, GA4
las reasigna en 24–48 h. Cuando el panel detecta el sesgo, muestra el Δ **sin
color y con ⚠** — pintarlo de rojo afirmaría una caída que la atribución no
respalda. El total y el propio Unassigned no se marcan: no sufren el lag.
**Para leer un canal de verdad: ayer vs mismo día de la semana pasada.**

**3. El período previo se desplaza un múltiplo de 7 días,** no el largo del rango,
así siempre caen los mismos días de la semana (un lunes contra un domingo no es
comparable). Redondea para arriba para que nunca solape: 1 día → 7, 10 → 14,
90 → 91. Los presets de N días terminan **ayer** (día cerrado); si el rango
incluye hoy, el Δ da negativo por ser parcial y el panel lo aclara.

## Cómo funciona

`server.py` (Flask) sirve `index.html` y dos endpoints. Reusa la auth de los otros
23 `scripts/ga4-*.py`: property `532962136`, service account en
`~/.config/gcp/hacecuentas-indexing.json`.

    GET /api/pulse                → curva de 24 h de cada día POR CANAL
    GET /api/report?start=&end=   → canales + fuente/medio + período previo
    ?fresh=1                      → saltea el cache de 5 min (botón "Actualizar")

El filtro de canal es de cliente: `/api/pulse` ya trae la curva de cada canal, así
que cambiar de canal no repega a la API.

## Recrear el LaunchAgent

`~/Library/LaunchAgents/com.hacecuentas.ga4-panel.plist`, después
`launchctl load ~/Library/LaunchAgents/com.hacecuentas.ga4-panel.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.hacecuentas.ga4-panel</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Library/Frameworks/Python.framework/Versions/3.13/bin/python3</string>
    <string>/Users/marrod/hacecuentas/scripts/ga4-panel/server.py</string>
    <string>4399</string>
  </array>
  <key>WorkingDirectory</key><string>/Users/marrod/hacecuentas</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>/Users/marrod/hacecuentas/data/ga4-panel/panel.log</string>
  <key>StandardErrorPath</key><string>/Users/marrod/hacecuentas/data/ga4-panel/panel.log</string>
</dict>
</plist>
```

`KeepAlive: true` a secas, **nunca `SuccessfulExit: false`**: eso último significa
"si salió bien, no lo reinicies", y un exit 0 (el puerto ocupado un instante al
reiniciar) dejaba el panel muerto hasta el próximo login. El guard de puerto del
server no se rinde: espera hasta 30 s a que se libere y, si no puede, sale con 1
para que launchd reintente. Verificado con SIGKILL (revive en 5 s) y SIGTERM
(8 s). El proceso cuelga de launchd (PPID 1), no de ninguna sesión.
