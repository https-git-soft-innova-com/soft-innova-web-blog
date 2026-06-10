#!/usr/bin/env node
/**
 * Publica vía EmDash MCP: Sobrevivir a la Recesión 2026 (Mila Vivanco)
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_URL = "https://blog.soft-innova.com/_emdash/api/mcp";
const SLUG = "sobrevivir-recesion-2026";
const MILA_BYLINE = "01KS2WK47553ZBRVGMSXFMVMPB";
const PUBLISHED_AT = "2026-05-26T14:00:00.000Z";
const FEATURED_IMAGE = {
  id: "",
  src: "https://images.unsplash.com/photo-1611974789855-9417a99a79e8?w=1200&q=80&auto=format&fit=crop",
  alt: "Empresario analizando gráficos de caída económica en recesión",
};

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
  multi("k0", [
    span("s0a", "Cuando uno revisa los datos del Banco Central de Chile del primer trimestre de 2026 con la calma que merece la economía de un país, hay un patrón que es difícil de ignorar. El PIB se contrajo "),
    span("s0b", "0,5% interanual entre enero y marzo", ["strong"]),
    span("s0c", ". La inflación se aceleró hasta el "),
    span("s0d", "4% en abril", ["strong"]),
    span("s0e", ", con el mayor salto mensual en casi cuatro años. El desempleo se mantiene en "),
    span("s0f", "8,9%", ["strong"]),
    span("s0g", " en el trimestre móvil enero-marzo. Y aunque técnicamente todavía no se cumple la definición clásica de recesión — dos trimestres consecutivos de caída del PIB — la dirección de los indicadores está clara para cualquiera que sepa leer un balance."),
  ]),
  multi("k1", [
    span("s1a", "Pero hay un número que no aparece en los titulares de los grandes medios y que debería estar enmarcado en cada oficina de gerencia comercial en este país: "),
    span("s1b", "las quiebras de empresas en Chile subieron 44% entre enero y agosto de 2025", ["strong"]),
    span("s1c", ", según cifras de la Superintendencia de Insolvencia y Reemprendimiento (Superir). Y dentro de ese universo, las liquidaciones simplificadas de micro y pequeñas empresas — la columna vertebral del empleo chileno — crecieron un "),
    span("s1d", "86,3% en los primeros cuatro meses del año", ["strong"]),
    span("s1e", ". Léelo de nuevo. No es una desaceleración. Es una sangría silenciosa."),
  ]),
  multi("k2", [
    span("s2a", "Y lo que la mayoría de los gerentes y dueños de PYMEs no termina de entender — porque nadie se los ha explicado con la honestidad necesaria — es que "),
    span("s2b", "la mayoría de esas empresas no quebró por falta de clientes. Quebró por incapacidad de cerrar los clientes que ya tenía.", ["strong"]),
    span("s2c", " Y esa diferencia, aparentemente sutil, es la que separa a las empresas que van a sobrevivir 2026 de las que no."),
  ]),
  multi("k3", [
    span("s3a", "⚡ Lo que dice el superintendente Hugo Sánchez (Superir): \"El aumento de liquidaciones refleja cierres efectivos, formales y regulados. Aunque en Chile hay "),
    span("s3b", "más de 78 mil empresas morosas", ["strong"]),
    span("s3c", ", solo un 1,3% inicia un procedimiento de liquidación.\" Es decir: por cada empresa que oficialmente cierra, hay decenas más que están técnicamente quebradas pero todavía no han firmado el certificado de defunción. La crisis es más profunda de lo que muestran las estadísticas oficiales."),
  ]),
  h2("k4", "01 // El error que cometen 9 de cada 10 PYMEs cuando llega la recesión"),
  p(
    "k5",
    "Hay un libreto repetido que se ve en cada ciclo recesivo. Cuando el directorio de una PYME chilena ve que las ventas se enfrían y los plazos de pago se alargan, la decisión instintiva — casi siempre tomada con la mejor intención del mundo — es la misma: recortemos lo que no es esencial. Y \"lo que no es esencial\", para una mente acostumbrada a operar en modo supervivencia, suele significar marketing, publicidad y todo lo que no se vea como \"operación pura\".",
  ),
  multi("k6", [
    span("s6a", "El razonamiento parece sólido: \"si las ventas están bajas, no tiene sentido gastar más en buscar clientes que no van a comprar\". Suena lógico. Y es "),
    span("s6b", "profundamente equivocado", ["strong"]),
    span("s6c", ". Porque confunde el problema. El problema no es que no haya clientes — el mercado chileno sigue moviendo más de US$10.000 millones al año solo en comercio electrónico, según la Cámara de Comercio de Santiago. El problema es que esos clientes están más asustados, más exigentes y más sensibles a la fricción que nunca. Y mientras tu competencia recorta servicio, atención y marketing — tú deberías estar haciendo exactamente lo contrario."),
  ]),
  h2("k7", "02 // La trampa neuronal: cuando el cerebro entra en modo \"miedo a elegir mal\""),
  multi("k8", [
    span("s8a", "Acá viene la parte que casi nadie explica bien y que es estructural para entender por qué las recesiones matan empresas que aparentemente tenían un buen producto. En una economía inestable, "),
    span("s8b", "el cerebro del consumidor entra en un estado de hipervigilancia financiera", ["strong"]),
    span("s8c", ". La amígdala — esa parte del cerebro que procesa el miedo y las amenazas — se activa con mucha más facilidad ante cualquier decisión de gasto."),
  ]),
  multi("k9", [
    span("s9a", "El resultado neurológico es predecible y demoledor para tu funnel de ventas: cualquier fricción que en tiempos normales sería tolerable, en tiempos de crisis se convierte en motivo de abandono inmediato. Una web que tarda en cargar. Un WhatsApp que demora dos horas en responder. Un formulario con un campo de más. Una página de pago que pide datos innecesarios. Cualquiera de esas cosas activa el miedo a elegir mal — y el cerebro toma la decisión más segura desde su perspectiva: "),
    span("s9b", "cerrar la pestaña", ["strong"]),
    span("s9c", "."),
  ]),
  multi("k10", [
    span("s10a", "Eso es el \"Laberinto Cognitivo\" del que hablan los investigadores en neuromarketing: "),
    span("s10b", "en tiempos normales el consumidor tolera la fricción porque tiene margen mental. En tiempos de recesión, ese margen no existe", ["strong"]),
    span("s10c", ". Y ahí está la oportunidad estratégica que pocos están viendo: la empresa que elimine fricciones y guíe al cliente de la mano en este momento — gana doble. Captura ahora, y captura por mucho tiempo. Porque la lealtad construida en crisis es la lealtad más sólida que existe."),
  ]),
  quote(
    "k11",
    "Cuando la economía aprieta, el cliente no necesita más opciones — necesita más guía. La empresa que entiende esa diferencia es la que va a salir más grande de 2026. — Análisis Soft-Tech · Mayo 2026",
  ),
  h2("k12", "03 // Los sectores que están sangrando más rápido"),
  p(
    "k13",
    "Los datos de la Superintendencia de Insolvencia y Reemprendimiento son una radiografía cruda de dónde está cayendo más fuerte la crisis. Si tu PYME está en uno de estos sectores, no es paranoia tu nerviosismo — es lectura adecuada del entorno:",
  ),
  multi("k14", [
    span("s14a", "Bernardita Silva, gerente de Estudios de la Cámara Nacional de Comercio (CNC), lo resumió con honestidad brutal en una entrevista a La Tercera: \"Las pymes enfrentan márgenes estrechos y mayores costos financieros y laborales. Las ventas han repuntado, pero no basta. Muchas empresas buscan reorganizarse antes de llegar a la liquidación, mostrando voluntad de continuidad, aunque la fragilidad del sector es evidente\". Léelo dos veces. "),
    span("s14b", "El problema no es solo bajada de ventas — es que cada venta perdida pesa más, porque los costos siguen subiendo aunque tu facturación baje", ["strong"]),
    span("s14c", "."),
  ]),
  multi("k15", [
    span("s15a", "⚡ El dato que nadie quiere mirar: Mientras 1,3% de las 78 mil empresas morosas inicia liquidación formal, el resto — "),
    span("s15b", "aproximadamente 77 mil PYMEs chilenas", ["strong"]),
    span("s15c", " — está operando técnicamente quebrada, postergando lo inevitable, persiguiendo cobranzas, renegociando con bancos. La verdadera crisis no es la que se ve en los titulares. Es la que se ve cuando llamas el lunes a las 9 AM y nadie contesta el teléfono."),
  ]),
  h2("k16", "04 // La pregunta correcta: \"¿estoy convirtiendo lo que ya estoy gastando?\""),
  multi("k17", [
    span("s17a", "Hagamos un ejercicio simple de matemática de PYME — el tipo de cuenta que ningún consultor te cobra pero que vale lo mismo que tres sesiones de coaching. Tomemos una PYME chilena promedio: gasta US$5.000 mensuales en publicidad digital. Eso le genera, digamos, 500 leads al mes. De esos 500 leads, en una empresa con marketing y ventas conectados, debería cerrar entre el 15% y el 20% — entre 75 y 100 ventas. "),
    span("s17b", "En una PYME con silos, equipos saturados y atención solo en horario laboral, el cierre real está entre el 3% y el 6%", ["strong"]),
    span("s17c", ". Es decir: entre 15 y 30 ventas."),
  ]),
  multi("k18", [
    span("s18a", "Mira la cifra. Estás pagando los mismos US$5.000 mensuales, pero capturando entre tres y cinco veces menos del valor que esa inversión podría generar. La pregunta correcta en recesión no es \"¿gasto más en publicidad?\" — la pregunta correcta es: "),
    span("s18b", "\"¿estoy convirtiendo lo que ya estoy gastando?\"", ["strong"]),
    span("s18c", ". Y la respuesta honesta, para 8 de cada 10 PYMEs en Chile, es no."),
  ]),
  h2("k19", "05 // Lo que Annie hace por las PYMEs que aún tienen oportunidad"),
  multi("k20", [
    span("s20a", "Acá llegamos a la parte donde el artículo deja de hablar de problemas y empieza a hablar de soluciones — porque toda esta data no sirve de nada si no se traduce en acción concreta esta semana. Annie no es un software más para que tu equipo aprenda a usar. "),
    span("s20b", "Annie es un servicio de crecimiento completo", ["strong"]),
    span("s20c", ": un equipo humano de Soft-Tech operando tu marketing y tu venta digital, con una arquitectura de agentes especializados que aprenden de tus clientes en tiempo real y un KAM dedicado que responde por los resultados."),
  ]),
  p(
    "k21",
    "En lenguaje directo: no te entregamos un dashboard para que tú te las arregles. Te entregamos un equipo que se hace cargo del crecimiento de tu PYME, con la tecnología incluida. Y en recesión, eso no es un lujo. Es supervivencia.",
  ),
  h2("k22", "06 // Lo que opera por dentro el servicio Annie"),
  p(
    "k23",
    "Detrás de cualquiera de los tres modelos comerciales hay una arquitectura técnica que es la misma — porque la diferencia entre los modelos no está en la tecnología, está en cómo te facturamos. Estos son los agentes especializados que operan en tu PYME cuando contratas el servicio:",
  ),
  multi("k24", [
    span("s24a", "Lo importante de esta arquitectura es algo que aún muchas empresas no terminan de procesar: "),
    span("s24b", "estos agentes no operan en silos como tu equipo humano tradicional", ["strong"]),
    span("s24c", ". Comparten contexto entre todos en tiempo real. Lo que aprende el Agente de Captación sobre un lead lo usa inmediatamente el Agente de Seguimiento. Lo que detecta el Agente de Cierre alimenta al Agente de Retención. La memoria del cliente fluye entre etapas sin que un humano tenga que copiar y pegar datos entre sistemas. Eso es exactamente lo que en una PYME tradicional pasa mal — y por donde se cae el revenue que después te pesa en el flujo de caja."),
  ]),
  h2("k25", "07 // Las preguntas para tu próximo directorio"),
  p(
    "k26",
    "Si después de leer todos los datos del Banco Central, de la Superir, de la CNC y de Hacienda no haces nada, te vas a quedar exactamente donde estás. Y si la curva de los últimos 12 meses se mantiene, \"donde estás\" podría ser un lugar peligroso. Pero antes de tomar cualquier decisión, hay un trabajo previo que vale la pena hacer en tu próximo directorio. Llevar estas siete preguntas y responderlas con honestidad cruda:",
  ),
  multi("k27", [
    span("s27a", "Si respondes con honestidad estas siete preguntas y descubres que tu PYME no tiene buenas respuestas, hay dos noticias. La mala: estás en el grupo del 86% de micro y pequeñas empresas chilenas que aumentaron su tasa de liquidación en 2025 según la Superir. La buena: "),
    span("s27b", "esto se resuelve más rápido de lo que crees — y se resuelve sin que tengas que poner capital propio si eliges el modelo Riesgo 0", ["strong"]),
    span("s27c", "."),
  ]),
  multi("k28", [
    span("s28a", "⚡ El argumento más honesto que podemos darte: En recesión, la ventaja competitiva no se construye gastando más. Se construye gastando mejor. Las PYMEs que sobrevivan 2026 no van a ser las que tengan más capital — van a ser las que cierren mejor lo que ya tienen en su funnel. Esa diferencia, hoy, en Chile, no es estrategia. Es supervivencia."),
  ]),
];

const CUSTOM_HTML = readFileSync(
  resolve(__dirname, "sobrevivir-recesion-custom.html"),
  "utf8",
);

const EXCERPT =
  "El PIB chileno cayó 0,5% en el Q1 de 2026. Las quiebras de empresas subieron 44% en 2025. Y la respuesta instintiva — recortar marketing — es exactamente el error que mata a las PYMEs. Por qué en recesión la solución no es más leads, sino mejores cierres.";

async function upsertArticle() {
  const payload = {
    title:
      "Sobrevivir a la Recesión 2026: tu PYME no necesita más clientes, necesita mejores cierres",
    excerpt: EXCERPT,
    featured_image: FEATURED_IMAGE,
    content: CONTENT_BLOCKS,
    custom_html: CUSTOM_HTML,
  };

  const existing = await mcpCall("content_get", { collection: "posts", id: SLUG });
  await mcpCall("content_update", {
    collection: "posts",
    id: SLUG,
    _rev: existing._rev,
    data: payload,
    bylines: [
      { bylineId: MILA_BYLINE, roleLabel: "Ingeniera de Negocios Preventa" },
    ],
    seo: {
      title: `${payload.title} | SoftInnova`,
      description: EXCERPT,
    },
    publishedAt: PUBLISHED_AT,
  });
  console.log("Updated article:", SLUG);

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
