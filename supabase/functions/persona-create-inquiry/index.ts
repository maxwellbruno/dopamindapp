import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';

const PERSONA_API = 'https://api.withpersona.com/api/v1';
const PERSONA_VERSION = '2023-01-05';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const apiKey = Deno.env.get('PERSONA_API_KEY');
    const templateId = Deno.env.get('PERSONA_TEMPLATE_ID');
    if (!apiKey || !templateId) {
      return json({ error: 'Identity verification is not configured yet. Please try again later.' }, 503);
    }

    const body = await req.json().catch(() => ({}));
    const applicationId: string | undefined = body?.applicationId;

    const db = adminClient();

    // Reuse an existing inquiry if one is already pending for this user.
    let application: any = null;
    if (applicationId) {
      const { data } = await db
        .from('therapist_applications')
        .select('id, user_id, full_name, email, persona_inquiry_id, persona_status')
        .eq('id', applicationId)
        .maybeSingle();
      application = data;
      if (!application || application.user_id !== userId) {
        return json({ error: 'Application not found' }, 404);
      }
    }

    let inquiryId = application?.persona_inquiry_id as string | undefined;

    if (!inquiryId) {
      const createRes = await fetch(`${PERSONA_API}/inquiries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Persona-Version': PERSONA_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              'inquiry-template-id': templateId,
              'reference-id': userId,
              fields: {
                'name-first': application?.full_name?.split(' ')?.[0] ?? undefined,
                'email-address': application?.email ?? undefined,
              },
            },
          },
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        console.error('Persona inquiry creation failed', created);
        return json({ error: 'Could not start identity verification.' }, 502);
      }
      inquiryId = created?.data?.id;
      if (!inquiryId) return json({ error: 'Persona returned no inquiry id.' }, 502);

      if (application) {
        await db
          .from('therapist_applications')
          .update({ persona_inquiry_id: inquiryId, persona_status: 'created', status: 'kyc_pending' })
          .eq('id', application.id);
      }
    }

    const linkRes = await fetch(`${PERSONA_API}/inquiries/${inquiryId}/generate-one-time-link`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Persona-Version': PERSONA_VERSION,
        'Content-Type': 'application/json',
      },
    });
    const linkBody = await linkRes.json();
    if (!linkRes.ok) {
      console.error('Persona one-time-link failed', linkBody);
      return json({ error: 'Could not open identity verification.' }, 502);
    }

    const url = linkBody?.meta?.['one-time-link'];
    return json({ inquiryId, url });
  } catch (err) {
    console.error('persona-create-inquiry error', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
