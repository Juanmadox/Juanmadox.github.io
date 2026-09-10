from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
DATA = {
    "claramunt": {
        "name": "Claramunt Food Service",
        "headline": "Unificar pedidos HORECA sin obligar al cliente a cambiar de canal",
        "facts": ["Más de 900 productos publicados", "Pedidos por WhatsApp, email, EDI y otros sistemas", "Distribución de frutas, verduras y productos de 4ª y 5ª gama para profesionales HORECA"],
        "opportunity": "Concentrar entradas heterogéneas en un flujo controlado, resolver referencias y formatos, y derivar únicamente las excepciones al operador.",
        "scenario": ["Pedido sintético recibido por email o canal equivalente", "Identificación de cliente y líneas", "Matching de referencia y formato", "Bloqueo de ambigüedad o referencia desconocida", "Preentrada ERP simulada y trazabilidad"],
        "discovery": ["ERP y método real de integración", "Formato EDI utilizado y mensajes relevantes", "Política de referencias, formatos, sustituciones y mínimos", "Canal WhatsApp Business y consentimiento técnico", "Volumen diario, horarios de corte y gestión de urgencias"],
    },
    "disalvi": {
        "name": "Disalvi",
        "headline": "Convertir llamadas, WhatsApp y email en pedidos estructurados y verificables",
        "facts": ["Pedidos publicados por teléfono, WhatsApp y email", "Catálogo de gran amplitud; la web publica cifras de 1.800+ referencias", "1.600 clientes declarados y operativa HORECA multisegmento"],
        "opportunity": "Normalizar pedidos con redacción y formatos distintos antes de que lleguen al sistema de gestión, manteniendo revisión humana cuando la confianza no sea suficiente.",
        "scenario": ["Pedido sintético procedente de email/WhatsApp o transcripción de llamada", "Normalización de cliente, producto y cantidad", "Cruce contra maestro de referencias", "Excepción humana cuando existe duda", "Preentrada simulada, idempotencia y auditoría"],
        "discovery": ["ERP actual y vías de importación disponibles", "Cómo se transcriben hoy los pedidos telefónicos", "Reglas comerciales y equivalencias de producto", "Catálogo maestro y códigos por cliente", "Volumen, picos horarios y excepciones frecuentes"],
    },
    "cendis": {
        "name": "Cendis S.A.",
        "headline": "Controlar referencias y excepciones antes de que un pedido alcance el sistema de gestión",
        "facts": ["Más de 1.000 referencias publicadas", "Más de un millar de clientes solo en la Comunidad de Madrid", "Trazabilidad de lotes y caducidades destacada públicamente"],
        "opportunity": "Reducir grabación manual y evitar que referencias, formatos o datos dudosos entren silenciosamente; conservar una evidencia auditable de cada decisión.",
        "scenario": ["Pedido sintético de restauración o colectividades", "Validación de referencia, formato y cantidad", "Detección de dato dudoso o no reconocido", "Resolución humana registrada", "Preentrada simulada, recovery y auditoría"],
        "discovery": ["ERP/WMS y responsabilidades entre sistemas", "Dónde se asignan lotes y caducidades", "Reglas de trazabilidad que deben preservarse", "Catálogo, presentaciones y unidades logísticas", "Controles actuales de duplicados, sustituciones e incidencias"],
    },
}
def items(values):
    return "".join(f"<li>{escape(v)}</li>" for v in values)

def steps(values):
    return "".join(f'<div class="step"><b>PASO {i}</b><span>{escape(v)}</span></div>' for i, v in enumerate(values, 1))

def page(slug, d):
    name = escape(d["name"])
    headline = escape(d["headline"])
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; connect-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; frame-src 'none'; object-src 'none'; media-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<title>OrderFlow · {name} — propuesta de automatización</title>
<meta name="description" content="Demostración independiente de OrderFlow con un escenario sintético preparado para {name}.">
<link rel="stylesheet" href="/assets/orderflow-sales.css">
</head>
<body>
<header class="top"><div class="shell"><div class="brand">OrderFlow</div><small>Automatización fiable de entrada de pedidos</small></div></header>
<main>
<section class="hero"><div class="shell"><div class="eyebrow">Propuesta independiente para {name}</div><h1>{headline}</h1><p class="lead">Escenario preparado a partir de información pública. El objetivo es demostrar el patrón operativo sin afirmar acceso a sistemas, datos internos ni procesos no confirmados.</p><div class="badges"><span class="badge ok">Motor funcional validado</span><span class="badge">Datos 100% sintéticos</span><span class="badge">Sin conexión a su ERP</span><span class="badge">Sin relación contractual implícita</span></div></div></section>
<section class="section"><div class="shell grid"><article class="card"><h2>Señales públicas</h2><ul class="list">{items(d['facts'])}</ul></article><article class="card"><h2>Oportunidad</h2><p>{escape(d['opportunity'])}</p></article><article class="card"><h2>Límite de la demo</h2><p>No conocemos su ERP, reglas internas ni arquitectura. Cualquier integración real requiere discovery técnico y un piloto controlado.</p></article></div></section>
''' + f'''
<section class="section"><div class="shell"><h2 class="section-title">Flujo propuesto para el piloto</h2><div class="flow">{steps(d['scenario'])}</div></div></section>
<section class="section"><div class="shell two"><article class="panel"><h2>Qué debe demostrar el piloto</h2><ul class="list"><li><strong>0 duplicados</strong> generados por OrderFlow.</li><li><strong>100% de escrituras</strong> con correlation ID y evidencia auditable.</li><li>Excepciones dudosas bloqueadas antes de escritura.</li><li>Recovery verificable ante fallo de integración.</li><li>Medición real de tiempo por pedido y tasa de intervención humana.</li></ul></article><article class="card"><h2>Discovery necesario</h2><ul class="list">{items(d['discovery'])}</ul></article></div></section>
<section class="section" id="motor"><div class="shell"><h2 class="section-title">Motor interactivo validado</h2><p class="lead">El motor utiliza un dataset sintético neutral para demostrar estados, excepciones, aprobación humana, preentrada ERP simulada, idempotencia, recovery y auditoría. La personalización comercial permanece aislada del motor para preservar fiabilidad.</p><a class="demo-preview" href="/" target="_blank" rel="noopener noreferrer" aria-label="Abrir la demo interactiva de OrderFlow en una pestaña nueva"><img src="/manual-assets/01-dashboard-960.webp" width="960" height="1208" loading="lazy" decoding="async" alt="Captura del dashboard de OrderFlow con pedidos y estados sintéticos"></a><div class="actions"><a class="btn primary" href="/" target="_blank" rel="noopener noreferrer">Abrir demo interactiva</a></div><p class="note">Nota técnica: la captura y el motor contienen únicamente datos sintéticos. No se transmiten pedidos ni datos a {name}; las integraciones externas de esta demostración son simuladas.</p></div></section>
<section class="section"><div class="shell"><article class="card"><h2>Propuesta de siguiente paso</h2><p>Sesión técnica breve para validar el proceso actual y escoger un único flujo con impacto medible. Si el caso encaja, se ejecuta un piloto controlado en paralelo al proceso existente antes de cualquier automatización en producción.</p><div class="actions"><a class="btn primary" href="/">Probar OrderFlow</a></div></article></div></section>
</main>
<footer class="footer"><div class="shell">Demostración independiente de OrderFlow. Datos sintéticos. Las referencias a {name} se limitan a contextualizar una propuesta basada en información pública y no implican relación comercial, autorización, acceso a sistemas ni validación por parte de la empresa.</div></footer>
</body></html>'''

for slug, data in DATA.items():
    out = ROOT / "demo" / slug / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(slug, data), encoding="utf-8")
    print(slug, out.stat().st_size)
