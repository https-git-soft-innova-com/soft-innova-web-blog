import fs from 'node:fs';
import { execSync } from 'node:child_process';
import https from 'node:https';

const TOKEN = process.env.EMDASH_TOKEN;
const BYLINE_ID = '01KS2WK47553ZBRVGMSXFMVMPB';
const PYTHON = 'python3';
const SCRIPT = new URL('./import-article.py', import.meta.url).pathname;

const ARTICLES = [
  {
    file: '/Users/felipeahumadaaraya/Downloads/05-pymes-crecer-annie-ai.html',
    slug: 'pymes-crecer-annie-ai',
    publishedAt: '2026-05-01T16:00:00.000Z',
    seoDesc:
      'Las PYMES que crecen con Annie-AI automatizan ventas 24/7. Descubra cómo escalar sin ampliar equipo y pida una demo con SoftInnova.',
  },
  {
    file: '/Users/felipeahumadaaraya/Downloads/04-fin-marketing-creencias.html',
    slug: 'fin-marketing-creencias',
    publishedAt: '2026-04-24T16:00:00.000Z',
    seoDesc:
      'El marketing de creencias ya no convence: los datos deciden. Conozca el nuevo playbook comercial y converse con SoftInnova sobre IA aplicada.',
  },
  {
    file: '/Users/felipeahumadaaraya/Downloads/03-laberinto-cognitivo-ecommerce.html',
    slug: 'laberinto-cognitivo-ecommerce',
    publishedAt: '2026-04-17T16:00:00.000Z',
    seoDesc:
      'Reduzca la fricción cognitiva en su e-commerce y convierta más visitas en ventas. Lea el análisis y solicite una estrategia con SoftInnova.',
  },
  {
    file: '/Users/felipeahumadaaraya/Downloads/02-fabricas-2040-venta-autonoma.html',
    slug: 'fabricas-2040-venta-autonoma',
    publishedAt: '2026-04-10T16:00:00.000Z',
    seoDesc:
      'Las fábricas del 2040 venden solas: IA, datos y automatización. Anticipe el modelo y agende una conversación con SoftInnova hoy.',
  },
  {
    file: '/Users/felipeahumadaaraya/Downloads/01-muerte-clic-tradicional.html',
    slug: 'muerte-clic-tradicional',
    publishedAt: '2026-04-03T16:00:00.000Z',
    seoDesc:
      'El clic tradicional murió: la intención conversacional manda. Entienda el cambio y explore soluciones IA con SoftInnova ahora.',
  },
];

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(`https://blog.soft-innova.com${path}`);
    const r = https.request(
      u,
      {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'X-EmDash-Request': '1',
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(b) });
          } catch {
            resolve({ status: res.statusCode, body: b.slice(0, 200) });
          }
        });
      },
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function parseHtml(file) {
  const out = execSync(`${PYTHON} "${SCRIPT}" "${file}"`, { encoding: 'utf8' });
  return JSON.parse(out);
}

function tagSlug(label) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureTags(tags) {
  const termIds = [];
  for (const label of tags) {
    const slug = tagSlug(label);
    const created = await req(
      'POST',
      '/_emdash/api/taxonomies/tag/terms',
      JSON.stringify({ slug, label }),
    );
    if (created.status === 201 || created.status === 200) {
      termIds.push(created.body.data.term.id);
      continue;
    }
    const list = await req('GET', '/_emdash/api/taxonomies/tag/terms?limit=200');
    const found = list.body?.data?.items?.find((t) => t.slug === slug);
    if (found) termIds.push(found.id);
  }
  return termIds;
}

async function publishArticle({ file, slug, publishedAt, seoDesc }) {
  const article = parseHtml(file);
  const title = article.title;
  const payload = {
    data: {
      title,
      excerpt: seoDesc.slice(0, 160),
      content: article.content,
    },
    slug,
    status: 'draft',
    locale: 'es',
    seo: { title: `${title} | SoftInnova`, description: seoDesc },
    bylines: [{ bylineId: BYLINE_ID, roleLabel: 'Ingeniera de Negocios Preventa' }],
    publishedAt,
  };

  const existing = await req('GET', `/_emdash/api/content/posts/${slug}`);
  if (existing.status === 200 && existing.body?.data?.item) {
    return { slug, skipped: true, url: `https://blog.soft-innova.com/posts/${slug}` };
  }

  const create = await req('POST', '/_emdash/api/content/posts', JSON.stringify(payload));
  if (create.status !== 201) {
    throw new Error(`create failed ${slug}: ${create.status} ${JSON.stringify(create.body).slice(0, 300)}`);
  }
  const id = create.body.data.item.id;
  await req('POST', `/_emdash/api/content/posts/${id}/publish`, JSON.stringify({ publishedAt }));
  await ensureTags(article.tags);

  return {
    slug,
    id,
    title,
    publishedAt,
    url: `https://blog.soft-innova.com/posts/${slug}`,
  };
}

const results = [];
for (const art of ARTICLES) {
  try {
    const r = await publishArticle(art);
    results.push({ ok: true, ...r });
    console.log('OK', r.slug, r.url);
  } catch (e) {
    results.push({ ok: false, slug: art.slug, error: String(e) });
    console.error('FAIL', art.slug, e.message);
  }
}
console.log(JSON.stringify(results, null, 2));
