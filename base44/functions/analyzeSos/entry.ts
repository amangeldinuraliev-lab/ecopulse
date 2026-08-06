import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const photo_url = body.photo_url;
    if (!photo_url || typeof photo_url !== 'string' || photo_url.length > 1000) {
      return Response.json({ error: 'photo_url қажет' }, { status: 400 });
    }
    const note = String(body.location_note || '').slice(0, 300);
    const lat = body.lat, lng = body.lng;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Сен экологиялық жедел жағдайларды талдайтын AI-сың. Суретті талдап, экологиялық қауіпті анықта.
category: мыналардан таңда — "oil_spill" (мұнай төгіндісі), "dead_fish" (өлі балық), "dead_seal" (өлі каспий итбалығы), "illegal_dump" (заңсыз қоқыс үйіндісі), "illegal_fishing" (заңсыз балық аулау/браконьерлік), "accident" (экологиялық апат), "other".
severity: "low", "medium", "high", "critical".
ai_analysis: қазақ тілінде 2-4 сөйлем талдау.
official_message: әкімдікке/жауапты органға жіберуге дайын РЕСМИ хабарлама мәтіні қазақ тілінде — қауіп түрі, орналасқан жері, ықтимал зиян және шұғыл ұсынылатын шаралар көрсетілсін.
Орналасқан жері: ${note || 'көрсетілмеген'}${lat && lng ? ` (координаттар: ${lat}, ${lng})` : ''}.`,
      file_urls: [photo_url],
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['oil_spill', 'dead_fish', 'illegal_dump', 'other'] },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          ai_analysis: { type: 'string' },
          official_message: { type: 'string' }
        },
        required: ['category', 'severity', 'ai_analysis', 'official_message']
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}