#!/usr/bin/env node
/**
 * EmDash MCP batch: Magnifica Humanitas article + CTA updates
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_URL = "https://blog.soft-innova.com/_emdash/api/mcp";

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

const CONTENT_BLOCKS = [
  {
    _type: "block",
    style: "normal",
    _key: "k0",
    children: [
      {
        _type: "span",
        _key: "s0",
        text: "El 25 de mayo de 2026, el Santo Padre León XIV publicó Magnifica Humanitas, la primera encíclica pontificia dedicada íntegramente a la inteligencia artificial. No es un documento técnico. No es una condena. No es una bendición incondicional. Es algo más raro y más valioso: un acto de discernimiento.",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k1",
    children: [
      {
        _type: "span",
        _key: "s1a",
        text: "Lo leí completo en dos sentadas. Y cuando terminé, tuve la sensación extraña de que el Papa había escrito, sin saberlo, el mejor diagnóstico empresarial sobre transformación digital que he leído en años. No porque hable de métricas ni de ROI — sino porque ",
      },
      {
        _type: "span",
        _key: "s1b",
        text: "habla de lo que está debajo de todo eso: para qué, para quién y con qué criterio.",
        marks: ["strong"],
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k2",
    children: [
      {
        _type: "span",
        _key: "s2",
        text: "I · La metáfora de Babel — y por qué nos debería preocupar",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k3",
    children: [
      {
        _type: "span",
        _key: "s3",
        text: "León XIV abre con la Torre de Babel. No como decoración bíblica — como diagnóstico preciso. Babel no fracasó porque fuera técnicamente imposible. Fracasó porque el proyecto tenía como norte la acumulación de poder, no el bien común. El lenguaje se fragmentó porque el propósito se había fragmentado antes.",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k4",
    children: [
      {
        _type: "span",
        _key: "s4a",
        text: "La encíclica llama a esto el ",
      },
      {
        _type: "span",
        _key: "s4b",
        text: "'paradigma tecnocrático':",
        marks: ["strong"],
      },
      {
        _type: "span",
        _key: "s4c",
        text: " la tendencia a adoptar tecnología porque existe, porque la competencia la tiene, porque el mercado la exige — sin preguntarse si resuelve un problema humano real o si simplemente eficientiza una lógica que tal vez debería cuestionarse primero.",
      },
    ],
  },
  {
    _type: "block",
    style: "blockquote",
    _key: "k5",
    children: [
      {
        _type: "span",
        _key: "s5",
        text: "'La IA no es buena ni mala en sí misma. Es un espejo. Amplifica lo que somos. Si somos Babel, construiremos Babel más rápido. Si somos Jerusalén, la reconstruiremos más humanamente.' — León XIV · Magnifica Humanitas · 2026",
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k6",
    children: [
      {
        _type: "span",
        _key: "s6",
        text: "II · Nehemías y la reconstrucción — el modelo que proponemos",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k7",
    children: [
      {
        _type: "span",
        _key: "s7",
        text: "Frente a Babel, León XIV propone a Nehemías. El constructor que regresó a Jerusalén destruida y la reconstruyó piedra a piedra, consultando a cada familia, asignando a cada persona la reconstrucción del muro frente a su propia casa. No hay centralización de poder. No hay acumulación de control. Hay subsidiariedad, participación y propósito compartido.",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k8",
    children: [
      {
        _type: "span",
        _key: "s8a",
        text: "Ese es, exactamente, el modelo que intentamos aplicar en Soft-Tech cuando implementamos IA en una empresa. No llegamos con una solución prefabricada. Llegamos a entender qué muro específico necesita reconstruir cada equipo — y les damos las herramientas para que ",
      },
      {
        _type: "span",
        _key: "s8b",
        text: "sean ellos quienes lo construyan, con su criterio, frente a su casa.",
        marks: ["strong"],
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k9",
    children: [
      {
        _type: "span",
        _key: "s9",
        text: "III · El paradigma tecnocrático en números — lo que el mercado no quiere ver",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k10",
    children: [
      {
        _type: "span",
        _key: "s10",
        text: "Los datos que manejamos en Soft-Tech después de cuatro años de implementaciones en LATAM son coherentes con el diagnóstico de la encíclica. El 68% de las empresas que hemos auditado adoptó IA primariamente por presión de mercado o de directorio, no por haber identificado un problema humano específico que resolver.",
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k11",
    children: [
      {
        _type: "span",
        _key: "s11",
        text: "IV · El gap más peligroso — saber usar sin saber pensar",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k12",
    children: [
      {
        _type: "span",
        _key: "s12",
        text: "León XIV dedica un capítulo completo a lo que llama 'la amenaza de la heteronomía cognitiva': el riesgo de que los seres humanos deleguen no solo las tareas, sino el pensamiento. Que la eficiencia del sistema lleve a sus usuarios a dejar de cuestionar los resultados que el sistema produce.",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k13",
    children: [
      {
        _type: "span",
        _key: "s13a",
        text: "En términos empresariales concretos: el mayor riesgo de la IA no es que reemplace personas — es que ",
      },
      {
        _type: "span",
        _key: "s13b",
        text: "generemos personas que sepan usar herramientas sin saber pensar.",
        marks: ["strong"],
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k14",
    children: [
      {
        _type: "span",
        _key: "s14",
        text: "V · Siete preguntas antes de su próxima implementación de IA",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k15",
    children: [
      {
        _type: "span",
        _key: "s15",
        text: "León XIV cierra con criterios concretos. Soft-Tech, desde su experiencia comercial, ofrece los suyos. Coinciden notablemente. No como una checklist a tildar, sino como un examen de conciencia empresarial.",
      },
    ],
  },
  {
    _type: "block",
    style: "h2",
    _key: "k16",
    children: [
      {
        _type: "span",
        _key: "s16",
        text: "VI · La pregunta que no responde la encíclica — y por qué eso es bueno",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k17",
    children: [
      {
        _type: "span",
        _key: "s17",
        text: "León XIV no nos dice qué tecnología comprar. Lo que hace es algo más radical: nos devuelve la responsabilidad de pensar. Esa es también nuestra apuesta en Soft-Tech. No queremos ser un proveedor más que le venda IA. Queremos ser un socio que lo ayude a hacer la transformación digital sin perder la dirección. Que cuando termine la implementación, su equipo sepa más, no menos. Que sus colaboradores tengan más dignidad, no menos.",
      },
    ],
  },
  {
    _type: "block",
    style: "normal",
    _key: "k18",
    children: [
      {
        _type: "span",
        _key: "s18",
        text: "León XIV cierra su encíclica con una invitación que también nosotros queremos hacer nuestra: 'No bendigamos entusiasmos ingenuos ni alimentemos miedos estériles. Más bien, indiquemos criterios de discernimiento y traduzcámoslos en prácticas.' Eso es exactamente lo que intentamos hacer cada día en Soft-Tech.",
      },
    ],
  },
];

const CUSTOM_HTML = readFileSync(
  resolve(__dirname, "magnifica-humanitas-custom.html"),
  "utf8",
);

const CTA_MAP = {
  "muerte-clic-tradicional":
    "https://auditoria-web.soft-innova.com?tipo=aeo&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "laberinto-cognitivo-ecommerce":
    "https://auditoria-web.soft-innova.com?tipo=marketing&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "fin-marketing-creencias":
    "https://auditoria-web.soft-innova.com?tipo=marketing&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "fragilidad-del-gigante-wordpress":
    "https://auditoria-web.soft-innova.com?tipo=seguridad&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "fabricas-2040-venta-autonoma":
    "https://auditoria-web.soft-innova.com?tipo=operaciones&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "pymes-crecer-annie-ai":
    "https://auditoria-web.soft-innova.com?tipo=comercial&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "soberania-digital":
    "https://auditoria-web.soft-innova.com?tipo=seguridad&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
  "hubspot-ia-chile-2026":
    "https://auditoria-web.soft-innova.com?tipo=marketing&utm_source=blog&utm_medium=cta&utm_campaign=auditoria",
};

const TAG_SLUGS = [
  "direccion",
  "etica-ia",
  "transformacion-digital",
  "proposito",
];

async function ensureIsabelByline() {
  const token = loadToken();
  const listRes = await fetch(
    "https://blog.soft-innova.com/_emdash/api/admin/bylines?limit=50",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (listRes.ok) {
    const list = await listRes.json();
    const items = list.data?.items ?? list.items ?? [];
    const found = items.find((b) => b.slug === "isabel-martinez");
    if (found) {
      console.log("Byline exists:", found.id);
      return found.id;
    }
  }

  const createRes = await fetch(
    "https://blog.soft-innova.com/_emdash/api/admin/bylines",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: "isabel-martinez",
        displayName: "Isabel Martínez",
        bio: "CEO · Soft-Tech. Humanizamos la tecnología para empresas en LATAM.",
        isGuest: false,
      }),
    },
  );
  const created = await createRes.json();
  if (!createRes.ok) {
    console.warn("Byline create via admin API:", createRes.status, created);
    return null;
  }
  const id = created.data?.id ?? created.id;
  console.log("Created byline:", id);
  return id;
}

async function ensureTags() {
  const terms = await mcpCall("taxonomy_list_terms", { taxonomy: "tag" });
  const existing = new Set((terms.items || []).map((t) => t.slug));
  const needed = [
    ["direccion", "Dirección"],
    ["etica-ia", "Ética & IA"],
    ["transformacion-digital", "Transformación Digital"],
    ["proposito", "Propósito"],
  ];
  for (const [slug, label] of needed) {
    if (!existing.has(slug)) {
      await mcpCall("taxonomy_create_term", {
        taxonomy: "tag",
        slug,
        label,
      });
      console.log("Created tag:", slug);
    }
  }
}

function replaceCtaHref(html, newUrl) {
  return html.replace(
    /href="https:\/\/soft-innova\.com\/#contacto"/g,
    `href="${newUrl}"`,
  );
}

async function updateArticleCtas() {
  for (const [slug, url] of Object.entries(CTA_MAP)) {
    const got = await mcpCall("content_get", { collection: "posts", id: slug });
    const rev = got._rev;
    const html = got.item?.data?.custom_html;
    if (!html) {
      console.warn("No custom_html for", slug);
      continue;
    }
    const updated = replaceCtaHref(html, url);
    if (updated === html) {
      console.warn("No CTA href replaced for", slug);
    }
    await mcpCall("content_update", {
      collection: "posts",
      id: slug,
      _rev: rev,
      data: { custom_html: updated },
    });
    await mcpCall("content_publish", { collection: "posts", id: slug });
    console.log("Updated CTA:", slug);
  }
}

async function main() {
  const step = process.argv[2] || "all";

  if (step === "tags" || step === "all") await ensureTags();

  if (step === "create" || step === "all") {
    try {
      const existing = await mcpCall("content_get", {
        collection: "posts",
        id: "magnifica-humanitas-ia-etica",
      });
      console.log("Article exists:", existing.item?.id);
    } catch {
      const created = await mcpCall("content_create", {
        collection: "posts",
        slug: "magnifica-humanitas-ia-etica",
        status: "draft",
        data: {
          title:
            "Magnifica Humanitas: La encíclica que cambia la conversación sobre la IA",
          excerpt:
            "León XIV escribió la primera encíclica sobre IA. Habla de Babel, de Nehemías, de dignidad humana. Por qué su mensaje y el de Soft-Tech convergen en una sola idea: humanizar la tecnología.",
          featured_image: {
            id: "",
            src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200",
          },
          content: CONTENT_BLOCKS,
          custom_html: CUSTOM_HTML,
        },
      });
      const rev = created._rev || created.item?._rev;
      await mcpCall("content_update", {
        collection: "posts",
        id: "magnifica-humanitas-ia-etica",
        _rev: rev,
        tags: TAG_SLUGS,
        publishedAt: "2026-06-01T09:00:00.000Z",
      });
      console.log("Created article");
    }
  }

  if (step === "byline" || step === "all") {
    const bylineId = await ensureIsabelByline();
    if (bylineId) {
      const got = await mcpCall("content_get", {
        collection: "posts",
        id: "magnifica-humanitas-ia-etica",
      });
      await mcpCall("content_update", {
        collection: "posts",
        id: "magnifica-humanitas-ia-etica",
        _rev: got._rev,
        bylines: [{ bylineId, roleLabel: "CEO · Soft-Tech" }],
      });
      console.log("Assigned byline to article");
    }
  }

  if (step === "update" || step === "all") {
    const got = await mcpCall("content_get", {
      collection: "posts",
      id: "magnifica-humanitas-ia-etica",
    });
    const updateArgs = {
      collection: "posts",
      id: "magnifica-humanitas-ia-etica",
      _rev: got._rev,
      data: {
        content: CONTENT_BLOCKS,
        custom_html: CUSTOM_HTML,
      },
      tags: TAG_SLUGS,
      publishedAt: "2026-06-01T09:00:00.000Z",
    };
    await mcpCall("content_update", updateArgs);
    console.log("Updated content + custom_html");
  }

  if (step === "publish" || step === "all") {
    await mcpCall("content_publish", {
      collection: "posts",
      id: "magnifica-humanitas-ia-etica",
    });
    console.log("Published magnifica-humanitas-ia-etica");
  }

  if (step === "ctas" || step === "all") await updateArticleCtas();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
