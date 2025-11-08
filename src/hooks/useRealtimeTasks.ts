import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { syncTasksFromDB } from '@/store/tasksSlice';
import { toast } from 'sonner';

export const useRealtimeTasks = (userId: string | undefined) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          // Show toast for changes from other users
          if (payload.eventType === 'INSERT') {
            toast.info('New task added by another user');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Task updated by another user');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Task deleted by another user');
          }

          // Sync with database
          dispatch(syncTasksFromDB());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, dispatch]);
};
