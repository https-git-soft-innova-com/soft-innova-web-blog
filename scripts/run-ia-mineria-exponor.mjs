#!/usr/bin/env node
/**
 * Publica vía EmDash MCP: IA en ventas para minería · Exponor 2026
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_URL = "https://blog.soft-innova.com/_emdash/api/mcp";
const SLUG = "ia-ventas-mineria-exponor-2026";
const MILA_BYLINE = "01KS2WK47553ZBRVGMSXFMVMPB";
const PUBLISHED_AT = "2026-06-02T14:00:00.000Z";

const TAGS = [
  "exponor-2026",
  "mineria-chile",
  "hto-chile",
  "annie-ai",
  "transformacion-digital",
  "pyme-industrial",
  "ia-en-ventas",
  "antofagasta",
  "aia",
  "comercial",
];

const FEATURED_IMAGE = {
  id: "exponor-chile-2026-featured.png",
  meta: { storageKey: "exponor-chile-2026-featured.png" },
  provider: "local",
  alt: "Vista aérea de Exponor Chile 2026 en Antofagasta",
};

const EXCERPT =
  "Exponor 2026 reunirá más de 1.300 expositores y US$1.000 millones en negocios. El caso HTO Chile + Soft-innova muestra cómo Annie-AI convierte visitas de feria en cotizaciones reales antes de que el lead se enfríe.";

function loadToken() {
  const mcp = JSON.parse(
    readFileSync(resolve(process.env.HOME, ".cursor/mcp.json"), "utf8"),
  );
  return mcp.mcpServers["emdash-blog"].headers.Authorization.split(" ")[1];
}

async function mcpCall(name, args) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${loadToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const text = await res.text();
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = JSON.parse(line.slice(6));
    if (payload.error) throw new Error(JSON.stringify(payload.error));
    const content = payload.result?.content;
    if (Array.isArray(content) && content[0]?.text) {
      return JSON.parse(content[0].text);
    }
    return payload.result;
  }
  throw new Error(`No MCP data: ${text.slice(0, 400)}`);
}

function span(key, text, marks) {
  const s = { _type: "span", _key: key, text };
  if (marks) s.marks = marks;
  return s;
}

function block(style, key, children) {
  return { _type: "block", style, _key: key, children };
}

function p(key, text, marks) {
  return block("normal", key, [span(`s${key}`, text, marks)]);
}

function h2(key, text) {
  return block("h2", key, [span(`s${key}`, text)]);
}

function quote(key, text) {
  return block("blockquote", key, [span(`s${key}`, text)]);
}

function multi(key, parts) {
  return block("normal", key, parts);
}

const CONTENT_BLOCKS = [
  p(
    "k0",
    "Hay una escena que se va a repetir miles de veces entre el 8 y el 11 de junio en el recinto ferial de Antofagasta. Un comprador de una gran minera llega al stand de un proveedor industrial — uno entre los más de 1.300 expositores de 36 países confirmados para Exponor 2026 — y deja sus datos. Una semana después, sigue esperando una cotización. Dos semanas después, ya compró a otro proveedor. Y el stand que pagó miles de dólares por estar en la feria nunca supo que esa oportunidad existió. Esa es la trampa silenciosa de las ferias mineras: el problema no es la falta de leads — es la incapacidad de convertirlos antes de que se enfríen.",
  ),
  multi("k1", [
    span("s1a", "Exponor 2026 será, según los datos confirmados por la Asociación de Industriales de Antofagasta (AIA), "),
    span("s1b", "la edición más grande de la historia de esta feria", ["strong"]),
    span("s1c", ". Más de 1.300 empresas, 36 países, 18 pabellones internacionales, sobre 45 mil visitantes especializados proyectados y negocios estimados en US$1.000 millones."),
  ]),
  multi("k2", [
    span("s2a", "Y mientras la mayoría del ecosistema minero conversa sobre robótica y automatización, hay una conversación que casi nadie está teniendo: "),
    span("s2b", "cómo la inteligencia artificial está transformando la venta industrial", ["strong"]),
    span("s2c", ". Ese es el ángulo que HTO Chile, en alianza con Soft-innova, ya está trabajando rumbo a la feria."),
  ]),
  multi("k3", [
    span("s3", "⚡ Contexto importante: La Región de Antofagasta lidera las inversiones mineras de Chile hasta el año 2033 según Cochilco. Cada lead que se pierda por no responder a tiempo no es solo una cotización menos — es muchas veces el primer eslabón de una cuenta corporativa de varios años."),
  ]),
  h2("k4", "01 // La industria minera cambió. La forma de venderle, todavía no."),
  p(
    "k5",
    "Durante décadas, la venta industrial a la minería operó bajo un modelo predecible: catálogo, ficha técnica, visita comercial, cotización por correo, seguimiento humano. Hoy, esa velocidad cambió. Los compradores mineros operan con turnos 24/7 y paradas de planta que cuestan cientos de miles de dólares por hora. Cuando necesitan un componente hidráulico, no pueden esperar tres días por una cotización.",
  ),
  multi("k6", [
    span("s6a", "La diferencia entre los proveedores que sobreviven y los que crecen este año no va a estar en el producto ni en el precio. Va a estar en la "),
    span("s6b", "capacidad de respuesta", ["strong"]),
    span("s6c", ". Quién contesta primero. Quién cotiza primero. Y ahí, donde antes el cuello de botella era humano, la inteligencia artificial bien diseñada cambia las reglas."),
  ]),
  quote(
    "k7",
    "En minería, la urgencia y la precisión pesan tanto como el precio. Una cotización entregada en dos horas vale más que una entregada en dos días — aunque sea por un producto idéntico. — Lectura del mercado minero · Soft-Tech 2026",
  ),
  h2("k8", "02 // HTO Chile: una pyme industrial con valor real"),
  p(
    "k9",
    "El caso de HTO Chile rompe con el prejuicio de que las pymes industriales llegan tarde a la digitalización. Esta es una empresa que ya tiene los atributos que muchas otras todavía están intentando construir — y por eso su proceso con Soft-innova es más una optimización estratégica que una reconstrucción.",
  ),
  p(
    "k10",
    "El desafío para HTO Chile no era crear valor desde cero, sino organizar mejor el valor que ya existía para que llegara a más clientes. HTO llega en modo ofensivo: tiene una propuesta de valor sólida y quiere amplificarla con tecnología. Esa es la postura correcta para entrar a una feria como Exponor.",
  ),
  h2("k11", "03 // El número que nadie pone en su presentación de Exponor"),
  p(
    "k12",
    "Una empresa expositora promedio en Exponor recibe entre 200 y 500 contactos calificados en cuatro días. La pregunta incómoda: ¿cuántos de esos contactos se transforman en cotizaciones formales dentro de las primeras 72 horas posteriores a la feria?",
  ),
  multi("k13", [
    span("s13a", "En la experiencia de proveedores industriales chilenos, ese porcentaje oscila entre 15% y 25%. El resto se enfría. "),
    span("s13b", "Cada lead perdido cuesta lo mismo que un lead capturado", ["strong"]),
    span("s13c", " — porque ambos costaron el mismo precio en stand, viajes, viáticos y horas de equipo comercial."),
  ]),
  multi("k14", [
    span("s14a", "Una empresa que captura el 60% de sus leads de Exponor — en lugar del 20% del promedio — multiplica su retorno sobre la inversión en feria por tres, sin gastar un peso adicional en presencia física. "),
    span("s14b", "La diferencia no está en el stand. Está en lo que pasa después del intercambio de tarjetas", ["strong"]),
    span("s14c", "."),
  ]),
  h2("k15", "04 // El plan que están ejecutando HTO Chile + Soft-innova"),
  p(
    "k16",
    "El proyecto acordado entre las dos empresas no es un \"vamos a probar la IA a ver qué pasa\". Es una ruta estructurada con fases concretas, entregables medibles y objetivos comerciales claros. La digitalización se construye en etapas, no en saltos.",
  ),
  multi("k17", [
    span("s17", "⚡ El argumento periodístico honesto: Soft-innova no le vendió a HTO un milagro digital. Le vendió una hoja de ruta con fases medibles. Esa es la diferencia entre un proyecto que funciona y uno que solo se presenta bien en una propuesta comercial."),
  ]),
  h2("k18", "05 // Annie-AI como agente de ventas en un negocio industrial"),
  multi("k19", [
    span("s19a", "Annie-AI no es un chatbot. En un contexto industrial como el de HTO Chile, esa diferencia es estructural. "),
    span("s19b", "Annie-AI es una arquitectura agéntica", ["strong"]),
    span("s19c", " que aprende de la base de conocimiento técnico de la empresa, clasifica consultas según urgencia y deriva al equipo humano lo que requiere criterio técnico complejo."),
  ]),
  p(
    "k20",
    "En el rubro de mangueras hidráulicas para minería, la consulta típica no es \"¿tienen mangueras?\". Es una especificación técnica con presión, temperatura y plazo de entrega en faena — exactamente donde un agente con contexto técnico bien cargado vale lo que pesa.",
  ),
  multi("k21", [
    span("s21a", "Estos agentes no operan en silos. Comparten contexto en tiempo real. "),
    span("s21b", "La memoria del cliente fluye entre etapas sin que un humano tenga que copiar y pegar datos entre sistemas", ["strong"]),
    span("s21c", ". Eso es lo que cambia la matemática del cierre de leads en una feria minera."),
  ]),
  h2("k22", "06 // El antes y el después en una pyme industrial"),
  h2("k23", "07 // Qué puede aprender otra pyme industrial de este caso"),
  p(
    "k24",
    "El caso HTO Chile no es excepcional por las herramientas que se están usando. Es excepcional por la lógica con la que se están aplicando. Y esa lógica es replicable para cualquier pyme industrial que esté pensando en cómo capitalizar mejor su presencia en ferias del sector.",
  ),
  h2("k25", "08 // La pregunta para tu próximo directorio"),
  p(
    "k26",
    "Si tu empresa vende a la industria minera, energética o industrial pesada, hay una pregunta que vale la pena llevar al próximo comité directivo — antes de gastar más en stands, viajes y catálogos impresos.",
  ),
  quote(
    "k27",
    "\"¿Cuántos de los leads que generamos en nuestra última feria se convirtieron en cotizaciones formales en menos de 72 horas? ¿Lo sabemos con exactitud — o solo creemos saberlo?\" — La pregunta que define el ROI real de tu próxima feria",
  ),
  multi("k28", [
    span("s28a", "La diferencia entre HTO Chile y la mayoría de los proveedores industriales no es el producto — es "),
    span("s28b", "haber decidido construir la infraestructura comercial antes de la feria, no después", ["strong"]),
    span("s28c", ". Y todavía hay tiempo de hacerlo bien para Exponor 2026."),
  ]),
];

const CUSTOM_HTML = readFileSync(
  resolve(__dirname, "ia-mineria-exponor-custom.html"),
  "utf8",
);

const TAG_LABELS = [
  ["exponor-2026", "EXPONOR 2026"],
  ["mineria-chile", "MINERÍA CHILE"],
  ["hto-chile", "HTO CHILE"],
  ["annie-ai", "Annie-AI"],
  ["transformacion-digital", "Transformación Digital"],
  ["pyme-industrial", "PYME Industrial"],
  ["ia-en-ventas", "IA en Ventas"],
  ["antofagasta", "Antofagasta"],
  ["aia", "AIA"],
  ["comercial", "Comercial"],
];

async function ensureTags() {
  const terms = await mcpCall("taxonomy_list_terms", { taxonomy: "tag" });
  const existing = new Set((terms.items || []).map((t) => t.slug));
  for (const [slug, label] of TAG_LABELS) {
    if (existing.has(slug)) continue;
    try {
      await mcpCall("taxonomy_create_term", { taxonomy: "tag", slug, label });
      console.log("Created tag:", slug);
    } catch (e) {
      console.warn("Tag skipped:", slug, String(e).slice(0, 120));
    }
  }
}

async function upsertArticle() {
  await ensureTags();

  const title =
    "IA en ventas para minería: cómo convertir una visita en una cotización real";

  const payload = {
    title,
    excerpt: EXCERPT,
    featured_image: FEATURED_IMAGE,
    content: CONTENT_BLOCKS,
    custom_html: CUSTOM_HTML,
  };

  let rev;
  try {
    const existing = await mcpCall("content_get", { collection: "posts", id: SLUG });
    rev = existing._rev;
    console.log("Article exists, updating:", SLUG);
  } catch {
    const created = await mcpCall("content_create", {
      collection: "posts",
      slug: SLUG,
      status: "draft",
      data: payload,
    });
    rev = created._rev;
    console.log("Created draft:", SLUG);
  }

  await mcpCall("content_update", {
    collection: "posts",
    id: SLUG,
    _rev: rev,
    data: payload,
    tags: TAGS,
    bylines: [{ bylineId: MILA_BYLINE, roleLabel: "Ingeniera PreVenta" }],
    seo: {
      title: `${title} | SoftInnova`,
      description: EXCERPT,
    },
    publishedAt: PUBLISHED_AT,
  });

  await mcpCall("content_publish", {
    collection: "posts",
    id: SLUG,
    publishedAt: PUBLISHED_AT,
  });

  console.log("Published:", SLUG);
  console.log("URL: https://blog.soft-innova.com/posts/" + SLUG);
}

upsertArticle().catch((e) => {
  console.error(e);
  process.exit(1);
});
