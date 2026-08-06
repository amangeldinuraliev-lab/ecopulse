import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { photo_url, title, description } = await req.json();
    if (!title || typeof title !== 'string' || title.length > 200) {
      return Response.json({ error: 'title қажет' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Сен экологиялық қауымдастық контентін модерациялайтын AI-сың. Пайдаланушы жіберген мазмұнды тексер.
approved: бұзушылық/оспақсыз/заңсыз болмаса true.
ai_note: қазақ тілінде 1 сөйлем қысқаша баға.
title: ${String(title || '').slice(0, 200)}
description: ${String(description || '').slice(0, 1000)}
${photo_url ? 'Суретті де тексер.' : ''}`,
      file_urls: photo_url ? [photo_url] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          approved: { type: 'boolean' },
          ai_note: { type: 'string' }
        },
        required: ['approved', 'ai_note']
      }
    });

    return Response.json({
      ai_moderation: result.approved ? 'approved' : 'flagged',
      ai_note: result.ai_note
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}