import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { before_url, after_url } = await req.json();
    if (!before_url || !after_url || before_url.length > 1000 || after_url.length > 1000) {
      return Response.json({ error: 'before_url және after_url қажет' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Сен экологиялық тексеруші AI-сың. Екі сурет берілген: БІРІНШІ сурет — тазалауға ДЕЙІН, ЕКІНШІ сурет — тазалаудан КЕЙІН.
Салыстыр және шынымен қоқыс жиналғанын анықта.
verified: шынымен тазаланған болса true, әйтпесе false (мысалы, суреттер бір-бірімен байланысты емес, немесе өзгеріс жоқ, немесе алдау белгісі бар).
improvement_percent: 0-100 аралығында тазалық жақсаруы.
waste_kg: жиналған қоқыстың шамалас салмағы (кг).
ai_verdict: қазақ тілінде 2-3 сөйлем түсіндірме.`,
      file_urls: [before_url, after_url],
      response_json_schema: {
        type: 'object',
        properties: {
          verified: { type: 'boolean' },
          improvement_percent: { type: 'number' },
          waste_kg: { type: 'number' },
          ai_verdict: { type: 'string' }
        },
        required: ['verified', 'improvement_percent', 'ai_verdict']
      }
    });

    const improvement = Math.max(0, Math.min(100, Number(result.improvement_percent) || 0));
    const coins = result.verified ? Math.round(improvement * 1.5) + 10 : 0;

    return Response.json({ ...result, improvement_percent: improvement, coins_awarded: coins });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}