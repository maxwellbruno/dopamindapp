
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import MinimalSpinner from '@/components/ui/MinimalSpinner';

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
    return <MinimalSpinner />;
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
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🎯</span>
                          <span>{session.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mint-green/20 text-mint-green">
                          {session.duration} min
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(session.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-text-light">{format(new Date(session.created_at), 'HH:mm')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-4xl">🎯</span>
                        <span className="text-text-light">No focus sessions yet.</span>
                        <span className="text-sm text-text-light">Complete your first session to see it here!</span>
                      </div>
                    </TableCell>
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
