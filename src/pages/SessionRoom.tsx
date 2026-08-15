import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Mic, Square, Video, Loader2, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatUsd } from '@/lib/escrow';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SessionRoom: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const [callUrl, setCallUrl] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [ending, setEnding] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.from('therapist_bookings').select('*').eq('id', bookingId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['session-messages', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('booking_id', bookingId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (!bookingId) return;
    const channel = supabase
      .channel(`session-${bookingId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_messages', filter: `booking_id=eq.${bookingId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['session-messages', bookingId] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const otherUserId =
    booking && user ? (booking.client_user_id === user.id ? booking.therapist_user_id : booking.client_user_id) : null;
  const isTherapist = !!booking && !!user && booking.therapist_user_id === user.id;

  const sendMessage = async () => {
    if (!message.trim() || !booking || !user || !otherUserId) return;
    const body = message.trim();
    setMessage('');
    const { error } = await supabase.from('session_messages').insert({
      booking_id: booking.id,
      sender_user_id: user.id,
      recipient_user_id: otherUserId,
      body,
    });
    if (error) {
      toast.error('Message not sent');
      setMessage(body);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadVoiceNote(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (e) {
      toast.error('Microphone access is required for voice notes.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const uploadVoiceNote = async (blob: Blob) => {
    if (!booking || !user || !otherUserId) return;
    const path = `${booking.id}/${user.id}-${Date.now()}.webm`;
    const { error: upErr } = await supabase.storage.from('session-media').upload(path, blob, { contentType: 'audio/webm' });
    if (upErr) {
      console.error(upErr);
      return toast.error('Could not upload the voice note.');
    }
    const { error } = await supabase.from('session_messages').insert({
      booking_id: booking.id,
      sender_user_id: user.id,
      recipient_user_id: otherUserId,
      voice_note_path: path,
    });
    if (error) toast.error('Voice note not sent');
  };

  const joinCall = async () => {
    setJoining(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-daily-room', { body: { bookingId } });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      setCallUrl(data.roomUrl);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not start the call.');
    } finally {
      setJoining(false);
    }
  };

  const endSession = async () => {
    if (!booking) return;
    setEnding(true);
    try {
      await supabase
        .from('therapist_bookings')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', booking.id);
      const { data, error } = await supabase.functions.invoke('release-escrow', { body: { bookingId: booking.id } });
      if (error || data?.error) {
        toast.warning('Session ended', { description: data?.error ?? 'Payout will be retried shortly.' });
      } else {
        toast.success('Session ended', { description: 'Payment released to the therapist.' });
      }
      setCallUrl(null);
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    } finally {
      setEnding(false);
    }
  };

  const submitReview = async () => {
    if (!booking || !user || rating < 1) return toast.error('Pick a star rating first.');
    const { error } = await supabase.from('therapist_reviews').insert({
      therapist_id: booking.therapist_id,
      booking_id: booking.id,
      client_user_id: user.id,
      rating,
      review: reviewText.trim() || null,
    });
    if (error) return toast.error('Could not save your review.');
    toast.success('Thanks for your review!');
    setRating(0);
    setReviewText('');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-text-light text-sm">Loading session...</p>
      </div>
    );
  }

  const completed = booking.status === 'completed';

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/sessions')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-dark">Therapy session</h1>
              <p className="text-text-light text-sm">
                {new Date(booking.scheduled_start).toLocaleString()} · {booking.duration_minutes} min ·{' '}
                {formatUsd(booking.amount_cents)}
              </p>
            </div>
          </div>

          <div className="dopamind-card p-4 mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-text-dark capitalize">{booking.status.replace('_', ' ')}</span>
            <div className="flex gap-2">
              {!completed && booking.session_mode !== 'chat' && (
                <button
                  onClick={joinCall}
                  disabled={joining}
                  className="inline-flex items-center gap-2 bg-deep-blue text-white text-sm font-semibold rounded-2xl px-4 py-2 disabled:opacity-60"
                >
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  Join call
                </button>
              )}
              {!completed && booking.status !== 'pending_payment' && (
                <button
                  onClick={endSession}
                  disabled={ending}
                  className="inline-flex items-center gap-2 bg-mint-green text-white text-sm font-semibold rounded-2xl px-4 py-2 disabled:opacity-60"
                >
                  {ending && <Loader2 className="w-4 h-4 animate-spin" />}
                  End & release
                </button>
              )}
            </div>
          </div>

          {callUrl && (
            <div className="dopamind-card overflow-hidden mb-4">
              <iframe
                title="Therapy call"
                src={callUrl}
                allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                className="w-full h-[420px] border-0"
              />
            </div>
          )}

          {/* Chat */}
          <div className="dopamind-card p-4">
            <h2 className="text-base font-bold text-text-dark mb-3">Messages</h2>
            <div className="space-y-3 max-h-[340px] overflow-y-auto mb-3">
              {messages.length === 0 && <p className="text-sm text-text-light">No messages yet. Say hello.</p>}
              {messages.map((m: any) => {
                const mine = m.sender_user_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine ? 'bg-mint-green text-white' : 'bg-light-gray text-text-dark'}`}>
                      {m.body && <p className="text-sm whitespace-pre-wrap">{m.body}</p>}
                      {m.voice_note_path && <VoiceNote path={m.voice_note_path} />}
                      <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-text-light'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
                className="rounded-2xl border-2 border-gray-100"
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`p-3 rounded-2xl ${recording ? 'bg-red-500 text-white' : 'bg-light-gray text-text-dark'}`}
                aria-label={recording ? 'Stop recording' : 'Record voice note'}
              >
                {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={sendMessage} className="p-3 rounded-2xl bg-mint-green text-white" aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Review */}
          {completed && !isTherapist && (
            <div className="dopamind-card p-6 mt-4">
              <h2 className="text-base font-bold text-text-dark mb-3">Rate your session</h2>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
                    <Star className={`w-7 h-7 ${n <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share how the session went (optional)"
                maxLength={1000}
                className="mb-3"
              />
              <button onClick={submitReview} className="w-full bg-mint-green text-white font-semibold rounded-2xl py-3">
                Submit review
              </button>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs text-text-light p-4 bg-white rounded-2xl border border-gray-200">
            <ShieldCheck className="w-4 h-4 text-mint-green flex-shrink-0 mt-0.5" />
            <p>Funds are held in escrow and released to the therapist (minus a 15% Dopamind fee) once the session ends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VoiceNote: React.FC<{ path: string }> = ({ path }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.storage
      .from('session-media')
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);
  if (!url) return <p className="text-xs">Loading voice note...</p>;
  return <audio controls src={url} className="mt-1 w-56 max-w-full" />;
};

export default SessionRoom;
