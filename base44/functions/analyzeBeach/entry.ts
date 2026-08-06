import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { photo_url } = await req.json();
    if (!photo_url || typeof photo_url !== 'string' || photo_url.length > 1000) {
      return Response.json({ error: 'photo_url қажет' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Сен жағажай ластануын бағалайтын экологиялық AI-сарапшысың. Берілген суретті талдап, қоқыс түрлерін анықта және ластану деңгейін бағала.
pollution_score: 0 (мүлдем таза) - 100 (өте лас).
pollution_level: score <= 25 болса "clean", 26-60 болса "medium", 60-тан жоғары болса "dirty".
waste_types: тек мына мәндерден таңда: пластик, шыны, металл, қағаз, темекі қалдығы, балық аулау торы, органикалық, өзге.
estimated_items: суреттегі көрінетін қоқыс саны (шамамен).
ai_summary: қазақ тілінде 2-3 сөйлем қысқаша қорытынды.
Егер суретте жағажай немесе жағалау көрінбесе, ai_summary-де осыны айт және score-ды 0 қой.`,
      file_urls: [photo_url],
      response_json_schema: {
        type: 'object',
        properties: {
          pollution_score: { type: 'number' },
          pollution_level: { type: 'string', enum: ['clean', 'medium', 'dirty'] },
          waste_types: { type: 'array', items: { type: 'string' } },
          estimated_items: { type: 'number' },
          ai_summary: { type: 'string' }
        },
        required: ['pollution_score', 'pollution_level', 'ai_summary']
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}