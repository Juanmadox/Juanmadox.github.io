(() => {
  'use strict';
  const CONFIGS = {
    claramunt: {
      name: 'Claramunt Food Service', short: 'Claramunt', scenario: 'Distribución HORECA multicanal',
      evidence: 'Información pública: más de 900 productos y pedidos por WhatsApp, email, EDI y otros sistemas.',
      focus: 'Unificar entradas heterogéneas, resolver formatos/referencias y dejar solo excepciones para revisión humana.',
      boundary: 'WhatsApp y EDI se modelan como hipótesis de integración; esta demo no está conectada a esos canales ni a un ERP real.',
      clients: ['Hotel Litoral Demo S.L.','Restaurante Mediterrani Demo S.L.','Catering Garraf Demo S.L.','Bistró Mercat Demo S.L.','Colectividades Costa Demo S.L.','Hotel Marina Demo S.A.'],
      products: [
        ['ERP-TONER-305A','ERP-SYN-TOM-RAMA-6KG'],['Tóner negro compatible 305A','Tomate rama · caja 6 kg'],['Tóner negro 305A','Tomate rama · caja 6 kg'],['SUP-HP-305A','CLI-TOM-RAMA'],
        ['ERP-PAPEL-A4-80-500','ERP-SYN-PAT-IV-2500'],['ERP-PAPEL-A4-80-2500','ERP-SYN-PAT-IV-10000'],['Papel A4 80g resma 500 hojas','Patata IV gama · bolsa 2,5 kg'],['Papel A4 80g caja 5 resmas','Patata IV gama · caja 10 kg'],['Papel A4 80g','Patata IV gama'],['SUP-PAP-A4-80','CLI-PAT-IV'],
        ['ERP-CARP-ANILLA-40','ERP-SYN-MEZCLUM-500'],['Carpeta anillas 40mm','Mezclum IV gama · bolsa 500 g'],['SUP-CARP-40','CLI-MEZCLUM'],
        ['ERP-ETIQ-105X48','ERP-SYN-PEPINILLO'],['Etiquetas adhesivas 105x48','Pepinillo encurtido · formato horeca'],['Etiquetas 105x48','Pepinillo encurtido'],['SUP-ETIQ-10548','CLI-PEPINILLO'],
        ['ERP-BOLI-AZUL-50','ERP-SYN-GAZPACHO-1L'],['Bolígrafo azul caja 50','Gazpacho HPP · 1 L'],['Bolígrafo azul','Gazpacho HPP'],['SUP-BOLI-AZ50','CLI-GAZPACHO'],
        ['ERP-CINTA-EMB-66','ERP-SYN-ACEITE-5L'],['Cinta embalar 66m','Aceite de cocina · garrafa 5 L'],['Cinta de embalar 66m','Aceite de cocina · garrafa 5 L'],['SUP-CINTA-66','CLI-ACEITE-5L'],
        ['ERP-GUANTE-NITRILO-M','ERP-SYN-MANGO-CONG'],['Guante nitrilo talla M caja 100','Mango dado congelado · caja'],['Guante nitrilo talla M','Mango dado congelado'],['Guante nitrilo M','Mango dado congelado'],['SUP-GUA-NIT-M','CLI-MANGO-CONG'],
        ['ERP-NUEVO-NEW-447','ERP-SYN-NUEVO-447'],['SUP-NEW-447','CLI-NUEVO-447'],['Film estirable industrial 23µ','Producto especial de temporada sin referencia maestra']
      ]
    },    disalvi: {
      name: 'Disalvi', short: 'Disalvi', scenario: 'Normalización de pedidos multicanal',
      evidence: 'Información pública: pedidos por llamada, WhatsApp y email; 1.800 referencias y 1.600 clientes declarados.',
      focus: 'Mantener los canales que ya usa el cliente y convertir pedidos heterogéneos en una entrada estructurada y controlada.',
      boundary: 'La llamada y WhatsApp se representan como fuentes de pedido potenciales; esta demo no intercepta comunicaciones ni conoce el ERP de Disalvi.',
      clients: ['Restaurante Eixample Demo S.L.','Catering Besòs Demo S.L.','Retail Barcelona Demo S.L.','Burger Lab Demo S.L.','Colectividades Vallès Demo S.L.','Hotel Litoral Demo S.A.'],
      products: [
        ['ERP-TONER-305A','ERP-SYN-CROQ-JAM-1KG'],['Tóner negro compatible 305A','Croqueta de jamón · bolsa 1 kg'],['Tóner negro 305A','Croqueta de jamón · bolsa 1 kg'],['SUP-HP-305A','CLI-CROQ-JAM'],
        ['ERP-PAPEL-A4-80-500','ERP-SYN-PAT-FRITA-2500'],['ERP-PAPEL-A4-80-2500','ERP-SYN-PAT-FRITA-10000'],['Papel A4 80g resma 500 hojas','Patata prefrita 10x10 · bolsa 2,5 kg'],['Papel A4 80g caja 5 resmas','Patata prefrita 10x10 · caja 10 kg'],['Papel A4 80g','Patata prefrita 10x10'],['SUP-PAP-A4-80','CLI-PAT-FRITA'],
        ['ERP-CARP-ANILLA-40','ERP-SYN-BURGER-VEG'],['Carpeta anillas 40mm','Burger vegetal · caja horeca'],['SUP-CARP-40','CLI-BURGER-VEG'],
        ['ERP-ETIQ-105X48','ERP-SYN-CALAMAR-2KG'],['Etiquetas adhesivas 105x48','Calamar limpio congelado · caja 2 kg'],['Etiquetas 105x48','Calamar limpio congelado'],['SUP-ETIQ-10548','CLI-CALAMAR'],
        ['ERP-BOLI-AZUL-50','ERP-SYN-SALSA-1L'],['Bolígrafo azul caja 50','Salsa gastronómica · botella 1 L'],['Bolígrafo azul','Salsa gastronómica'],['SUP-BOLI-AZ50','CLI-SALSA-1L'],
        ['ERP-CINTA-EMB-66','ERP-SYN-BRIOCHE'],['Cinta embalar 66m','Pan brioche · caja horeca'],['Cinta de embalar 66m','Pan brioche · caja horeca'],['SUP-CINTA-66','CLI-BRIOCHE'],
        ['ERP-GUANTE-NITRILO-M','ERP-SYN-TARTA-PORC'],['Guante nitrilo talla M caja 100','Tarta porcionada · caja'],['Guante nitrilo talla M','Tarta porcionada'],['Guante nitrilo M','Tarta porcionada'],['SUP-GUA-NIT-M','CLI-TARTA'],
        ['ERP-NUEVO-NEW-447','ERP-SYN-NUEVO-447'],['SUP-NEW-447','CLI-NUEVO-447'],['Film estirable industrial 23µ','Producto 5ª gama solicitado fuera del maestro sintético']
      ]
    },    cendis: {
      name: 'Cendis S.A.', short: 'Cendis', scenario: 'Control de pedidos y excepciones para distribución refrigerada',
      evidence: 'Información pública: más de 1.000 referencias, más de 1.000 clientes en Madrid y trazabilidad de lotes/caducidades.',
      focus: 'Reducir grabación manual y bloquear referencias, formatos o datos dudosos antes de la preentrada al sistema de gestión.',
      boundary: 'La trazabilidad de lote/caducidad es un requisito de discovery para una integración real; esta versión demuestra pedido, excepción, recovery y auditoría, no trazabilidad alimentaria completa.',
      clients: ['Restaurante Centro Demo S.L.','Colegio Norte Demo S.L.','Hotel Castellana Demo S.A.','Catering Sur Demo S.L.','Cafetería Leganés Demo S.L.','Colectividades Guadalajara Demo S.L.'],
      products: [
        ['ERP-TONER-305A','ERP-SYN-MERLUZA-5KG'],['Tóner negro compatible 305A','Lomos de merluza · caja 5 kg'],['Tóner negro 305A','Lomos de merluza · caja 5 kg'],['SUP-HP-305A','CLI-MERLUZA'],
        ['ERP-PAPEL-A4-80-500','ERP-SYN-PAT-10X10-2500'],['ERP-PAPEL-A4-80-2500','ERP-SYN-PAT-10X10-10000'],['Papel A4 80g resma 500 hojas','Patata prefrita 10x10 · bolsa 2,5 kg'],['Papel A4 80g caja 5 resmas','Patata prefrita 10x10 · caja 10 kg'],['Papel A4 80g','Patata prefrita 10x10'],['SUP-PAP-A4-80','CLI-PAT-10X10'],
        ['ERP-CARP-ANILLA-40','ERP-SYN-MENESTRA-2500'],['Carpeta anillas 40mm','Menestra de verduras · bolsa 2,5 kg'],['SUP-CARP-40','CLI-MENESTRA'],
        ['ERP-ETIQ-105X48','ERP-SYN-LANGOSTINO-2KG'],['Etiquetas adhesivas 105x48','Langostino cocido · caja 2 kg'],['Etiquetas 105x48','Langostino cocido'],['SUP-ETIQ-10548','CLI-LANGOSTINO'],
        ['ERP-BOLI-AZUL-50','ERP-SYN-CROQ-1KG'],['Bolígrafo azul caja 50','Croqueta de jamón · bolsa 1 kg'],['Bolígrafo azul','Croqueta de jamón'],['SUP-BOLI-AZ50','CLI-CROQ'],
        ['ERP-CINTA-EMB-66','ERP-SYN-TARTA-QUESO'],['Cinta embalar 66m','Tarta de queso · caja'],['Cinta de embalar 66m','Tarta de queso · caja'],['SUP-CINTA-66','CLI-TARTA-QUESO'],
        ['ERP-GUANTE-NITRILO-M','ERP-SYN-BURGER-VAC'],['Guante nitrilo talla M caja 100','Hamburguesa de vacuno · caja horeca'],['Guante nitrilo talla M','Hamburguesa de vacuno'],['Guante nitrilo M','Hamburguesa de vacuno'],['SUP-GUA-NIT-M','CLI-BURGER-VAC'],
        ['ERP-NUEVO-NEW-447','ERP-SYN-NUEVO-447'],['SUP-NEW-447','CLI-NUEVO-447'],['Film estirable industrial 23µ','Preparado congelado solicitado fuera del maestro sintético']
      ]
    }
  };  const BASE_CLIENTS = ['Distribuciones Nortelia S.L.','Oficinas Vallmar S.A.','Suministros Ebro Center S.L.','Papelería Central Sintética S.L.','Grupo Logístico Sintel S.A.','Envases y Embalajes Demo S.L.'];
  const ADDRESSES = {
    claramunt: [
      ['Pol. Ind. Sintética 12, Nave 4, 50014 Zaragoza','C/ Litoral Sintético 12, 08800 Vilanova i la Geltrú'],['C/ Ejemplo Ficticio 88, 08029 Barcelona','C/ Eixample Demo 88, 08029 Barcelona'],['Avda. Sintética del Puerto 3, 46024 Valencia','Avda. Demo Delta 3, 08820 El Prat de Llobregat'],['C/ Demo 4, 28045 Madrid','C/ Mercat Demo 4, 08018 Barcelona'],['C/ Sin número, Sevilla','C/ Demo incompleta, Sitges'],['Pol. Ind. Ficticio 9, 15008 A Coruña','Pol. Ind. Demo 9, 08800 Vilanova i la Geltrú'],['C/ Sintética del Aljarafe 45, Nave B, 41020 Sevilla','C/ Sintética Garraf 45, Nave B, 08870 Sitges']
    ],
    disalvi: [
      ['Pol. Ind. Sintética 12, Nave 4, 50014 Zaragoza','C/ Indústria Demo 12, 08911 Badalona'],['C/ Ejemplo Ficticio 88, 08029 Barcelona','C/ Eixample Demo 88, 08029 Barcelona'],['Avda. Sintética del Puerto 3, 46024 Valencia','Avda. Granvia Demo 3, 08902 L’Hospitalet'],['C/ Demo 4, 28045 Madrid','C/ Demo Vallès 4, 08201 Sabadell'],['C/ Sin número, Sevilla','C/ Demo incompleta, Terrassa'],['Pol. Ind. Ficticio 9, 15008 A Coruña','Pol. Ind. Demo 9, 08302 Mataró'],['C/ Sintética del Aljarafe 45, Nave B, 41020 Sevilla','C/ Sintética Vallès 45, Nave B, 08223 Terrassa']
    ],
    cendis: [
      ['Pol. Ind. Sintética 12, Nave 4, 50014 Zaragoza','C/ Logística Demo 12, 28914 Leganés'],['C/ Ejemplo Ficticio 88, 08029 Barcelona','C/ Castellana Demo 88, 28046 Madrid'],['Avda. Sintética del Puerto 3, 46024 Valencia','Avda. Demo Henares 3, 28806 Alcalá de Henares'],['C/ Demo 4, 28045 Madrid','C/ Demo Centro 4, 28045 Madrid'],['C/ Sin número, Sevilla','C/ Demo incompleta, Getafe'],['Pol. Ind. Ficticio 9, 15008 A Coruña','Pol. Ind. Demo 9, 19004 Guadalajara'],['C/ Sintética del Aljarafe 45, Nave B, 41020 Sevilla','C/ Sintética Sur 45, Nave B, 28906 Getafe']
    ]
  };
  const requested = new URLSearchParams(location.search).get('prospect');
  if (requested === 'generic') sessionStorage.removeItem('of-prospect');
  if (requested && CONFIGS[requested]) sessionStorage.setItem('of-prospect', requested);
  const slug = CONFIGS[requested] ? requested : sessionStorage.getItem('of-prospect');
  const cfg = CONFIGS[slug];
  if (!cfg) return;  const clientPairs = BASE_CLIENTS.map((name, index) => [name, cfg.clients[index]]);
  const replacements = [...cfg.products, ...clientPairs, ...(ADDRESSES[slug] || [])]
    .sort((a, b) => b[0].length - a[0].length);
  const replaceText = value => {
    let next = value;
    for (const [from, to] of replacements) next = next.split(from).join(to);
    return next;
  };
  const transformTree = root => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const tag = node.parentElement?.tagName;
      if (!tag || ['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(tag)) continue;
      const next = replaceText(node.nodeValue || '');
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  };
  const setMeta = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  };
  const ensureMeta = () => {
    document.documentElement.dataset.prospect = slug;
    document.title = `OrderFlow · ${cfg.short} — demo personalizada`;
    setMeta('meta[name="description"]', `${cfg.scenario}. Demostración independiente con datos sintéticos preparada para ${cfg.name}.`);
    setMeta('meta[property="og:title"]', `OrderFlow · ${cfg.short} — demo personalizada`);
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex,nofollow,noarchive';
  };  const panelHtml = () => `
    <div class="of-prospect-kicker">Escenario personalizado · ${cfg.name}</div>
    <div class="of-prospect-grid">
      <div><strong>${cfg.scenario}</strong><p>${cfg.focus}</p></div>
      <div><span class="of-prospect-label">Base pública contrastada</span><p>${cfg.evidence}</p></div>
    </div>
    <div class="of-prospect-boundary"><strong>Alcance:</strong> ${cfg.boundary}</div>`;
  const ensurePanel = () => {
    const host = document.querySelector('main#contenido > div');
    if (!host) return;
    let panel = document.getElementById('of-prospect-context');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'of-prospect-context';
      panel.className = 'of-prospect-context';
      panel.setAttribute('aria-label', `Contexto de demostración para ${cfg.name}`);
      host.prepend(panel);
    }
    if (panel.dataset.slug !== slug) { panel.dataset.slug = slug; panel.innerHTML = panelHtml(); }
  };
  const ensureBanner = () => {
    const banner = [...document.querySelectorAll('div')].find(el =>
      el.children.length === 0 && (el.textContent || '').includes('Demo conceptual con datos 100% sintéticos'));
    if (banner) banner.textContent = `Demo independiente preparada para ${cfg.name}. Datos 100% sintéticos; sin conexión a sistemas reales ni relación contractual implícita.`;
  };  let applying = false;
  let scheduled = false;
  const apply = () => {
    if (applying) return;
    applying = true;
    try {
      ensureMeta();
      transformTree(document.body);
      ensurePanel();
      ensureBanner();
      for (const el of document.querySelectorAll('span')) {
        if ((el.textContent || '').trim() === 'OrderFlow Demo') el.textContent = `OrderFlow · ${cfg.short}`;
      }
    } finally { applying = false; }
  };
  const scheduleApply = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  };
  const observer = new MutationObserver(scheduleApply);
  const start = () => {
    apply();
    observer.observe(document.body, {subtree: true, childList: true, characterData: true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();