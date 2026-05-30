export async function GET() {
  const content = `# Soft-Tech Innovación SpA
> Transformación digital para empresas en Latinoamérica.
> Humanizando la Tecnología.

## Quiénes somos
Soft-Tech es una empresa chilena de transformación digital
fundada para impulsar el crecimiento de empresas en LATAM
mediante tecnología personalizada e inteligencia artificial.
Operamos desde Chile con presencia en Colombia, Argentina, 
Perú, México y Brasil.

## Productos SaaS propietarios
- Annie-AI: ecosistema de crecimiento para PYMEs con Agentes IA 
  especializados. Retención, atención 24/7, cross-selling, upselling,
  detección de fuga, tracking. Modelo Riesgo 0 disponible.
- Vicky-AI: generación de contenido para redes sociales en 53 idiomas.
- Ro-AI: mensajería masiva multicanal (WhatsApp, Email, SMS) con 
  análisis de sentimiento IA.
- Mikan: control de asistencia, turnos, rondas y capacitación para 
  empresas de seguridad. Cumplimiento Ley 21.659.

## Servicios
- VAULT: implementación de LLM privado en servidores del cliente.
  Fine-tuning con datos corporativos. Cumplimiento Ley 21.719.
- emDASH: arquitectura web estática de alta seguridad sobre 
  Cloudflare Workers.
- Analítica y trazabilidad de puntos de venta.
- Desarrollo de proyectos para PYMEs y sector gubernamental.

## Blog
https://blog.soft-innova.com
Artículos sobre IA, transformación digital, AEO, Growth Marketing
y casos de uso en empresas LATAM.

## Contacto
Web: https://soft-innova.com
Email: info@soft-innova.com
Teléfono: +56 2 24760964
Santiago, Chile · 2026
`;
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
