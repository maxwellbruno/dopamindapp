import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';

const DAILY_API = 'https://api.daily.co/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) return json({ error: 'Video calling is not configured yet.' }, 503);

    const { bookingId } = await req.json().catch(() => ({}));
    if (!bookingId) return json({ error: 'bookingId is required' }, 400);

    const db = adminClient();
    const { data: booking } = await db
      .from('therapist_bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();
    if (!booking) return json({ error: 'Booking not found' }, 404);

    const isTherapist = booking.therapist_user_id === userId;
    if (!isTherapist && booking.client_user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (!['scheduled', 'in_progress'].includes(booking.status)) {
      return json({ error: 'This session is not payable/active yet.' }, 400);
    }

    const startMs = new Date(booking.scheduled_start).getTime();
    const endMs = startMs + booking.duration_minutes * 60_000;
    // Allow joining 10 minutes early and 15 minutes past the end.
    if (Date.now() < startMs - 10 * 60_000) return json({ error: 'The room opens 10 minutes before your session.' }, 400);
    if (Date.now() > endMs + 15 * 60_000) return json({ error: 'This session has ended.' }, 400);

    const expSeconds = Math.floor((endMs + 15 * 60_000) / 1000);
    let roomName = booking.daily_room_name as string | null;
    let roomUrl = booking.daily_room_url as string | null;

    if (!roomName) {
      const res = await fetch(`${DAILY_API}/rooms`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacy: 'private',
          properties: {
            exp: expSeconds,
            enable_chat: true,
            start_video_off: booking.session_mode === 'voice',
            eject_at_room_exp: true,
          },
        }),
      });
      const room = await res.json();
      if (!res.ok) {
        console.error('Daily room creation failed', room);
        return json({ error: 'Could not create the call room.' }, 502);
      }
      roomName = room.name;
      roomUrl = room.url;
      await db
        .from('therapist_bookings')
        .update({ daily_room_name: roomName, daily_room_url: roomUrl, status: 'in_progress', started_at: booking.started_at ?? new Date().toISOString() })
        .eq('id', bookingId);
    }

    const tokenRes = await fetch(`${DAILY_API}/meeting-tokens`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isTherapist,
          exp: expSeconds,
          user_name: isTherapist ? 'Therapist' : 'Client',
        },
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Daily token creation failed', tokenBody);
      return json({ error: 'Could not join the call.' }, 502);
    }

    return json({ roomUrl: `${roomUrl}?t=${tokenBody.token}`, token: tokenBody.token, roomName });
  } catch (err) {
    console.error('create-daily-room error', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
