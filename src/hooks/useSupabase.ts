import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Simplified hook for fetching data from Supabase
export function useSupabaseQuery<T = any>(
  table: string,
  select: string = '*',
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!profile?.business_id) return;

    try {
      setLoading(true);
      let query = (supabase as any).from(table).select(select);
      
      // Add business_id filter
      query = query.eq('business_id', profile.business_id);
      
      // Add additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data: result, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setData(result || []);
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.business_id, table, JSON.stringify(filters)]);

  // Set up real-time subscription
  useEffect(() => {
    if (!profile?.business_id) return;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `business_id=eq.${profile.business_id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.business_id, table]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for CRUD operations
export function useSupabaseMutation(table: string) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const insert = async (data: any) => {
    if (!profile?.business_id) {
      throw new Error('Business ID not found');
    }

    const { error } = await (supabase as any)
      .from(table)
      .insert({ ...data, business_id: profile.business_id });

    if (error) {
      toast({
        title: "Error creating record",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Success",
      description: "Record created successfully"
    });
  };

  const update = async (id: string, data: any) => {
    const { error } = await (supabase as any)
      .from(table)
      .update(data)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating record",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Don't show success toast for updates in the mutation hook
    // Let the calling component handle success messages
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any)
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting record",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Success",
      description: "Record deleted successfully"
    });
  };

  return { insert, update, remove };
}