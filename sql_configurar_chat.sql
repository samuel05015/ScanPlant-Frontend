-- Script para criar tabelas e funções necessárias para o sistema de chat
-- Execute este script no Supabase SQL Editor

-- Tabela para armazenar as conversas
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_ids UUID[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_sender_id UUID,
    unread_count INTEGER DEFAULT 0
);

-- Tabela para armazenar os participantes de cada conversa
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (chat_id, user_id)
);

-- Tabela para armazenar as mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read BOOLEAN DEFAULT false
);

-- Função para incrementar o contador de mensagens não lidas
CREATE OR REPLACE FUNCTION increment_unread(chat_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT unread_count INTO current_count FROM public.chats WHERE id = chat_id_param;
    RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS chats_participant_ids_idx ON public.chats USING GIN (participant_ids);
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON public.messages (chat_id);
CREATE INDEX IF NOT EXISTS messages_chat_id_created_at_idx ON public.messages (chat_id, created_at);
CREATE INDEX IF NOT EXISTS chat_participants_user_id_idx ON public.chat_participants (user_id);
CREATE INDEX IF NOT EXISTS chat_participants_chat_id_idx ON public.chat_participants (chat_id);

-- Configurar políticas de segurança RLS (Row Level Security)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Usuários podem ver seus próprios chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = ANY(participant_ids));
  
CREATE POLICY "Usuários podem criar chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));
  
CREATE POLICY "Usuários podem atualizar seus próprios chats"
  ON public.chats FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- Políticas para participantes
CREATE POLICY "Usuários podem ver participantes de seus chats"
  ON public.chat_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_participants.chat_id
    AND auth.uid() = ANY(chats.participant_ids)
  ));
  
CREATE POLICY "Usuários podem adicionar participantes aos seus chats"
  ON public.chat_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_participants.chat_id
      AND auth.uid() = ANY(chats.participant_ids)
    )
  );

-- Políticas para mensagens
CREATE POLICY "Usuários podem ver mensagens de seus chats"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = messages.chat_id
    AND auth.uid() = ANY(chats.participant_ids)
  ));
  
CREATE POLICY "Usuários podem enviar mensagens para seus chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND auth.uid() = ANY(chats.participant_ids)
    ) AND auth.uid() = sender_id
  );
  
CREATE POLICY "Usuários podem atualizar suas próprias mensagens"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND auth.uid() = ANY(chats.participant_ids)
    )
  );

-- Configurar trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar o Realtime para as tabelas de chat
-- O mecanismo de subscription do Supabase foi atualizado, então usamos um método diferente
-- para habilitar o Realtime nas tabelas

-- Habilitar Realtime para a tabela de chats
ALTER PUBLICATION supabase_realtime ADD TABLE chats;

-- Habilitar Realtime para a tabela de mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Nota: Se o comando acima falhar, pode ser necessário habilitar o Realtime
-- manualmente no painel do Supabase: Database > Replication > Supabase Realtime
-- e então selecionar as tabelas 'chats' e 'messages'.