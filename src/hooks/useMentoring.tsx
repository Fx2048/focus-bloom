import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface MentoringRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  created_at: string;
  partner_name?: string;
  partner_emoji?: string;
  is_mentor: boolean;
}

export interface MentoringSession {
  id: string;
  relationship_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  jitsi_room_name: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface MentoringMessage {
  id: string;
  relationship_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface MentoringProject {
  id: string;
  relationship_id: string;
  title: string;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useMentoring() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<MentoringRelationship[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [messages, setMessages] = useState<MentoringMessage[]>([]);
  const [projects, setProjects] = useState<MentoringProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRelationship, setActiveRelationship] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('mentoring_relationships')
      .select('*')
      .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
      .eq('status', 'active');

    if (error) { console.error(error); return; }

    // Fetch partner profiles
    const enriched: MentoringRelationship[] = [];
    for (const rel of data || []) {
      const isMentor = rel.mentor_id === user.id;
      const partnerId = isMentor ? rel.mentee_id : rel.mentor_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_emoji')
        .eq('user_id', partnerId)
        .single();

      enriched.push({
        ...rel,
        partner_name: profile?.display_name || 'Usuario',
        partner_emoji: profile?.avatar_emoji || '🧑‍💻',
        is_mentor: isMentor,
      });
    }
    setRelationships(enriched);
    if (enriched.length > 0 && !activeRelationship) {
      setActiveRelationship(enriched[0].id);
    }
  }, [user, activeRelationship]);

  const fetchSessions = useCallback(async () => {
    if (!activeRelationship) return;
    const { data } = await supabase
      .from('mentoring_sessions')
      .select('*')
      .eq('relationship_id', activeRelationship)
      .order('scheduled_at', { ascending: true });
    setSessions((data as MentoringSession[]) || []);
  }, [activeRelationship]);

  const fetchMessages = useCallback(async () => {
    if (!activeRelationship) return;
    const { data } = await supabase
      .from('mentoring_messages')
      .select('*')
      .eq('relationship_id', activeRelationship)
      .order('created_at', { ascending: true });
    setMessages((data as MentoringMessage[]) || []);
  }, [activeRelationship]);

  const fetchProjects = useCallback(async () => {
    if (!activeRelationship) return;
    const { data } = await supabase
      .from('mentoring_projects')
      .select('*')
      .eq('relationship_id', activeRelationship)
      .order('created_at', { ascending: false });
    setProjects((data as MentoringProject[]) || []);
  }, [activeRelationship]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchRelationships();
      setIsLoading(false);
    };
    load();
  }, [fetchRelationships]);

  useEffect(() => {
    if (activeRelationship) {
      fetchSessions();
      fetchMessages();
      fetchProjects();
    }
  }, [activeRelationship, fetchSessions, fetchMessages, fetchProjects]);

  // Realtime messages
  useEffect(() => {
    if (!activeRelationship) return;
    const channel = supabase
      .channel(`mentoring-messages-${activeRelationship}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mentoring_messages',
        filter: `relationship_id=eq.${activeRelationship}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as MentoringMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRelationship]);

  const sendMessage = async (content: string) => {
    if (!user || !activeRelationship) return;
    const { error } = await supabase.from('mentoring_messages').insert({
      relationship_id: activeRelationship,
      sender_id: user.id,
      content,
    });
    if (error) toast.error('Error al enviar mensaje');
  };

  const createSession = async (title: string, scheduledAt: string, durationMinutes: number) => {
    if (!user || !activeRelationship) return;
    const roomName = `tizza-${activeRelationship.slice(0, 8)}-${Date.now()}`;
    const { error } = await supabase.from('mentoring_sessions').insert({
      relationship_id: activeRelationship,
      title,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
      jitsi_room_name: roomName,
      created_by: user.id,
    });
    if (error) { toast.error('Error al crear sesión'); return; }
    toast.success('Sesión programada');
    fetchSessions();
  };

  const createProject = async (title: string, description: string) => {
    if (!user || !activeRelationship) return;
    const { error } = await supabase.from('mentoring_projects').insert({
      relationship_id: activeRelationship,
      title,
      description,
      created_by: user.id,
    });
    if (error) { toast.error('Error al crear proyecto'); return; }
    toast.success('Proyecto creado');
    fetchProjects();
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    const { error } = await supabase
      .from('mentoring_projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) { toast.error('Error al actualizar proyecto'); return; }
    fetchProjects();
  };

  const connectWithMentor = async (mentorEmail: string) => {
    if (!user) return;
    // Find user by looking up profiles — we search by display_name as email proxy
    // In a real app you'd have an invitation system
    toast.info('Sistema de invitaciones próximamente. Por ahora, comparte tu ID de usuario con tu mentor/estudiante.');
  };

  const connectById = async (partnerId: string, asMentor: boolean) => {
    if (!user) return;
    const mentorId = asMentor ? user.id : partnerId;
    const menteeId = asMentor ? partnerId : user.id;
    
    const { error } = await supabase.from('mentoring_relationships').insert({
      mentor_id: mentorId,
      mentee_id: menteeId,
    });
    if (error) {
      if (error.code === '23505') toast.error('Ya tienes una relación con este usuario');
      else toast.error('Error al conectar');
      return;
    }
    toast.success('¡Conexión de mentoring creada!');
    fetchRelationships();
  };

  return {
    relationships,
    sessions,
    messages,
    projects,
    isLoading,
    activeRelationship,
    setActiveRelationship,
    sendMessage,
    createSession,
    createProject,
    updateProjectStatus,
    connectById,
    fetchSessions,
  };
}
