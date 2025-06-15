
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import LoadingScreen from '@/components/LoadingScreen';

const AllFocusSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFocusSessions = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching focus sessions:', error);
      throw new Error(error.message);
    }
    return data;
  };

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: fetchFocusSessions,
    enabled: !!user,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-text-dark animate-fade-in-up">All Focus Sessions</h1>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>
          <div className="dopamind-card p-6 animate-fade-in-up">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Duration (min)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>{format(new Date(session.created_at), 'PPP')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No sessions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllFocusSessions;
